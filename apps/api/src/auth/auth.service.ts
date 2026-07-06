import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  toPublic(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto): Promise<{ user: PublicUser; token: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        role: UserRole.USER,
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    const token = this.signToken(user);
    return { user: this.toPublic(user), token };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUser; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Ensure cart and wishlist exist for users created before they were a thing
    await this.ensureCartAndWishlist(user.id);

    const token = this.signToken(user);
    return { user: this.toPublic(user), token };
  }

  async getById(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return this.toPublic(user);
  }

  /**
   * Guest express account: creates a shadow account with just an email,
   * logs the user in, and emails a set-password link (reset token).
   */
  async guest(email: string): Promise<{ user: PublicUser; token: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('This email already has an account — sign in instead');
    }
    const passwordHash = await argon2.hash(randomBytes(24).toString('hex'));
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: null,
        role: UserRole.USER,
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    // Enlace para fijar contraseña más tarde (mismo flujo del reset)
    const resetToken = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });
    const webUrl = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
    this.mail.sendPasswordReset(user.email, `${webUrl}/reset-password?token=${resetToken}`);

    const token = this.signToken(user);
    return { user: this.toPublic(user), token };
  }

  // ---------- password reset ----------

  /** Always resolves OK (no email enumeration); sends the reset link when the user exists. */
  async forgotPassword(email: string): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
      const webUrl = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
      this.mail.sendPasswordReset(user.email, `${webUrl}/reset-password?token=${token}`);
    }
    return { ok: true };
  }

  async resetPassword(token: string, password: string): Promise<{ ok: true }> {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }
    const passwordHash = await argon2.hash(password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  private signToken(user: { id: string; email: string; role: UserRole }): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwt.sign(payload);
  }

  private async ensureCartAndWishlist(userId: string): Promise<void> {
    await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  cookieOptions() {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      domain: domain && domain !== 'localhost' ? domain : undefined,
      path: '/',
      // 7 days in ms — matches JWT_EXPIRES_IN default
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
}

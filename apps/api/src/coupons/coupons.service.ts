import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupons.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- validation / application ----------

  /**
   * Validates a code for a user and subtotal, returning the discount in cents.
   * Throws BadRequestException with a human-readable reason when invalid.
   */
  async validateForUser(code: string, userId: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { _count: { select: { redemptions: true } } },
    });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.endsAt && coupon.endsAt < now) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      throw new BadRequestException(
        `This coupon requires a minimum subtotal of $${(coupon.minSubtotal / 100).toFixed(2)}`,
      );
    }
    if (coupon.maxUses && coupon._count.redemptions >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (coupon.maxUsesPerUser) {
      const mine = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (mine >= coupon.maxUsesPerUser) {
        throw new BadRequestException('You already used this coupon');
      }
    }

    return { coupon, discount: this.computeDiscount(coupon, subtotal) };
  }

  /** PERCENT → % of subtotal · FIXED → flat cents, never above the subtotal. */
  computeDiscount(coupon: Coupon, subtotal: number): number {
    const raw =
      coupon.type === 'PERCENT'
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;
    return Math.min(raw, subtotal);
  }

  /** Validate against the user's current cart (public endpoint). */
  async validateAgainstCart(code: string, userId: string) {
    const subtotal = await this.cartSubtotal(userId);
    if (subtotal === 0) throw new BadRequestException('Cart is empty');
    const { coupon, discount } = await this.validateForUser(code, userId, subtotal);
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      subtotal,
    };
  }

  private async cartSubtotal(userId: string): Promise<number> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.variant?.priceOverride ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }

  // ---------- admin CRUD ----------

  async list() {
    const coupons = await this.prisma.coupon.findMany({
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Revenue generated per coupon (orders that used it, excluding cancelled)
    const revenue = await this.prisma.order.groupBy({
      by: ['couponId'],
      where: { couponId: { not: null }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      _sum: { total: true, discount: true },
    });
    const revenueByCoupon = new Map(revenue.map((r) => [r.couponId, r._sum]));
    return coupons.map((c) => ({
      ...c,
      uses: c._count.redemptions,
      revenue: revenueByCoupon.get(c.id)?.total ?? 0,
      discountGiven: revenueByCoupon.get(c.id)?.discount ?? 0,
      _count: undefined,
    }));
  }

  async create(dto: CreateCouponDto) {
    this.assertValueShape(dto.type, dto.value);
    try {
      return await this.prisma.coupon.create({
        data: {
          ...this.toData(dto),
          code: dto.code.trim().toUpperCase(),
          type: dto.type,
          value: dto.value,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A coupon with that code already exists');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Coupon not found');
    if (dto.type || dto.value !== undefined) {
      this.assertValueShape(dto.type ?? existing.type, dto.value ?? existing.value);
    }
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...this.toData(dto),
        ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
      },
    });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { redemptions: true } } },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon._count.redemptions > 0) {
      throw new ConflictException(
        'This coupon was already used in orders — deactivate it instead of deleting',
      );
    }
    await this.prisma.coupon.delete({ where: { id } });
    return { deleted: true };
  }

  // ---------- helpers ----------

  private assertValueShape(type: 'PERCENT' | 'FIXED', value: number) {
    if (type === 'PERCENT' && (value < 1 || value > 100)) {
      throw new BadRequestException('Percent coupons must be between 1 and 100');
    }
    if (type === 'FIXED' && value < 1) {
      throw new BadRequestException('Fixed coupons must be a positive amount in cents');
    }
  }

  private toData(dto: Partial<CreateCouponDto>) {
    return {
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.value !== undefined ? { value: dto.value } : {}),
      ...(dto.minSubtotal !== undefined ? { minSubtotal: dto.minSubtotal } : {}),
      ...(dto.maxUses !== undefined ? { maxUses: dto.maxUses } : {}),
      ...(dto.maxUsesPerUser !== undefined ? { maxUsesPerUser: dto.maxUsesPerUser } : {}),
      ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null } : {}),
      ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null } : {}),
      ...(dto.active !== undefined ? { active: dto.active } : {}),
    };
  }
}

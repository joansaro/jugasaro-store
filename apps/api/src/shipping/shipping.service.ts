import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { UpsertShippingMethodDto } from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Active methods for the storefront, cheapest-configured order. */
  listActive() {
    return this.prisma.shippingMethod.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  listAll() {
    return this.prisma.shippingMethod.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  /** Effective price for a subtotal (applies the free-above rule). */
  priceFor(method: { price: number; freeAbove: number | null }, subtotal: number): number {
    if (method.freeAbove !== null && subtotal >= method.freeAbove) return 0;
    return method.price;
  }

  /** Resolves the chosen method (or the first active one as a fallback). */
  async resolveForCheckout(shippingMethodId: string | undefined) {
    if (shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: shippingMethodId },
      });
      if (!method || !method.active) {
        throw new BadRequestException('Invalid shipping method');
      }
      return method;
    }
    const fallback = await this.prisma.shippingMethod.findFirst({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (!fallback) throw new BadRequestException('No shipping methods configured');
    return fallback;
  }

  // ---------- admin ----------

  create(dto: UpsertShippingMethodDto) {
    return this.prisma.shippingMethod.create({ data: dto });
  }

  async update(id: string, dto: Partial<UpsertShippingMethodDto>) {
    const existing = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Shipping method not found');
    return this.prisma.shippingMethod.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.shippingMethod.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!existing) throw new NotFoundException('Shipping method not found');
    if (existing._count.orders > 0) {
      // Orders keep the name snapshot, but preserve history: deactivate instead.
      await this.prisma.shippingMethod.update({ where: { id }, data: { active: false } });
      return { deactivated: true };
    }
    await this.prisma.shippingMethod.delete({ where: { id } });
    return { deleted: true };
  }
}

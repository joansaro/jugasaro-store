import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Promotion } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { UpsertPromotionDto } from './dto/promotions.dto';

/** Ítem mínimo para calcular descuentos de promoción. */
export interface PromoItem {
  unitPrice: number;
  quantity: number;
  categoryId: string;
  brandId: string;
}

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Promotions currently in their validity window. */
  async activePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
    });
  }

  /**
   * Total automatic discount for a set of items.
   * Per item, the BEST matching promotion wins (storewide, category or brand).
   */
  async discountForItems(items: PromoItem[]): Promise<number> {
    if (items.length === 0) return 0;
    const promos = await this.activePromotions();
    if (promos.length === 0) return 0;

    let total = 0;
    for (const item of items) {
      const best = promos.reduce((max, promo) => {
        const matches =
          (promo.categoryId === null && promo.brandId === null) || // toda la tienda
          promo.categoryId === item.categoryId ||
          promo.brandId === item.brandId;
        return matches && promo.value > max ? promo.value : max;
      }, 0);
      if (best > 0) {
        total += Math.round((item.unitPrice * item.quantity * best) / 100);
      }
    }
    return total;
  }

  /** Discount for the current user's cart (used by checkout UI and coupon validation). */
  async discountForCart(userId: string): Promise<{ discount: number; subtotal: number }> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!cart || cart.items.length === 0) return { discount: 0, subtotal: 0 };

    const items: PromoItem[] = cart.items.map((item) => ({
      unitPrice: item.variant?.priceOverride ?? item.product.price,
      quantity: item.quantity,
      categoryId: item.product.categoryId,
      brandId: item.product.brandId,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return { discount: await this.discountForItems(items), subtotal };
  }

  // ---------- admin CRUD ----------

  list() {
    return this.prisma.promotion.findMany({
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: UpsertPromotionDto) {
    this.assertScope(dto);
    return this.prisma.promotion.create({ data: this.toData(dto) });
  }

  async update(id: string, dto: Partial<UpsertPromotionDto>) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion not found');
    return this.prisma.promotion.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: string) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion not found');
    await this.prisma.promotion.delete({ where: { id } });
    return { deleted: true };
  }

  private assertScope(dto: UpsertPromotionDto) {
    if (dto.categoryId && dto.brandId) {
      throw new BadRequestException('Pick a category OR a brand (or neither for storewide)');
    }
  }

  private toData(dto: Partial<UpsertPromotionDto>): Prisma.PromotionUncheckedCreateInput {
    return {
      name: dto.name!,
      value: dto.value!,
      categoryId: dto.categoryId || null,
      brandId: dto.brandId || null,
      active: dto.active ?? true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    };
  }
}

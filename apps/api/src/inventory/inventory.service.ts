import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { SettingsService } from '@/settings/settings.service';
import { AdjustStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  /** All variants with product info; optionally only those at/below the low-stock threshold. */
  async list(lowStockOnly: boolean) {
    const threshold = await this.settings.lowStockThreshold();
    const variants = await this.prisma.productVariant.findMany({
      where: lowStockOnly ? { stock: { lte: threshold } } : {},
      include: {
        product: { select: { name: true, slug: true, published: true } },
      },
      orderBy: { stock: 'asc' },
    });
    return {
      threshold,
      items: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        stock: v.stock,
        lowStock: v.stock <= threshold,
        productName: v.product.name,
        productSlug: v.product.slug,
        published: v.product.published,
      })),
    };
  }

  /** Manual adjustment with an audit trail; stock can never go negative. */
  async adjust(adminUserId: string, dto: AdjustStockDto) {
    if (dto.delta === 0) throw new BadRequestException('Delta cannot be zero');

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({ where: { id: dto.variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      const next = variant.stock + dto.delta;
      if (next < 0) {
        throw new BadRequestException(
          `Stock cannot go negative (current ${variant.stock}, delta ${dto.delta})`,
        );
      }

      const updated = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: next },
      });
      await tx.stockAdjustment.create({
        data: {
          variantId: dto.variantId,
          delta: dto.delta,
          reason: dto.reason,
          userId: adminUserId,
        },
      });
      return { id: updated.id, sku: updated.sku, stock: updated.stock };
    });
  }

  /** Adjustment history, optionally per variant. */
  async history(variantId?: string) {
    return this.prisma.stockAdjustment.findMany({
      where: variantId ? { variantId } : {},
      include: {
        variant: { select: { sku: true, product: { select: { name: true } } } },
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

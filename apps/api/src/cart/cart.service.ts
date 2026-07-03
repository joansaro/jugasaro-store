import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { AddCartItemDto } from './dto/cart.dto';

const CART_INCLUDE = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        include: {
          brand: { select: { id: true, slug: true, name: true } },
          category: { select: { id: true, slug: true, name: true } },
          images: { orderBy: { position: 'asc' as const }, take: 1 },
        },
      },
      variant: true,
    },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof CART_INCLUDE }>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: CART_INCLUDE,
    });
    return this.toResponse(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });
    if (!product || !product.published) {
      throw new NotFoundException('Product not found or unavailable');
    }
    if (product.outOfStock) {
      throw new BadRequestException('Product is out of stock');
    }

    let variantId: string | null = null;
    if (dto.variantId) {
      const variant = product.variants.find((v) => v.id === dto.variantId);
      if (!variant) throw new NotFoundException('Variant not found for this product');
      variantId = variant.id;
    } else if (product.variants.length > 0) {
      // Default to the first variant when product has variants but none was specified.
      variantId = product.variants[0]!.id;
    }

    const quantity = dto.quantity ?? 1;

    // Try to merge with existing line for same (cart, product, variant).
    // findFirst handles the nullable-variantId case better than the compound unique.
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId,
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getOrCreate(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart.userId !== userId) throw new ForbiddenException('Not your cart item');

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.getOrCreate(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart.userId !== userId) throw new ForbiddenException('Not your cart item');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreate(userId);
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getOrCreate(userId);
  }

  // ---------- helpers ----------

  private toResponse(cart: CartWithItems) {
    const items = cart.items.map((item) => {
      const unitPrice = item.variant?.priceOverride ?? item.product.price;
      return {
        id: item.id,
        product: {
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          price: item.product.price,
          compareAtPrice: item.product.compareAtPrice,
          tag: item.product.tag,
          outOfStock: item.product.outOfStock,
          brand: item.product.brand,
          category: item.product.category,
          thumbnailUrl: item.product.images[0]?.url ?? null,
        },
        variant: item.variant
          ? {
              id: item.variant.id,
              sku: item.variant.sku,
              color: item.variant.color,
              size: item.variant.size,
              stock: item.variant.stock,
              priceOverride: item.variant.priceOverride,
            }
          : null,
        quantity: item.quantity,
        unitPrice,
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount,
    };
  }
}

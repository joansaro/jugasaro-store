import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { AddWishlistItemDto } from './dto/wishlist.dto';

const WISHLIST_INCLUDE = {
  items: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      product: {
        include: {
          brand: { select: { id: true, slug: true, name: true } },
          category: { select: { id: true, slug: true, name: true } },
          images: { orderBy: { position: 'asc' as const }, take: 1 },
        },
      },
    },
  },
} satisfies Prisma.WishlistInclude;

type WishlistWithItems = Prisma.WishlistGetPayload<{ include: typeof WISHLIST_INCLUDE }>;

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: WISHLIST_INCLUDE,
    });
    return this.toResponse(wishlist);
  }

  async addItem(userId: string, dto: AddWishlistItemDto) {
    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    try {
      await this.prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: product.id,
          variantId: dto.variantId ?? null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Item already in wishlist');
      }
      throw err;
    }

    return this.getOrCreate(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: { wishlist: true },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    if (item.wishlist.userId !== userId) throw new ForbiddenException('Not your wishlist');

    await this.prisma.wishlistItem.delete({ where: { id: itemId } });
    return this.getOrCreate(userId);
  }

  private toResponse(wishlist: WishlistWithItems) {
    return {
      id: wishlist.id,
      items: wishlist.items.map((item) => ({
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
        addedAt: item.createdAt,
      })),
    };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';

const PURCHASED_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Approved reviews for a product + aggregate stats. */
  async listForProduct(productId: string) {
    const [reviews, agg] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { productId, status: ReviewStatus.APPROVED },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.aggregate({
        where: { productId, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
      count: agg._count,
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
        authorName: r.user.name ?? 'Anonymous',
        createdAt: r.createdAt,
      })),
    };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || !product.published) throw new NotFoundException('Product not found');

    // "Verified purchase": the user has a non-cancelled order containing the product.
    const bought = await this.prisma.orderItem.count({
      where: {
        productId: dto.productId,
        order: { userId, status: { in: [...PURCHASED_STATUSES] } },
      },
    });

    try {
      const review = await this.prisma.review.create({
        data: {
          productId: dto.productId,
          userId,
          rating: dto.rating,
          title: dto.title ?? null,
          body: dto.body,
          verified: bought > 0,
          // Pending until an admin approves it
          status: ReviewStatus.PENDING,
        },
      });
      return { id: review.id, status: review.status, verified: review.verified };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('You already reviewed this product');
      }
      throw e;
    }
  }

  // ---------- admin ----------

  async listAdmin(status?: ReviewStatus) {
    const reviews = await this.prisma.review.findMany({
      where: status ? { status } : {},
      include: {
        user: { select: { email: true, name: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return reviews;
  }

  async moderate(id: string, status: ReviewStatus) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { status } });
  }
}

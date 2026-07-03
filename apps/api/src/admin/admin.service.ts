import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPIs for the admin dashboard.
   * Compares the last 30 days vs the previous 30-day period.
   */
  async dashboard() {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const cutoff30 = new Date(now.getTime() - 30 * day);
    const cutoff60 = new Date(now.getTime() - 60 * day);

    const paidStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const [last30, prev30, customers30, customersPrev30, totalProducts, totalBrands] =
      await Promise.all([
        this.prisma.order.aggregate({
          _sum: { total: true },
          _count: true,
          where: { status: { in: paidStatuses }, createdAt: { gte: cutoff30 } },
        }),
        this.prisma.order.aggregate({
          _sum: { total: true },
          _count: true,
          where: {
            status: { in: paidStatuses },
            createdAt: { gte: cutoff60, lt: cutoff30 },
          },
        }),
        this.prisma.user.count({ where: { createdAt: { gte: cutoff30 } } }),
        this.prisma.user.count({
          where: { createdAt: { gte: cutoff60, lt: cutoff30 } },
        }),
        this.prisma.product.count({ where: { published: true } }),
        this.prisma.brand.count(),
      ]);

    const revenue = last30._sum.total ?? 0;
    const prevRevenue = prev30._sum.total ?? 0;
    const orders = last30._count;
    const prevOrders = prev30._count;
    const aov = orders > 0 ? Math.round(revenue / orders) : 0;
    const prevAov = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;

    const pct = (current: number, previous: number): number => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    return {
      revenue: { value: revenue, delta: pct(revenue, prevRevenue) },
      orders: { value: orders, delta: pct(orders, prevOrders) },
      newCustomers: { value: customers30, delta: pct(customers30, customersPrev30) },
      avgOrderValue: { value: aov, delta: pct(aov, prevAov) },
      totals: {
        products: totalProducts,
        brands: totalBrands,
      },
    };
  }

  async listUsers(opts: { page?: number; pageSize?: number } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        ordersCount: u._count.orders,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Promote/demote a user. An admin cannot change their own role. */
  async updateUserRole(id: string, role: UserRole, actingUserId: string) {
    if (id === actingUserId) {
      throw new BadRequestException('You cannot change your own role.');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });
    return updated;
  }
}

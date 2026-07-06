import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

// Cancelled/refunded orders don't count as sales.
const SOLD = Prisma.sql`status NOT IN ('CANCELLED', 'REFUNDED')`;

interface DayRow {
  day: string;
  orders: number;
  revenue: number;
  discount: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Normalizes the date range: defaults to the last 30 days, end-exclusive. */
  private range(from?: string, to?: string) {
    const end = to ? new Date(`${to}T00:00:00Z`) : new Date();
    end.setUTCDate(end.getUTCDate() + 1); // include the "to" day
    const start = from
      ? new Date(`${from}T00:00:00Z`)
      : new Date(end.getTime() - 31 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  async sales(from?: string, to?: string) {
    const { start, end } = this.range(from, to);

    const [summary, series, topProducts, byCategory] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lt: end },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        _count: true,
        _sum: { total: true, discount: true, shipping: true, tax: true },
        _avg: { total: true },
      }),
      this.prisma.$queryRaw<DayRow[]>(Prisma.sql`
        SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day,
               COUNT(*)::int                            AS orders,
               COALESCE(SUM(total), 0)::int             AS revenue,
               COALESCE(SUM(discount), 0)::int          AS discount
        FROM orders
        WHERE created_at >= ${start} AND created_at < ${end} AND ${SOLD}
        GROUP BY 1
        ORDER BY 1
      `),
      this.prisma.$queryRaw<
        { name: string; units: number; revenue: number }[]
      >(Prisma.sql`
        SELECT oi.product_name                  AS name,
               SUM(oi.quantity)::int            AS units,
               SUM(oi.total_price)::int         AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= ${start} AND o.created_at < ${end}
          AND o.status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY 1
        ORDER BY revenue DESC
        LIMIT 10
      `),
      this.prisma.$queryRaw<
        { name: string; units: number; revenue: number }[]
      >(Prisma.sql`
        SELECT c.name                           AS name,
               SUM(oi.quantity)::int            AS units,
               SUM(oi.total_price)::int         AS revenue
        FROM order_items oi
        JOIN orders o     ON o.id = oi.order_id
        JOIN products p   ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE o.created_at >= ${start} AND o.created_at < ${end}
          AND o.status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY 1
        ORDER BY revenue DESC
      `),
    ]);

    return {
      from: start.toISOString().slice(0, 10),
      to: new Date(end.getTime() - 1).toISOString().slice(0, 10),
      summary: {
        orders: summary._count,
        revenue: summary._sum.total ?? 0,
        discount: summary._sum.discount ?? 0,
        shipping: summary._sum.shipping ?? 0,
        tax: summary._sum.tax ?? 0,
        avgOrder: Math.round(summary._avg.total ?? 0),
      },
      series,
      topProducts,
      byCategory,
    };
  }

  /** Flat CSV of the orders in range, for spreadsheets. */
  async salesCsv(from?: string, to?: string): Promise<string> {
    const { start, end } = this.range(from, to);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const money = (cents: number) => (cents / 100).toFixed(2);
    const header = 'number,date,customer,status,subtotal,discount,coupon,shipping,tax,total';
    const rows = orders.map((o) =>
      [
        o.number,
        o.createdAt.toISOString().slice(0, 10),
        escape(o.user.email),
        o.status,
        money(o.subtotal),
        money(o.discount),
        o.couponCode ?? '',
        money(o.shipping),
        money(o.tax),
        money(o.total),
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }
}

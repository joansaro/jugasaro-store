import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Order, Paginated } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { PageHeader } from '@/components/admin/page-header';
import { KpiCard } from '@/components/admin/kpi-card';

export const dynamic = 'force-dynamic';

interface DashboardData {
  revenue: { value: number; delta: number };
  orders: { value: number; delta: number };
  newCustomers: { value: number; delta: number };
  avgOrderValue: { value: number; delta: number };
  totals: { products: number; brands: number };
}

export default async function AdminDashboard() {
  const [data, recent] = await Promise.all([
    apiServer.get<DashboardData>('/admin/dashboard'),
    apiServer.get<Paginated<Order>>('/admin/orders?pageSize=5'),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Last 30 days"
        title="Dashboard"
        description="Live metrics from the database — revenue, orders and customer acquisition."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <KpiCard
          label="Revenue"
          value={formatPrice(data.revenue.value)}
          delta={data.revenue.delta}
          sub="vs prior 30d"
        />
        <KpiCard
          label="Orders"
          value={String(data.orders.value)}
          delta={data.orders.delta}
          sub="vs prior 30d"
        />
        <KpiCard
          label="New customers"
          value={String(data.newCustomers.value)}
          delta={data.newCustomers.delta}
          sub="vs prior 30d"
        />
        <KpiCard
          label="Avg order value"
          value={formatPrice(data.avgOrderValue.value)}
          delta={data.avgOrderValue.delta}
          sub="vs prior 30d"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted)">
            Catalog snapshot
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {data.totals.products}
              </p>
              <p className="text-xs text-(--color-fg-muted)">products</p>
            </div>
            <div>
              <p
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {data.totals.brands}
              </p>
              <p className="text-xs text-(--color-fg-muted)">brands</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev)">
        <div className="px-5 py-4 border-b border-(--color-border) flex items-center justify-between">
          <h2
            className="text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-(--color-accent) hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-(--color-fg-muted)">
            No orders placed yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Order</th>
                <th className="text-left px-5 py-3 font-normal">Date</th>
                <th className="text-left px-5 py-3 font-normal">Items</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {recent.items.map((o) => (
                <tr key={o.id} className="hover:bg-(--color-bg-muted) transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-(--color-fg-muted)">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-(--color-fg-muted)">{o.items.length}</td>
                  <td className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest">
                    {o.status}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

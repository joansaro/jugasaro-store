import Link from 'next/link';
import type { Order, Paginated, OrderStatus } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/shop/pagination';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: 'bg-(--color-bg-muted) text-(--color-fg-muted)',
  PAID: 'bg-(--color-accent-soft) text-(--color-accent)',
  PROCESSING: 'bg-(--color-warning)/20 text-(--color-warning)',
  SHIPPED: 'bg-(--color-success)/20 text-(--color-success)',
  DELIVERED: 'bg-(--color-success) text-white',
  CANCELLED: 'bg-(--color-danger)/20 text-(--color-danger)',
  REFUNDED: 'bg-(--color-bg-muted) text-(--color-fg-muted)',
};

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.status) params.set('status', sp.status);
  params.set('page', sp.page ?? '1');
  params.set('pageSize', '20');

  const orders = await apiServer.get<Paginated<Order>>(`/admin/orders?${params.toString()}`);

  const STATUSES: OrderStatus[] = [
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  return (
    <>
      <PageHeader eyebrow="Operations" title={`Orders (${orders.total})`} />

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Link
          href="/admin/orders"
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border',
            !sp.status
              ? 'bg-(--color-fg) text-(--color-bg) border-(--color-fg)'
              : 'bg-(--color-bg-elev) border-(--color-border) hover:border-(--color-fg)',
          )}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border font-mono uppercase tracking-widest',
              sp.status === s
                ? 'bg-(--color-fg) text-(--color-bg) border-(--color-fg)'
                : 'bg-(--color-bg-elev) border-(--color-border) hover:border-(--color-fg)',
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
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
            {orders.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-(--color-fg-muted)">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              orders.items.map((o) => (
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
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-(--color-fg-muted)">{o.items.length}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full',
                        STATUS_CLASSES[o.status],
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={orders.page} totalPages={orders.totalPages} basePath="/admin/orders" />
    </>
  );
}

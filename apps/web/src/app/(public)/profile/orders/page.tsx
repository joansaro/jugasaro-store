import Link from 'next/link';
import type { Order, Paginated } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { LinkButton } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const sp = await searchParams;
  const page = sp.page ?? '1';
  const orders = await apiServer.get<Paginated<Order>>(`/orders?page=${page}&pageSize=10`);

  return (
    <div className="space-y-6">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        All orders ({orders.total})
      </h2>

      {orders.items.length === 0 ? (
        <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted) space-y-3">
          <p className="text-base">No orders yet.</p>
          <LinkButton href="/shop" variant="outline">
            Start shopping
          </LinkButton>
        </div>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Order</th>
                <th className="text-left px-4 py-3 font-normal">Date</th>
                <th className="text-left px-4 py-3 font-normal">Items</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="text-right px-4 py-3 font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {orders.items.map((order) => (
                <tr key={order.id} className="hover:bg-(--color-bg-muted) transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-(--color-fg-muted)">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-(--color-fg-muted)">{order.items.length}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-(--color-bg-muted) text-(--color-fg-muted)',
    PAID: 'bg-(--color-accent-soft) text-(--color-accent)',
    PROCESSING: 'bg-(--color-warning)/20 text-(--color-warning)',
    SHIPPED: 'bg-(--color-success)/20 text-(--color-success)',
    DELIVERED: 'bg-(--color-success) text-white',
    CANCELLED: 'bg-(--color-danger)/20 text-(--color-danger)',
    REFUNDED: 'bg-(--color-bg-muted) text-(--color-fg-muted)',
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-full ${map[status] ?? ''}`}
    >
      {status}
    </span>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Order } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { PageHeader } from '@/components/admin/page-header';
import { OrderStatusSelect } from '@/components/admin/order-status-select';

export const dynamic = 'force-dynamic';

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  let order: Order;
  try {
    order = await apiServer.get<Order>(`/orders/${id}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) notFound();
    throw err;
  }

  return (
    <>
      <PageHeader
        eyebrow={`Placed ${new Date(order.createdAt).toLocaleString()}`}
        title={`Order ${order.number}`}
      />

      <Link
        href="/admin/orders"
        className="text-sm text-(--color-accent) hover:underline inline-block mb-4"
      >
        ← Back to orders
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-3">
              Items ({order.items.length})
            </h3>
            <ul className="divide-y divide-(--color-border)">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    {item.variantSku && (
                      <p className="text-xs font-mono text-(--color-fg-subtle)">
                        {item.variantSku}
                      </p>
                    )}
                    <p className="text-xs text-(--color-fg-muted) mt-1">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {formatPrice(item.totalPrice)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-(--color-border) space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row
                label="Shipping"
                value={order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
              />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
              <Row label="Total" value={formatPrice(order.total)} bold />
            </div>
          </section>

          {order.shippingAddress && (
            <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-3">
                Shipping address
              </h3>
              <address className="not-italic text-sm space-y-0.5">
                <p>{order.shippingAddress.fullName}</p>
                <p className="text-(--color-fg-muted)">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p className="text-(--color-fg-muted)">{order.shippingAddress.line2}</p>
                )}
                <p className="text-(--color-fg-muted)">
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-(--color-fg-muted)">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-(--color-fg-muted) font-mono">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </address>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
              Status
            </h3>
            <OrderStatusSelect orderId={order.id} current={order.status} />
            <p className="text-xs text-(--color-fg-muted)">
              Changes are saved automatically.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-3 ${bold ? 'border-t border-(--color-border) pt-2 font-semibold text-base' : ''}`}
    >
      <dt className={bold ? '' : 'text-(--color-fg-muted)'}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

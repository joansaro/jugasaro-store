import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Order } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  let order: Order;
  try {
    order = await apiServer.get<Order>(`/orders/${id}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/profile/orders"
        className="text-sm text-(--color-accent) hover:underline inline-block"
      >
        ← Back to orders
      </Link>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
              Order
            </p>
            <h2
              className="text-xl font-semibold font-mono"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {order.number}
            </h2>
            <p className="text-xs text-(--color-fg-muted) mt-1">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest font-medium px-3 py-1.5 rounded-full bg-(--color-accent-soft) text-(--color-accent)">
            {order.status}
          </span>
        </div>

        <div className="border-t border-(--color-border) pt-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-3">
            Items
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
        </div>

        <div className="border-t border-(--color-border) pt-5 grid sm:grid-cols-2 gap-6">
          {order.shippingAddress && (
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-2">
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
            </div>
          )}

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-2">
              Summary
            </h3>
            <dl className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Shipping" value={order.shipping === 0 ? 'Free' : formatPrice(order.shipping)} />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
              <Row label="Total" value={formatPrice(order.total)} bold />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? 'border-t border-(--color-border) pt-2 font-semibold text-base' : ''}`}>
      <dt className={bold ? '' : 'text-(--color-fg-muted)'}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

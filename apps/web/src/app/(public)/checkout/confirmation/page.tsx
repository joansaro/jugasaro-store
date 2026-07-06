import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { Order } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { apiServer } from '@/lib/api';
import { requireAuth } from '@/lib/auth-server';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface ConfirmationProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationProps) {
  await requireAuth();
  const sp = await searchParams;
  if (!sp.order) redirect('/');

  const order = await apiServer.get<Order>(`/orders/${sp.order}`);

  return (
    <main className="py-16">
      <Container className="max-w-xl">
        <div className="text-center space-y-4 mb-10">
          <CheckCircle2 className="size-12 mx-auto text-(--color-success)" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Order placed
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Thank you for your order!
          </h1>
          <p className="text-(--color-fg-muted)">
            Your order <strong className="font-mono">{order.number}</strong> has been received and
            is being processed. You&apos;ll get an email with tracking information shortly.
          </p>
        </div>

        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-mono text-sm font-medium">{order.number}</p>
            <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-(--color-accent-soft) text-(--color-accent)">
              {order.status}
            </span>
          </div>
          <ul className="divide-y divide-(--color-border) text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="py-2 flex justify-between gap-2">
                <span className="truncate">
                  {item.quantity}× {item.productName}
                </span>
                <span className="font-mono text-xs">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-(--color-border) pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-(--color-fg-muted)">Subtotal</span>
              <span className="font-mono">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-(--color-success)">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span className="font-mono">−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-(--color-fg-muted)">
                Shipping{order.shippingMethodName ? ` — ${order.shippingMethodName}` : ''}
              </span>
              <span className="font-mono">
                {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-(--color-fg-muted)">Tax</span>
                <span className="font-mono">{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-(--color-border) text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-8">
          <LinkButton href={`/profile/orders/${order.id}`} variant="outline">
            View order details
          </LinkButton>
          <LinkButton href="/shop">Keep shopping</LinkButton>
        </div>

        <p className="text-center text-xs text-(--color-fg-muted) pt-6">
          Need help?{' '}
          <Link href="/profile/orders" className="text-(--color-accent) hover:underline">
            Manage your orders
          </Link>
        </p>
      </Container>
    </main>
  );
}

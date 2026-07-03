import { redirect } from 'next/navigation';
import type { Cart } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { apiServer } from '@/lib/api';
import { requireAuth } from '@/lib/auth-server';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { CartSummary } from '@/components/cart/cart-summary';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await requireAuth();
  const cart = await apiServer.get<Cart>('/cart');

  if (cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <main className="py-12">
      <Container>
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Step 2 of 2
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-8">
            <section>
              <h2
                className="text-lg font-semibold tracking-tight mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Shipping address
              </h2>
              <CheckoutForm defaultName={user.name ?? undefined} />
            </section>
          </div>

          <div className="space-y-4">
            <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
            <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-3">
                In your order
              </p>
              <ul className="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="truncate min-w-0">
                      {item.quantity}× {item.product.name}
                    </span>
                    <span className="font-mono text-xs whitespace-nowrap">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

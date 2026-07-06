import { redirect } from 'next/navigation';
import type { Cart, ShippingMethod, StoreSettings } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { apiServer } from '@/lib/api';
import { requireAuth } from '@/lib/auth-server';
import { CheckoutClient } from '@/components/checkout/checkout-client';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await requireAuth();
  const [cart, methods, settings] = await Promise.all([
    apiServer.get<Cart>('/cart'),
    apiServer.get<ShippingMethod[]>('/shipping-methods'),
    apiServer.get<StoreSettings>('/settings'),
  ]);

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

        <CheckoutClient
          cart={cart}
          methods={methods}
          taxRateBps={settings.taxRateBps}
          defaultName={user.name ?? undefined}
        />
      </Container>
    </main>
  );
}

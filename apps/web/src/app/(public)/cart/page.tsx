import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { Cart } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { apiServer } from '@/lib/api';
import { getMe } from '@/lib/auth-server';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { CartSummary } from '@/components/cart/cart-summary';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const user = await getMe();

  if (!user) {
    return (
      <main className="py-24">
        <Container className="max-w-md text-center space-y-4">
          <ShoppingBag className="size-10 mx-auto text-(--color-fg-muted)" />
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your cart
          </h1>
          <p className="text-(--color-fg-muted)">
            Sign in to see your cart and continue checking out.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <LinkButton href="/login?redirect=/cart">Sign in</LinkButton>
            <LinkButton href="/register" variant="outline">
              Create account
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  const cart = await apiServer.get<Cart>('/cart');

  if (cart.items.length === 0) {
    return (
      <main className="py-24">
        <Container className="max-w-md text-center space-y-4">
          <ShoppingBag className="size-10 mx-auto text-(--color-fg-muted)" />
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your cart is empty
          </h1>
          <p className="text-(--color-fg-muted)">
            Find something you love — over a thousand products from 100+ brands.
          </p>
          <div className="pt-2">
            <LinkButton href="/shop" size="lg">
              Browse products
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12">
      <Container>
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Step 1 of 2
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your cart ({cart.itemCount})
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            <div className="border-t border-(--color-border)">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
            <Link
              href="/shop"
              className="text-sm text-(--color-accent) hover:underline mt-4 inline-block"
            >
              ← Continue shopping
            </Link>
          </div>

          <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
        </div>
      </Container>
    </main>
  );
}

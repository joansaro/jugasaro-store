import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { WishlistItem } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { Badge } from '@/components/ui/badge';
import { apiServer } from '@/lib/api';
import { getMe } from '@/lib/auth-server';
import { formatPrice } from '@/lib/format';
import { WishlistItemActions } from '@/components/cart/wishlist-actions';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const user = await getMe();

  if (!user) {
    return (
      <main className="py-24">
        <Container className="max-w-md text-center space-y-4">
          <Heart className="size-10 mx-auto text-(--color-fg-muted)" />
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your wishlist
          </h1>
          <p className="text-(--color-fg-muted)">Sign in to save your favorite products.</p>
          <div className="pt-2 flex gap-3 justify-center">
            <LinkButton href="/login?redirect=/wishlist">Sign in</LinkButton>
            <LinkButton href="/register" variant="outline">
              Create account
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  const wishlist = await apiServer.get<{ id: string; items: WishlistItem[] }>('/wishlist');

  return (
    <main className="py-12">
      <Container>
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Saved for later
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Wishlist ({wishlist.items.length})
          </h1>
        </div>

        {wishlist.items.length === 0 ? (
          <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted) space-y-3">
            <p className="text-base">Your wishlist is empty.</p>
            <LinkButton href="/shop" variant="outline">
              Browse products
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden flex flex-col"
              >
                <Link href={`/products/${item.product.slug}`} className="relative">
                  <SmartImage src={item.product.thumbnailUrl} alt={item.product.name} fallbackKey={item.product.id} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.product.tag && (
                      <Badge
                        variant={
                          item.product.tag === 'NEW'
                            ? 'new'
                            : item.product.tag === 'SALE'
                              ? 'sale'
                              : 'hot'
                        }
                      >
                        {item.product.tag}
                      </Badge>
                    )}
                    {item.product.outOfStock && <Badge variant="soft">Out of stock</Badge>}
                  </div>
                </Link>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">
                      {item.product.brand.name}
                    </p>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-2 text-base font-semibold">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <WishlistItemActions
                    productId={item.product.id}
                    wishlistItemId={item.id}
                    outOfStock={item.product.outOfStock}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

'use client';

import { useTransition } from 'react';
import { ShoppingBag, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  moveToCartAction,
  removeWishlistItemAction,
} from '@/app/(public)/wishlist/actions';

export function WishlistItemActions({
  productId,
  wishlistItemId,
  outOfStock,
}: {
  productId: string;
  wishlistItemId: string;
  outOfStock: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          startTransition(() => {
            void moveToCartAction(productId, wishlistItemId);
          })
        }
        disabled={pending || outOfStock}
        className="flex-1"
      >
        <ShoppingBag className="size-3.5" />
        {outOfStock ? 'Out of stock' : 'Move to cart'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          startTransition(() => {
            void removeWishlistItemAction(wishlistItemId);
          })
        }
        disabled={pending}
        aria-label="Remove from wishlist"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import type { CartItem } from '@jugasaro/shared';

import { SmartImage } from '@/components/ui/smart-image';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';
import { removeCartItemAction, updateCartItemAction } from '@/app/(public)/cart/actions';

export function CartItemRow({ item }: { item: CartItem }) {
  const [pending, startTransition] = useTransition();

  const update = (qty: number) => {
    if (qty < 1) return;
    startTransition(() => {
      void updateCartItemAction(item.id, qty);
    });
  };

  const remove = () => {
    startTransition(() => {
      void removeCartItemAction(item.id);
    });
  };

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div
      className={cn(
        'flex gap-4 py-5 border-b border-(--color-border) transition-opacity',
        pending && 'opacity-50',
      )}
    >
      <Link
        href={`/products/${item.product.slug}`}
        className="size-24 sm:size-28 rounded-lg overflow-hidden bg-(--color-bg-muted) shrink-0"
      >
        <SmartImage src={item.product.thumbnailUrl} alt={item.product.name} fallbackKey={item.product.id} />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
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
            {item.variant && (item.variant.color || item.variant.size) && (
              <p className="text-xs text-(--color-fg-muted) mt-1">
                {[item.variant.color, item.variant.size].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label="Remove from cart"
            className="p-1 text-(--color-fg-muted) hover:text-(--color-danger) cursor-pointer disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-end justify-between gap-3">
          <div className="inline-flex items-center border border-(--color-border) rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => update(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              className="size-8 grid place-items-center hover:bg-(--color-bg-muted) cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm font-mono">{item.quantity}</span>
            <button
              type="button"
              onClick={() => update(item.quantity + 1)}
              disabled={pending}
              className="size-8 grid place-items-center hover:bg-(--color-bg-muted) cursor-pointer disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-(--color-fg-subtle) font-mono">
                {formatPrice(item.unitPrice)} ea
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

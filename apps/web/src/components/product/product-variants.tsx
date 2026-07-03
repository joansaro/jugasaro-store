'use client';

import { useState } from 'react';
import type { Product, ProductVariant } from '@jugasaro/shared';
import { Heart, ShoppingBag } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

interface ProductVariantsProps {
  product: Product;
}

export function ProductVariants({ product }: ProductVariantsProps) {
  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c)));
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s)));

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const matchVariant = (variants: ProductVariant[]): ProductVariant | null => {
    return (
      variants.find(
        (v) =>
          (selectedColor === null || v.color === selectedColor) &&
          (selectedSize === null || v.size === selectedSize),
      ) ?? null
    );
  };

  const variant = matchVariant(product.variants);
  const price = variant?.priceOverride ?? product.price;
  const isOOS = product.outOfStock || (variant ? variant.stock <= 0 : false);

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback(null);
    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.post('/cart/items', {
        productId: product.id,
        variantId: variant?.id,
        quantity: 1,
      });
      setFeedback('Added to cart');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Could not add to cart — login first?');
    } finally {
      setAdding(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.post('/wishlist/items', { productId: product.id });
      setFeedback('Added to wishlist');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Could not add to wishlist');
    } finally {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold">{formatPrice(price)}</span>
        {product.compareAtPrice && product.compareAtPrice > price && (
          <span className="text-base text-(--color-fg-subtle) line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
            Color: <span className="text-(--color-fg)">{selectedColor}</span>
          </p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={cn(
                  'size-9 rounded-full border-2 cursor-pointer transition-all',
                  selectedColor === c
                    ? 'border-(--color-accent) ring-2 ring-(--color-accent)/30'
                    : 'border-(--color-border-strong) hover:border-(--color-fg)',
                )}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={cn(
                  'min-w-12 h-10 px-3 rounded-md border text-sm font-medium cursor-pointer transition-colors',
                  selectedSize === s
                    ? 'bg-(--color-fg) text-(--color-bg) border-(--color-fg)'
                    : 'bg-(--color-bg-elev) border-(--color-border) hover:border-(--color-fg)',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={adding || isOOS}
          className="w-full"
        >
          <ShoppingBag className="size-4" />
          {isOOS ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
        </Button>
        <Button size="lg" variant="outline" onClick={handleAddToWishlist} className="w-full">
          <Heart className="size-4" />
          Add to wishlist
        </Button>
        {feedback && (
          <p
            role="status"
            className="text-xs text-center font-medium pt-1 text-(--color-fg-muted)"
          >
            {feedback}
          </p>
        )}
      </div>

      {variant && (
        <div className="border-t border-(--color-border) pt-4 space-y-1 text-xs font-mono text-(--color-fg-subtle)">
          <p>SKU: {variant.sku}</p>
          {variant.stock > 0 && variant.stock <= 5 && (
            <p className="text-(--color-warning)">Only {variant.stock} left in stock</p>
          )}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import type { ProductListItem } from '@jugasaro/shared';

import { Badge } from '@/components/ui/badge';
import { SmartImage } from '@/components/ui/smart-image';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const tagVariant =
    product.tag === 'NEW' ? 'new' : product.tag === 'SALE' ? 'sale' : product.tag === 'HOT' ? 'hot' : null;

  return (
    <Link
      href={`/products/${product.slug}` as never}
      className={cn(
        'group relative flex flex-col gap-3 p-2 rounded-2xl hover:bg-(--color-bg-muted) transition-colors',
        className,
      )}
    >
      <div className="relative rounded-xl overflow-hidden bg-(--color-bg-muted)">
        <SmartImage
          src={product.thumbnailUrl}
          alt={product.name}
          fallbackKey={product.id}
          className="rounded-xl"
          imgClassName="group-hover:scale-[1.02] transition-transform duration-300"
        />

        {/* badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {tagVariant && <Badge variant={tagVariant}>{product.tag}</Badge>}
          {product.outOfStock && <Badge variant="soft">Out of stock</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">
          {product.brand.name}
        </p>
        <h3
          className="text-sm font-medium line-clamp-2 min-h-[2.5em]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-(--color-fg-subtle) line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

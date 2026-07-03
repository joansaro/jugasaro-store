'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { Brand, Category } from '@jugasaro/shared';

import { cn } from '@/lib/cn';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-asc', label: 'Price: low → high' },
  { value: 'price-desc', label: 'Price: high → low' },
];

const TAGS = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'SALE', label: 'On sale' },
  { value: 'HOT', label: 'Hot' },
];

interface ShopFiltersProps {
  brands: Brand[];
  categories: Category[];
}

export function ShopFilters({ brands, categories }: ShopFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    next.delete('page');
    startTransition(() => {
      router.push(`/shop?${next.toString()}` as never);
    });
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
        {title}
      </h4>
      {children}
    </div>
  );

  const Pill = ({
    selected,
    onClick,
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50',
        selected
          ? 'bg-(--color-fg) text-(--color-bg) border-(--color-fg)'
          : 'bg-(--color-bg-elev) text-(--color-fg) border-(--color-border) hover:border-(--color-fg)',
      )}
    >
      {children}
    </button>
  );

  return (
    <aside className="space-y-8">
      <Section title="Tag">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <Pill
              key={t.value}
              selected={(params.get('tag') ?? '') === t.value}
              onClick={() => update('tag', t.value || null)}
            >
              {t.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Sort by">
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((o) => (
            <Pill
              key={o.value}
              selected={(params.get('sort') ?? 'newest') === o.value}
              onClick={() => update('sort', o.value)}
            >
              {o.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title={`Categories (${categories.length})`}>
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-2">
          <button
            type="button"
            onClick={() => update('categorySlug', null)}
            className={cn(
              'text-left text-sm px-2 py-1.5 rounded-md cursor-pointer',
              !params.get('categorySlug')
                ? 'bg-(--color-bg-muted) font-semibold'
                : 'hover:bg-(--color-bg-muted)',
            )}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update('categorySlug', c.slug)}
              className={cn(
                'text-left text-sm px-2 py-1.5 rounded-md flex justify-between items-center cursor-pointer',
                params.get('categorySlug') === c.slug
                  ? 'bg-(--color-bg-muted) font-semibold'
                  : 'hover:bg-(--color-bg-muted)',
              )}
            >
              <span>{c.name}</span>
              {c.productCount !== undefined && (
                <span className="font-mono text-[10px] text-(--color-fg-subtle)">
                  {c.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Brands (${brands.length})`}>
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-2">
          <button
            type="button"
            onClick={() => update('brandSlug', null)}
            className={cn(
              'text-left text-sm px-2 py-1.5 rounded-md cursor-pointer',
              !params.get('brandSlug')
                ? 'bg-(--color-bg-muted) font-semibold'
                : 'hover:bg-(--color-bg-muted)',
            )}
          >
            All brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => update('brandSlug', b.slug)}
              className={cn(
                'text-left text-sm px-2 py-1.5 rounded-md cursor-pointer',
                params.get('brandSlug') === b.slug
                  ? 'bg-(--color-bg-muted) font-semibold'
                  : 'hover:bg-(--color-bg-muted)',
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}

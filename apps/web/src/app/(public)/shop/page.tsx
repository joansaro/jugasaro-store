import type { Brand, Category, Paginated, ProductListItem } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { Container } from '@/components/ui/container';
import { ProductCard } from '@/components/product/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { Pagination } from '@/components/shop/pagination';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sp = await searchParams;

  const params = new URLSearchParams();
  for (const key of [
    'search',
    'brandSlug',
    'categorySlug',
    'tag',
    'minPrice',
    'maxPrice',
    'sort',
    'page',
  ]) {
    const value = sp[key];
    if (typeof value === 'string' && value.length > 0) params.set(key, value);
  }
  params.set('pageSize', '24');

  const [products, brands, categories] = await Promise.all([
    apiServer.get<Paginated<ProductListItem>>(`/products?${params.toString()}`),
    apiServer.get<Brand[]>('/brands'),
    apiServer.get<Category[]>('/categories?withCount=true'),
  ]);

  return (
    <main className="py-10">
      <Container>
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            All products
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shop
          </h1>
          <p className="text-sm text-(--color-fg-muted)">
            {products.total} products · page {products.page} of {Math.max(products.totalPages, 1)}
          </p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <ShopFilters brands={brands} categories={categories} />

          <div>
            {products.items.length === 0 ? (
              <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted)">
                <p className="text-base">No products match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {products.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            <Pagination page={products.page} totalPages={products.totalPages} />
          </div>
        </div>
      </Container>
    </main>
  );
}

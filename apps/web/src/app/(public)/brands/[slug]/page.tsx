import { notFound } from 'next/navigation';
import type { Brand, Paginated, ProductListItem } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { Container } from '@/components/ui/container';
import { ProductCard } from '@/components/product/product-card';
import { Pagination } from '@/components/shop/pagination';

export const dynamic = 'force-dynamic';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let brand: Brand;
  try {
    brand = await apiServer.get<Brand>(`/brands/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const page = sp.page ?? '1';
  const products = await apiServer.get<Paginated<ProductListItem>>(
    `/products?brandSlug=${slug}&page=${page}&pageSize=24`,
  );

  return (
    <main className="py-12">
      <Container>
        <div className="mb-10 space-y-2 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-accent)">
            Brand
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-sm text-(--color-fg-muted)">{brand.description}</p>
          )}
          <p className="text-sm text-(--color-fg-muted) pt-2">
            {products.total} {products.total === 1 ? 'product' : 'products'}
          </p>
        </div>

        {products.items.length === 0 ? (
          <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted)">
            <p className="text-base">No products yet for this brand.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <Pagination
          page={products.page}
          totalPages={products.totalPages}
          basePath={`/brands/${slug}`}
        />
      </Container>
    </main>
  );
}

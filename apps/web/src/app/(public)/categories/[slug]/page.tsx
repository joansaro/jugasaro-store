import { notFound } from 'next/navigation';
import type { Category, Paginated, ProductListItem } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { Container } from '@/components/ui/container';
import { ProductCard } from '@/components/product/product-card';
import { Pagination } from '@/components/shop/pagination';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let category: Category;
  try {
    category = await apiServer.get<Category>(`/categories/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const page = sp.page ?? '1';
  const products = await apiServer.get<Paginated<ProductListItem>>(
    `/products?categorySlug=${slug}&page=${page}&pageSize=24`,
  );

  return (
    <main className="py-12">
      <Container>
        <div className="mb-10 space-y-2 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-accent)">
            Category
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-(--color-fg-muted)">{category.description}</p>
          )}
          <p className="text-sm text-(--color-fg-muted) pt-2">
            {products.total} {products.total === 1 ? 'product' : 'products'}
          </p>
        </div>

        {products.items.length === 0 ? (
          <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted)">
            <p className="text-base">No products yet in this category.</p>
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
          basePath={`/categories/${slug}`}
        />
      </Container>
    </main>
  );
}

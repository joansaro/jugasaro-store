import Link from 'next/link';
import type { Category } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { Container } from '@/components/ui/container';
import { SmartImage } from '@/components/ui/smart-image';

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await apiServer.get<Category[]>('/categories?withCount=true');

  return (
    <main className="py-12">
      <Container>
        <div className="mb-10 space-y-2 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Browse by category
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            All categories
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}` as never}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] hover:shadow-lg transition-shadow"
            >
              <SmartImage src={c.imageUrl} alt={c.name} fallbackKey={c.slug} aspect="aspect-[4/3]" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <h3
                  className="text-white text-lg font-semibold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {c.name}
                </h3>
                {c.productCount !== undefined && (
                  <p className="text-white/80 text-xs font-mono uppercase tracking-widest">
                    {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

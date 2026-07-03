import Link from 'next/link';
import type { Brand } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { Container } from '@/components/ui/container';

export const revalidate = 300;

export default async function BrandsPage() {
  const brands = await apiServer.get<Brand[]>('/brands?withCount=true');

  return (
    <main className="py-12">
      <Container>
        <div className="mb-10 space-y-2 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Curated partners
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            All brands ({brands.length})
          </h1>
          <p className="text-sm text-(--color-fg-muted)">
            From minimalist studios to heritage makers — the full lineup of Jugasaro&apos;s curated
            brand partners.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}` as never}
              className="aspect-[4/3] rounded-xl border border-(--color-border) bg-(--color-bg-elev) flex flex-col items-center justify-center px-3 hover:border-(--color-accent) hover:bg-(--color-accent-soft) transition-colors"
            >
              <span
                className="text-sm font-semibold tracking-tight text-center line-clamp-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {b.name}
              </span>
              {b.productCount !== undefined && b.productCount > 0 && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle) mt-1">
                  {b.productCount} {b.productCount === 1 ? 'product' : 'products'}
                </span>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

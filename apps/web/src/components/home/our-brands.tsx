import Link from 'next/link';
import type { Brand } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { SectionHeader } from './section-header';

export function OurBrands({ brands }: { brands: Brand[] }) {
  return (
    <section className="py-12 md:py-16 bg-(--color-bg-subtle)">
      <Container>
        <SectionHeader
          eyebrow="Curated partners"
          title="100+ brands you'll love."
          link={{ href: '/brands', label: 'All brands' }}
        />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {brands.slice(0, 32).map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}` as never}
              className="aspect-[3/2] rounded-xl border border-(--color-border) bg-(--color-bg-elev) grid place-items-center px-3 hover:border-(--color-accent) hover:bg-(--color-accent-soft) transition-colors"
            >
              <span
                className="text-xs sm:text-sm font-semibold tracking-tight text-center line-clamp-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

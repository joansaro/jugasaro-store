import Link from 'next/link';
import type { Category } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { SmartImage } from '@/components/ui/smart-image';
import { SectionHeader } from './section-header';

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-12 md:py-16 bg-(--color-bg-subtle)">
      <Container>
        <SectionHeader
          eyebrow="Browse by category"
          title="Find what you're looking for."
          link={{ href: '/categories', label: 'All categories' }}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.slice(0, 8).map((c) => (
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
                    {c.productCount} products
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

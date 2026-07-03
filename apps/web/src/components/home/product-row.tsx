import type { ProductListItem } from '@jugasaro/shared';
import { Container } from '@/components/ui/container';
import { ProductCard } from '@/components/product/product-card';
import { SectionHeader } from './section-header';

interface ProductRowProps {
  eyebrow?: string;
  title: string;
  link?: { href: string; label: string };
  products: ProductListItem[];
}

export function ProductRow({ eyebrow, title, link, products }: ProductRowProps) {
  if (products.length === 0) return null;
  return (
    <section className="py-12 md:py-16">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} link={link} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

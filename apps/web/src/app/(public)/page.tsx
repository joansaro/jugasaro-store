import type { Brand, Category, HeroSlide, Paginated, ProductListItem } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { Hero } from '@/components/home/hero';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { ProductRow } from '@/components/home/product-row';
import { CategoriesGrid } from '@/components/home/categories-grid';
import { Promotions } from '@/components/home/promotions';
import { OurBrands } from '@/components/home/our-brands';
import { Locations } from '@/components/home/locations';

export const revalidate = 60; // ISR — refresh home every minute

export default async function HomePage() {
  // Fetch in parallel — these are all independent.
  const [slides, bestSellers, newArrivals, categories, brands] = await Promise.all([
    apiServer.get<HeroSlide[]>('/hero-slides'),
    apiServer.get<Paginated<ProductListItem>>('/products?sort=popular&pageSize=8'),
    apiServer.get<Paginated<ProductListItem>>('/products?sort=newest&pageSize=8'),
    apiServer.get<Category[]>('/categories?withCount=true'),
    apiServer.get<Brand[]>('/brands?withCount=true'),
  ]);

  return (
    <main>
      {slides.length > 0 ? <HeroCarousel slides={slides} /> : <Hero />}
      <ProductRow
        eyebrow="Best sellers"
        title="What everyone is loving."
        link={{ href: '/shop?sort=popular', label: 'See all' }}
        products={bestSellers.items}
      />
      <CategoriesGrid categories={categories} />
      <ProductRow
        eyebrow="Just landed"
        title="New arrivals."
        link={{ href: '/shop?sort=newest', label: 'See all' }}
        products={newArrivals.items}
      />
      <Promotions />
      <OurBrands brands={brands} />
      <Locations />
    </main>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { Container } from '@/components/ui/container';
import { SmartImage } from '@/components/ui/smart-image';
import { Badge } from '@/components/ui/badge';
import { ProductVariants } from '@/components/product/product-variants';
import { ProductReviews } from '@/components/product/product-reviews';
import { getMe } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

interface PdpProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PdpProps) {
  const { slug } = await params;
  try {
    const product = await apiServer.get<Product>(`/products/${slug}`);
    return { title: product.name, description: product.description ?? undefined };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductPage({ params }: PdpProps) {
  const { slug } = await params;
  const me = await getMe();
  let product: Product;
  try {
    product = await apiServer.get<Product>(`/products/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const tagVariant =
    product.tag === 'NEW' ? 'new' : product.tag === 'SALE' ? 'sale' : product.tag === 'HOT' ? 'hot' : null;

  return (
    <main className="py-10">
      <Container>
        {/* Breadcrumbs */}
        <nav className="text-sm text-(--color-fg-muted) mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-(--color-fg)">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}` as never} className="hover:text-(--color-fg)">
            {product.category.name}
          </Link>
          <span>/</span>
          <Link href={`/brands/${product.brand.slug}` as never} className="hover:text-(--color-fg)">
            {product.brand.name}
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-(--color-bg-muted)">
              <SmartImage
                src={product.images[0]?.url}
                alt={product.images[0]?.alt ?? product.name}
                fallbackKey={product.id}
                aspect="aspect-square"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {tagVariant && <Badge variant={tagVariant}>{product.tag}</Badge>}
                {product.outOfStock && <Badge variant="soft">Out of stock</Badge>}
              </div>
            </div>
            {/* Thumbnails — real product images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img) => (
                  <div key={img.id} className="rounded-lg overflow-hidden border border-(--color-border)">
                    <SmartImage src={img.url} alt={img.alt ?? product.name} fallbackKey={img.id} aspect="aspect-square" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Link
                href={`/brands/${product.brand.slug}` as never}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted) hover:text-(--color-accent)"
              >
                {product.brand.name}
              </Link>
              <h1
                className="text-3xl md:text-4xl font-semibold tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {product.name}
              </h1>
            </div>

            <ProductVariants product={product} />

            {product.description && (
              <div className="border-t border-(--color-border) pt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-2">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-(--color-fg-muted)">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <ProductReviews productId={product.id} isLoggedIn={me !== null} />
      </Container>
    </main>
  );
}

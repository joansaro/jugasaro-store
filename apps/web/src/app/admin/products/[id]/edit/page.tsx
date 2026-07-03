import { notFound } from 'next/navigation';
import type { Brand, Category, Product } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // The API exposes /products/:slug — the admin URL uses id.
  // List products and find by id (works because admin only has 40-ish; will need
  // a /products/by-id/:id endpoint if scale grows).
  let product: Product | undefined;
  try {
    // Try as slug first — common case if admin clicked a card
    product = await apiServer.get<Product>(`/products/${id}`);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) throw err;
  }

  if (!product) {
    // Fallback: search through pages until found
    let page = 1;
    while (true) {
      const list = await apiServer.get<{ items: Product[]; totalPages: number }>(
        `/products?pageSize=50&page=${page}`,
      );
      const match = list.items.find((p) => p.id === id);
      if (match) {
        product = await apiServer.get<Product>(`/products/${match.slug}`);
        break;
      }
      if (page >= list.totalPages) break;
      page += 1;
    }
  }

  if (!product) notFound();

  const [brands, categories] = await Promise.all([
    apiServer.get<Brand[]>('/brands'),
    apiServer.get<Category[]>('/categories'),
  ]);

  return (
    <>
      <PageHeader eyebrow="Products" title={`Edit: ${product.name}`} />
      <ProductForm mode="edit" brands={brands} categories={categories} initial={product} />
    </>
  );
}

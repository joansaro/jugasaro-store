import type { Brand, Category } from '@jugasaro/shared';
import { apiServer } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    apiServer.get<Brand[]>('/brands'),
    apiServer.get<Category[]>('/categories'),
  ]);

  return (
    <>
      <PageHeader eyebrow="Products" title="New product" />
      <ProductForm mode="create" brands={brands} categories={categories} />
    </>
  );
}

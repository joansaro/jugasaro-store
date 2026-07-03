import { notFound } from 'next/navigation';
import type { Brand } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { BrandForm } from '@/components/admin/brand-form';

export const dynamic = 'force-dynamic';

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;

  // The API exposes /brands/:slug — to find by id we list all and match.
  const brands = await apiServer.get<Brand[]>('/brands');
  const brand = brands.find((b) => b.id === id);
  if (!brand) {
    try {
      // Fallback: maybe `id` is actually a slug
      const bySlug = await apiServer.get<Brand>(`/brands/${id}`);
      return renderEdit(bySlug);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }
  }
  return renderEdit(brand);
}

function renderEdit(brand: Brand) {
  return (
    <>
      <PageHeader eyebrow="Brands" title={`Edit: ${brand.name}`} />
      <BrandForm
        mode="edit"
        initial={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          logoUrl: brand.logoUrl,
        }}
      />
    </>
  );
}

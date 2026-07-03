import { notFound } from 'next/navigation';
import type { Category } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { CategoryForm } from '@/components/admin/category-form';

export const dynamic = 'force-dynamic';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const categories = await apiServer.get<Category[]>('/categories');
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <>
      <PageHeader eyebrow="Categories" title={`Edit: ${category.name}`} />
      <CategoryForm
        mode="edit"
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
        }}
      />
    </>
  );
}

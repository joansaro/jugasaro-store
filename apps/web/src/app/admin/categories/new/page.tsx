import { PageHeader } from '@/components/admin/page-header';
import { CategoryForm } from '@/components/admin/category-form';

export const dynamic = 'force-dynamic';

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader eyebrow="Categories" title="New category" />
      <CategoryForm mode="create" />
    </>
  );
}

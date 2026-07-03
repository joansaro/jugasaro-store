import { PageHeader } from '@/components/admin/page-header';
import { BrandForm } from '@/components/admin/brand-form';

export const dynamic = 'force-dynamic';

export default function NewBrandPage() {
  return (
    <>
      <PageHeader eyebrow="Brands" title="New brand" />
      <BrandForm mode="create" />
    </>
  );
}

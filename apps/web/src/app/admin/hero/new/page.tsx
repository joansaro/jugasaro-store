import { PageHeader } from '@/components/admin/page-header';
import { HeroSlideForm } from '@/components/admin/hero-slide-form';

export default function NewHeroSlidePage() {
  return (
    <>
      <PageHeader eyebrow="Storefront" title="New slide" />
      <HeroSlideForm mode="create" />
    </>
  );
}

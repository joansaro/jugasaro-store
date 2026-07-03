import type { HeroSlide } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { HeroSlideForm } from '@/components/admin/hero-slide-form';

export const dynamic = 'force-dynamic';

interface EditHeroSlidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHeroSlidePage({ params }: EditHeroSlidePageProps) {
  const { id } = await params;
  const slide = await apiServer.get<HeroSlide>(`/hero-slides/${id}`);

  return (
    <>
      <PageHeader eyebrow="Storefront" title={`Edit: ${slide.title}`} />
      <HeroSlideForm mode="edit" initial={slide} />
    </>
  );
}

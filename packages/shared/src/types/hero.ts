export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Placeholder } from '@/components/ui/placeholder';

const PROMOS = [
  { eyebrow: 'Summer Drop — 06.15', title: 'Up to 40% off across 60+ partner brands.', cta: 'Shop summer sale', href: '/shop?tag=SALE', large: true, hue: 285 },
  { eyebrow: 'Members only', title: 'Free shipping over $75.', cta: 'Join now', href: '/register', hue: 300 },
  { eyebrow: 'New at Jugasaro', title: "Fresh arrivals every Monday.", cta: "See what's new", href: '/shop?sort=newest', hue: 310 },
];

export function Promotions() {
  return (
    <section className="py-12 md:py-16">
      <Container className="grid md:grid-cols-3 gap-3 md:gap-4">
        {PROMOS.map((p, i) => (
          <div
            key={i}
            className={`relative rounded-2xl overflow-hidden flex flex-col justify-end p-6 md:p-8 min-h-[280px] ${p.large ? 'md:col-span-2 md:min-h-[400px]' : ''}`}
          >
            <Placeholder hue={p.hue} className="absolute inset-0 aspect-auto h-full" />
            <div className="relative z-10 max-w-md text-(--color-fg)">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted) mb-3">
                {p.eyebrow}
              </p>
              <h3
                className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {p.title}
              </h3>
              <LinkButton href={p.href} variant="secondary" size="md">
                {p.cta} <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

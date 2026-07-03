import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Placeholder } from '@/components/ui/placeholder';

export function Hero() {
  return (
    <section className="relative">
      <Container className="grid md:grid-cols-2 gap-8 lg:gap-16 py-12 md:py-20 items-center">
        <div className="space-y-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            New Season — Vol 04
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Designed for everyday, built to last.
          </h1>
          <p className="text-base md:text-lg text-(--color-fg-muted) max-w-md">
            Discover the curated drop — 100+ brands, over a thousand products, one seamless store.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <LinkButton href="/shop" size="lg">
              Shop the drop <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton href="/brands" size="lg" variant="outline">
              See all brands
            </LinkButton>
          </div>
        </div>

        <div className="relative aspect-[4/5] md:aspect-[5/6] rounded-2xl overflow-hidden">
          <Placeholder hue={300} label="hero_01.jpg — editorial lifestyle" className="aspect-[5/6]" />
        </div>
      </Container>
    </section>
  );
}

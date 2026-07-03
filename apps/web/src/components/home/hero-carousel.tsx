'use client';

/**
 * Full-viewport hero carousel (banner + navbar = 100% of the screen).
 * Slides are managed from the admin panel (/admin/hero).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from '@jugasaro/shared';

import { cn } from '@/lib/cn';

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timer.current = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [index, paused, slides.length, go]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[calc(100svh-72px)] min-h-[480px] overflow-hidden bg-(--color-bg-muted)"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.imageUrl}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-linear',
              i === index ? 'scale-105' : 'scale-100',
            )}
          />
          {/* Legibility gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Copy */}
          <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
            <div
              className={cn(
                'max-w-xl space-y-5 transition-all delay-150 duration-700',
                i === index ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              )}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
                {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </p>
              <h1
                className="text-4xl font-semibold leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="max-w-md text-base text-white/80 md:text-lg">{slide.subtitle}</p>
              )}
              {slide.ctaLabel && slide.ctaHref && (
                <div className="pt-2">
                  <Link
                    href={slide.ctaHref as never}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                  >
                    {slide.ctaLabel} <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          {/* Arrows */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/50 sm:grid"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/50 sm:grid"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

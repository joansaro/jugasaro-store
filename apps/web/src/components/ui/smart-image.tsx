'use client';

/**
 * Renders a real image with a graceful fallback to the gradient Placeholder
 * when there is no src or the image fails to load. Drop-in replacement for the
 * old <Placeholder /> usage across product cards, the PDP, cart, categories, etc.
 */
import { useState } from 'react';

import { Placeholder, hueFromString } from './placeholder';
import { cn } from '@/lib/cn';

interface SmartImageProps {
  src?: string | null;
  alt?: string;
  /** Key used to derive a stable fallback gradient hue. */
  fallbackKey?: string;
  /** Aspect-ratio utility (e.g. "aspect-square", "aspect-[4/3]"). */
  aspect?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export function SmartImage({
  src,
  alt = '',
  fallbackKey = '',
  aspect = 'aspect-square',
  className,
  imgClassName,
  priority = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  return (
    <div className={cn('relative w-full overflow-hidden', aspect, className)}>
      {!showImg && (
        <Placeholder
          hue={hueFromString(fallbackKey || alt || 'x')}
          className="absolute inset-0 h-full w-full !aspect-auto"
        />
      )}
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
          className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}

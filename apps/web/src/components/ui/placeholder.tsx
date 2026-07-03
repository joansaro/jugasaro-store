/**
 * Placeholder image component — uses a gradient derived from a hue.
 * Will be replaced in Phase 8 by an `<Image />` pointing to Cloudflare R2.
 */
import { cn } from '@/lib/cn';

interface PlaceholderProps {
  label?: string;
  hue?: number;
  className?: string;
  dark?: boolean;
}

export function Placeholder({ label, hue = 300, className, dark = false }: PlaceholderProps) {
  const a = dark ? `oklch(20% 0.05 ${hue})` : `oklch(88% 0.03 ${hue})`;
  const b = dark ? `oklch(15% 0.08 ${hue})` : `oklch(82% 0.05 ${hue})`;
  return (
    <div
      className={cn(
        'placeholder-gradient relative grid place-items-center w-full aspect-square overflow-hidden',
        className,
      )}
      style={
        {
          '--ph-a': a,
          '--ph-b': b,
        } as React.CSSProperties
      }
    >
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted) px-2 py-1 rounded-md bg-(--color-bg)/70 backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}

/** Deterministic hue from a string — keeps the same product showing the same color across renders. */
export function hueFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return 270 + (hash % 60);
}

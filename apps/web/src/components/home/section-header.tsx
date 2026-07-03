import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  link?: { href: string; label: string };
}

export function SectionHeader({ eyebrow, title, link }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
      <div className="space-y-2">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            {eyebrow}
          </p>
        )}
        <h2
          className="text-2xl md:text-3xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href as never}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-fg-muted) hover:text-(--color-fg) transition-colors"
        >
          {link.label} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

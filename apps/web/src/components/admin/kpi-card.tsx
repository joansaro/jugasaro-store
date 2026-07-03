import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  sub?: string;
}

export function KpiCard({ label, value, delta, sub }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted)">
        {label}
      </p>
      <p
        className="text-2xl md:text-3xl font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full',
              positive
                ? 'bg-(--color-success)/10 text-(--color-success)'
                : 'bg-(--color-danger)/10 text-(--color-danger)',
            )}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {positive && '+'}
            {delta}%
          </span>
        )}
        {sub && <span className="text-(--color-fg-muted)">{sub}</span>}
      </div>
    </div>
  );
}

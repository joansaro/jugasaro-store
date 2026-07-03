'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({ page, totalPages, basePath = '/shop' }: PaginationProps) {
  const router = useRouter();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (n: number) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete('page');
    else next.set('page', String(n));
    router.push(`${basePath}?${next.toString()}` as never);
  };

  const numbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.min(totalPages, page + 2),
  );

  return (
    <nav className="flex items-center justify-center gap-2 mt-10">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="size-9 grid place-items-center rounded-md border border-(--color-border) hover:bg-(--color-bg-muted) disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft className="size-4" />
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => goTo(n)}
          className={cn(
            'size-9 grid place-items-center rounded-md text-sm font-medium cursor-pointer',
            n === page
              ? 'bg-(--color-fg) text-(--color-bg)'
              : 'border border-(--color-border) hover:bg-(--color-bg-muted)',
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="size-9 grid place-items-center rounded-md border border-(--color-border) hover:bg-(--color-bg-muted) disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

import { cn } from '@/lib/cn';

interface DeleteButtonProps {
  action: () => Promise<{ ok: boolean; error?: string }>;
  confirmMessage?: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

export function DeleteButton({
  action,
  confirmMessage = 'Are you sure? This cannot be undone.',
  label = 'Delete',
  iconOnly = false,
  className,
}: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  const handle = () => {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        alert(result.error ?? 'Could not delete');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-(--color-danger) hover:bg-(--color-danger)/10 px-2 py-1 rounded-md cursor-pointer disabled:opacity-50 transition-colors',
        className,
      )}
    >
      <Trash2 className="size-3.5" />
      {!iconOnly && (pending ? 'Deleting…' : label)}
    </button>
  );
}

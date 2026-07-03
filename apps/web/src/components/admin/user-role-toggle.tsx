'use client';

import { useState, useTransition } from 'react';

import { setUserRoleAction } from '@/app/admin/users/actions';
import { cn } from '@/lib/cn';

interface Props {
  userId: string;
  role: 'USER' | 'ADMIN';
}

export function UserRoleToggle({ userId, role }: Props) {
  const [current, setCurrent] = useState<'USER' | 'ADMIN'>(role);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const next = current === 'ADMIN' ? 'USER' : 'ADMIN';

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await setUserRoleAction(userId, next);
      if (res.ok) setCurrent(next);
      else setError(res.error ?? 'Error');
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
          current === 'ADMIN'
            ? 'bg-(--color-accent) text-(--color-accent-fg)'
            : 'bg-(--color-bg-muted) text-(--color-fg-muted)',
        )}
      >
        {current}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="text-xs font-medium text-(--color-fg-muted) underline-offset-2 hover:text-(--color-fg) hover:underline disabled:opacity-50 cursor-pointer"
      >
        {pending ? '…' : current === 'ADMIN' ? 'Make user' : 'Make admin'}
      </button>
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </div>
  );
}

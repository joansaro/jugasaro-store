'use client';

import { useTransition, useState } from 'react';
import type { OrderStatus } from '@jugasaro/shared';

import { cn } from '@/lib/cn';
import { updateOrderStatusAction } from '@/app/admin/orders/actions';

const STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handle = (status: OrderStatus) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status);
      if (!result.ok) setFeedback(result.error ?? 'Could not update');
    });
  };

  return (
    <div className="space-y-2">
      <select
        defaultValue={current}
        onChange={(e) => handle(e.target.value as OrderStatus)}
        disabled={pending}
        className={cn(
          'h-9 px-3 rounded-md bg-(--color-bg-elev) border border-(--color-border) text-sm outline-none cursor-pointer focus:border-(--color-accent)',
          pending && 'opacity-50',
        )}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {feedback && <p className="text-xs text-(--color-danger)">{feedback}</p>}
    </div>
  );
}

'use client';

/** Número de tracking del pedido; se guarda junto al estado actual. */
import { useState, useTransition } from 'react';
import type { OrderStatus } from '@jugasaro/shared';

import { Button } from '@/components/ui/button';
import { updateOrderStatusAction } from '@/app/admin/orders/actions';

export function TrackingForm({
  orderId,
  status,
  current,
}: {
  orderId: string;
  status: OrderStatus;
  current: string | null;
}) {
  const [value, setValue] = useState(current ?? '');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const save = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status, value.trim());
      setFeedback(result.ok ? 'Saved ✓' : (result.error ?? 'Could not save'));
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 1Z999AA10123456784"
          className="h-9 flex-1 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-sm font-mono outline-none focus:border-(--color-accent)"
        />
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? '…' : 'Save'}
        </Button>
      </div>
      {feedback && (
        <p className={`text-xs ${feedback.includes('✓') ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
          {feedback}
        </p>
      )}
      <p className="text-xs text-(--color-fg-muted)">
        The customer sees it in their order and gets it in the shipping email.
      </p>
    </div>
  );
}

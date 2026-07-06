'use client';

/** Cancelación por el propio cliente: solo mientras el pedido no entra a preparación. */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, {});
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel the order');
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Cancel order
        </Button>
        <p className="text-xs text-(--color-fg-muted)">
          You can cancel while the order hasn&apos;t started fulfillment. Stock is returned
          automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Cancel this order?</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
          Keep it
        </Button>
        <Button onClick={cancel} disabled={pending}>
          {pending ? 'Cancelling…' : 'Yes, cancel'}
        </Button>
      </div>
      {error && <p className="text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
}

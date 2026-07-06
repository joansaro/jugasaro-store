'use client';

/** Acciones del cliente sobre su pedido: volver a comprar y solicitar devolución. */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order, ReturnRequest } from '@jugasaro/shared';

import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';

export function OrderActions({
  order,
  returnRequest,
}: {
  order: Order;
  returnRequest: ReturnRequest | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);
  const [reason, setReason] = useState('');

  async function buyAgain() {
    setPending(true);
    setMessage(null);
    try {
      const result = await apiClient.post<{ added: number; skipped: number }>(
        `/orders/${order.id}/reorder`,
        {},
      );
      if (result.skipped > 0) {
        setMessage(`${result.added} added to cart · ${result.skipped} no longer available`);
        setTimeout(() => router.push('/cart'), 1400);
      } else {
        router.push('/cart');
      }
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not add the items');
      setPending(false);
    }
  }

  async function requestReturn() {
    setPending(true);
    setMessage(null);
    try {
      await apiClient.post('/returns', { orderId: order.id, reason: reason.trim() });
      router.refresh();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not request the return');
      setPending(false);
    }
  }

  const canReturn =
    (order.status === 'SHIPPED' || order.status === 'DELIVERED') && !returnRequest;

  return (
    <div className="space-y-3">
      {/* Estado de devolución existente */}
      {returnRequest && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-bg) p-4 text-sm space-y-1">
          <p className="font-medium">
            Return{' '}
            <span
              className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                returnRequest.status === 'APPROVED'
                  ? 'bg-(--color-success)/10 text-(--color-success)'
                  : returnRequest.status === 'REJECTED'
                    ? 'bg-(--color-danger)/10 text-(--color-danger)'
                    : 'bg-(--color-accent-soft) text-(--color-accent)'
              }`}
            >
              {returnRequest.status}
            </span>
          </p>
          <p className="text-(--color-fg-muted)">&ldquo;{returnRequest.reason}&rdquo;</p>
          {returnRequest.adminNote && (
            <p className="text-xs text-(--color-fg-muted)">Store: {returnRequest.adminNote}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={buyAgain} disabled={pending}>
          Buy again
        </Button>
        <a href={`/profile/orders/${order.id}/invoice`}>
          <Button variant="outline">Invoice</Button>
        </a>
        {canReturn && !returning && (
          <Button variant="outline" onClick={() => setReturning(true)}>
            Request return
          </Button>
        )}
      </div>

      {returning && canReturn && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why (wrong size, damaged, changed my mind…)"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent) resize-y"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReturning(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={requestReturn} disabled={pending || reason.trim().length < 5}>
              {pending ? 'Sending…' : 'Submit request'}
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-xs text-(--color-fg-muted)">{message}</p>}
    </div>
  );
}

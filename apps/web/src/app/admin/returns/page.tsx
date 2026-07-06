'use client';

/** Devoluciones (RMA): aprobar reembolsa el pedido y repone stock. */
import { useCallback, useEffect, useState } from 'react';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { formatPrice } from '@/lib/format';

type Status = 'REQUESTED' | 'APPROVED' | 'REJECTED';

interface AdminReturn {
  id: string;
  reason: string;
  status: Status;
  adminNote: string | null;
  createdAt: string;
  order: { number: string; total: number; status: string };
  user: { email: string; name: string | null };
}

const TABS: Status[] = ['REQUESTED', 'APPROVED', 'REJECTED'];

export default function AdminReturnsPage() {
  const [status, setStatus] = useState<Status>('REQUESTED');
  const [items, setItems] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async (s: Status) => {
    setLoading(true);
    setItems(await apiClient.get<AdminReturn[]>(`/returns?status=${s}`));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(status);
  }, [status, load]);

  async function resolve(id: string, approve: boolean) {
    try {
      await apiClient.patch(`/returns/${id}/resolve`, {
        approve,
        adminNote: note.trim() || undefined,
      });
      setResolving(null);
      setNote('');
      await load(status);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not resolve');
    }
  }

  return (
    <>
      <PageHeader eyebrow="Fulfillment" title="Returns (RMA)" />
      <p className="mb-4 -mt-2 text-sm text-(--color-fg-muted) max-w-2xl">
        Approving a return refunds the order: status becomes REFUNDED, stock is restored and the
        customer is emailed.
      </p>

      <div className="mb-4 inline-flex rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors ${
              status === tab
                ? 'bg-(--color-accent) text-(--color-accent-fg)'
                : 'text-(--color-fg-muted) hover:text-(--color-fg)'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center text-sm text-(--color-fg-muted)">
          No {status.toLowerCase()} returns.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-3">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="font-mono font-semibold">{r.order.number}</span>
                <span className="font-mono">{formatPrice(r.order.total)}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-(--color-bg-muted) text-(--color-fg-muted)">
                  order {r.order.status}
                </span>
                <span className="text-xs text-(--color-fg-muted) ml-auto">
                  {r.user.name ?? r.user.email} ·{' '}
                  {new Date(r.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
              <p className="text-sm text-(--color-fg-muted)">&ldquo;{r.reason}&rdquo;</p>
              {r.adminNote && (
                <p className="text-xs text-(--color-fg-subtle)">Note: {r.adminNote}</p>
              )}

              {r.status === 'REQUESTED' && (
                resolving === r.id ? (
                  <div className="space-y-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note for the customer (optional)"
                      className="h-10 w-full px-3 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => resolve(r.id, true)}>
                        Approve & refund
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => resolve(r.id, false)}>
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setResolving(null); setNote(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setResolving(r.id)}>
                    Resolve…
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

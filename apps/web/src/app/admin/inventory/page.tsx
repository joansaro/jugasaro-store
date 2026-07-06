'use client';

/** Inventario: stock por variante, alerta de stock bajo, ajustes con motivo e historial. */
import { useCallback, useEffect, useState } from 'react';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';

interface VariantRow {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  stock: number;
  lowStock: boolean;
  productName: string;
  productSlug: string;
}

interface AdjustmentRow {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
  variant: { sku: string; product: { name: string } };
  user: { email: string; name: string | null } | null;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<VariantRow[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [lowOnly, setLowOnly] = useState(false);
  const [history, setHistory] = useState<AdjustmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [adjusting, setAdjusting] = useState<VariantRow | null>(null);
  const [delta, setDelta] = useState('1');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (low: boolean) => {
    setLoading(true);
    const [inv, hist] = await Promise.all([
      apiClient.get<{ threshold: number; items: VariantRow[] }>(
        `/admin/inventory?lowStockOnly=${low}`,
      ),
      apiClient.get<AdjustmentRow[]>('/admin/inventory/history'),
    ]);
    setItems(inv.items);
    setThreshold(inv.threshold);
    setHistory(hist);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(lowOnly);
  }, [lowOnly, load]);

  const lowCount = items.filter((i) => i.lowStock).length;

  async function applyAdjustment() {
    if (!adjusting) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/admin/inventory/adjust', {
        variantId: adjusting.id,
        delta: Number.parseInt(delta, 10),
        reason: reason.trim(),
      });
      setAdjusting(null);
      setDelta('1');
      setReason('');
      await load(lowOnly);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not adjust stock');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Fulfillment"
        title="Inventory"
        actions={
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="accent-(--color-accent)"
            />
            Low stock only (≤ {threshold})
          </label>
        }
      />

      {!loading && lowCount > 0 && !lowOnly && (
        <p className="mb-4 rounded-xl border border-(--color-warning, #f59e0b)/30 bg-amber-500/10 px-4 py-2.5 text-sm">
          ⚠️ {lowCount} variant{lowCount === 1 ? '' : 's'} at or below the low-stock threshold.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Product</th>
                <th className="text-left px-5 py-3 font-normal">SKU</th>
                <th className="text-left px-5 py-3 font-normal">Variant</th>
                <th className="text-right px-5 py-3 font-normal">Stock</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {items.map((v) => (
                <tr key={v.id} className="hover:bg-(--color-bg-muted) transition-colors">
                  <td className="px-5 py-3 font-medium">{v.productName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-(--color-fg-muted)">{v.sku}</td>
                  <td className="px-5 py-3 text-xs text-(--color-fg-muted)">
                    {[v.color, v.size].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`inline-flex font-mono px-2 py-0.5 rounded-full text-xs ${
                        v.stock === 0
                          ? 'bg-(--color-danger)/10 text-(--color-danger) font-semibold'
                          : v.lowStock
                            ? 'bg-amber-500/10 text-amber-600 font-semibold'
                            : ''
                      }`}
                    >
                      {v.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => { setAdjusting(v); setError(null); }}
                      className="text-xs font-medium text-(--color-accent) hover:underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-(--color-fg-muted)">
                    Nothing to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Historial de ajustes */}
      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-(--color-fg-subtle) mb-3">
            Adjustment history
          </h2>
          <ul className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) divide-y divide-(--color-border) text-sm">
            {history.slice(0, 20).map((h) => (
              <li key={h.id} className="px-5 py-3 flex items-center gap-3 flex-wrap">
                <span
                  className={`font-mono font-semibold ${h.delta > 0 ? 'text-(--color-success)' : 'text-(--color-danger)'}`}
                >
                  {h.delta > 0 ? `+${h.delta}` : h.delta}
                </span>
                <span className="font-medium">{h.variant.product.name}</span>
                <span className="font-mono text-xs text-(--color-fg-muted)">{h.variant.sku}</span>
                <span className="text-(--color-fg-muted)">— {h.reason}</span>
                <span className="text-xs text-(--color-fg-subtle) ml-auto">
                  {h.user?.name ?? h.user?.email ?? 'system'} ·{' '}
                  {new Date(h.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal de ajuste */}
      {adjusting && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setAdjusting(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-(--color-bg-elev) border border-(--color-border) p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Adjust stock
            </h2>
            <p className="text-sm text-(--color-fg-muted)">
              {adjusting.productName} — <span className="font-mono">{adjusting.sku}</span> · current:{' '}
              <strong>{adjusting.stock}</strong>
            </p>
            {error && (
              <p className="rounded-lg bg-(--color-danger)/10 text-(--color-danger) text-sm px-3 py-2">
                {error}
              </p>
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Delta (+ restock / − correction)</span>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) font-mono outline-none focus:border-(--color-accent)"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Reason</span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Restock from supplier PO-1042"
                className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none focus:border-(--color-accent)"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdjusting(null)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={applyAdjustment}
                disabled={saving || reason.trim().length < 3 || !delta || delta === '0'}
              >
                {saving ? 'Saving…' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

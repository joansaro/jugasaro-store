'use client';

/** Admin de métodos de envío: tarifas, regla de envío gratis y orden. */
import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { ShippingMethod } from '@jugasaro/shared';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { formatPrice } from '@/lib/format';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  freeAbove: string;
  active: boolean;
  sortOrder: string;
}

const EMPTY: FormState = {
  name: '',
  description: '',
  price: '9.99',
  freeAbove: '',
  active: true,
  sortOrder: '0',
};

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setMethods(await apiClient.get<ShippingMethod[]>('/shipping-methods/all'));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Math.round(Number.parseFloat(form.price || '0') * 100),
      freeAbove: form.freeAbove
        ? Math.round(Number.parseFloat(form.freeAbove) * 100)
        : undefined,
      active: form.active,
      sortOrder: Number.parseInt(form.sortOrder || '0', 10),
    };
    try {
      if (form.id) await apiClient.patch(`/shipping-methods/${form.id}`, payload);
      else await apiClient.post('/shipping-methods', payload);
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(method: ShippingMethod) {
    if (!confirm(`Delete "${method.name}"?`)) return;
    const result = await apiClient.delete<{ deleted?: boolean; deactivated?: boolean }>(
      `/shipping-methods/${method.id}`,
    );
    if (result.deactivated) {
      alert('This method was used by orders, so it was deactivated instead of deleted.');
    }
    await load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Fulfillment"
        title={`Shipping methods (${methods.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm({ ...EMPTY }); setError(null); }}>
            <Plus className="size-4" /> New method
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Method</th>
                <th className="text-left px-5 py-3 font-normal">Price</th>
                <th className="text-left px-5 py-3 font-normal">Free above</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-(--color-bg-muted) transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium">{m.name}</p>
                    {m.description && (
                      <p className="text-xs text-(--color-fg-muted)">{m.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono">
                    {m.price === 0 ? 'Free' : formatPrice(m.price)}
                  </td>
                  <td className="px-5 py-3 font-mono text-(--color-fg-muted)">
                    {m.freeAbove !== null ? formatPrice(m.freeAbove) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                        m.active
                          ? 'bg-(--color-success)/10 text-(--color-success)'
                          : 'bg-(--color-bg-muted) text-(--color-fg-muted)'
                      }`}
                    >
                      {m.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2 text-xs font-medium">
                      <button
                        onClick={() =>
                          setForm({
                            id: m.id,
                            name: m.name,
                            description: m.description ?? '',
                            price: (m.price / 100).toFixed(2),
                            freeAbove: m.freeAbove !== null ? (m.freeAbove / 100).toFixed(2) : '',
                            active: m.active,
                            sortOrder: String(m.sortOrder),
                          })
                        }
                        className="text-(--color-accent) hover:underline px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(m)}
                        className="text-(--color-danger) hover:underline px-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setForm(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-(--color-bg-elev) border border-(--color-border) p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {form.id ? `Edit ${form.name}` : 'New shipping method'}
            </h2>
            {error && (
              <p className="rounded-lg bg-(--color-danger)/10 text-(--color-danger) text-sm px-3 py-2">
                {error}
              </p>
            )}
            <div className="grid gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none focus:border-(--color-accent)"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Description (optional)</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. 3-5 business days"
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none focus:border-(--color-accent)"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Price ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Free above ($, opt.)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.freeAbove}
                    onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Sort order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="accent-(--color-accent)"
                  />
                  <span className="font-medium">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setForm(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

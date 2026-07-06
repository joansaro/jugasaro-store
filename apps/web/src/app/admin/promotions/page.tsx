'use client';

/** Promociones automáticas: % por categoría, marca o toda la tienda. */
import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Brand, Category, Promotion } from '@jugasaro/shared';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';

interface FormState {
  id?: string;
  name: string;
  value: string;
  scope: 'store' | 'category' | 'brand';
  categoryId: string;
  brandId: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
}

const EMPTY: FormState = {
  name: '',
  value: '10',
  scope: 'category',
  categoryId: '',
  brandId: '',
  active: true,
  startsAt: '',
  endsAt: '',
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [promos, cats, brds] = await Promise.all([
      apiClient.get<Promotion[]>('/promotions'),
      apiClient.get<Category[]>('/categories'),
      apiClient.get<Brand[]>('/brands'),
    ]);
    setPromotions(promos);
    setCategories(cats);
    setBrands(brds);
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
      value: Number.parseInt(form.value || '0', 10),
      categoryId: form.scope === 'category' ? form.categoryId || undefined : undefined,
      brandId: form.scope === 'brand' ? form.brandId || undefined : undefined,
      active: form.active,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : undefined,
    };
    try {
      if (form.id) await apiClient.patch(`/promotions/${form.id}`, payload);
      else await apiClient.post('/promotions', payload);
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(promo: Promotion) {
    if (!confirm(`Delete "${promo.name}"?`)) return;
    await apiClient.delete(`/promotions/${promo.id}`);
    await load();
  }

  const scopeLabel = (p: Promotion) =>
    p.category?.name ?? p.brand?.name ?? 'Whole store';

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title={`Automatic promotions (${promotions.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm({ ...EMPTY }); setError(null); }}>
            <Plus className="size-4" /> New promotion
          </Button>
        }
      />
      <p className="mb-5 -mt-2 text-sm text-(--color-fg-muted) max-w-2xl">
        Applied automatically at checkout to matching items — no code needed. The best matching
        promotion wins per item, and coupons apply on top.
      </p>

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Name</th>
                <th className="text-left px-5 py-3 font-normal">Discount</th>
                <th className="text-left px-5 py-3 font-normal">Scope</th>
                <th className="text-left px-5 py-3 font-normal">Window</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-(--color-bg-muted) transition-colors">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 font-mono">−{p.value}%</td>
                  <td className="px-5 py-3 text-(--color-fg-muted)">{scopeLabel(p)}</td>
                  <td className="px-5 py-3 text-xs text-(--color-fg-muted)">
                    {p.startsAt || p.endsAt
                      ? `${p.startsAt?.slice(0, 10) ?? '…'} → ${p.endsAt?.slice(0, 10) ?? '…'}`
                      : 'Always'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                        p.active
                          ? 'bg-(--color-success)/10 text-(--color-success)'
                          : 'bg-(--color-bg-muted) text-(--color-fg-muted)'
                      }`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2 text-xs font-medium">
                      <button
                        onClick={() =>
                          setForm({
                            id: p.id,
                            name: p.name,
                            value: String(p.value),
                            scope: p.categoryId ? 'category' : p.brandId ? 'brand' : 'store',
                            categoryId: p.categoryId ?? '',
                            brandId: p.brandId ?? '',
                            active: p.active,
                            startsAt: p.startsAt?.slice(0, 10) ?? '',
                            endsAt: p.endsAt?.slice(0, 10) ?? '',
                          })
                        }
                        className="text-(--color-accent) hover:underline px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-(--color-danger) hover:underline px-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-(--color-fg-muted)">
                    No promotions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setForm(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-(--color-bg-elev) border border-(--color-border) p-6 space-y-4 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {form.id ? `Edit ${form.name}` : 'New promotion'}
            </h2>
            {error && (
              <p className="rounded-lg bg-(--color-danger)/10 text-(--color-danger) text-sm px-3 py-2">{error}</p>
            )}
            <div className="grid gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Fashion week sale"
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none focus:border-(--color-accent)"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Percent off (1-100)</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Scope</span>
                <select
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value as FormState['scope'] })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                >
                  <option value="category">One category</option>
                  <option value="brand">One brand</option>
                  <option value="store">Whole store</option>
                </select>
              </label>
              {form.scope === 'category' && (
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Category</span>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  >
                    <option value="">Choose…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              )}
              {form.scope === 'brand' && (
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Brand</span>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  >
                    <option value="">Choose…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Starts (opt.)</span>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium">Ends (opt.)</span>
                  <input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-(--color-accent)"
                />
                <span className="font-medium">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setForm(null)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={
                  saving ||
                  !form.name.trim() ||
                  (form.scope === 'category' && !form.categoryId) ||
                  (form.scope === 'brand' && !form.brandId)
                }
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

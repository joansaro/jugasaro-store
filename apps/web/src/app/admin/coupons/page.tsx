'use client';

/**
 * Admin de cupones: lista con uso/revenue + crear/editar/eliminar.
 * Todo cliente contra la API (el guard de admin vive en el layout).
 */
import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Coupon } from '@jugasaro/shared';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { formatPrice } from '@/lib/format';

interface FormState {
  id?: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: string;
  minSubtotal: string;
  maxUses: string;
  maxUsesPerUser: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

const EMPTY: FormState = {
  code: '',
  type: 'PERCENT',
  value: '10',
  minSubtotal: '',
  maxUses: '',
  maxUsesPerUser: '',
  startsAt: '',
  endsAt: '',
  active: true,
};

function fromCoupon(c: Coupon): FormState {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.type === 'FIXED' ? (c.value / 100).toFixed(2) : String(c.value),
    minSubtotal: c.minSubtotal ? (c.minSubtotal / 100).toFixed(2) : '',
    maxUses: c.maxUses ? String(c.maxUses) : '',
    maxUsesPerUser: c.maxUsesPerUser ? String(c.maxUsesPerUser) : '',
    startsAt: c.startsAt ? c.startsAt.slice(0, 10) : '',
    endsAt: c.endsAt ? c.endsAt.slice(0, 10) : '',
    active: c.active,
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setCoupons(await apiClient.get<Coupon[]>('/coupons'));
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
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value:
        form.type === 'FIXED'
          ? Math.round(Number.parseFloat(form.value || '0') * 100)
          : Number.parseInt(form.value || '0', 10),
      minSubtotal: form.minSubtotal
        ? Math.round(Number.parseFloat(form.minSubtotal) * 100)
        : undefined,
      maxUses: form.maxUses ? Number.parseInt(form.maxUses, 10) : undefined,
      maxUsesPerUser: form.maxUsesPerUser ? Number.parseInt(form.maxUsesPerUser, 10) : undefined,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : undefined,
      active: form.active,
    };
    try {
      if (form.id) await apiClient.patch(`/coupons/${form.id}`, payload);
      else await apiClient.post('/coupons', payload);
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the coupon');
    } finally {
      setSaving(false);
    }
  }

  async function remove(coupon: Coupon) {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await apiClient.delete(`/coupons/${coupon.id}`);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete');
    }
  }

  async function toggleActive(coupon: Coupon) {
    await apiClient.patch(`/coupons/${coupon.id}`, { active: !coupon.active });
    await load();
  }

  const label = (c: Coupon) =>
    c.type === 'PERCENT' ? `${c.value}% off` : `${formatPrice(c.value)} off`;

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title={`Coupons (${coupons.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm({ ...EMPTY }); setError(null); }}>
            <Plus className="size-4" /> New coupon
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Code</th>
                <th className="text-left px-5 py-3 font-normal">Discount</th>
                <th className="text-left px-5 py-3 font-normal">Rules</th>
                <th className="text-left px-5 py-3 font-normal">Uses</th>
                <th className="text-left px-5 py-3 font-normal">Revenue</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {coupons.map((c) => {
                const expired = c.endsAt !== null && new Date(c.endsAt) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-(--color-bg-muted) transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-5 py-3">{label(c)}</td>
                    <td className="px-5 py-3 text-xs text-(--color-fg-muted)">
                      {c.minSubtotal ? `min ${formatPrice(c.minSubtotal)}` : '—'}
                      {c.maxUses ? ` · max ${c.maxUses}` : ''}
                      {c.maxUsesPerUser ? ` · ${c.maxUsesPerUser}/user` : ''}
                      {c.endsAt ? ` · until ${c.endsAt.slice(0, 10)}` : ''}
                    </td>
                    <td className="px-5 py-3 font-mono">{c.uses ?? 0}</td>
                    <td className="px-5 py-3 font-mono">{formatPrice(c.revenue ?? 0)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                          !c.active
                            ? 'bg-(--color-bg-muted) text-(--color-fg-muted)'
                            : expired
                              ? 'bg-(--color-danger)/10 text-(--color-danger)'
                              : 'bg-(--color-success)/10 text-(--color-success)'
                        }`}
                      >
                        {!c.active ? 'Inactive' : expired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2 text-xs font-medium">
                        <button
                          onClick={() => { setForm(fromCoupon(c)); setError(null); }}
                          className="text-(--color-accent) hover:underline px-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(c)}
                          className="text-(--color-fg-muted) hover:underline px-1"
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="text-(--color-danger) hover:underline px-1"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-(--color-fg-muted)">
                    No coupons yet — create the first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {form && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setForm(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-(--color-bg-elev) border border-(--color-border) p-6 space-y-4 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {form.id ? `Edit ${form.code}` : 'New coupon'}
            </h2>
            {error && (
              <p className="rounded-lg bg-(--color-danger)/10 text-(--color-danger) text-sm px-3 py-2">
                {error}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) font-mono outline-none focus:border-(--color-accent)"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as FormState['type'] })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                >
                  <option value="PERCENT">Percent (%)</option>
                  <option value="FIXED">Fixed amount ($)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">{form.type === 'PERCENT' ? 'Percent (1-100)' : 'Amount ($)'}</span>
                <input
                  type="number"
                  min="0"
                  step={form.type === 'FIXED' ? '0.01' : '1'}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Min subtotal ($, optional)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minSubtotal}
                  onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Max uses (optional)</span>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Max per user (optional)</span>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsesPerUser}
                  onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Starts (optional)</span>
                <input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Ends (optional)</span>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
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
              <Button onClick={save} disabled={saving || !form.code.trim() || !form.value}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

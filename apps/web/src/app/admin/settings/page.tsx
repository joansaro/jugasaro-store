'use client';

/** Configuración de la tienda: nombre, moneda, impuesto y umbral de stock bajo. */
import { useEffect, useState } from 'react';

import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';

const FIELDS = [
  { key: 'store_name', label: 'Store name', type: 'text', hint: 'Shown across the storefront.' },
  { key: 'currency', label: 'Currency code', type: 'text', hint: 'ISO code, e.g. USD.' },
  {
    key: 'tax_rate_bps',
    label: 'Tax rate (basis points)',
    type: 'number',
    hint: '800 = 8.00%. Applied to the discounted subtotal at checkout.',
  },
  {
    key: 'low_stock_threshold',
    label: 'Low-stock threshold',
    type: 'number',
    hint: 'Variants at or below this stock are flagged in Inventory.',
  },
  { key: 'email_from', label: 'Email sender', type: 'text', hint: 'From address for transactional emails (demo).' },
] as const;

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Record<string, string>>('/settings/all').then((data) => {
      setValues(data);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      await apiClient.put('/settings', { entries: values });
      setFeedback('Saved ✓');
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Store" title="Settings" />

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="max-w-xl rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-5">
          {FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{field.label}</span>
              <input
                type={field.type}
                value={values[field.key] ?? ''}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) outline-none focus:border-(--color-accent)"
              />
              <span className="text-xs text-(--color-fg-muted)">{field.hint}</span>
            </label>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
            {feedback && (
              <span
                className={`text-sm ${feedback.includes('✓') ? 'text-(--color-success)' : 'text-(--color-danger)'}`}
              >
                {feedback}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

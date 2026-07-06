'use client';

/** Reportes de ventas: resumen, serie diaria, top productos, por categoría y export CSV. */
import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { formatPrice } from '@/lib/format';

interface SalesReport {
  from: string;
  to: string;
  summary: {
    orders: number;
    revenue: number;
    discount: number;
    shipping: number;
    tax: number;
    avgOrder: number;
  };
  series: { day: string; orders: number; revenue: number; discount: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  byCategory: { name: string; units: number; revenue: number }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function daysAgo(n: number) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(daysAgo(0));
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setReport(await apiClient.get<SalesReport>(`/admin/reports/sales?from=${from}&to=${to}`));
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxRevenue = Math.max(1, ...(report?.series.map((d) => d.revenue) ?? [1]));

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Sales report"
        actions={
          <a href={`${API_BASE}/api/admin/reports/sales.csv?from=${from}&to=${to}`}>
            <Button size="sm" variant="outline">Export CSV</Button>
          </a>
        }
      />

      {/* Rango de fechas */}
      <div className="mb-6 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 px-3 rounded-lg bg-(--color-bg-elev) border border-(--color-border) outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 px-3 rounded-lg bg-(--color-bg-elev) border border-(--color-border) outline-none"
          />
        </label>
        <div className="flex gap-2">
          {[7, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => { setFrom(daysAgo(n)); setTo(daysAgo(0)); }}
              className="h-10 px-3 rounded-lg border border-(--color-border) bg-(--color-bg-elev) text-xs font-mono hover:border-(--color-accent)"
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {loading || !report ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : (
        <div className="space-y-8">
          {/* Resumen */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: formatPrice(report.summary.revenue) },
              { label: 'Orders', value: String(report.summary.orders) },
              { label: 'Avg. order', value: formatPrice(report.summary.avgOrder) },
              { label: 'Discounts given', value: formatPrice(report.summary.discount) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Serie diaria (barras simples) */}
          <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-(--color-fg-subtle) mb-4">
              Revenue per day
            </h2>
            {report.series.length === 0 ? (
              <p className="text-sm text-(--color-fg-muted)">No sales in this range.</p>
            ) : (
              <div className="flex items-end gap-1 h-36">
                {report.series.map((d) => (
                  <div
                    key={d.day}
                    title={`${d.day} — ${formatPrice(d.revenue)} (${d.orders} orders)`}
                    className="flex-1 min-w-[6px] rounded-t bg-(--color-accent)/80 hover:bg-(--color-accent) transition-colors"
                    style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top productos */}
            <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-(--color-fg-subtle) px-5 pt-5 pb-3">
                Top products
              </h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-(--color-border)">
                  {report.topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td className="px-5 py-2.5 font-mono text-xs text-(--color-fg-subtle) w-8">{i + 1}</td>
                      <td className="px-2 py-2.5 font-medium">{p.name}</td>
                      <td className="px-2 py-2.5 text-(--color-fg-muted) text-xs whitespace-nowrap">{p.units} u.</td>
                      <td className="px-5 py-2.5 text-right font-mono whitespace-nowrap">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                  {report.topProducts.length === 0 && (
                    <tr><td className="px-5 py-6 text-(--color-fg-muted)">No data.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Por categoría */}
            <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-(--color-fg-subtle) px-5 pt-5 pb-3">
                Sales by category
              </h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-(--color-border)">
                  {report.byCategory.map((c) => (
                    <tr key={c.name}>
                      <td className="px-5 py-2.5 font-medium">{c.name}</td>
                      <td className="px-2 py-2.5 text-(--color-fg-muted) text-xs whitespace-nowrap">{c.units} u.</td>
                      <td className="px-5 py-2.5 text-right font-mono whitespace-nowrap">{formatPrice(c.revenue)}</td>
                    </tr>
                  ))}
                  {report.byCategory.length === 0 && (
                    <tr><td className="px-5 py-6 text-(--color-fg-muted)">No data.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

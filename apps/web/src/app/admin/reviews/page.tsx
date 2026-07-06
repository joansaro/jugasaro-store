'use client';

/** Moderación de reseñas: pendientes por defecto, aprobar/rechazar en línea. */
import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: Status;
  verified: boolean;
  createdAt: string;
  user: { email: string; name: string | null };
  product: { name: string; slug: string };
}

const TABS: Status[] = ['PENDING', 'APPROVED', 'REJECTED'];

export default function AdminReviewsPage() {
  const [status, setStatus] = useState<Status>('PENDING');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (s: Status) => {
    setLoading(true);
    setReviews(await apiClient.get<AdminReview[]>(`/reviews?status=${s}`));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(status);
  }, [status, load]);

  async function moderate(id: string, next: Status) {
    await apiClient.patch(`/reviews/${id}/status`, { status: next });
    await load(status);
  }

  return (
    <>
      <PageHeader eyebrow="Community" title="Reviews" />

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
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center text-sm text-(--color-fg-muted)">
          No {status.toLowerCase()} reviews.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-2"
            >
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="font-mono text-(--color-accent)">{'★'.repeat(r.rating)}</span>
                <span className="font-medium">{r.product.name}</span>
                {r.verified && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-success)">
                    ✓ verified
                  </span>
                )}
                <span className="text-xs text-(--color-fg-muted) ml-auto">
                  {r.user.name ?? r.user.email} ·{' '}
                  {new Date(r.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
              {r.title && <p className="text-sm font-semibold">{r.title}</p>}
              <p className="text-sm text-(--color-fg-muted)">{r.body}</p>
              <div className="flex gap-2 pt-1">
                {r.status !== 'APPROVED' && (
                  <Button size="sm" onClick={() => moderate(r.id, 'APPROVED')}>
                    Approve
                  </Button>
                )}
                {r.status !== 'REJECTED' && (
                  <Button size="sm" variant="outline" onClick={() => moderate(r.id, 'REJECTED')}>
                    Reject
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

'use client';

/** Bandeja de salida demo: los emails transaccionales que la tienda "envió". */
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/admin/page-header';

interface OutboxEmail {
  id: number;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<OutboxEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<OutboxEmail[]>('/admin/emails').then((data) => {
      setEmails(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <PageHeader eyebrow="Store" title="Email outbox (demo)" />
      <p className="mb-5 text-sm text-(--color-fg-muted) max-w-2xl">
        This is a showcase system: transactional emails (order confirmations, shipping updates,
        password resets) are not delivered to a real inbox — they land here. Wiring a real
        provider only means swapping the mail transport.
      </p>

      {loading ? (
        <p className="text-sm text-(--color-fg-muted)">Loading…</p>
      ) : emails.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center text-sm text-(--color-fg-muted)">
          Nothing sent yet. Place an order or request a password reset to see emails here.
          (The outbox is in-memory — it resets when the API restarts.)
        </p>
      ) : (
        <ul className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) divide-y divide-(--color-border)">
          {emails.map((email) => (
            <li key={email.id}>
              <button
                onClick={() => setOpen(open === email.id ? null : email.id)}
                className="w-full px-5 py-3.5 text-left flex items-center gap-4 hover:bg-(--color-bg-muted) transition-colors"
              >
                <span className="text-sm font-medium flex-1 min-w-0 truncate">{email.subject}</span>
                <span className="font-mono text-xs text-(--color-fg-muted) truncate max-w-[180px]">
                  {email.to}
                </span>
                <span className="text-xs text-(--color-fg-subtle) whitespace-nowrap">
                  {new Date(email.sentAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </button>
              {open === email.id && (
                <pre className="px-5 pb-4 pt-1 text-xs text-(--color-fg-muted) whitespace-pre-wrap font-mono">
                  {email.body}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

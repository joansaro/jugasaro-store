'use client';

/** Solicitud de restablecimiento: siempre responde OK (sin enumeración de emails). */
import { useState } from 'react';
import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } finally {
      setSent(true);
      setSending(false);
    }
  }

  return (
    <main className="py-16">
      <Container className="max-w-md">
        <h1
          className="text-3xl font-semibold tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Reset your password
        </h1>

        {sent ? (
          <div className="rounded-2xl border border-(--color-success)/40 bg-(--color-success)/5 p-5 text-sm space-y-2">
            <p className="font-medium">Check your inbox ✓</p>
            <p className="text-(--color-fg-muted)">
              If an account exists for <span className="font-mono">{email}</span>, we sent a reset
              link valid for 1 hour.
            </p>
            <p className="text-xs text-(--color-fg-muted)">
              Demo note: emails land in the admin&apos;s email outbox.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-(--color-fg-muted)">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full px-4 rounded-lg bg-(--color-bg-elev) border border-(--color-border) text-sm outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
            />
            <Button type="submit" className="w-full" disabled={sending || !email}>
              {sending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-(--color-fg-muted) pt-6">
          <Link href="/login" className="text-(--color-accent) hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </Container>
    </main>
  );
}

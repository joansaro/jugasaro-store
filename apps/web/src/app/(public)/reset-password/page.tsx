'use client';

/** Establece la nueva contraseña usando el token del enlace. */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset the password');
      setPending(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-(--color-fg-muted)">
        This link is missing its token.{' '}
        <Link href="/forgot-password" className="text-(--color-accent) hover:underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-(--color-success)/40 bg-(--color-success)/5 p-5 text-sm">
        <p className="font-medium">Password updated ✓</p>
        <p className="text-(--color-fg-muted)">Taking you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 px-4 rounded-lg bg-(--color-bg-elev) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Confirm password</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-11 px-4 rounded-lg bg-(--color-bg-elev) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        />
      </label>
      {error && <p className="text-xs text-(--color-danger)">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="py-16">
      <Container className="max-w-md">
        <h1
          className="text-3xl font-semibold tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Choose a new password
        </h1>
        <Suspense>
          <ResetForm />
        </Suspense>
      </Container>
    </main>
  );
}

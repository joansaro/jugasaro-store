'use client';

/** Formulario de reseña: envía a moderación (status PENDING). */
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';

export function ReviewForm({ productId, isLoggedIn }: { productId: string; isLoggedIn: boolean }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 text-sm text-(--color-fg-muted)">
        <Link href="/login" className="text-(--color-accent) hover:underline">
          Sign in
        </Link>{' '}
        to write a review.
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-(--color-success)/40 bg-(--color-success)/5 p-5 text-sm">
        <p className="font-medium mb-1">Thanks for your review! ✓</p>
        <p className="text-(--color-fg-muted)">
          It will appear here once it passes moderation.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await apiClient.post('/reviews', {
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review');
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-4"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
        Write a review
      </p>

      <div>
        <span className="block text-sm font-medium mb-1.5">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} stars`}
              className={
                star <= rating
                  ? 'text-xl text-(--color-accent)'
                  : 'text-xl text-(--color-border) hover:text-(--color-accent)/50'
              }
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Title (optional)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="h-10 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Your review <span className="text-(--color-danger)">*</span>
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="px-3 py-2 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent) resize-y"
        />
      </label>

      {error && <p className="text-xs text-(--color-danger)">{error}</p>}

      <Button type="submit" disabled={sending || body.trim().length < 10} className="w-full">
        {sending ? 'Sending…' : 'Submit review'}
      </Button>
    </form>
  );
}

/**
 * Checkout de invitado: crea una cuenta exprés con solo el email.
 * El enlace para fijar contraseña llega por email (outbox demo).
 */
import { Button } from '@/components/ui/button';
import { guestAction } from '@/app/(public)/login/actions';

const ERRORS: Record<string, string> = {
  'guest-email': 'Enter a valid email address.',
  'guest-exists': 'This email already has an account — sign in above instead.',
  guest: 'Could not continue as guest. Try again.',
};

export function GuestCheckout({ error }: { error?: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) mb-2">
        Or continue as guest
      </p>
      <p className="text-xs text-(--color-fg-muted) mb-3">
        Just your email — we&apos;ll create an express account and send you a link to set a
        password later.
      </p>
      <form action={guestAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="h-10 flex-1 px-3 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        />
        <Button type="submit" variant="outline">
          Continue
        </Button>
      </form>
      {error && ERRORS[error] && (
        <p className="mt-2 text-xs text-(--color-danger)">{ERRORS[error]}</p>
      )}
    </div>
  );
}

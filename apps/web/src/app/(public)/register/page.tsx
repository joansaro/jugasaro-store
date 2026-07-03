import { redirect } from 'next/navigation';

import { Container } from '@/components/ui/container';
import { AuthForm } from '@/components/auth/auth-form';
import { getMe } from '@/lib/auth-server';
import { registerAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const me = await getMe();
  if (me) redirect('/');

  return (
    <main className="py-16">
      <Container className="max-w-md">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Get started
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create your account
          </h1>
        </div>
        <AuthForm mode="register" action={registerAction} />
      </Container>
    </main>
  );
}

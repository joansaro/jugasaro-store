import { redirect } from 'next/navigation';

import { Container } from '@/components/ui/container';
import { AuthForm } from '@/components/auth/auth-form';
import { getMe } from '@/lib/auth-server';
import { loginAction } from './actions';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const me = await getMe();
  const sp = await searchParams;
  if (me) redirect(sp.redirect || '/');

  return (
    <main className="py-16">
      <Container className="max-w-md">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Welcome back
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sign in
          </h1>
        </div>
        <AuthForm mode="login" action={loginAction} redirectTo={sp.redirect} />
      </Container>
    </main>
  );
}

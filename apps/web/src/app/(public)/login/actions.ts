'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { authPostAndForwardCookie, AuthError } from '@/lib/auth-server';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  redirectTo: z.string().optional(),
});

export interface LoginState {
  errors?: { email?: string[]; password?: string[]; form?: string };
  values?: { email?: string };
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { email: String(formData.get('email') ?? '') },
    };
  }

  try {
    await authPostAndForwardCookie('/auth/login', {
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (err) {
    const message = err instanceof AuthError ? err.message : 'Login failed';
    return {
      errors: { form: message },
      values: { email: parsed.data.email },
    };
  }

  // Server actions can't redirect from inside try/catch — outside is required.
  redirect(parsed.data.redirectTo || '/');
}

const DEMO_ACCOUNTS = {
  ana: { email: 'ana@jugasaro.com', password: 'Demo1234!' },
  admin: { email: 'admin@jugasaro.com', password: 'Admin1234!' },
} as const;

/**
 * One-click demo login. `role` is bound to the action (`.bind(null, 'admin')`)
 * so it is reliable — button name/value is not passed to server actions.
 */
export async function loginAsDemoAction(
  role: keyof typeof DEMO_ACCOUNTS,
  _formData: FormData,
): Promise<void> {
  const account = DEMO_ACCOUNTS[role];
  if (!account) {
    redirect('/login?error=demo');
  }

  let failed = false;
  try {
    await authPostAndForwardCookie('/auth/login', account);
  } catch {
    failed = true;
  }

  redirect(failed ? '/login?error=demo' : role === 'admin' ? '/admin' : '/');
}


/** Checkout de invitado: cuenta exprés con solo el email (patrón void como el demo login). */
export async function guestAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    redirect('/login?error=guest-email');
  }

  let error: string | null = null;
  try {
    await authPostAndForwardCookie('/auth/guest', { email });
  } catch (err) {
    error = err instanceof AuthError ? 'guest-exists' : 'guest';
  }

  redirect(error ? `/login?error=${error}` : '/');
}

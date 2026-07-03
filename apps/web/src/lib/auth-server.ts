/**
 * Server-side helpers for reading the current session and forwarding cookies
 * from API responses (e.g. /auth/login Set-Cookie) onto the user's response.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@jugasaro/shared';

import { apiServer } from './api';

const SESSION_COOKIE = 'jugasaro_token';

/** Returns the current user if logged in, null otherwise. Never throws. */
export async function getMe(): Promise<User | null> {
  try {
    const res = await apiServer.get<{ user: User }>('/auth/me', { swallowAuthErrors: true });
    return res?.user ?? null;
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * POSTs to /auth/login or /auth/register and forwards the Set-Cookie token
 * onto the user's response so subsequent requests are authenticated.
 */
export async function authPostAndForwardCookie(
  path: '/auth/login' | '/auth/register',
  body: unknown,
): Promise<User> {
  const baseInternal = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
  const res = await fetch(`${baseInternal}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => ({}))) as
    | { user: User }
    | { message: string | string[] };

  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    const message = Array.isArray(m) ? m.join(', ') : m ?? 'Authentication failed';
    throw new AuthError(res.status, message);
  }

  const setCookie = res.headers.get('set-cookie');
  const tokenMatch = setCookie ? /jugasaro_token=([^;]+)/i.exec(setCookie) : null;
  if (tokenMatch?.[1]) {
    const store = await cookies();
    store.set(SESSION_COOKIE, tokenMatch[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return (data as { user: User }).user;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Forces redirect to /login if the user is not authenticated. */
export async function requireAuth(): Promise<User> {
  const user = await getMe();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getMe();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/');
  return user;
}

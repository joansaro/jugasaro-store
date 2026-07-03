/**
 * Typed API client for the Jugasaro NestJS backend.
 *
 * Two callsites:
 *  - Server (RSC, Server Actions, route handlers): use `apiServer` so requests
 *    flow through the internal URL and forward the user's cookies for auth.
 *  - Client components: use `apiClient` so requests go to the public URL with
 *    `credentials: 'include'` to send the JWT cookie.
 */
import 'server-only';
import { cookies } from 'next/headers';

const BASE_INTERNAL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  // When true, ignores 4xx errors and returns null. Useful for `getMe()` on guests.
  swallowAuthErrors?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, headers, swallowAuthErrors, ...rest } = opts;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const url = `${BASE_INTERNAL}/api${path}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: rest.cache ?? 'no-store',
  });

  if (!res.ok) {
    if (swallowAuthErrors && (res.status === 401 || res.status === 403)) {
      return null as T;
    }
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = await res.text();
    }
    const msg =
      (parsed as { message?: string | string[] })?.message ??
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg, parsed);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const apiServer = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'body' | 'method'> = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'body' | 'method'> = {}) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'body' | 'method'> = {}) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts: Omit<RequestOptions, 'body' | 'method'> = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

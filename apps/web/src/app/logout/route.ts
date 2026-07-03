import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'jugasaro_token';

async function handle(req: NextRequest) {
  const baseInternal = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    await fetch(`${baseInternal}/api/auth/logout`, {
      method: 'POST',
      headers: token ? { Cookie: `${SESSION_COOKIE}=${token}` } : {},
      cache: 'no-store',
    });
  } catch {
    /* ignore */
  }

  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL('/', req.url));
}

export const GET = handle;
export const POST = handle;

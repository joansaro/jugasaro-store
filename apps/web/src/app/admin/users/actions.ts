'use server';

import { revalidatePath } from 'next/cache';

import { apiServer, ApiError } from '@/lib/api';

export async function setUserRoleAction(
  id: string,
  role: 'USER' | 'ADMIN',
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.patch(`/admin/users/${id}/role`, { role });
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not update role' };
  }
  revalidatePath('/admin/users');
  return { ok: true };
}

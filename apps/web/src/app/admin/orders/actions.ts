'use server';

import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@jugasaro/shared';
import { apiServer, ApiError } from '@/lib/api';

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.patch(`/orders/${id}/status`, {
      status,
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
    });
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not update' };
  }
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

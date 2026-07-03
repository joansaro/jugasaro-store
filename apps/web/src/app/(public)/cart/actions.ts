'use server';

import { revalidatePath } from 'next/cache';
import { apiServer } from '@/lib/api';

export async function updateCartItemAction(itemId: string, quantity: number): Promise<void> {
  await apiServer.patch(`/cart/items/${itemId}`, { quantity });
  revalidatePath('/cart');
  revalidatePath('/', 'layout');
}

export async function removeCartItemAction(itemId: string): Promise<void> {
  await apiServer.delete(`/cart/items/${itemId}`);
  revalidatePath('/cart');
  revalidatePath('/', 'layout');
}

export async function clearCartAction(): Promise<void> {
  await apiServer.delete('/cart');
  revalidatePath('/cart');
  revalidatePath('/', 'layout');
}

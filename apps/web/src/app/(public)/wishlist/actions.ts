'use server';

import { revalidatePath } from 'next/cache';
import { apiServer } from '@/lib/api';

export async function removeWishlistItemAction(itemId: string): Promise<void> {
  await apiServer.delete(`/wishlist/items/${itemId}`);
  revalidatePath('/wishlist');
}

export async function moveToCartAction(productId: string, wishlistItemId: string): Promise<void> {
  await apiServer.post('/cart/items', { productId, quantity: 1 });
  await apiServer.delete(`/wishlist/items/${wishlistItemId}`);
  revalidatePath('/wishlist');
  revalidatePath('/', 'layout');
}

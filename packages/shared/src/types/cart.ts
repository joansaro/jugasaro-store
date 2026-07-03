import type { ProductListItem, ProductVariant } from './product';

export interface CartItem {
  id: string;
  product: ProductListItem;
  variant: ProductVariant | null;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItem {
  id: string;
  product: ProductListItem;
  addedAt: string;
}

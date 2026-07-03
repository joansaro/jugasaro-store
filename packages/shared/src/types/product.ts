export type ProductTag = 'NEW' | 'SALE' | 'HOT';

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  stock: number;
  priceOverride: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  tag: ProductTag | null;
  outOfStock: boolean;
  published: boolean;
  brand: { id: string; slug: string; name: string };
  category: { id: string; slug: string; name: string };
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  tag: ProductTag | null;
  outOfStock: boolean;
  brand: { id: string; slug: string; name: string };
  category: { id: string; slug: string; name: string };
  thumbnailUrl: string | null;
}

export interface ProductListQuery {
  search?: string;
  brandSlug?: string;
  categorySlug?: string;
  tag?: ProductTag;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  page?: number;
  pageSize?: number;
}

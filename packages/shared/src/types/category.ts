export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

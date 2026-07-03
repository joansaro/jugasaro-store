export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  authorName: string;
  createdAt: string;
}

export interface ProductReviews {
  average: number | null;
  count: number;
  items: ProductReview[];
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  taxRateBps: number;
}

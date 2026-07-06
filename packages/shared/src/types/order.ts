export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantSku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  shippingMethodName: string | null;
  trackingNumber: string | null;
  tax: number;
  total: number;
  customerEmail?: string;
  items: OrderItem[];
  shippingAddress: Address | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  freeAbove: number | null;
  active: boolean;
  sortOrder: number;
}

export type CouponType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  uses?: number;
  revenue?: number;
  discountGiven?: number;
  createdAt: string;
}

export interface CouponValidation {
  code: string;
  type: CouponType;
  value: number;
  discount: number;
  subtotal: number;
}

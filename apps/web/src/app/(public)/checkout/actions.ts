'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiServer, ApiError } from '@/lib/api';
import type { Order } from '@jugasaro/shared';

const ShippingSchema = z.object({
  fullName: z.string().min(2, { message: 'At least 2 characters' }).max(120),
  line1: z.string().min(1, { message: 'Required' }).max(160),
  line2: z.string().max(160).optional().or(z.literal('')),
  city: z.string().min(1, { message: 'Required' }).max(80),
  state: z.string().max(80).optional().or(z.literal('')),
  postalCode: z.string().min(1, { message: 'Required' }).max(20),
  country: z.string().min(2).max(2).default('AR'),
  phone: z.string().max(40).optional().or(z.literal('')),
});

export interface CheckoutState {
  errors?: {
    fullName?: string[];
    line1?: string[];
    line2?: string[];
    city?: string[];
    state?: string[];
    postalCode?: string[];
    country?: string[];
    phone?: string[];
    form?: string;
  };
  values?: Record<string, string>;
}

export async function checkoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = ShippingSchema.safeParse({
    fullName: raw.fullName,
    line1: raw.line1,
    line2: raw.line2,
    city: raw.city,
    state: raw.state,
    postalCode: raw.postalCode,
    country: raw.country || 'AR',
    phone: raw.phone,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  let order: Order;
  try {
    order = await apiServer.post<Order>('/orders', {
      shippingAddress: {
        fullName: parsed.data.fullName,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || undefined,
        city: parsed.data.city,
        state: parsed.data.state || undefined,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        phone: parsed.data.phone || undefined,
      },
    });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Checkout failed';
    return { errors: { form: message }, values: raw };
  }

  revalidatePath('/cart');
  revalidatePath('/profile');
  revalidatePath('/', 'layout');
  redirect(`/checkout/confirmation?order=${order.id}`);
}

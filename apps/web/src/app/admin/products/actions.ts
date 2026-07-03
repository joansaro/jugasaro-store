'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiServer, ApiError } from '@/lib/api';
import type { Product } from '@jugasaro/shared';

const VariantSchema = z.object({
  id: z.string().optional().or(z.literal('')),
  sku: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0).optional(),
  priceOverride: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : v), z.coerce.number().int().min(0))
    .optional(),
});

const ProductSchema = z.object({
  name: z.string().min(1, { message: 'Required' }).max(160),
  slug: z.string().max(180).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  // Money is entered in dollars in the form; we convert to cents.
  priceDollars: z
    .preprocess(
      (v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v),
      z.number({ invalid_type_error: 'Must be a number' }).min(0),
    )
    .transform((n) => Math.round(n * 100)),
  compareAtPriceDollars: z
    .preprocess(
      (v) => (v === '' || v === undefined || v === null ? undefined : Number(String(v).replace(',', '.'))),
      z.number().min(0).optional(),
    )
    .transform((n) => (n !== undefined ? Math.round(n * 100) : null)),
  tag: z.enum(['NEW', 'SALE', 'HOT']).optional().or(z.literal('')),
  outOfStock: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  brandId: z.string().min(1, { message: 'Pick a brand' }),
  categoryId: z.string().min(1, { message: 'Pick a category' }),
});

export interface ProductFormState {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    priceDollars?: string[];
    compareAtPriceDollars?: string[];
    tag?: string[];
    brandId?: string[];
    categoryId?: string[];
    form?: string;
  };
  values?: Record<string, string>;
}

interface VariantInput {
  id?: string;
  sku?: string;
  color?: string | null;
  size?: string | null;
  stock?: number;
  priceOverride?: number | null;
}

function parseVariants(formData: FormData): VariantInput[] {
  const rows = formData.getAll('variants') as string[];
  if (rows.length === 0) return [];
  const out: VariantInput[] = [];
  for (const raw of rows) {
    if (!raw) continue;
    try {
      const parsed = VariantSchema.parse(JSON.parse(raw));
      out.push({
        id: parsed.id || undefined,
        sku: parsed.sku || undefined,
        color: parsed.color || null,
        size: parsed.size || null,
        stock: parsed.stock ?? 0,
        priceOverride: parsed.priceOverride !== undefined ? parsed.priceOverride : null,
      });
    } catch {
      /* skip malformed rows */
    }
  }
  return out;
}

const ImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
});

interface ImageInput {
  url: string;
  alt?: string;
  position?: number;
}

function parseImages(formData: FormData): ImageInput[] {
  const rows = formData.getAll('images') as string[];
  const out: ImageInput[] = [];
  rows.forEach((raw, i) => {
    if (!raw) return;
    try {
      const parsed = ImageSchema.parse(JSON.parse(raw));
      out.push({ url: parsed.url, alt: parsed.alt, position: parsed.position ?? i });
    } catch {
      /* skip malformed rows */
    }
  });
  return out;
}

function basePayload(parsed: z.infer<typeof ProductSchema>) {
  return {
    name: parsed.name,
    slug: parsed.slug || undefined,
    description: parsed.description || undefined,
    price: parsed.priceDollars,
    compareAtPrice: parsed.compareAtPriceDollars,
    tag: parsed.tag || null,
    outOfStock: !!parsed.outOfStock,
    published: parsed.published === undefined ? true : !!parsed.published,
    brandId: parsed.brandId,
    categoryId: parsed.categoryId,
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ProductFormState['errors'], values: raw };
  }

  const variants = parseVariants(formData);
  const images = parseImages(formData);

  try {
    await apiServer.post<Product>('/products', { ...basePayload(parsed.data), variants, images });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not create product' },
      values: raw,
    };
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ProductFormState['errors'], values: raw };
  }

  const variants = parseVariants(formData);
  const images = parseImages(formData);

  try {
    await apiServer.patch<Product>(`/products/${id}`, { ...basePayload(parsed.data), variants, images });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not update product' },
      values: raw,
    };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  redirect('/admin/products');
}

export async function deleteProductAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.delete(`/products/${id}`);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not delete' };
  }
  revalidatePath('/admin/products');
  return { ok: true };
}

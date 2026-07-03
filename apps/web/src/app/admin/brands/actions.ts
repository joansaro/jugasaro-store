'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiServer, ApiError } from '@/lib/api';

const BrandSchema = z.object({
  name: z.string().min(1, { message: 'Required' }).max(80),
  slug: z.string().max(120).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  logoUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
});

export interface BrandFormState {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    logoUrl?: string[];
    form?: string;
  };
  values?: Record<string, string>;
}

export async function createBrandAction(
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = BrandSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw };
  }

  try {
    await apiServer.post('/brands', {
      name: parsed.data.name,
      slug: parsed.data.slug || undefined,
      description: parsed.data.description || undefined,
      logoUrl: parsed.data.logoUrl || undefined,
    });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not create brand' },
      values: raw,
    };
  }

  revalidatePath('/admin/brands');
  redirect('/admin/brands');
}

export async function updateBrandAction(
  id: string,
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = BrandSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw };
  }

  try {
    await apiServer.patch(`/brands/${id}`, {
      name: parsed.data.name,
      slug: parsed.data.slug || undefined,
      description: parsed.data.description || undefined,
      logoUrl: parsed.data.logoUrl || undefined,
    });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not update brand' },
      values: raw,
    };
  }

  revalidatePath('/admin/brands');
  revalidatePath(`/admin/brands/${id}/edit`);
  redirect('/admin/brands');
}

export async function deleteBrandAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.delete(`/brands/${id}`);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not delete brand' };
  }
  revalidatePath('/admin/brands');
  return { ok: true };
}

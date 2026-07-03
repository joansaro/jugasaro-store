'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiServer, ApiError } from '@/lib/api';

const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Required' }).max(80),
  slug: z.string().max(120).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
});

export interface CategoryFormState {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    imageUrl?: string[];
    form?: string;
  };
  values?: Record<string, string>;
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw };
  }
  try {
    await apiServer.post('/categories', {
      name: parsed.data.name,
      slug: parsed.data.slug || undefined,
      description: parsed.data.description || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
    });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not create category' },
      values: raw,
    };
  }
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw };
  }
  try {
    await apiServer.patch(`/categories/${id}`, {
      name: parsed.data.name,
      slug: parsed.data.slug || undefined,
      description: parsed.data.description || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
    });
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not update category' },
      values: raw,
    };
  }
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${id}/edit`);
  redirect('/admin/categories');
}

export async function deleteCategoryAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.delete(`/categories/${id}`);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not delete' };
  }
  revalidatePath('/admin/categories');
  return { ok: true };
}

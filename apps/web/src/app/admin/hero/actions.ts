'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiServer, ApiError } from '@/lib/api';

const SlideSchema = z.object({
  title: z.string().min(1, { message: 'Required' }).max(120),
  subtitle: z.string().max(240).optional().or(z.literal('')),
  ctaLabel: z.string().max(60).optional().or(z.literal('')),
  ctaHref: z.string().max(300).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: 'Must be a valid URL' }),
  position: z.coerce.number().int().min(0).optional(),
  active: z.coerce.boolean().optional(),
});

export interface SlideFormState {
  errors?: {
    title?: string[];
    subtitle?: string[];
    ctaLabel?: string[];
    ctaHref?: string[];
    imageUrl?: string[];
    position?: string[];
    form?: string;
  };
  values?: Record<string, string>;
}

function payload(parsed: z.infer<typeof SlideSchema>) {
  return {
    title: parsed.title,
    subtitle: parsed.subtitle || null,
    ctaLabel: parsed.ctaLabel || null,
    ctaHref: parsed.ctaHref || null,
    imageUrl: parsed.imageUrl,
    position: parsed.position ?? 0,
    active: parsed.active ?? false,
  };
}

function refreshHome() {
  revalidatePath('/admin/hero');
  revalidatePath('/');
}

export async function createSlideAction(
  _prev: SlideFormState,
  formData: FormData,
): Promise<SlideFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = SlideSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as SlideFormState['errors'], values: raw };
  }
  try {
    await apiServer.post('/hero-slides', payload(parsed.data));
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not create slide' },
      values: raw,
    };
  }
  refreshHome();
  redirect('/admin/hero');
}

export async function updateSlideAction(
  id: string,
  _prev: SlideFormState,
  formData: FormData,
): Promise<SlideFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = SlideSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as SlideFormState['errors'], values: raw };
  }
  try {
    await apiServer.patch(`/hero-slides/${id}`, payload(parsed.data));
  } catch (err) {
    return {
      errors: { form: err instanceof ApiError ? err.message : 'Could not update slide' },
      values: raw,
    };
  }
  refreshHome();
  redirect('/admin/hero');
}

export async function deleteSlideAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.delete(`/hero-slides/${id}`);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not delete' };
  }
  refreshHome();
  return { ok: true };
}

export async function toggleSlideAction(
  id: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer.patch(`/hero-slides/${id}`, { active });
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Could not update' };
  }
  refreshHome();
  return { ok: true };
}

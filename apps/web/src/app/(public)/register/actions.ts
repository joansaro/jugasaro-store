'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { authPostAndForwardCookie, AuthError } from '@/lib/auth-server';

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'At least 2 characters' }).max(80).optional().or(z.literal('')),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'At least 8 characters' })
    .max(128)
    .refine((p) => /[A-Z]/.test(p), { message: 'Include an uppercase letter' })
    .refine((p) => /\d/.test(p), { message: 'Include a number' }),
});

export interface RegisterState {
  errors?: { email?: string[]; password?: string[]; name?: string[]; form?: string };
  values?: { email?: string; name?: string };
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get('name') || undefined,
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: {
        email: String(formData.get('email') ?? ''),
        name: String(formData.get('name') ?? ''),
      },
    };
  }

  try {
    await authPostAndForwardCookie('/auth/register', {
      email: parsed.data.email,
      password: parsed.data.password,
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
    });
  } catch (err) {
    const message = err instanceof AuthError ? err.message : 'Registration failed';
    return {
      errors: { form: message },
      values: { email: parsed.data.email, name: parsed.data.name },
    };
  }

  redirect('/');
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { Button, LinkButton } from '@/components/ui/button';
import { FormField } from '@/components/admin/form-field';
import {
  type BrandFormState,
  createBrandAction,
  updateBrandAction,
} from '@/app/admin/brands/actions';

interface BrandFormProps {
  mode: 'create' | 'edit';
  initial?: { id: string; name: string; slug: string; description: string | null; logoUrl: string | null };
}

export function BrandForm({ mode, initial }: BrandFormProps) {
  const action =
    mode === 'create'
      ? createBrandAction
      : (prev: BrandFormState, fd: FormData) => updateBrandAction(initial!.id, prev, fd);

  const [state, formAction, pending] = useActionState<BrandFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.errors?.form && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
          {state.errors.form}
        </div>
      )}

      <FormField
        label="Name"
        name="name"
        required
        defaultValue={state.values?.name ?? initial?.name ?? ''}
        error={state.errors?.name?.[0]}
      />
      <FormField
        label="Slug"
        name="slug"
        hint="Auto-generated from name if empty. Only lowercase letters, numbers and dashes."
        defaultValue={state.values?.slug ?? initial?.slug ?? ''}
        error={state.errors?.slug?.[0]}
      />
      <FormField
        label="Description"
        name="description"
        textarea
        rows={3}
        defaultValue={state.values?.description ?? initial?.description ?? ''}
        error={state.errors?.description?.[0]}
      />
      <FormField
        label="Logo URL"
        name="logoUrl"
        type="url"
        hint="Will be replaced by an upload field in Phase 8 (Cloudflare R2)."
        defaultValue={state.values?.logoUrl ?? initial?.logoUrl ?? ''}
        error={state.errors?.logoUrl?.[0]}
      />

      <div className="flex items-center gap-3 pt-3 border-t border-(--color-border)">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create brand' : 'Save changes'}
        </Button>
        <LinkButton href="/admin/brands" variant="ghost">
          Cancel
        </LinkButton>
        {mode === 'edit' && (
          <Link
            href={`/brands/${initial!.slug}`}
            className="text-xs text-(--color-fg-muted) hover:text-(--color-fg) ml-auto"
            target="_blank"
          >
            View on store ↗
          </Link>
        )}
      </div>
    </form>
  );
}

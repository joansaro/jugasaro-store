'use client';

import { useActionState } from 'react';

import { Button, LinkButton } from '@/components/ui/button';
import { FormField } from '@/components/admin/form-field';
import {
  type CategoryFormState,
  createCategoryAction,
  updateCategoryAction,
} from '@/app/admin/categories/actions';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initial?: { id: string; name: string; slug: string; description: string | null; imageUrl: string | null };
}

export function CategoryForm({ mode, initial }: CategoryFormProps) {
  const action =
    mode === 'create'
      ? createCategoryAction
      : (prev: CategoryFormState, fd: FormData) => updateCategoryAction(initial!.id, prev, fd);

  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(action, {});

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
        hint="Auto-generated from name if empty."
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
        label="Image URL"
        name="imageUrl"
        type="url"
        hint="Will be replaced by an upload field in Phase 8."
        defaultValue={state.values?.imageUrl ?? initial?.imageUrl ?? ''}
        error={state.errors?.imageUrl?.[0]}
      />

      <div className="flex items-center gap-3 pt-3 border-t border-(--color-border)">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
        </Button>
        <LinkButton href="/admin/categories" variant="ghost">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}

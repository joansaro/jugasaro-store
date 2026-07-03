'use client';

import { useActionState, useState } from 'react';
import type { HeroSlide } from '@jugasaro/shared';

import { Button, LinkButton } from '@/components/ui/button';
import { FormField } from '@/components/admin/form-field';
import {
  type SlideFormState,
  createSlideAction,
  updateSlideAction,
} from '@/app/admin/hero/actions';

interface HeroSlideFormProps {
  mode: 'create' | 'edit';
  initial?: HeroSlide;
}

export function HeroSlideForm({ mode, initial }: HeroSlideFormProps) {
  const action =
    mode === 'create'
      ? createSlideAction
      : (prev: SlideFormState, fd: FormData) => updateSlideAction(initial!.id, prev, fd);

  const [state, formAction, pending] = useActionState<SlideFormState, FormData>(action, {});
  const [preview, setPreview] = useState(initial?.imageUrl ?? '');

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.errors?.form && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
          {state.errors.form}
        </div>
      )}

      {/* Live preview of the banner image */}
      <div className="relative aspect-[21/9] overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-muted)">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-(--color-fg-muted)">
            Paste an image URL below to preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center p-6">
          <div className="max-w-[70%] space-y-1">
            <p className="text-lg font-semibold leading-tight text-white">{state.values?.title ?? initial?.title ?? 'Slide title'}</p>
            <p className="text-xs text-white/75">{state.values?.subtitle ?? initial?.subtitle ?? ''}</p>
          </div>
        </div>
      </div>

      <FormField
        label="Image URL"
        name="imageUrl"
        required
        hint="Wide image recommended (1920px+). Shown full-screen behind the text."
        defaultValue={state.values?.imageUrl ?? initial?.imageUrl ?? ''}
        error={state.errors?.imageUrl?.[0]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreview(e.target.value)}
      />
      <FormField
        label="Title"
        name="title"
        required
        defaultValue={state.values?.title ?? initial?.title ?? ''}
        error={state.errors?.title?.[0]}
      />
      <FormField
        label="Subtitle"
        name="subtitle"
        hint="Optional supporting line."
        defaultValue={state.values?.subtitle ?? initial?.subtitle ?? ''}
        error={state.errors?.subtitle?.[0]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="CTA label"
          name="ctaLabel"
          hint='Button text, e.g. "Shop now".'
          defaultValue={state.values?.ctaLabel ?? initial?.ctaLabel ?? ''}
          error={state.errors?.ctaLabel?.[0]}
        />
        <FormField
          label="CTA link"
          name="ctaHref"
          hint='Where the button goes, e.g. "/shop".'
          defaultValue={state.values?.ctaHref ?? initial?.ctaHref ?? ''}
          error={state.errors?.ctaHref?.[0]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Position"
          name="position"
          type="number"
          hint="Lower shows first."
          defaultValue={state.values?.position ?? String(initial?.position ?? 0)}
          error={state.errors?.position?.[0]}
        />
        <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={initial?.active ?? true}
            className="size-4 accent-(--color-accent) cursor-pointer"
          />
          <span className="text-sm">Active (visible on the store)</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create slide' : 'Save changes'}
        </Button>
        <LinkButton href="/admin/hero" variant="ghost">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}

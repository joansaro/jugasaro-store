'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Brand, Category, Product } from '@jugasaro/shared';

import { Button, LinkButton } from '@/components/ui/button';
import { FormField } from '@/components/admin/form-field';
import { cn } from '@/lib/cn';
import {
  type ProductFormState,
  createProductAction,
  updateProductAction,
} from '@/app/admin/products/actions';

interface ProductFormProps {
  mode: 'create' | 'edit';
  brands: Brand[];
  categories: Category[];
  initial?: Product;
}

interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  priceOverride: string;
}

export function ProductForm({ mode, brands, categories, initial }: ProductFormProps) {
  const action =
    mode === 'create'
      ? createProductAction
      : (prev: ProductFormState, fd: FormData) => updateProductAction(initial!.id, prev, fd);

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});

  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color ?? '',
      size: v.size ?? '',
      stock: v.stock,
      priceOverride: v.priceOverride !== null ? (v.priceOverride / 100).toFixed(2) : '',
    })) ?? [],
  );

  const addVariant = () =>
    setVariants((vs) => [...vs, { sku: '', color: '', size: '', stock: 0, priceOverride: '' }]);

  const removeVariant = (i: number) =>
    setVariants((vs) => vs.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const [images, setImages] = useState<string[]>(
    initial?.images.map((img) => img.url) ?? [],
  );
  const addImage = () => setImages((imgs) => [...imgs, '']);
  const removeImage = (i: number) => setImages((imgs) => imgs.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) =>
    setImages((imgs) => imgs.map((v, idx) => (idx === i ? val : v)));

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden variant rows serialized as JSON — server action parses with Zod */}
      {variants.map((v, i) => (
        <input
          key={i}
          type="hidden"
          name="variants"
          value={JSON.stringify({
            ...(v.id ? { id: v.id } : {}),
            sku: v.sku,
            color: v.color || undefined,
            size: v.size || undefined,
            stock: Number(v.stock) || 0,
            priceOverride:
              v.priceOverride !== '' ? Math.round(Number(v.priceOverride) * 100) : undefined,
          })}
        />
      ))}

      {/* Hidden image rows serialized as JSON */}
      {images
        .filter((url) => url.trim() !== '')
        .map((url, i) => (
          <input
            key={`img-${i}`}
            type="hidden"
            name="images"
            value={JSON.stringify({ url: url.trim(), position: i })}
          />
        ))}

      {state.errors?.form && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
          {state.errors.form}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <SectionTitle title="Basics" />
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
            rows={5}
            defaultValue={state.values?.description ?? initial?.description ?? ''}
            error={state.errors?.description?.[0]}
          />
        </div>

        <div className="space-y-5">
          <SectionTitle title="Pricing & status" />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Price (USD)"
              name="priceDollars"
              type="number"
              required
              hint="e.g. 268 for $268.00"
              defaultValue={
                state.values?.priceDollars ??
                (initial ? (initial.price / 100).toFixed(2) : '')
              }
              error={state.errors?.priceDollars?.[0]}
            />
            <FormField
              label="Compare at"
              name="compareAtPriceDollars"
              type="number"
              hint="Original price (optional)"
              defaultValue={
                state.values?.compareAtPriceDollars ??
                (initial?.compareAtPrice ? (initial.compareAtPrice / 100).toFixed(2) : '')
              }
              error={state.errors?.compareAtPriceDollars?.[0]}
            />
          </div>

          <SelectField
            label="Tag"
            name="tag"
            defaultValue={state.values?.tag ?? initial?.tag ?? ''}
            error={state.errors?.tag?.[0]}
            options={[
              { value: '', label: 'No tag' },
              { value: 'NEW', label: 'New' },
              { value: 'SALE', label: 'Sale' },
              { value: 'HOT', label: 'Hot' },
            ]}
          />

          <SelectField
            label="Brand"
            name="brandId"
            required
            defaultValue={state.values?.brandId ?? initial?.brand.id ?? ''}
            error={state.errors?.brandId?.[0]}
            options={[{ value: '', label: 'Select a brand' }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
          />

          <SelectField
            label="Category"
            name="categoryId"
            required
            defaultValue={state.values?.categoryId ?? initial?.category.id ?? ''}
            error={state.errors?.categoryId?.[0]}
            options={[
              { value: '', label: 'Select a category' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Checkbox
              name="outOfStock"
              label="Mark as out of stock"
              defaultChecked={initial?.outOfStock ?? false}
            />
            <Checkbox
              name="published"
              label="Published (visible on store)"
              defaultChecked={initial?.published ?? true}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-(--color-border)">
        <div className="flex items-center justify-between">
          <SectionTitle title="Images" />
          <Button type="button" size="sm" variant="outline" onClick={addImage}>
            <Plus className="size-3.5" /> Add image
          </Button>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-(--color-fg-muted) py-4 text-center border border-dashed border-(--color-border) rounded-md">
            No images yet. Paste an image URL — the first one is used as the thumbnail.
          </p>
        ) : (
          <div className="space-y-2">
            {images.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-md border border-(--color-border) bg-(--color-bg-muted)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {url.trim() !== '' && (
                    <img src={url} alt="" className="size-full object-cover" />
                  )}
                </div>
                <SmallInput
                  value={url}
                  onChange={(val) => updateImage(i, val)}
                  placeholder="https://…/image.jpg"
                  className="flex-1"
                />
                {i === 0 && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted)">
                    main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-1.5 rounded-md text-(--color-danger) hover:bg-(--color-danger)/10 cursor-pointer"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-(--color-fg-muted)">
          Images are stored by URL. The first image is shown as the product thumbnail across the store.
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-(--color-border)">
        <div className="flex items-center justify-between">
          <SectionTitle title="Variants" />
          <Button type="button" size="sm" variant="outline" onClick={addVariant}>
            <Plus className="size-3.5" /> Add variant
          </Button>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-(--color-fg-muted) py-4 text-center border border-dashed border-(--color-border) rounded-md">
            No variants yet. The product will get a default variant on save.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-(--color-border)">
            <table className="w-full text-sm">
              <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
                <tr>
                  <th className="text-left px-3 py-2 font-normal">SKU</th>
                  <th className="text-left px-3 py-2 font-normal">Color</th>
                  <th className="text-left px-3 py-2 font-normal">Size</th>
                  <th className="text-left px-3 py-2 font-normal">Stock</th>
                  <th className="text-left px-3 py-2 font-normal">Price override</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {variants.map((v, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      <SmallInput
                        value={v.sku}
                        onChange={(val) => updateVariant(i, { sku: val })}
                        placeholder="auto"
                      />
                    </td>
                    <td className="p-2">
                      <SmallInput
                        value={v.color}
                        onChange={(val) => updateVariant(i, { color: val })}
                        placeholder="—"
                      />
                    </td>
                    <td className="p-2">
                      <SmallInput
                        value={v.size}
                        onChange={(val) => updateVariant(i, { size: val })}
                        placeholder="—"
                        className="max-w-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <SmallInput
                        value={String(v.stock)}
                        onChange={(val) => updateVariant(i, { stock: Number(val) || 0 })}
                        type="number"
                        className="max-w-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <SmallInput
                        value={v.priceOverride}
                        onChange={(val) => updateVariant(i, { priceOverride: val })}
                        type="number"
                        placeholder="(default)"
                        className="max-w-[120px]"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="p-1.5 rounded-md text-(--color-danger) hover:bg-(--color-danger)/10 cursor-pointer"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-(--color-fg-muted)">
          Variants represent SKU-level stock. Leave color/size empty if the product doesn&apos;t have that
          dimension. Price override is optional.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-(--color-border)">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </Button>
        <LinkButton href="/admin/products" variant="ghost">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3
      className="text-base font-semibold tracking-tight"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {title}
    </h3>
  );
}

function SelectField({
  label,
  name,
  required,
  defaultValue,
  options,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-(--color-danger)"> *</span>}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={cn(
          'h-10 px-3 rounded-md bg-(--color-bg-elev) border text-sm outline-none',
          'focus:ring-2 focus:ring-(--color-accent)/20',
          error
            ? 'border-(--color-danger) focus:border-(--color-danger)'
            : 'border-(--color-border) focus:border-(--color-accent)',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="size-4 accent-(--color-accent) cursor-pointer"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function SmallInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full h-8 px-2 rounded-md bg-(--color-bg) border border-(--color-border) text-xs outline-none focus:border-(--color-accent)',
        className,
      )}
    />
  );
}

import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Brand, Category, Paginated, ProductListItem } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { LinkButton } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { Pagination } from '@/components/shop/pagination';
import { formatPrice } from '@/lib/format';
import { deleteProductAction } from './actions';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams: Promise<{ search?: string; brandSlug?: string; categorySlug?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const sp = await searchParams;

  const params = new URLSearchParams();
  if (sp.search) params.set('search', sp.search);
  if (sp.brandSlug) params.set('brandSlug', sp.brandSlug);
  if (sp.categorySlug) params.set('categorySlug', sp.categorySlug);
  params.set('page', sp.page ?? '1');
  params.set('pageSize', '20');

  const [products, brands, categories] = await Promise.all([
    apiServer.get<Paginated<ProductListItem>>(`/products?${params.toString()}`),
    apiServer.get<Brand[]>('/brands'),
    apiServer.get<Category[]>('/categories'),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={`Products (${products.total})`}
        actions={
          <LinkButton href="/admin/products/new" size="sm">
            <Plus className="size-4" /> New product
          </LinkButton>
        }
      />

      <form
        method="get"
        className="rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-3 mb-4 flex flex-wrap gap-2"
      >
        <input
          type="search"
          name="search"
          placeholder="Search by name…"
          defaultValue={sp.search ?? ''}
          className="flex-1 min-w-[200px] h-9 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        />
        <select
          name="brandSlug"
          defaultValue={sp.brandSlug ?? ''}
          className="h-9 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          name="categorySlug"
          defaultValue={sp.categorySlug ?? ''}
          className="h-9 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent)"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 px-4 rounded-md bg-(--color-fg) text-(--color-bg) text-sm font-medium hover:opacity-90 cursor-pointer"
        >
          Filter
        </button>
      </form>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
            <tr>
              <th className="text-left px-5 py-3 font-normal">Product</th>
              <th className="text-left px-5 py-3 font-normal">Brand</th>
              <th className="text-left px-5 py-3 font-normal">Category</th>
              <th className="text-right px-5 py-3 font-normal">Price</th>
              <th className="text-left px-5 py-3 font-normal">Status</th>
              <th className="text-right px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {products.items.map((p) => (
              <tr key={p.id} className="hover:bg-(--color-bg-muted) transition-colors">
                <td className="px-5 py-3 font-medium max-w-xs truncate">{p.name}</td>
                <td className="px-5 py-3 text-(--color-fg-muted)">{p.brand.name}</td>
                <td className="px-5 py-3 text-(--color-fg-muted)">{p.category.name}</td>
                <td className="px-5 py-3 text-right font-mono">{formatPrice(p.price)}</td>
                <td className="px-5 py-3">
                  {p.outOfStock ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-(--color-danger)/10 text-(--color-danger)">
                      Out of stock
                    </span>
                  ) : p.tag ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-(--color-accent-soft) text-(--color-accent)">
                      {p.tag}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted)">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs font-medium text-(--color-accent) hover:underline px-2 py-1"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteProductAction.bind(null, p.id)}
                      iconOnly
                      label={`Delete ${p.name}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={products.page}
        totalPages={products.totalPages}
        basePath="/admin/products"
      />
    </>
  );
}

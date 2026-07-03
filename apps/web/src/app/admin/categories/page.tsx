import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Category } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { LinkButton } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { deleteCategoryAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await apiServer.get<Category[]>('/categories?withCount=true');

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={`Categories (${categories.length})`}
        actions={
          <LinkButton href="/admin/categories/new" size="sm">
            <Plus className="size-4" /> New category
          </LinkButton>
        }
      />

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
            <tr>
              <th className="text-left px-5 py-3 font-normal">Name</th>
              <th className="text-left px-5 py-3 font-normal">Slug</th>
              <th className="text-left px-5 py-3 font-normal">Products</th>
              <th className="text-right px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-(--color-bg-muted) transition-colors">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-(--color-fg-muted)">{c.slug}</td>
                <td className="px-5 py-3 text-(--color-fg-muted)">{c.productCount ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${c.id}/edit`}
                      className="text-xs font-medium text-(--color-accent) hover:underline px-2 py-1"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteCategoryAction.bind(null, c.id)}
                      iconOnly
                      label={`Delete ${c.name}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Brand } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { LinkButton } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { deleteBrandAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const brands = await apiServer.get<Brand[]>('/brands?withCount=true');

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={`Brands (${brands.length})`}
        actions={
          <LinkButton href="/admin/brands/new" size="sm">
            <Plus className="size-4" /> New brand
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
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-(--color-bg-muted) transition-colors">
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-(--color-fg-muted)">{b.slug}</td>
                <td className="px-5 py-3 text-(--color-fg-muted)">{b.productCount ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/brands/${b.id}/edit`}
                      className="text-xs font-medium text-(--color-accent) hover:underline px-2 py-1"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteBrandAction.bind(null, b.id)}
                      iconOnly
                      label={`Delete ${b.name}`}
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

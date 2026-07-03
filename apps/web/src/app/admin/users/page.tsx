import type { Paginated } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/shop/pagination';
import { UserRoleToggle } from '@/components/admin/user-role-toggle';

export const dynamic = 'force-dynamic';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const sp = await searchParams;
  const page = sp.page ?? '1';
  const users = await apiServer.get<Paginated<AdminUser>>(
    `/admin/users?page=${page}&pageSize=20`,
  );

  return (
    <>
      <PageHeader eyebrow="People" title={`Users (${users.total})`} />

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
            <tr>
              <th className="text-left px-5 py-3 font-normal">User</th>
              <th className="text-left px-5 py-3 font-normal">Email</th>
              <th className="text-left px-5 py-3 font-normal">Role</th>
              <th className="text-left px-5 py-3 font-normal">Orders</th>
              <th className="text-left px-5 py-3 font-normal">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {users.items.map((u) => (
              <tr key={u.id} className="hover:bg-(--color-bg-muted) transition-colors">
                <td className="px-5 py-3 font-medium">{u.name ?? '—'}</td>
                <td className="px-5 py-3 text-(--color-fg-muted) font-mono text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <UserRoleToggle userId={u.id} role={u.role} />
                </td>
                <td className="px-5 py-3 text-(--color-fg-muted)">{u.ordersCount}</td>
                <td className="px-5 py-3 text-(--color-fg-muted)">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={users.page} totalPages={users.totalPages} basePath="/admin/users" />
    </>
  );
}

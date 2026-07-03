import type { Paginated } from '@jugasaro/shared';
import type { Order } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { requireAuth } from '@/lib/auth-server';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireAuth();
  const orders = await apiServer.get<Paginated<Order>>('/orders?pageSize=3');

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-5">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Account details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={user.name ?? '—'} />
          <Field label="Email" value={user.email} />
          <Field
            label="Role"
            value={user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
          />
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Recent orders
          </h2>
          <Link
            href="/profile/orders"
            className="text-sm text-(--color-accent) hover:underline"
          >
            See all
          </Link>
        </div>
        {orders.items.length === 0 ? (
          <p className="text-sm text-(--color-fg-muted) py-4 text-center">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-(--color-border)">
            {orders.items.map((order) => (
              <li key={order.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="font-mono text-sm font-medium hover:underline"
                  >
                    {order.number}
                  </Link>
                  <p className="text-xs text-(--color-fg-muted)">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length}{' '}
                    {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  <p className="text-xs uppercase tracking-widest font-mono text-(--color-fg-muted)">
                    {order.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle) mb-1">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

import Link from 'next/link';
import {
  BadgePercent,
  BarChart3,
  Undo2,
  Sparkles,
  Images,
  Boxes,
  Layers,
  LineChart,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Users,
} from 'lucide-react';

import { requireAdmin } from '@/lib/auth-server';
import { AdminThemeToggle } from '@/components/admin/admin-theme-toggle';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/reports', label: 'Reports', icon: LineChart },
  { href: '/admin/hero', label: 'Hero banner', icon: Images },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/coupons', label: 'Coupons', icon: BadgePercent },
  { href: '/admin/promotions', label: 'Promotions', icon: Sparkles },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/returns', label: 'Returns', icon: Undo2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/emails', label: 'Email outbox', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-(--color-bg-subtle) grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:flex flex-col bg-(--color-bg-elev) border-r border-(--color-border) sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-(--color-border) flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg bg-(--color-accent) text-(--color-accent-fg) grid place-items-center font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            J
          </div>
          <div className="leading-tight">
            <p
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Jugasaro
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-muted)">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <p className="px-2 pt-2 pb-1 font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">
            Manage
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-(--color-bg-muted) transition-colors"
              >
                <Icon className="size-4 text-(--color-fg-muted)" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-(--color-border) space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-(--color-bg-muted) text-(--color-fg-muted)"
          >
            <Boxes className="size-4" />
            Back to store
          </Link>
        </div>

        <div className="p-3 border-t border-(--color-border) flex items-center gap-3">
          <span className="size-8 rounded-full bg-(--color-accent) text-(--color-accent-fg) grid place-items-center text-xs font-semibold">
            {(user.name ?? user.email).slice(0, 1).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.name ?? 'Admin'}</p>
            <p className="text-[10px] text-(--color-fg-muted) truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="bg-(--color-bg-elev) border-b border-(--color-border) px-6 lg:px-8 h-14 flex items-center gap-4 sticky top-0 z-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle) lg:hidden">
            Admin
          </p>
          <div className="flex-1" />
          <AdminThemeToggle />
          <Link
            href="/logout"
            className="text-xs font-medium text-(--color-danger) hover:underline"
          >
            Sign out
          </Link>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-[1280px] w-full">{children}</main>
      </div>
    </div>
  );
}

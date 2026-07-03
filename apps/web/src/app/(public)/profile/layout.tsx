import Link from 'next/link';
import { Heart, MapPin, Package, User as UserIcon } from 'lucide-react';

import { Container } from '@/components/ui/container';
import { requireAuth } from '@/lib/auth-server';

const NAV = [
  { href: '/profile', label: 'Account', icon: UserIcon },
  { href: '/profile/orders', label: 'Orders', icon: Package },
  { href: '/profile/addresses', label: 'Addresses', icon: MapPin },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <main className="py-10">
      <Container>
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
            Welcome back, {user.name?.split(' ')[0] ?? 'friend'}
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            My account
          </h1>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <nav className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-2 h-fit">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-(--color-bg-muted) transition-colors"
                >
                  <Icon className="size-4 text-(--color-fg-muted)" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-(--color-border) my-2" />
            <Link
              href="/logout"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-(--color-bg-muted) text-(--color-danger) transition-colors"
            >
              Sign out
            </Link>
          </nav>

          <div>{children}</div>
        </div>
      </Container>
    </main>
  );
}

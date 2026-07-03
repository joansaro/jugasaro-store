'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Package, Settings, User as UserIcon } from 'lucide-react';
import type { User } from '@jugasaro/shared';

import { cn } from '@/lib/cn';

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors"
      >
        <UserIcon className="size-5" />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className={cn(
          'flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors cursor-pointer',
          open && 'bg-(--color-bg-muted)',
        )}
      >
        <span className="size-7 rounded-full bg-(--color-accent) text-(--color-accent-fg) grid place-items-center text-xs font-semibold">
          {(user.name ?? user.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden md:inline text-xs font-medium max-w-[120px] truncate">
          {user.name ?? user.email}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-(--color-border) bg-(--color-bg-elev) shadow-lg p-1.5 z-50"
        >
          <div className="px-3 py-2 border-b border-(--color-border) mb-1">
            <p className="text-xs text-(--color-fg-muted)">Signed in as</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <MenuLink href="/profile" icon={<UserIcon className="size-4" />}>
            My profile
          </MenuLink>
          <MenuLink href="/profile/orders" icon={<Package className="size-4" />}>
            Orders
          </MenuLink>
          {user.role === 'ADMIN' && (
            <MenuLink href="/admin" icon={<Settings className="size-4" />}>
              Admin panel
            </MenuLink>
          )}
          <div className="my-1 border-t border-(--color-border)" />
          <Link
            href="/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-(--color-bg-muted) text-(--color-danger)"
          >
            <LogOut className="size-4" /> Sign out
          </Link>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-(--color-bg-muted)"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

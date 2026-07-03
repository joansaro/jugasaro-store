'use client';

import Link from 'next/link';
import { Heart, Menu, Moon, Search, ShoppingBag, Sun } from 'lucide-react';
import type { User } from '@jugasaro/shared';

import { Container } from '@/components/ui/container';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/cn';
import { UserMenu } from './user-menu';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/brands', label: 'Brands' },
  { href: '/categories', label: 'Categories' },
];

interface NavbarProps {
  user: User | null;
  cartCount?: number;
}

export function Navbar({ user, cartCount = 0 }: NavbarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 backdrop-blur-md',
        'bg-(--color-bg)/80 border-b border-(--color-border)',
      )}
    >
      <Container className="h-[72px] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
          <div
            className="w-9 h-9 rounded-lg bg-(--color-accent) text-(--color-accent-fg) grid place-items-center font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            J
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Jugasaro
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-fg-subtle)">
              Store
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-(--color-bg-muted) transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Link
            href="/shop"
            aria-label="Search"
            className="p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors"
          >
            <Search className="size-5" />
          </Link>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <UserMenu user={user} />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors hidden sm:block"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-(--color-accent) text-(--color-accent-fg) text-[10px] font-bold grid place-items-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Open menu"
            className="md:hidden p-2 rounded-lg hover:bg-(--color-bg-muted) transition-colors cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </Container>
    </header>
  );
}

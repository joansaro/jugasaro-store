import Link from 'next/link';
import { Container } from '@/components/ui/container';

const SECTIONS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/shop' },
      { label: 'Brands', href: '/brands' },
      { label: 'Categories', href: '/categories' },
      { label: 'New arrivals', href: '/shop?sort=newest' },
      { label: 'On sale', href: '/shop?tag=SALE' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My profile', href: '/profile' },
      { label: 'Orders', href: '/profile/orders' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-bg-subtle) mt-20">
      <Container className="py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg bg-(--color-accent) text-(--color-accent-fg) grid place-items-center font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              J
            </div>
            <span
              className="font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Jugasaro Store
            </span>
          </div>
          <p className="text-sm text-(--color-fg-muted) max-w-xs">
            100+ curated brands, over a thousand products, one seamless store.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-widest text-(--color-fg-subtle)">
              {section.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-(--color-fg-muted) hover:text-(--color-fg) transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-(--color-border)">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--color-fg-muted)">
          <p>© {new Date().getFullYear()} Jugasaro Store. All rights reserved.</p>
          <p className="font-mono uppercase tracking-widest text-[10px]">v0.1.0 · phase 4</p>
        </Container>
      </div>
    </footer>
  );
}

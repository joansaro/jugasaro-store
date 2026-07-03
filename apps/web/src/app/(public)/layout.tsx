import type { Cart } from '@jugasaro/shared';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Marquee } from '@/components/layout/marquee';
import { getMe } from '@/lib/auth-server';
import { apiServer } from '@/lib/api';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  let cartCount = 0;
  if (user) {
    try {
      const cart = await apiServer.get<Cart>('/cart', { swallowAuthErrors: true });
      cartCount = cart?.itemCount ?? 0;
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <Marquee />
      <Navbar user={user} cartCount={cartCount} />
      {children}
      <Footer />
    </>
  );
}

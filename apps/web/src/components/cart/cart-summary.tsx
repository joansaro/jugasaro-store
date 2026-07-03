import Link from 'next/link';
import { LinkButton } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

const FREE_SHIPPING_THRESHOLD = 7500; // cents — matches API
const FLAT_SHIPPING = 999;

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <aside className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 space-y-5 sticky top-24">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Order summary
      </h2>

      <div className="space-y-2 text-sm">
        <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`} value={formatPrice(subtotal)} />
        <Row
          label="Shipping"
          value={shipping === 0 ? 'Free' : formatPrice(shipping)}
        />
        <Row label="Tax" value="Calculated at checkout" muted />
      </div>

      {remainingForFreeShipping > 0 && itemCount > 0 && (
        <div className="rounded-lg bg-(--color-accent-soft) text-(--color-accent) px-3 py-2 text-xs">
          Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free shipping.
        </div>
      )}

      <div className="border-t border-(--color-border) pt-4 flex items-baseline justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-semibold">{formatPrice(total)}</span>
      </div>

      <LinkButton
        href="/checkout"
        size="lg"
        className="w-full"
        aria-disabled={itemCount === 0}
      >
        Checkout
      </LinkButton>

      <p className="text-xs text-center text-(--color-fg-muted)">
        or{' '}
        <Link href="/shop" className="text-(--color-accent) hover:underline">
          continue shopping
        </Link>
      </p>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-(--color-fg-muted)">{label}</span>
      <span className={muted ? 'text-(--color-fg-muted)' : ''}>{value}</span>
    </div>
  );
}

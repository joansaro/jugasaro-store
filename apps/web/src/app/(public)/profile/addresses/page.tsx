import { MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Addresses
      </h2>
      <div className="border border-dashed border-(--color-border) rounded-2xl p-16 text-center text-(--color-fg-muted) space-y-3">
        <MapPin className="size-8 mx-auto opacity-50" />
        <p className="text-sm">
          Address book coming in Phase 6 — for now, you can enter a shipping address at checkout.
        </p>
      </div>
    </div>
  );
}

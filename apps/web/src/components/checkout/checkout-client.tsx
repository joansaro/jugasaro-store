'use client';

/**
 * Checkout completo: dirección + cupón + método de envío + totales en vivo.
 * El descuento se valida contra la API; el resumen se recalcula al instante.
 */
import { useMemo, useState, useActionState } from 'react';
import type { Cart, CouponValidation, ShippingMethod } from '@jugasaro/shared';

import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';
import { checkoutAction, type CheckoutState } from '@/app/(public)/checkout/actions';

interface InputProps {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

function Input(props: InputProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', props.className)}>
      <span className="text-sm font-medium">
        {props.label}
        {props.required && <span className="text-(--color-danger)">*</span>}
      </span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        required={props.required}
        className={cn(
          'h-11 px-4 rounded-lg bg-(--color-bg-elev) border text-sm outline-none',
          'focus:ring-2 focus:ring-(--color-accent)/20',
          props.error
            ? 'border-(--color-danger) focus:border-(--color-danger)'
            : 'border-(--color-border) focus:border-(--color-accent)',
        )}
      />
      {props.error && <span className="text-xs text-(--color-danger)">{props.error}</span>}
    </label>
  );
}

interface Props {
  cart: Cart;
  methods: ShippingMethod[];
  taxRateBps: number;
  defaultName?: string;
}

export function CheckoutClient({ cart, methods, taxRateBps, defaultName }: Props) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(checkoutAction, {});

  const [methodId, setMethodId] = useState(methods[0]?.id ?? '');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const subtotal = cart.subtotal;
  const discount = coupon?.discount ?? 0;

  const shipping = useMemo(() => {
    const method = methods.find((m) => m.id === methodId);
    if (!method) return 0;
    if (method.freeAbove !== null && subtotal >= method.freeAbove) return 0;
    return method.price;
  }, [methods, methodId, subtotal]);

  const tax = Math.round(((subtotal - discount) * taxRateBps) / 10_000);
  const total = subtotal - discount + shipping + tax;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      const result = await apiClient.post<CouponValidation>('/coupons/validate', {
        code: couponInput.trim(),
      });
      setCoupon(result);
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof ApiError ? err.message : 'Could not validate the coupon');
    } finally {
      setApplying(false);
    }
  }

  return (
    <form action={formAction} className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
      {/* Valores elegidos que viajan con el submit */}
      <input type="hidden" name="couponCode" value={coupon?.code ?? ''} />
      <input type="hidden" name="shippingMethodId" value={methodId} />

      <div className="space-y-8">
        {state.errors?.form && (
          <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
            {state.errors.form}
          </div>
        )}

        {/* ---------- Dirección ---------- */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Shipping address
          </h2>
          <Input label="Full name" name="fullName" required autoComplete="name"
            defaultValue={state.values?.fullName ?? defaultName ?? ''} error={state.errors?.fullName?.[0]} />
          <Input label="Address line 1" name="line1" required placeholder="Street and number"
            autoComplete="address-line1" defaultValue={state.values?.line1} error={state.errors?.line1?.[0]} />
          <Input label="Address line 2" name="line2" placeholder="Apartment, suite, etc. (optional)"
            autoComplete="address-line2" defaultValue={state.values?.line2} error={state.errors?.line2?.[0]} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="City" name="city" required autoComplete="address-level2"
              defaultValue={state.values?.city} error={state.errors?.city?.[0]} />
            <Input label="State / Province" name="state" autoComplete="address-level1"
              defaultValue={state.values?.state} error={state.errors?.state?.[0]} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Postal code" name="postalCode" required autoComplete="postal-code"
              defaultValue={state.values?.postalCode} error={state.errors?.postalCode?.[0]} />
            <Input label="Phone" name="phone" type="tel" autoComplete="tel"
              defaultValue={state.values?.phone} error={state.errors?.phone?.[0]} />
          </div>
        </section>

        {/* ---------- Método de envío ---------- */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Shipping method
          </h2>
          <div className="space-y-2">
            {methods.map((method) => {
              const free = method.freeAbove !== null && subtotal >= method.freeAbove;
              const price = free ? 0 : method.price;
              const selected = methodId === method.id;
              return (
                <label
                  key={method.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                    selected
                      ? 'border-(--color-accent) bg-(--color-accent-soft)'
                      : 'border-(--color-border) bg-(--color-bg-elev) hover:border-(--color-accent)/50',
                  )}
                >
                  <input
                    type="radio"
                    name="shipping-choice"
                    checked={selected}
                    onChange={() => setMethodId(method.id)}
                    className="accent-(--color-accent)"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{method.name}</span>
                    {method.description && (
                      <span className="block text-xs text-(--color-fg-muted)">{method.description}</span>
                    )}
                  </span>
                  <span className="font-mono text-sm whitespace-nowrap">
                    {price === 0 ? (
                      <span className="text-(--color-success) font-medium">Free</span>
                    ) : (
                      formatPrice(price)
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* ---------- Cupón ---------- */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Coupon
          </h2>
          {coupon ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-(--color-success)/40 bg-(--color-success)/5 px-4 py-3">
              <p className="text-sm">
                <span className="font-mono font-semibold">{coupon.code}</span>{' '}
                <span className="text-(--color-fg-muted)">
                  — you save {formatPrice(coupon.discount)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => { setCoupon(null); setCouponInput(''); }}
                className="text-xs text-(--color-fg-muted) hover:text-(--color-danger)"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                className="h-11 flex-1 px-4 rounded-lg bg-(--color-bg-elev) border border-(--color-border) text-sm font-mono outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
              />
              <Button type="button" variant="outline" onClick={applyCoupon} disabled={applying || !couponInput.trim()}>
                {applying ? 'Checking…' : 'Apply'}
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs text-(--color-danger)">{couponError}</p>}
        </section>
      </div>

      {/* ---------- Resumen ---------- */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-subtle)">
            Order summary
          </p>
          <ul className="space-y-2 text-sm max-h-56 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="truncate min-w-0">
                  {item.quantity}× {item.product.name}
                </span>
                <span className="font-mono text-xs whitespace-nowrap">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-(--color-border) pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-(--color-fg-muted)">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-(--color-success)">
                <span>Discount ({coupon?.code})</span>
                <span className="font-mono">−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-(--color-fg-muted)">Shipping</span>
              <span className="font-mono">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-(--color-fg-muted)">Tax ({(taxRateBps / 100).toFixed(2)}%)</span>
                <span className="font-mono">{formatPrice(tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-(--color-border) text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
        </Button>
        <p className="text-center text-[11px] text-(--color-fg-muted)">
          Demo store — payment is simulated, no card required.
        </p>
      </aside>
    </form>
  );
}

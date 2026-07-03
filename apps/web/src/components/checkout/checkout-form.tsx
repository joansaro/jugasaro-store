'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
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

export function CheckoutForm({ defaultName }: { defaultName?: string }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(checkoutAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.errors?.form && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
          {state.errors.form}
        </div>
      )}

      <Input
        label="Full name"
        name="fullName"
        required
        autoComplete="name"
        defaultValue={state.values?.fullName ?? defaultName ?? ''}
        error={state.errors?.fullName?.[0]}
      />
      <Input
        label="Address line 1"
        name="line1"
        required
        placeholder="Street and number"
        autoComplete="address-line1"
        defaultValue={state.values?.line1}
        error={state.errors?.line1?.[0]}
      />
      <Input
        label="Address line 2"
        name="line2"
        placeholder="Apartment, suite, etc. (optional)"
        autoComplete="address-line2"
        defaultValue={state.values?.line2}
        error={state.errors?.line2?.[0]}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="City"
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={state.values?.city}
          error={state.errors?.city?.[0]}
        />
        <Input
          label="State / Province"
          name="state"
          autoComplete="address-level1"
          defaultValue={state.values?.state}
          error={state.errors?.state?.[0]}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Postal code"
          name="postalCode"
          required
          autoComplete="postal-code"
          defaultValue={state.values?.postalCode}
          error={state.errors?.postalCode?.[0]}
        />
        <Input
          label="Country"
          name="country"
          required
          autoComplete="country"
          defaultValue={state.values?.country ?? 'AR'}
          placeholder="AR"
          error={state.errors?.country?.[0]}
        />
      </div>
      <Input
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={state.values?.phone}
        error={state.errors?.phone?.[0]}
      />

      <div className="border-t border-(--color-border) pt-5">
        <div className="rounded-lg bg-(--color-bg-muted) px-4 py-3 mb-4 text-xs text-(--color-fg-muted)">
          <strong>Demo mode:</strong> payment is simulated. Submitting will create a paid order without
          charging anything. A real payment gateway will be wired up in a later phase.
        </div>
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? 'Placing order…' : 'Place order'}
        </Button>
      </div>
    </form>
  );
}

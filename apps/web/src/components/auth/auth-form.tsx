'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { loginAsDemoAction } from '@/app/(public)/login/actions';
import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
}

function Field({ label, name, type = 'text', placeholder, defaultValue, error, autoComplete }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'w-full h-11 px-4 rounded-lg bg-(--color-bg-elev) border text-sm outline-none',
          'focus:ring-2 focus:ring-(--color-accent)/20',
          error
            ? 'border-(--color-danger) focus:border-(--color-danger)'
            : 'border-(--color-border) focus:border-(--color-accent)',
        )}
      />
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </label>
  );
}

function PasswordField(props: Omit<FieldProps, 'type'>) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{props.label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={props.name}
          defaultValue={props.defaultValue}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          className={cn(
            'w-full h-11 px-4 pr-11 rounded-lg bg-(--color-bg-elev) border text-sm outline-none',
            'focus:ring-2 focus:ring-(--color-accent)/20',
            props.error
              ? 'border-(--color-danger) focus:border-(--color-danger)'
              : 'border-(--color-border) focus:border-(--color-accent)',
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--color-fg-muted) hover:text-(--color-fg) cursor-pointer"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {props.error && <span className="text-xs text-(--color-danger)">{props.error}</span>}
    </label>
  );
}

interface AuthFormProps {
  mode: 'login' | 'register';
  action: (prev: AuthFormState, fd: FormData) => Promise<AuthFormState>;
  redirectTo?: string;
}

export interface AuthFormState {
  errors?: { email?: string[]; password?: string[]; name?: string[]; form?: string };
  values?: { email?: string; name?: string };
}

export function AuthForm({ mode, action, redirectTo }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, {});

  return (
    <div className="space-y-5">
    <form action={formAction} className="space-y-5">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      {state.errors?.form && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/5 px-4 py-3 text-sm text-(--color-danger)">
          {state.errors.form}
        </div>
      )}

      {mode === 'register' && (
        <Field
          label="Full name"
          name="name"
          placeholder="Ana Demo"
          defaultValue={state.values?.name}
          error={state.errors?.name?.[0]}
          autoComplete="name"
        />
      )}

      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        defaultValue={state.values?.email}
        error={state.errors?.email?.[0]}
        autoComplete="email"
      />

      <PasswordField
        label="Password"
        name="password"
        placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
        error={state.errors?.password?.[0]}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-(--color-fg-muted)">
        {mode === 'login' ? (
          <>
            New to Jugasaro?{' '}
            <Link href="/register" className="text-(--color-accent) hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-(--color-accent) hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

    </form>

    {mode === 'login' && (
      <div className="pt-3 border-t border-(--color-border) space-y-2">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-(--color-fg-subtle)">
          Demo accounts — one click
        </p>
        <div className="grid grid-cols-2 gap-2">
          <form action={loginAsDemoAction.bind(null, 'ana')}>
            <button
              type="submit"
              className="w-full rounded-lg border border-(--color-border) px-3 py-2.5 text-left transition-colors hover:border-(--color-accent) hover:bg-(--color-bg-muted) cursor-pointer"
            >
              <span className="block text-sm font-medium">Customer</span>
              <span className="block font-mono text-[10px] text-(--color-fg-muted)">ana@jugasaro.com</span>
            </button>
          </form>
          <form action={loginAsDemoAction.bind(null, 'admin')}>
            <button
              type="submit"
              className="w-full rounded-lg border border-(--color-border) px-3 py-2.5 text-left transition-colors hover:border-(--color-accent) hover:bg-(--color-bg-muted) cursor-pointer"
            >
              <span className="block text-sm font-medium">Admin</span>
              <span className="block font-mono text-[10px] text-(--color-fg-muted)">admin@jugasaro.com</span>
            </button>
          </form>
        </div>
        <p className="text-center text-[11px] text-(--color-fg-subtle)">
          Passwords: <code className="font-mono">Demo1234!</code> / <code className="font-mono">Admin1234!</code>
        </p>
      </div>
    )}
    </div>
  );
}

import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  textarea?: boolean;
  rows?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function FormField({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  error,
  required,
  hint,
  className,
  textarea,
  rows = 4,
  onChange,
}: FormFieldProps) {
  const inputCn = cn(
    'w-full px-3 rounded-md bg-(--color-bg-elev) border text-sm outline-none',
    'focus:ring-2 focus:ring-(--color-accent)/20',
    error
      ? 'border-(--color-danger) focus:border-(--color-danger)'
      : 'border-(--color-border) focus:border-(--color-accent)',
    textarea ? 'py-2' : 'h-10',
  );

  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-(--color-danger)"> *</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={inputCn}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          className={inputCn}
        />
      )}
      {error ? (
        <span className="text-xs text-(--color-danger)">{error}</span>
      ) : (
        hint && <span className="text-xs text-(--color-fg-muted)">{hint}</span>
      )}
    </label>
  );
}

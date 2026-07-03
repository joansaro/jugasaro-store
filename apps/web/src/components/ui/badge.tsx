import { cn } from '@/lib/cn';

type Variant = 'new' | 'sale' | 'hot' | 'soft';

const styles: Record<Variant, string> = {
  new: 'bg-(--color-accent) text-(--color-accent-fg)',
  sale: 'bg-(--color-danger) text-white',
  hot: 'bg-(--color-warning) text-(--color-fg)',
  soft: 'bg-(--color-accent-soft) text-(--color-accent)',
};

export function Badge({
  variant = 'soft',
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

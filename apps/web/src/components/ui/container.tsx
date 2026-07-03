import { cn } from '@/lib/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div {...props} className={cn('w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10', className)}>
      {children}
    </div>
  );
}

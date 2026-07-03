import { LinkButton } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main className="py-24">
      <Container className="text-center max-w-xl space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-fg-muted)">
          404
        </p>
        <h1
          className="text-4xl md:text-5xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Page not found
        </h1>
        <p className="text-(--color-fg-muted)">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-4">
          <LinkButton href="/" size="lg">
            Back to home
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}

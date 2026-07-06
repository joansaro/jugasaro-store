import type { ProductReviews as ProductReviewsData } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { ReviewForm } from './review-form';

function Stars({ value }: { value: number }) {
  return (
    <span className="font-mono text-sm tracking-tight text-(--color-accent)" aria-label={`${value} out of 5`}>
      {'★'.repeat(Math.round(value))}
      <span className="text-(--color-border)">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  );
}

/** Sección de reseñas (server component): lista aprobadas + formulario si hay sesión. */
export async function ProductReviews({
  productId,
  isLoggedIn,
}: {
  productId: string;
  isLoggedIn: boolean;
}) {
  const reviews = await apiServer.get<ProductReviewsData>(`/reviews/product/${productId}`);

  return (
    <section className="mt-14 border-t border-(--color-border) pt-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
        <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Reviews
        </h2>
        {reviews.count > 0 && (
          <p className="flex items-center gap-2 text-sm text-(--color-fg-muted)">
            <Stars value={reviews.average ?? 0} />
            <span className="font-mono">{reviews.average}</span> · {reviews.count}{' '}
            {reviews.count === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      {reviews.count === 0 && (
        <p className="text-sm text-(--color-fg-muted) mb-6">
          No reviews yet — be the first to share your experience.
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        <ul className="space-y-5">
          {reviews.items.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 space-y-2"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Stars value={review.rating} />
                {review.title && <p className="text-sm font-semibold">{review.title}</p>}
              </div>
              <p className="text-sm leading-relaxed text-(--color-fg-muted)">{review.body}</p>
              <p className="text-xs text-(--color-fg-subtle)">
                {review.authorName}
                {review.verified && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-(--color-success)/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-(--color-success)">
                    ✓ Verified purchase
                  </span>
                )}
                <span className="ml-2">
                  {new Date(review.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </p>
            </li>
          ))}
        </ul>

        <ReviewForm productId={productId} isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}

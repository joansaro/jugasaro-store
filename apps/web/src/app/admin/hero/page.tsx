import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import type { HeroSlide } from '@jugasaro/shared';

import { apiServer } from '@/lib/api';
import { LinkButton } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { deleteSlideAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHeroPage() {
  const slides = await apiServer.get<HeroSlide[]>('/hero-slides/all');

  return (
    <>
      <PageHeader
        eyebrow="Storefront"
        title={`Hero banner (${slides.length})`}
        actions={
          <LinkButton href="/admin/hero/new" size="sm">
            <Plus className="size-4" /> New slide
          </LinkButton>
        }
      />

      <p className="mb-6 -mt-4 text-sm text-(--color-fg-muted)">
        These slides rotate in the full-screen carousel at the top of the home page.
      </p>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-elev) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--color-bg-subtle) text-(--color-fg-muted) text-xs uppercase tracking-widest font-mono">
            <tr>
              <th className="text-left px-5 py-3 font-normal">Preview</th>
              <th className="text-left px-5 py-3 font-normal">Title</th>
              <th className="text-left px-5 py-3 font-normal">CTA</th>
              <th className="text-left px-5 py-3 font-normal">Position</th>
              <th className="text-left px-5 py-3 font-normal">Status</th>
              <th className="text-right px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {slides.map((s) => (
              <tr key={s.id} className="hover:bg-(--color-bg-muted) transition-colors">
                <td className="px-5 py-3">
                  <div className="h-12 w-24 overflow-hidden rounded-md border border-(--color-border) bg-(--color-bg-muted)">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="font-medium">{s.title}</span>
                  {s.subtitle && (
                    <span className="block max-w-[320px] truncate text-xs text-(--color-fg-muted)">
                      {s.subtitle}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-(--color-fg-muted)">
                  {s.ctaLabel ? (
                    <span>
                      {s.ctaLabel}
                      <span className="block font-mono text-[10px]">{s.ctaHref}</span>
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{s.position}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      s.active
                        ? 'inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-(--color-accent) text-(--color-accent-fg)'
                        : 'inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-(--color-bg-muted) text-(--color-fg-muted)'
                    }
                  >
                    {s.active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/hero/${s.id}/edit` as never}
                      className="p-2 rounded-md text-(--color-fg-muted) hover:bg-(--color-bg-muted) hover:text-(--color-fg) transition-colors"
                      aria-label={`Edit ${s.title}`}
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton
                      action={deleteSlideAction.bind(null, s.id)}
                      confirmMessage={`Delete slide "${s.title}"?`}
                      iconOnly
                    />
                  </div>
                </td>
              </tr>
            ))}
            {slides.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-(--color-fg-muted)">
                  No slides yet — the store shows the static hero. Create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

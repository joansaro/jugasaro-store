import { MapPin, Phone, Clock } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeader } from './section-header';

const LOCATIONS = [
  {
    kind: 'STORE',
    name: 'Jugasaro — Downtown',
    address: '482 Ashworth Avenue, Suite 12\nDowntown District, 10003',
    phone: '+1 (555) 284-0411',
    hours: [
      ['Mon – Fri', '10:00 — 20:00'],
      ['Saturday', '10:00 — 22:00'],
      ['Sunday', '11:00 — 18:00'],
    ],
  },
  {
    kind: 'STORE',
    name: 'Jugasaro — Riverside',
    address: '27 Canal Row, Ground Floor\nRiverside Quarter, 10106',
    phone: '+1 (555) 284-0488',
    hours: [
      ['Mon – Fri', '11:00 — 21:00'],
      ['Saturday', '10:00 — 22:00'],
      ['Sunday', '11:00 — 19:00'],
    ],
  },
  {
    kind: 'WHOLESALE',
    name: 'Jugasaro Warehouse — B2B',
    address: 'Unit 4, Meridian Logistics Park\nNorth Industrial Zone, 10420',
    phone: '+1 (555) 284-WHSL',
    hours: [
      ['Mon – Fri', '07:00 — 17:00'],
      ['Saturday', '08:00 — 13:00'],
      ['Sunday', '— closed —'],
    ],
  },
];

export function Locations() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <SectionHeader
          eyebrow="Visit us"
          title="Three locations, one experience."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              className="border border-(--color-border) rounded-2xl p-6 bg-(--color-bg-elev) space-y-4"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--color-accent) mb-2">
                  {loc.kind}
                </p>
                <h3
                  className="text-lg font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {loc.name}
                </h3>
              </div>
              <div className="flex gap-2 text-sm text-(--color-fg-muted)">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{loc.address}</span>
              </div>
              <div className="flex gap-2 text-sm text-(--color-fg-muted)">
                <Phone className="size-4 shrink-0 mt-0.5" />
                <span>{loc.phone}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Clock className="size-4 shrink-0 mt-0.5 text-(--color-fg-muted)" />
                <ul className="space-y-1 flex-1">
                  {loc.hours.map(([day, time]) => (
                    <li key={day} className="flex justify-between gap-3">
                      <span className="text-(--color-fg-muted)">{day}</span>
                      <span className="font-mono text-xs">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

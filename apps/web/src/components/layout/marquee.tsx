const ITEMS = [
  'Free shipping over $75',
  '100+ curated brands',
  'Wholesale available',
  '30-day hassle-free returns',
  'Members get early access',
  'New drops every Monday',
];

export function Marquee() {
  // Duplicate items for seamless loop
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="bg-(--color-fg) text-(--color-bg) py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-6 font-mono text-[11px] uppercase tracking-widest"
          >
            {item}
            <span className="opacity-30">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

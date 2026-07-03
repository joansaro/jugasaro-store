/* All mock data and helpers — single source of truth */

const Placeholder = ({ label, variant = "a", style, className = "" }) => {
  const hue = { a: 300, b: 310, c: 290, d: 270, e: 320, f: 280, g: 305, h: 295 }[variant] || 300;
  const s = {
    "--ph-a": `oklch(88% 0.03 ${hue})`,
    "--ph-b": `oklch(82% 0.05 ${hue})`,
    ...style,
  };
  return (
    <div className={`placeholder ${className}`} style={s}>
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
};

const DarkPlaceholder = ({ label, hue = 300, tone = 20, className = "" }) => {
  const s = {
    "--ph-a": `oklch(${tone}% 0.05 ${hue})`,
    "--ph-b": `oklch(${tone - 5}% 0.08 ${hue})`,
  };
  return (
    <div className={`placeholder ${className}`} style={s}>
      {label && <span className="ph-label" style={{ background: "oklch(15% 0.02 300)", color: "oklch(85% 0 0)", borderColor: "oklch(25% 0.02 300)" }}>{label}</span>}
    </div>
  );
};

const HERO_SLIDES = [
  { eyebrow: "NEW SEASON / VOL 04", title: "Designed for everyday, built to last.", sub: "Discover the curated drop — 100+ brands, over a thousand products, one seamless store.", cta: "Shop the drop", alt: "See lookbook", hue: 300, tone: 22, phLabel: "hero_01.jpg — editorial lifestyle" },
  { eyebrow: "LIMITED RELEASE", title: "Up to 40% off premium essentials.", sub: "Hand-picked favorites from our best-selling brands — while supplies last.", cta: "Browse offers", alt: "View all brands", hue: 280, tone: 18, phLabel: "hero_02.jpg — product flatlay" },
  { eyebrow: "WHOLESALE / B2B", title: "Bulk pricing, direct from our warehouse.", sub: "Serving retailers, contractors and resellers across the region since 2014.", cta: "Request a quote", alt: "Wholesale catalog", hue: 320, tone: 24, phLabel: "hero_03.jpg — warehouse scene" },
];

const SEARCH_SUGGESTIONS = {
  trending: [
    { q: "Leather weekender bag", meta: "182 results" },
    { q: "Minimalist desk lamp", meta: "94 results" },
    { q: "Ceramic coffee set", meta: "61 results" },
    { q: "Wireless earbuds", meta: "238 results" },
  ],
  brands: ["Northline", "Volta&Co", "Meridian", "Kasai", "Field Studio"],
  categories: ["Home & Living", "Tech & Audio", "Fashion", "Beauty", "Outdoor"],
};

// 100+ brands (mostly names as logotypes)
const BRANDS = [
  "Northline", "Volta & Co", "Meridian", "Kasai", "Field Studio", "Hemlock",
  "Ojai Goods", "Tusken", "Monvela", "Arcadia", "Sable & Sons", "Brightwell",
  "Korvo", "Lumenhaus", "Parallel", "Stonecroft", "Wovenly", "Aurea",
  "Highmark", "Elm & Ember", "Cobalt Lane", "Foxglove", "Harbor Hill", "Ironside",
  "Juneberry", "Klein Studio", "Lindenfeld", "Moss & Co", "Nordhus", "Oakbridge",
  "Pensa Lab", "Quill & Quill", "Ravenwood", "Silvercrest", "Timberyard", "Undine",
  "Vermilion", "Wilder", "Xander", "Yarrow", "Zephyr", "Ashland",
  "Brookmere", "Chevall", "Driftwood", "Echo Works", "Fawnridge", "Grayson & Co",
  "Hollowpine", "Irongate", "Jasmer", "Kingsley", "Larkfield", "Mossvale",
  "Nightfall", "Oakworth", "Pembrook", "Quarter Mile", "Ridgeline", "Stoneheart",
  "Thornwood", "Umbra", "Vesper", "Winslow", "Yonderly", "Zellwood",
  "Alderwick", "Briarly", "Cloudhaven", "Dawnridge", "Everhart", "Fernbrook",
  "Glade & Co", "Hartwell", "Inkstone", "Junewood", "Kestrel", "Lakemont",
  "Maple Ridge", "Nightingale", "Orris", "Pineford", "Quay", "Reedham",
  "Sandpiper", "Thistle", "Umbel", "Varna", "Willowdale", "Yewbank",
  "Ashwood", "Bristle", "Cinder", "Dovewood", "Ember Lane", "Foxtail",
  "Grove", "Hearth & Home", "Indigo Bay", "Juniper",
];

// Product set — now with out-of-stock examples + 20+ items for Shop page
const ALL_PRODUCTS = [
  { id: 1, brand: "Northline", name: "Weekender Leather Duffel Bag", price: 268, was: 320, tag: "sale", hue: 300, variants: ["#1a1a1a", "#5c4a3a", "#8b6f47"], cat: "Fashion" },
  { id: 2, brand: "Volta & Co", name: "Studio Desk Lamp — Matte Black", price: 149, tag: "new", hue: 280, variants: ["#1a1a1a", "#eeeeee"], cat: "Home & Living" },
  { id: 3, brand: "Meridian", name: "Ceramic Pour-Over Coffee Set (4pc)", price: 88, hue: 310, cat: "Kitchen" },
  { id: 4, brand: "Kasai", name: "Merino Crewneck Sweater", price: 120, was: 160, tag: "sale", hue: 270, sizes: ["S", "M", "L", "XL"], cat: "Fashion" },
  { id: 5, brand: "Field Studio", name: "Heritage Canvas Apron", price: 64, hue: 320, cat: "Home & Living" },
  { id: 6, brand: "Hemlock", name: "Walnut Cutting Board — Large", price: 72, tag: "hot", hue: 295, cat: "Kitchen" },
  { id: 7, brand: "Lumenhaus", name: "Noise-Cancelling Earbuds Pro", price: 199, was: 249, hue: 290, variants: ["#1a1a1a", "#ffffff", "#8a7ab5"], cat: "Tech & Audio" },
  { id: 8, brand: "Arcadia", name: "Linen Bath Towel Set", price: 96, hue: 300, cat: "Home & Living" },
  { id: 9, brand: "Aurea", name: "Cold Brew Carafe 1L", price: 48, tag: "new", hue: 285, cat: "Kitchen" },
  { id: 10, brand: "Parallel", name: "Leather-Wrapped Notebook", price: 34, hue: 315, cat: "Home & Living" },
  { id: 11, brand: "Stonecroft", name: "Cast Iron Candle Holder", price: 56, hue: 275, oos: true, cat: "Home & Living" },
  { id: 12, brand: "Brightwell", name: "Pima Cotton Oxford Shirt", price: 110, tag: "new", hue: 305, sizes: ["S", "M", "L", "XL"], cat: "Fashion" },
  { id: 13, brand: "Korvo", name: "Wool Beanie — Charcoal", price: 38, hue: 290, cat: "Fashion", variants: ["#333", "#8a7ab5", "#d2c9b6"] },
  { id: 14, brand: "Ojai Goods", name: "Beeswax Taper Candles (Set of 6)", price: 28, hue: 320, cat: "Home & Living" },
  { id: 15, brand: "Wovenly", name: "Handwoven Cotton Throw Blanket", price: 135, hue: 310, oos: true, cat: "Home & Living" },
  { id: 16, brand: "Tusken", name: "All-Weather Backpack 24L", price: 178, tag: "hot", hue: 280, variants: ["#1a1a1a", "#4a4a52"], cat: "Outdoor" },
  { id: 17, brand: "Monvela", name: "Silk Pillowcase Set", price: 82, was: 110, tag: "sale", hue: 300, variants: ["#eee", "#d4c5e0"], cat: "Home & Living" },
  { id: 18, brand: "Sable & Sons", name: "Aged Cheddar Box (3 varieties)", price: 42, hue: 295, cat: "Kitchen" },
  { id: 19, brand: "Ironside", name: "Minimal Steel Wallet", price: 58, hue: 270, cat: "Fashion" },
  { id: 20, brand: "Foxglove", name: "Rose Geranium Face Serum", price: 66, tag: "new", hue: 315, cat: "Beauty" },
  { id: 21, brand: "Juneberry", name: "Cedar & Sage Room Spray", price: 32, hue: 285, cat: "Beauty" },
  { id: 22, brand: "Harbor Hill", name: "Reclaimed Teak Cutting Board", price: 95, hue: 305, cat: "Kitchen", oos: true },
  { id: 23, brand: "Cobalt Lane", name: "Pour-Over Kettle — Copper", price: 128, hue: 290, cat: "Kitchen" },
  { id: 24, brand: "Ravenwood", name: "Wax Canvas Tote", price: 92, hue: 300, variants: ["#3a3a3a", "#6b5d48"], cat: "Fashion" },
  { id: 25, brand: "Silvercrest", name: "Brass Clip-On Desk Clock", price: 78, tag: "new", hue: 310, cat: "Home & Living" },
  { id: 26, brand: "Elm & Ember", name: "Smoke & Oak Candle 10oz", price: 42, hue: 275, cat: "Home & Living" },
  { id: 27, brand: "Timberyard", name: "Oak Hanger Set (12pc)", price: 64, hue: 320, cat: "Home & Living" },
  { id: 28, brand: "Highmark", name: "Alpaca Wool Scarf", price: 145, was: 180, tag: "sale", hue: 295, variants: ["#333", "#9b8a6a", "#5e556b"], cat: "Fashion" },
  { id: 29, brand: "Klein Studio", name: "Porcelain Pasta Bowl Set", price: 74, hue: 305, cat: "Kitchen" },
  { id: 30, brand: "Pensa Lab", name: "Aluminum Travel Mug 16oz", price: 36, hue: 280, cat: "Outdoor", variants: ["#aaa", "#333", "#8a7ab5"] },
  { id: 31, brand: "Moss & Co", name: "Organic Cotton Bath Mat", price: 58, hue: 290, cat: "Home & Living" },
  { id: 32, brand: "Oakbridge", name: "Leather Card Holder — Slim", price: 48, hue: 315, cat: "Fashion" },
  { id: 33, brand: "Quill & Quill", name: "Refillable Fountain Pen", price: 88, tag: "new", hue: 300, cat: "Home & Living" },
  { id: 34, brand: "Vermilion", name: "Cashmere Knit Crew", price: 210, hue: 320, sizes: ["S", "M", "L", "XL"], cat: "Fashion", oos: true },
  { id: 35, brand: "Wilder", name: "Trail Running Socks (3pk)", price: 26, hue: 285, cat: "Outdoor" },
  { id: 36, brand: "Yarrow", name: "Botanical Bath Salts 12oz", price: 24, hue: 310, cat: "Beauty" },
  { id: 37, brand: "Zephyr", name: "Packable Rain Shell", price: 168, tag: "hot", hue: 270, sizes: ["S", "M", "L", "XL"], cat: "Outdoor" },
  { id: 38, brand: "Driftwood", name: "Sea Salt & Cedar Bar Soap", price: 14, hue: 300, cat: "Beauty" },
  { id: 39, brand: "Echo Works", name: "Portable Bluetooth Speaker", price: 158, was: 198, tag: "sale", hue: 290, variants: ["#333", "#d4c5e0"], cat: "Tech & Audio" },
  { id: 40, brand: "Ashland", name: "Raw Denim Jacket — Indigo", price: 230, hue: 295, sizes: ["S", "M", "L", "XL"], cat: "Fashion" },
];

const makeProducts = () => ALL_PRODUCTS.slice();

const CATEGORIES = [
  { name: "Home & Living", count: 342, hue: 300, variant: "a" },
  { name: "Fashion", count: 278, hue: 310, variant: "b" },
  { name: "Tech & Audio", count: 164, hue: 290, variant: "c" },
  { name: "Beauty", count: 152, hue: 320, variant: "d" },
  { name: "Outdoor", count: 128, hue: 280, variant: "e" },
  { name: "Kitchen", count: 91, hue: 305, variant: "f" },
  { name: "Office", count: 84, hue: 295, variant: "g" },
  { name: "Travel", count: 73, hue: 275, variant: "h" },
  { name: "Wellness", count: 66, hue: 315, variant: "a" },
  { name: "Kids", count: 58, hue: 285, variant: "b" },
  { name: "Pets", count: 44, hue: 300, variant: "c" },
  { name: "Stationery", count: 38, hue: 310, variant: "d" },
];

const PROMOS = [
  { eyebrow: "Summer Drop — 06.15", title: "Up to 40% off across 60+ partner brands.", cta: "Shop summer sale", large: true, hue: 285, tone: 18, phLabel: "promo_lg.jpg" },
  { eyebrow: "Members only", title: "Free shipping over $75.", cta: "Join now", hue: 300, tone: 22, phLabel: "promo_02.jpg" },
  { eyebrow: "New at Jugasaro", title: "Fresh arrivals every Monday.", cta: "See what's new", hue: 310, tone: 24, phLabel: "promo_03.jpg" },
  { eyebrow: "Gift guide", title: "Curated picks under $50.", cta: "Browse picks", hue: 275, tone: 20, phLabel: "promo_04.jpg" },
  { eyebrow: "Trade-in program", title: "Refresh your kit. Give back.", cta: "Learn more", hue: 295, tone: 23, phLabel: "promo_05.jpg" },
];

const LOCATIONS = [
  { kind: "STORE", name: "Jugasaro — Downtown", address: "482 Ashworth Avenue, Suite 12\nDowntown District, 10003", phone: "+1 (555) 284-0411", hours: [["Mon – Fri", "10:00 — 20:00"], ["Saturday", "10:00 — 22:00"], ["Sunday", "11:00 — 18:00"]], hue: 300 },
  { kind: "STORE", name: "Jugasaro — Riverside", address: "27 Canal Row, Ground Floor\nRiverside Quarter, 10106", phone: "+1 (555) 284-0488", hours: [["Mon – Fri", "11:00 — 21:00"], ["Saturday", "10:00 — 22:00"], ["Sunday", "11:00 — 19:00"]], hue: 310 },
  { kind: "WHOLESALE", name: "Jugasaro Warehouse — B2B", address: "Unit 4, Meridian Logistics Park\nNorth Industrial Zone, 10420", phone: "+1 (555) 284-WHSL", hours: [["Mon – Fri", "07:00 — 17:00"], ["Saturday", "08:00 — 13:00"], ["Sunday", "— closed —"]], hue: 290, wholesale: { moq: "$1,500 minimum order", discount: "Tiered pricing from -15% to -42%", shipping: "Nationwide delivery · 2–5 business days" } },
];

const MARQUEE_ITEMS = [
  "Free shipping over $75",
  "100+ curated brands",
  "Wholesale available",
  "30-day hassle-free returns",
  "Members get early access",
  "New drops every Monday",
];

// Nav data — used by dropdown mega-menus
const NAV_BRANDS_TOP = BRANDS.slice(0, 10).map((b) => ({ name: b, count: Math.floor(Math.random() * 80) + 12 }));
const NAV_CATS_TOP = CATEGORIES.slice(0, 10);

Object.assign(window, {
  Placeholder, DarkPlaceholder,
  HERO_SLIDES, SEARCH_SUGGESTIONS, BRANDS, ALL_PRODUCTS, makeProducts,
  CATEGORIES, PROMOS, LOCATIONS, MARQUEE_ITEMS,
  NAV_BRANDS_TOP, NAV_CATS_TOP,
});

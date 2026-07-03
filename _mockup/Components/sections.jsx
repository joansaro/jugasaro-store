/* Product card + all home sections (carousels for best selling, new arrivals,
   promotions), categories, thin banner, brands, locations. */

// ---------- Product Card ----------
function ProductCard({ p }) {
  const [variant, setVariant] = React.useState(0);
  const [size, setSize] = React.useState(1);
  const [wish, setWish] = React.useState(false);

  const tag =
    p.oos ? <span className="tag tag-oos">Out of stock</span> :
    p.tag === "new" ? <span className="tag tag-new">New</span> :
    p.tag === "sale" ? <span className="tag tag-sale">-{Math.round(((p.was - p.price) / p.was) * 100)}%</span> :
    p.tag === "hot" ? <span className="tag tag-hot">Hot</span> :
    null;

  const variantLetter = (["a","b","c","d","e","f"])[p.id % 6];

  return (
    <article className={`product-card ${p.oos ? "oos" : ""}`}>
      <a href={`Product.html?id=${p.id}`} className="img-wrap" style={{ display: "block", textDecoration: "none" }}>
        {tag}
        <button
          className={`wishlist ${wish ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); setWish(!wish); }}
          aria-label="Add to wishlist"
        >
          <IconHeart size={16} />
        </button>
        <Placeholder label={`${p.brand.slice(0,3).toLowerCase()}_${String(p.id).padStart(3, "0")}.jpg`} variant={variantLetter} />
      </a>
      <div className="body">
        <div className="brand">{p.brand}</div>
        <a href={`Product.html?id=${p.id}`} className="name" style={{ textDecoration: "none", color: "inherit" }}>{p.name}</a>

        <div className="variations">
          {!p.oos && p.variants && p.variants.map((c, i) => (
            <button key={i} className={`swatch ${i === variant ? "active" : ""}`}
              style={{ background: c }} onClick={() => setVariant(i)}
              aria-label={`Variant ${i + 1}`} />
          ))}
          {!p.oos && p.sizes && p.sizes.map((s, i) => (
            <button key={s} className={`size-pill ${i === size ? "active" : ""}`}
              onClick={() => setSize(i)}>{s}</button>
          ))}
        </div>

        <div className="price-row">
          <span className="price">${p.price}</span>
          {p.was && <span className="price-strike">${p.was}</span>}
        </div>

        {p.oos ? (
          <button className="notify-btn">
            <IconMail size={14} /> Notify me when available
          </button>
        ) : (
          <button className="add-btn">
            <IconPlus size={14} /> Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

// ---------- Auto-scrolling rail (interactive) ----------
function AutoRail({ products, duration = 60 }) {
  const ref = React.useRef(null);
  const stateRef = React.useRef({ paused: false, drag: false, dragStartX: 0, dragStartScroll: 0 });
  const doubled = [...products, ...products];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    let last = performance.now();
    // pixels per second derived from duration: full track scroll over `duration` s
    // After mount, scrollWidth covers both halves; one loop = scrollWidth/2.
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const half = el.scrollWidth / 2;
      if (!stateRef.current.paused && !stateRef.current.drag && half > 0) {
        const speed = half / duration; // px/sec
        el.scrollLeft += speed * dt;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  // Pause on hover or focus
  const onEnter = () => { stateRef.current.paused = true; };
  const onLeave = () => { stateRef.current.paused = false; };

  // Drag to scroll
  const onDown = (e) => {
    stateRef.current.drag = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartScroll = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.scrollBehavior = "auto";
  };
  const onMove = (e) => {
    if (!stateRef.current.drag) return;
    const dx = e.clientX - stateRef.current.dragStartX;
    ref.current.scrollLeft = stateRef.current.dragStartScroll - dx;
  };
  const onUp = () => {
    stateRef.current.drag = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.scrollBehavior = "smooth";
    }
  };

  // Wheel: trap horizontal mouse-wheel + pause
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      stateRef.current.paused = true;
      clearTimeout(stateRef.current._t);
      stateRef.current._t = setTimeout(() => { stateRef.current.paused = false; }, 1500);
    }
  };

  // Arrow buttons
  const scroll = (dir) => {
    if (!ref.current) return;
    const step = 300;
    ref.current.scrollBy({ left: dir * step, behavior: "smooth" });
    stateRef.current.paused = true;
    clearTimeout(stateRef.current._t);
    stateRef.current._t = setTimeout(() => { stateRef.current.paused = false; }, 2500);
  };

  return (
    <div
      className="auto-rail-wrap interactive"
      onMouseEnter={onEnter}
      onMouseLeave={() => { onLeave(); onUp(); }}
    >
      <button className="rail-arrow prev" onClick={() => scroll(-1)} aria-label="Scroll left">
        <IconArrowLeft size={18} />
      </button>
      <div
        className="auto-rail-track"
        ref={ref}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onWheel={onWheel}
        style={{ cursor: "grab" }}
      >
        {doubled.map((p, i) => <ProductCard key={`${p.id}-${i}`} p={p} />)}
      </div>
      <button className="rail-arrow next" onClick={() => scroll(1)} aria-label="Scroll right">
        <IconArrowRight size={18} />
      </button>
    </div>
  );
}

// ---------- Auto-scrolling rail for arbitrary tiles ----------
function AutoRailTiles({ items, render, duration = 60, reverse = false }) {
  const ref = React.useRef(null);
  const stateRef = React.useRef({ paused: false, drag: false, dragStartX: 0, dragStartScroll: 0 });
  const doubled = [...items, ...items];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const half = el.scrollWidth / 2;
      if (!stateRef.current.paused && !stateRef.current.drag && half > 0) {
        const speed = (half / duration) * (reverse ? -1 : 1);
        el.scrollLeft += speed * dt;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        if (el.scrollLeft < 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    // Start at half so reverse direction has room
    if (reverse) el.scrollLeft = el.scrollWidth / 4;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, reverse]);

  const onEnter = () => { stateRef.current.paused = true; };
  const onLeave = () => { stateRef.current.paused = false; stateRef.current.drag = false; if (ref.current) ref.current.style.cursor = "grab"; };
  const onDown = (e) => {
    stateRef.current.drag = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartScroll = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
  };
  const onMove = (e) => {
    if (!stateRef.current.drag) return;
    const dx = e.clientX - stateRef.current.dragStartX;
    ref.current.scrollLeft = stateRef.current.dragStartScroll - dx;
  };
  const onUp = () => { stateRef.current.drag = false; if (ref.current) ref.current.style.cursor = "grab"; };

  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    stateRef.current.paused = true;
    clearTimeout(stateRef.current._t);
    stateRef.current._t = setTimeout(() => { stateRef.current.paused = false; }, 2500);
  };

  return (
    <div
      className="auto-rail-wrap interactive"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button className="rail-arrow prev" onClick={() => scroll(-1)} aria-label="Scroll left">
        <IconArrowLeft size={18} />
      </button>
      <div
        className="auto-rail-track"
        ref={ref}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        style={{ cursor: "grab" }}
      >
        {doubled.map((it, i) => (
          <React.Fragment key={i}>{render(it, i)}</React.Fragment>
        ))}
      </div>
      <button className="rail-arrow next" onClick={() => scroll(1)} aria-label="Scroll right">
        <IconArrowRight size={18} />
      </button>
    </div>
  );
}

// ---------- Horizontal product rail ----------
function ProductRail({ products }) {
  const ref = React.useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    const step = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <div className="rail-wrap">
      <button className="rail-arrow prev" onClick={() => scroll(-1)} aria-label="Scroll left">
        <IconArrowLeft size={18} />
      </button>
      <div className="rail" ref={ref}>
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      <button className="rail-arrow next" onClick={() => scroll(1)} aria-label="Scroll right">
        <IconArrowRight size={18} />
      </button>
    </div>
  );
}

// ---------- Best Selling (carousel) ----------
function BestSelling() {
  const products = ALL_PRODUCTS.slice(0, 10);
  return (
    <section className="section" id="best-selling">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Top picks · this month</span>
            <h2>Best selling</h2>
            <p>The pieces our customers reach for again and again — vetted, loved, restocked.</p>
          </div>
          <a href="Shop.html?sort=best" className="view-all">Shop all best sellers <IconArrowRight size={14} /></a>
        </div>
        <AutoRail products={products} duration={70} />
      </div>
    </section>
  );
}

// ---------- Categories ----------
function Categories() {
  const shown = CATEGORIES.slice(0, 6);
  return (
    <section className="section" id="categories-home" style={{ background: "var(--bg-subtle)" }}>
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Explore · {CATEGORIES.length} categories</span>
            <h2>Shop by category</h2>
          </div>
          <a href="Categories.html" className="view-all">All categories <IconArrowRight size={14} /></a>
        </div>

        <AutoRailTiles
          items={CATEGORIES.slice(0, 10)}
          duration={75}
          render={(c) => (
            <a href={`Category.html?cat=${encodeURIComponent(c.name)}`} className="cat-card auto" key={c.name}>
              <div className="cat-bg">
                <Placeholder label={`cat_${c.name.split(" ")[0].toLowerCase()}.jpg`} variant={c.variant} />
              </div>
              <div className="cat-overlay" />
              <div className="cat-info">
                <div>
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-count">{c.count} items</div>
                </div>
                <div className="cat-arrow"><IconArrowRight size={15} /></div>
              </div>
            </a>
          )}
        />
      </div>
    </section>
  );
}

// ---------- New Arrivals (carousel) ----------
function NewArrivals() {
  const products = ALL_PRODUCTS.slice(10, 24);
  return (
    <section className="section" id="new-arrivals">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Fresh drops · week 17</span>
            <h2>New arrivals</h2>
            <p>Just landed — the latest from our partner brands.</p>
          </div>
          <a href="Shop.html?sort=new" className="view-all">Shop all new <IconArrowRight size={14} /></a>
        </div>
        <AutoRail products={products} duration={80} />
      </div>
    </section>
  );
}

// ---------- Promotions ----------
function Promotions() {
  return (
    <section className="section" id="promotions">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Offers · live now</span>
            <h2>Promotions &amp; deals</h2>
            <p>Seasonal savings, bundles and members-only perks.</p>
          </div>
          <a href="Shop.html?sort=sale" className="view-all">All offers <IconArrowRight size={14} /></a>
        </div>

        <div className="promo-grid">
          {PROMOS.map((p, i) => (
            <a href="#offer" className={`promo-card ${p.large ? "large" : ""}`} key={i}>
              <div className="promo-bg"><DarkPlaceholder hue={p.hue} tone={p.tone} label={p.phLabel} /></div>
              <div className="promo-overlay" />
              <div className="promo-content">
                <span className="promo-eyebrow">{p.eyebrow}</span>
                <h3 className="promo-title">{p.title}</h3>
                <span className="promo-link">{p.cta} <IconArrowRight size={14} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Trending Deals Carousel ----------
function TrendingDeals() {
  const products = ALL_PRODUCTS.filter(p => p.was || p.tag === "hot").slice(0, 10);
  return (
    <section className="section" id="deals">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Limited time · ends in 3 days</span>
            <h2>Trending deals</h2>
            <p>Members-favorite products, now on promo.</p>
          </div>
          <a href="Shop.html?sort=sale" className="view-all">See all deals <IconArrowRight size={14} /></a>
        </div>
        <AutoRail products={products} duration={65} />
      </div>
    </section>
  );
}

// ---------- Thin marquee banner ----------
function ThinBanner() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="thin-banner">
      <div className="thin-banner-track">
        {items.map((t, i) => (
          <span key={i} className="thin-banner-item">
            <span className="dot" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- Our Brands (auto-scrolling rail, reverse direction) ----------
function OurBrands() {
  const shown = BRANDS.slice(0, 16);
  const counts = React.useMemo(() => shown.map((_, i) => 14 + ((i * 7) % 42)), [shown.length]);
  return (
    <section className="section" id="brands-home">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Trusted partners · {BRANDS.length}+</span>
            <h2>Our brands</h2>
            <p>From indie makers to household names — carefully curated, all in one place.</p>
          </div>
          <a href="Brands.html" className="view-all">See all brands <IconArrowRight size={14} /></a>
        </div>

        <AutoRailTiles
          items={shown}
          duration={70}
          reverse={true}
          render={(b, i) => (
            <a href={`Brand.html?brand=${encodeURIComponent(b)}`} className="brand-tile" key={b + i}>
              <div className="bt-glyph">{b.charAt(0)}</div>
              <div className="bt-name">{b}</div>
              <div className="bt-count">{counts[i % counts.length]} products</div>
            </a>
          )}
        />
      </div>
    </section>
  );
}

// ---------- Locations ----------
function Locations() {
  return (
    <section className="section" id="contact" style={{ background: "var(--bg-subtle)" }}>
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Visit us · 3 locations</span>
            <h2>Our addresses</h2>
            <p>Two retail stores and one wholesale warehouse — open to walk-ins and B2B partners.</p>
          </div>
        </div>

        <div className="loc-grid">
          {LOCATIONS.map((loc, i) => (
            <article key={i} className="loc-card">
              <div className="loc-map">
                <span className={`loc-badge ${loc.kind === "WHOLESALE" ? "wholesale" : ""}`}>
                  {loc.kind === "WHOLESALE" ? "Wholesale / B2B" : "Retail store"}
                </span>
                <DarkPlaceholder hue={loc.hue} tone={22} label={`map_${loc.kind.toLowerCase()}.png`} />
              </div>
              <div className="loc-body">
                <h3>{loc.name}</h3>
                <div className="loc-row">
                  <IconMapPin size={16} />
                  <span style={{ whiteSpace: "pre-line" }}>{loc.address}</span>
                </div>
                <div className="loc-row">
                  <IconPhone size={16} />
                  <span>{loc.phone}</span>
                </div>
                <div className="loc-row" style={{ alignItems: "flex-start" }}>
                  <IconClock size={16} />
                  <div className="loc-hours-grid">
                    {loc.hours.map(([d, h], j) => (
                      <React.Fragment key={j}>
                        <span className="day">{d}</span>
                        <span>{h}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {loc.wholesale && (
                  <div style={{
                    marginTop: 6, padding: 14, borderRadius: "var(--radius-md)",
                    background: "var(--accent-soft)",
                    border: "1px solid color-mix(in oklab, var(--accent) 20%, transparent)",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "var(--accent)", fontWeight: 500,
                    }}>Wholesale info</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <IconPercent size={14} style={{ flexShrink: 0, marginTop: 3, color: "var(--accent)" }} />
                        <span>{loc.wholesale.discount}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <IconShield size={14} style={{ flexShrink: 0, marginTop: 3, color: "var(--accent)" }} />
                        <span>{loc.wholesale.moq}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <IconTruck size={14} style={{ flexShrink: 0, marginTop: 3, color: "var(--accent)" }} />
                        <span>{loc.wholesale.shipping}</span>
                      </div>
                    </div>
                    <a href="#quote" className="btn btn-accent" style={{ height: 40, marginTop: 6, fontSize: 13 }}>
                      Request a wholesale quote <IconArrowRight size={14} />
                    </a>
                  </div>
                )}

                {!loc.wholesale && (
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <a href="#map" className="btn btn-outline" style={{ height: 40, fontSize: 13, flex: 1 }}>
                      Get directions
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  ProductCard, ProductRail, AutoRail, AutoRailTiles,
  BestSelling, Categories, NewArrivals, Promotions, TrendingDeals,
  ThinBanner, OurBrands, Locations,
});

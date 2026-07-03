/* Shop page — filters + 20 per page pagination */

const PER_PAGE = 20;
const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 — $50", min: 25, max: 50 },
  { label: "$50 — $100", min: 50, max: 100 },
  { label: "$100 — $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

// Expand dataset to ~120 products for a more realistic shop
function expandDataset() {
  const base = ALL_PRODUCTS;
  const extras = [];
  const modifiers = ["Classic", "Essential", "Premium", "Refined", "Daily", "Studio"];
  const nouns = ["Edition", "Selection", "Pack", "Collection", "Series"];
  for (let i = 0; i < 80; i++) {
    const src = base[i % base.length];
    extras.push({
      ...src,
      id: 1000 + i,
      name: `${modifiers[i % modifiers.length]} ${src.name.split(" ").slice(1).join(" ")} ${nouns[i % nouns.length]}`.trim(),
      price: Math.max(14, Math.round(src.price * (0.7 + (i % 10) / 10))),
      was: undefined,
      tag: i % 17 === 0 ? "new" : i % 23 === 0 ? "hot" : undefined,
      oos: i % 19 === 0,
      hue: 270 + (i * 7) % 60,
    });
  }
  return [...base, ...extras];
}
const SHOP_DATA = expandDataset();

function Checkbox({ active }) {
  return (
    <span className="check">
      {active && <IconCheck size={12} />}
    </span>
  );
}
// Use inline check glyph since IconCheck isn't defined
const IconCheckInline = (p) => (
  <svg width={p.size || 12} height={p.size || 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4 10-10" />
  </svg>
);

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="filter-group">
      <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        {title}
        <IconChevronDown size={14} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s" }} />
      </h4>
      {open && children}
    </div>
  );
}

function FilterItem({ label, count, active, onClick, swatch }) {
  return (
    <label className={`filter-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="check">{active && <IconCheckInline size={11} />}</span>
      {swatch && <span style={{ width: 14, height: 14, borderRadius: 999, background: swatch, border: "1px solid var(--border)" }} />}
      <span>{label}</span>
      {count != null && <span className="count">{count}</span>}
    </label>
  );
}

function ShopPage() {
  const [theme, setTheme] = React.useState(() => {
    const saved = localStorage.getItem("jugasaro-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = React.useState(false);

  // Filters state
  const [selCats, setSelCats] = React.useState(new Set());
  const [selBrands, setSelBrands] = React.useState(new Set());
  const [selPrices, setSelPrices] = React.useState(new Set());
  const [availOnly, setAvailOnly] = React.useState(false);
  const [onSaleOnly, setOnSaleOnly] = React.useState(false);
  const [minP, setMinP] = React.useState("");
  const [maxP, setMaxP] = React.useState("");
  const [sort, setSort] = React.useState("relevant");
  const [view, setView] = React.useState("grid");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  // Read URL param for initial category filter
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) setSelCats(new Set([cat]));
    const sortParam = params.get("sort");
    if (sortParam === "sale") setOnSaleOnly(true);
    if (sortParam === "new") setSort("newest");
  }, []);

  const toggle = (set, setter, v) => {
    const n = new Set(set);
    n.has(v) ? n.delete(v) : n.add(v);
    setter(n);
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    let r = SHOP_DATA.slice();
    if (selCats.size) r = r.filter(p => selCats.has(p.cat));
    if (selBrands.size) r = r.filter(p => selBrands.has(p.brand));
    if (availOnly) r = r.filter(p => !p.oos);
    if (onSaleOnly) r = r.filter(p => p.was);
    if (selPrices.size) {
      r = r.filter(p => {
        for (const range of PRICE_RANGES) {
          if (selPrices.has(range.label) && p.price >= range.min && p.price < range.max) return true;
        }
        return false;
      });
    }
    if (minP) r = r.filter(p => p.price >= Number(minP));
    if (maxP) r = r.filter(p => p.price <= Number(maxP));

    if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
    else if (sort === "newest") r.sort((a, b) => (b.tag === "new" ? 1 : 0) - (a.tag === "new" ? 1 : 0));
    else if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [selCats, selBrands, selPrices, availOnly, onSaleOnly, minP, maxP, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageStart = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(pageStart, pageStart + PER_PAGE);

  const clearAll = () => {
    setSelCats(new Set()); setSelBrands(new Set()); setSelPrices(new Set());
    setAvailOnly(false); setOnSaleOnly(false); setMinP(""); setMaxP(""); setPage(1);
  };

  const activeFilterCount =
    selCats.size + selBrands.size + selPrices.size +
    (availOnly ? 1 : 0) + (onSaleOnly ? 1 : 0) +
    (minP ? 1 : 0) + (maxP ? 1 : 0);

  // Count helpers (categories/brands sizes in dataset)
  const catCounts = React.useMemo(() => {
    const m = {}; SHOP_DATA.forEach(p => m[p.cat] = (m[p.cat] || 0) + 1); return m;
  }, []);
  const brandCounts = React.useMemo(() => {
    const m = {}; SHOP_DATA.forEach(p => m[p.brand] = (m[p.brand] || 0) + 1); return m;
  }, []);
  const topBrands = React.useMemo(() =>
    Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([n]) => n), [brandCounts]);

  const pageNumbers = React.useMemo(() => {
    const nums = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) nums.push(i);
      if (page < totalPages - 2) nums.push("...");
      nums.push(totalPages);
    }
    return nums;
  }, [page, totalPages]);

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="shop" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="Jugasaro Store.html">Home</a> / <span style={{ color: "var(--fg)" }}>Shop</span>
          </div>
          <span className="eyebrow">All products · {SHOP_DATA.length} items</span>
          <h1>Shop everything</h1>
          <p>Browse the complete Jugasaro catalog — filter by category, brand, price and availability to find exactly what you're after.</p>
        </div>
      </section>

      <div className="container shop-layout">
        {/* Filters */}
        <aside className={`shop-filters ${filtersCollapsed ? "collapsed" : ""}`}>
          <FilterGroup title="Category">
            <div className="filter-list">
              {CATEGORIES.map(c => (
                <FilterItem key={c.name} label={c.name} count={catCounts[c.name] || 0}
                  active={selCats.has(c.name)}
                  onClick={() => toggle(selCats, setSelCats, c.name)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Brand">
            <div className="filter-list">
              {topBrands.map(b => (
                <FilterItem key={b} label={b} count={brandCounts[b]}
                  active={selBrands.has(b)}
                  onClick={() => toggle(selBrands, setSelBrands, b)} />
              ))}
              <a href="Brands.html" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500, marginTop: 6 }}>
                See all {BRANDS.length} brands →
              </a>
            </div>
          </FilterGroup>

          <FilterGroup title="Price">
            <div className="filter-list">
              {PRICE_RANGES.map(r => (
                <FilterItem key={r.label} label={r.label}
                  active={selPrices.has(r.label)}
                  onClick={() => toggle(selPrices, setSelPrices, r.label)} />
              ))}
            </div>
            <div className="price-range-inputs">
              <input type="number" placeholder="Min" value={minP} onChange={e => { setMinP(e.target.value); setPage(1); }} />
              <input type="number" placeholder="Max" value={maxP} onChange={e => { setMaxP(e.target.value); setPage(1); }} />
            </div>
          </FilterGroup>

          <FilterGroup title="Availability">
            <div className="filter-list">
              <FilterItem label="In stock only" active={availOnly} onClick={() => { setAvailOnly(!availOnly); setPage(1); }} />
              <FilterItem label="On sale" active={onSaleOnly} onClick={() => { setOnSaleOnly(!onSaleOnly); setPage(1); }} />
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <main>
          <div className="shop-header-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button className="filters-toggle-mobile" onClick={() => setFiltersCollapsed(!filtersCollapsed)}>
                <IconMenu size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <span className="count-txt">
                Showing <b>{pageStart + 1}–{Math.min(pageStart + PER_PAGE, filtered.length)}</b> of <b>{filtered.length}</b> results
              </span>
            </div>
            <div className="shop-toolbar">
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="relevant">Sort: Relevance</option>
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Sort: Name</option>
              </select>
              <div className="view-toggle">
                <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
                </button>
                <button className={view === "grid-dense" ? "active" : ""} onClick={() => setView("grid-dense")} aria-label="Dense grid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="16" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/><rect x="16" y="9" width="5" height="5" rx="1"/><rect x="2" y="16" width="5" height="5" rx="1"/><rect x="9" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/></svg>
                </button>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="active-chips">
              {[...selCats].map(c => (
                <span key={c} className="chip">{c}<button onClick={() => toggle(selCats, setSelCats, c)}><IconClose size={10} /></button></span>
              ))}
              {[...selBrands].map(b => (
                <span key={b} className="chip">{b}<button onClick={() => toggle(selBrands, setSelBrands, b)}><IconClose size={10} /></button></span>
              ))}
              {[...selPrices].map(p => (
                <span key={p} className="chip">{p}<button onClick={() => toggle(selPrices, setSelPrices, p)}><IconClose size={10} /></button></span>
              ))}
              {availOnly && <span className="chip">In stock<button onClick={() => setAvailOnly(false)}><IconClose size={10} /></button></span>}
              {onSaleOnly && <span className="chip">On sale<button onClick={() => setOnSaleOnly(false)}><IconClose size={10} /></button></span>}
              {minP && <span className="chip">Min ${minP}<button onClick={() => setMinP("")}><IconClose size={10} /></button></span>}
              {maxP && <span className="chip">Max ${maxP}<button onClick={() => setMaxP("")}><IconClose size={10} /></button></span>}
              <span className="chip clear-all" onClick={clearAll}>Clear all</span>
            </div>
          )}

          {pageItems.length > 0 ? (
            <div className="product-grid" style={view === "grid-dense" ? { gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" } : {}}>
              {pageItems.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--fg-muted)" }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>No products match your filters</div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>Try removing some filters or browse our full catalog.</div>
              <button className="btn btn-outline" onClick={clearAll}>Clear all filters</button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <IconArrowLeft size={14} />
              </button>
              {pageNumbers.map((n, i) => n === "..."
                ? <span key={i} className="ellipsis">…</span>
                : <button key={i} className={n === page ? "active" : ""} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{n}</button>
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <IconArrowRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ShopPage />);

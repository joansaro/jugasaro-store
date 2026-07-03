/* Product Detail Page */

const REVIEWS = [
  { name: "Marcus T.", initials: "MT", date: "2026-03-14", stars: 5, title: "Exceeded expectations", body: "Build quality is outstanding — the materials feel premium and the finish is flawless. Shipped fast and packaging was thoughtful. Second one I've ordered." },
  { name: "Elena R.", initials: "ER", date: "2026-03-02", stars: 5, title: "Daily-use worthy", body: "I've been using this for a month and it's become part of my daily routine. No complaints whatsoever — holds up beautifully." },
  { name: "Jonas K.", initials: "JK", date: "2026-02-21", stars: 4, title: "Great, minor nit", body: "Love it overall. Only issue — the color looks slightly darker than on the website. Still happy with the purchase." },
  { name: "Priya S.", initials: "PS", date: "2026-02-09", stars: 5, title: "Bought one for a friend too", body: "Quality is so good I ended up ordering a second for a gift. Both recipients thrilled." },
  { name: "Sam L.", initials: "SL", date: "2026-01-28", stars: 4, title: "Solid pick", body: "Works as described, looks great in the space. Would recommend to anyone on the fence." },
];

function Stars({ n = 5, of = 5 }) {
  return <span className="stars">{"★".repeat(n)}{"☆".repeat(of - n)}</span>;
}

function PdpPage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Pick a product (id from URL, default id 1)
  const params = new URLSearchParams(window.location.search);
  const pid = Number(params.get("id")) || 1;
  const p = ALL_PRODUCTS.find(x => x.id === pid) || ALL_PRODUCTS[0];

  const [thumb, setThumb] = React.useState(0);
  const [variant, setVariant] = React.useState(0);
  const [size, setSize] = React.useState(p.sizes ? 1 : 0);
  const [qty, setQty] = React.useState(1);
  const [wish, setWish] = React.useState(false);
  const [tab, setTab] = React.useState("description");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const variantLetter = (["a","b","c","d","e","f"])[p.id % 6];
  const related = ALL_PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 8);
  const avgStars = 4.7;

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="shop" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <div className="container pdp-wrap">
        <div className="breadcrumb">
          <a href="Jugasaro Store.html">Home</a> / <a href="Shop.html">Shop</a> / <a href={`Category.html?cat=${encodeURIComponent(p.cat)}`}>{p.cat}</a> / <span style={{ color: "var(--fg)" }}>{p.name}</span>
        </div>

        <div className="pdp-grid">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-thumbs">
              {[0,1,2,3,4].map(i => (
                <button key={i} className={thumb === i ? "active" : ""} onClick={() => setThumb(i)}>
                  <Placeholder label={`${i+1}`} variant={(["a","b","c","d","e"])[i]} />
                </button>
              ))}
            </div>
            <div className="pdp-main-img">
              <Placeholder label={`${p.brand.slice(0,3).toLowerCase()}_${String(p.id).padStart(3,"0")}_${thumb+1}.jpg — product photo`} variant={(["a","b","c","d","e"])[thumb]} />
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <div className="pdp-brand">{p.brand}</div>
            <h1>{p.name}</h1>

            <div className="pdp-rating">
              <Stars n={Math.round(avgStars)} />
              <span>{avgStars} · {REVIEWS.length * 28} reviews</span>
              <span style={{ color: "var(--fg-subtle)" }}>·</span>
              <a href="#reviews" style={{ color: "var(--accent)" }}>Read reviews</a>
            </div>

            <div className="pdp-price">
              <span className="price" style={{ fontSize: 30 }}>${p.price}</span>
              {p.was && <>
                <span className="price-strike" style={{ fontSize: 16 }}>${p.was}</span>
                <span className="tag tag-sale" style={{ position: "static", fontSize: 11 }}>-{Math.round(((p.was - p.price) / p.was) * 100)}%</span>
              </>}
            </div>

            <p className="pdp-desc">
              A carefully considered piece from {p.brand} — designed for everyday use without compromise. Premium materials, thoughtful construction, and a finish that only improves with wear.
            </p>

            {p.variants && (
              <div className="pdp-opt-group">
                <div className="lbl">
                  <span>Color</span>
                  <span className="sel">Option {variant + 1}</span>
                </div>
                <div className="pdp-swatches">
                  {p.variants.map((c, i) => (
                    <button key={i} className={`pdp-swatch ${i === variant ? "active" : ""}`} style={{ background: c }} onClick={() => setVariant(i)} />
                  ))}
                </div>
              </div>
            )}

            {p.sizes && (
              <div className="pdp-opt-group">
                <div className="lbl">
                  <span>Size</span>
                  <a href="#size" className="sel" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>Size guide</a>
                </div>
                <div className="pdp-sizes">
                  {p.sizes.map((s, i) => (
                    <button key={s} className={`pdp-size ${i === size ? "active" : ""}`} onClick={() => setSize(i)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-opt-group">
              <div className="lbl"><span>Quantity</span></div>
              <div className="pdp-qty-row">
                <div className="pdp-qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <input value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} />
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <span style={{ fontSize: 12, color: "var(--fg-muted)", alignSelf: "center" }}>
                  {p.oos ? "Currently out of stock" : "In stock · ships in 1–2 business days"}
                </span>
              </div>
            </div>

            <div className="pdp-cta-row">
              {p.oos ? (
                <button className="btn btn-outline" style={{ height: 52, gridColumn: "1 / -1" }}>
                  <IconMail size={16} /> Notify me when available
                </button>
              ) : (
                <button className="btn btn-accent">
                  <IconCart size={16} /> Add to cart · ${p.price * qty}
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setWish(!wish)} style={{ width: 52, padding: 0, color: wish ? "var(--danger)" : "var(--fg)", borderColor: wish ? "var(--danger)" : "var(--border-strong)" }}>
                <IconHeart size={18} />
              </button>
            </div>

            <div className="pdp-ship">
              <div className="row"><IconTruck size={18} /><div><b>Free shipping</b>Orders over $75 ship free</div></div>
              <div className="row"><IconShield size={18} /><div><b>30-day returns</b>No questions asked</div></div>
              <div className="row"><IconMapPin size={18} /><div><b>In-store pickup</b>Available at 2 locations</div></div>
              <div className="row"><IconGift size={18} /><div><b>Gift wrap</b>Add at checkout · free</div></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pdp-tabs">
          {["description","specs","shipping","reviews"].map(t => (
            <button key={t} className={`pdp-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "description" ? "Description" : t === "specs" ? "Specifications" : t === "shipping" ? "Shipping & returns" : `Reviews (${REVIEWS.length * 28})`}
            </button>
          ))}
        </div>

        <div className="pdp-tab-body" id="reviews">
          {tab === "description" && (
            <>
              <p>Every {p.brand} piece starts with an obsession for materials. This {p.name.toLowerCase()} is no exception — sourced, specified and crafted with the kind of care you can feel the first time you pick it up.</p>
              <h4>What makes it different</h4>
              <ul>
                <li>Full-grain materials that develop a patina with use</li>
                <li>Stitched, not glued — built to be repaired, not replaced</li>
                <li>Quality-checked by the {p.brand} team before shipping</li>
                <li>Designed to be timeless — you'll use it in 10 years</li>
              </ul>
              <h4>In the box</h4>
              <p>1× {p.name} · Dust bag · Care card · {p.brand} provenance tag</p>
            </>
          )}
          {tab === "specs" && (
            <div className="pdp-specs">
              <div className="k">SKU</div><div>JUG-{String(p.id).padStart(6,"0")}</div>
              <div className="k">Brand</div><div>{p.brand}</div>
              <div className="k">Category</div><div>{p.cat}</div>
              <div className="k">Materials</div><div>Premium construction materials</div>
              <div className="k">Dimensions</div><div>Standard size · see size guide</div>
              <div className="k">Weight</div><div>Varies by variant</div>
              <div className="k">Country of origin</div><div>Made responsibly</div>
              <div className="k">Warranty</div><div>2-year manufacturer warranty</div>
            </div>
          )}
          {tab === "shipping" && (
            <>
              <h4>Shipping</h4>
              <p>Standard shipping (3–5 business days) is free on orders over $75. Express delivery (1–2 days) available at checkout. International shipping available to 40+ countries.</p>
              <h4>Returns</h4>
              <p>30-day hassle-free returns. Send it back in its original condition for a full refund or exchange. We cover return shipping on orders over $100.</p>
              <h4>In-store pickup</h4>
              <p>Order online and pick up at our Downtown or Riverside store — usually ready within 2 hours of order confirmation.</p>
            </>
          )}
          {tab === "reviews" && (
            <>
              <div className="reviews-summary">
                <div className="reviews-score">
                  <div className="big">{avgStars}</div>
                  <div className="stars">★★★★★</div>
                  <div className="count">{REVIEWS.length * 28} reviews</div>
                </div>
                <div className="reviews-bars">
                  {[5,4,3,2,1].map((n, i) => {
                    const pct = [72, 18, 6, 2, 2][i];
                    return (
                      <div key={n} className="reviews-bar-row">
                        <span>{n} ★</span>
                        <span className="reviews-bar-track"><span className="reviews-bar-fill" style={{ width: `${pct}%` }} /></span>
                        <span>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingBottom: 6 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>Recent reviews</div>
                <button className="btn btn-outline" style={{ height: 40, fontSize: 13 }}>Write a review</button>
              </div>
              {REVIEWS.map((r, i) => (
                <article key={i} className="review-item">
                  <div className="avatar sm">{r.initials}</div>
                  <div>
                    <div className="r-meta">
                      <div>
                        <span className="r-name">{r.name}</span>
                        <span style={{ color: "var(--fg-subtle)", fontSize: 11, marginLeft: 8, fontFamily: "var(--font-mono)" }}>VERIFIED BUYER</span>
                      </div>
                      <span className="r-date">{r.date}</span>
                    </div>
                    <div className="r-stars"><Stars n={r.stars} /></div>
                    <div className="r-title">{r.title}</div>
                    <div className="r-body">{r.body}</div>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>

        {/* Related */}
        <section className="related-strip">
          <div className="section-header">
            <div>
              <span className="eyebrow">You may also like</span>
              <h2>More from {p.cat}</h2>
            </div>
            <a href={`Category.html?cat=${encodeURIComponent(p.cat)}`} className="view-all">See all {p.cat} <IconArrowRight size={14} /></a>
          </div>
          <ProductRail products={related} />
        </section>
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PdpPage />);

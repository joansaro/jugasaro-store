/* Wishlist + Contact + Brand-single + Category-single + Product-edit */

// ---------- Wishlist ----------
function WishlistPage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [items, setItems] = React.useState(() => ALL_PRODUCTS.slice(0, 8));

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const remove = (id) => setItems(items.filter(p => p.id !== id));

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><a href="Jugasaro Store.html">Home</a> / <span style={{color:"var(--fg)"}}>Wishlist</span></div>
          <span className="eyebrow">Saved for later · {items.length} items</span>
          <h1>Your wishlist</h1>
          <p>Pieces you're watching. Move them to your cart whenever you're ready.</p>
        </div>
      </section>

      <div className="container" style={{ padding: "40px 0 80px" }}>
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="icon-wrap"><IconHeart size={30} /></div>
            <h2>Nothing saved yet</h2>
            <p>Tap the heart on any product to save it here.</p>
            <a href="Shop.html" className="btn btn-accent">Browse products <IconArrowRight size={14} /></a>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontSize: 14, color: "var(--fg-muted)" }}>{items.length} saved · sorted by recently added</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline" style={{ height: 40, fontSize: 13 }} onClick={() => setItems([])}>Clear all</button>
                <button className="btn btn-accent" style={{ height: 40, fontSize: 13 }}>
                  <IconCart size={14} /> Add all to cart
                </button>
              </div>
            </div>
            <div className="product-grid">
              {items.map(p => (
                <div key={p.id} style={{ position: "relative" }}>
                  <ProductCard p={p} />
                  <button onClick={() => remove(p.id)} style={{
                    position: "absolute", top: 12, right: 52, width: 34, height: 34, borderRadius: 999,
                    background: "var(--bg-elev)", border: "1px solid var(--border)", color: "var(--danger)",
                    display: "grid", placeItems: "center", zIndex: 3,
                  }} title="Remove from wishlist">
                    <IconClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

// ---------- Contact ----------
function ContactPage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", subject: "general", message: "" });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="contact" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><a href="Jugasaro Store.html">Home</a> / <span style={{color:"var(--fg)"}}>Contact</span></div>
          <span className="eyebrow">Get in touch · we reply within 24h</span>
          <h1>Let's talk.</h1>
          <p>Questions about an order, a product, or wholesale? Pick whichever channel works for you — we're here.</p>
        </div>
      </section>

      <div className="container contact-grid">
        <div className="contact-info">
          <div className="ci-chunk">
            <h3>Reach us directly</h3>
            <div className="ci-row"><IconMail size={18} /><div><b>hello@jugasaro.store</b>General inquiries · 24h reply</div></div>
            <div className="ci-row"><IconMail size={18} /><div><b>wholesale@jugasaro.store</b>B2B &amp; bulk orders</div></div>
            <div className="ci-row"><IconPhone size={18} /><div><b>+1 (555) 284-0411</b>Mon–Fri, 9am–6pm</div></div>
            <div className="ci-row"><IconWhatsapp size={18} /><div><b>WhatsApp us</b>Fastest response — usually under 10 min</div></div>
          </div>

          <div className="ci-chunk">
            <h3>Visit a store</h3>
            {LOCATIONS.slice(0,2).map((l, i) => (
              <div key={i} className="ci-row">
                <IconMapPin size={18} />
                <div><b>{l.name}</b><span style={{ whiteSpace: "pre-line" }}>{l.address}</span></div>
              </div>
            ))}
          </div>

          <div className="ci-chunk">
            <h3>Follow us</h3>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: "0 0 12px" }}>New drops, behind-the-scenes, and restock alerts first.</p>
            <div className="contact-socials">
              <a href="#ig" aria-label="Instagram"><IconInstagram size={18} /></a>
              <a href="#fb" aria-label="Facebook"><IconFacebook size={18} /></a>
              <a href="#tw" aria-label="Twitter"><IconTwitter size={18} /></a>
              <a href="#yt" aria-label="YouTube"><IconYoutube size={18} /></a>
              <a href="#tt" aria-label="TikTok"><IconTiktok size={18} /></a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          {sent ? (
            <div className="success-state">
              <div className="circle"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-10" /></svg></div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: "0 0 8px" }}>Message sent</h3>
              <p style={{ color: "var(--fg-muted)", margin: "0 0 20px" }}>Thanks {form.name || "for reaching out"}. We'll reply to <b>{form.email}</b> within 24 hours.</p>
              <button type="button" className="btn btn-outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "general", message: "" }); }}>Send another</button>
            </div>
          ) : (
            <>
              <h3>Send a message</h3>
              <p className="form-sub">Fill this out and we'll get back to you fast.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label>Your name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>What's this about?</label>
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                  <option value="general">General question</option>
                  <option value="order">Order support</option>
                  <option value="return">Return or exchange</option>
                  <option value="wholesale">Wholesale / B2B inquiry</option>
                  <option value="press">Press &amp; media</option>
                  <option value="other">Something else</option>
                </select>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Message</label>
                <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us what you need…" />
              </div>
              <button type="submit" className="btn btn-accent btn-full" style={{ marginTop: 20, height: 48 }}>
                Send message <IconArrowRight size={14} />
              </button>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "12px 0 0", textAlign: "center" }}>
                By submitting, you agree to our <a href="#privacy" style={{ color: "var(--accent)" }}>privacy policy</a>.
              </p>
            </>
          )}
        </form>
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

// ---------- Single Brand ----------
function BrandSinglePage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sort, setSort] = React.useState("relevant");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const params = new URLSearchParams(window.location.search);
  const brand = params.get("brand") || "Northline";
  // Use SHOP_DATA if available (from shop.jsx), else ALL_PRODUCTS
  const source = (typeof SHOP_DATA !== "undefined") ? SHOP_DATA : ALL_PRODUCTS;
  let products = source.filter(p => p.brand === brand);
  if (products.length < 12) {
    // Pad with variations
    products = ALL_PRODUCTS.map((p, i) => ({ ...p, brand, id: 5000 + i, name: p.name }));
  }
  if (sort === "price-asc") products = [...products].sort((a,b)=>a.price-b.price);
  else if (sort === "price-desc") products = [...products].sort((a,b)=>b.price-a.price);
  else if (sort === "newest") products = [...products].sort((a,b)=> (b.tag==="new"?1:0)-(a.tag==="new"?1:0));

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="brands" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      {/* Brand hero */}
      <section style={{ position: "relative", padding: "60px 0 50px", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="container">
          <div className="breadcrumb"><a href="Jugasaro Store.html">Home</a> / <a href="Brands.html">Brands</a> / <span style={{color:"var(--fg)"}}>{brand}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              width: 120, height: 120, borderRadius: 24,
              background: "linear-gradient(135deg, var(--accent), oklch(35% 0.18 300))",
              color: "white", display: "grid", placeItems: "center",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52,
              letterSpacing: "-0.03em", boxShadow: "var(--shadow-lg)",
            }}>{brand.charAt(0)}</div>
            <div>
              <span className="eyebrow" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>Partner brand · since 2019</span>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "8px 0 12px" }}>{brand}</h1>
              <p style={{ color: "var(--fg-muted)", margin: 0, maxWidth: 580, fontSize: 15, lineHeight: 1.6 }}>
                {brand} makes everyday objects with the kind of attention that makes them last decades. Every piece is considered — materials, construction, finish. We've stocked them since their first drop.
              </p>
              <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
                <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>{products.length}</div><div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Products</div></div>
                <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>4.8 ★</div><div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Avg rating</div></div>
                <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>7 yrs</div><div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>With Jugasaro</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "40px 0 80px" }}>
        <div className="shop-header-bar">
          <span className="count-txt">Showing <b>{products.length}</b> products from <b>{brand}</b></span>
          <div className="shop-toolbar">
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevant">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

// ---------- Single Category ----------
function CategorySinglePage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sort, setSort] = React.useState("relevant");
  const [brandFilter, setBrandFilter] = React.useState(new Set());

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat") || "Home & Living";
  const catObj = CATEGORIES.find(c => c.name === cat) || CATEGORIES[0];
  const source = (typeof SHOP_DATA !== "undefined") ? SHOP_DATA : ALL_PRODUCTS;
  let products = source.filter(p => p.cat === cat);
  if (brandFilter.size) products = products.filter(p => brandFilter.has(p.brand));
  if (sort === "price-asc") products = [...products].sort((a,b)=>a.price-b.price);
  else if (sort === "price-desc") products = [...products].sort((a,b)=>b.price-a.price);

  const brandsInCat = [...new Set(source.filter(p => p.cat === cat).map(p => p.brand))].slice(0, 10);

  const toggleBrand = (b) => {
    const n = new Set(brandFilter);
    n.has(b) ? n.delete(b) : n.add(b);
    setBrandFilter(n);
  };

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="categories" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      {/* Category hero with image */}
      <section style={{ position: "relative", height: 340, overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <DarkPlaceholder hue={catObj.hue} tone={20} label={`cat_${cat.split(" ")[0].toLowerCase()}_hero.jpg`} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, oklch(10% 0.02 300 / 0.4), oklch(8% 0.02 300 / 0.85))" }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 40, color: "white" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8, marginBottom: 10 }}>
            <a href="Jugasaro Store.html" style={{ color: "inherit" }}>Home</a> / <a href="Categories.html" style={{ color: "inherit" }}>Categories</a> / {cat}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.02 }}>{cat}</h1>
          <p style={{ fontSize: 16, opacity: 0.88, maxWidth: 560, margin: 0, lineHeight: 1.5 }}>
            {products.length} pieces from {brandsInCat.length} brands — hand-picked by our buying team.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: "30px 0 80px" }}>
        {/* Brand pill filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <button onClick={() => setBrandFilter(new Set())} style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
            border: "1px solid " + (brandFilter.size === 0 ? "var(--fg)" : "var(--border)"),
            background: brandFilter.size === 0 ? "var(--fg)" : "transparent",
            color: brandFilter.size === 0 ? "var(--bg)" : "var(--fg)",
          }}>All brands</button>
          {brandsInCat.map(b => (
            <button key={b} onClick={() => toggleBrand(b)} style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
              border: "1px solid " + (brandFilter.has(b) ? "var(--accent)" : "var(--border)"),
              background: brandFilter.has(b) ? "var(--accent-soft)" : "transparent",
              color: brandFilter.has(b) ? "var(--accent)" : "var(--fg-muted)",
            }}>{b}</button>
          ))}
        </div>

        <div className="shop-header-bar">
          <span className="count-txt">Showing <b>{products.length}</b> of <b>{source.filter(p => p.cat === cat).length}</b> in {cat}</span>
          <div className="shop-toolbar">
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevant">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

Object.assign(window, { WishlistPage, ContactPage, BrandSinglePage, CategorySinglePage });

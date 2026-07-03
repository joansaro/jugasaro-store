/* Brand create/edit page — admin */

function BrandEditPage() {
  const isEdit = /Edit Brand/.test(document.title);
  const [theme, setTheme] = React.useState(() => localStorage.getItem("theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const seed = isEdit ? "Northline" : "";
  const [name, setName] = React.useState(seed);
  const [slug, setSlug] = React.useState(seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  const [tagline, setTagline] = React.useState(isEdit ? "Crafted essentials, made to outlast." : "");
  const [bio, setBio] = React.useState(isEdit ? "Founded in 2014, Northline designs everyday objects with an emphasis on materials, restraint, and longevity. We work with small workshops in Portugal, Japan, and Mexico to produce limited runs of carefully considered goods." : "");
  const [website, setWebsite] = React.useState(isEdit ? "northline.co" : "");
  const [country, setCountry] = React.useState(isEdit ? "Portugal" : "");
  const [founded, setFounded] = React.useState(isEdit ? "2014" : "");
  const [featured, setFeatured] = React.useState(isEdit);
  const [active, setActive] = React.useState(true);
  const [categories, setCategories] = React.useState(isEdit ? ["Home & Living", "Fashion"] : []);
  const [logo, setLogo] = React.useState(isEdit ? { label: "northline_logo.svg", variant: "b" } : null);
  const [cover, setCover] = React.useState(isEdit ? { label: "northline_cover.jpg", variant: "d" } : null);

  React.useEffect(() => {
    if (!isEdit) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [name, isEdit]);

  const toggleCat = (c) => setCategories(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <div className="container">
        <div className="breadcrumb" style={{ paddingTop: 30 }}>
          <a href="Admin.html">Admin</a> / <a href="Admin.html">Brands</a> / <span style={{ color: "var(--fg)" }}>{isEdit ? "Edit brand" : "Create brand"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 18px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, letterSpacing: "-0.02em", margin: 0 }}>{isEdit ? `Edit ${name}` : "Create new brand"}</h1>
            <p style={{ color: "var(--fg-muted)", margin: "4px 0 0", fontSize: 14 }}>{isEdit ? "Update brand details, logo, and visibility." : "Add a new brand partner to your storefront."}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" style={{ height: 42 }}>Preview</button>
            <button className="btn btn-accent" style={{ height: 42 }}>{isEdit ? "Save changes" : "Create brand"}</button>
          </div>
        </div>

        <div className="edit-grid">
          {/* Main column */}
          <div>
            <div className="edit-card">
              <h3>Brand details</h3>
              <div className="field"><label>Brand name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Northline" />
              </div>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div className="field"><label>Slug (URL)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="northline" />
                  <span className="hint">jugasaro.com/brands/<strong>{slug || "your-brand"}</strong></span>
                </div>
                <div className="field"><label>Website <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>optional</span></label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="example.com" />
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Tagline <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(80 chars max — shown under brand name)</span></label>
                <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="A short, evocative phrase" maxLength={80} />
                <span className="hint">{tagline.length}/80</span>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Bio / about</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} placeholder="Tell the brand's story…" />
              </div>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div className="field"><label>Country of origin</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Portugal" />
                </div>
                <div className="field"><label>Year founded</label>
                  <input value={founded} onChange={e => setFounded(e.target.value)} placeholder="2014" />
                </div>
              </div>
            </div>

            <div className="edit-card">
              <h3>Logo &amp; visuals</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Logo</label>
                  <div className="img-slot filled" style={{ width: "100%", aspectRatio: "1/1" }} onClick={() => setLogo({ label: "brand_logo.svg", variant: "b" })}>
                    {logo ? (
                      <>
                        <Placeholder label={logo.label} variant={logo.variant} />
                        <button className="slot-x" onClick={(e) => { e.stopPropagation(); setLogo(null); }} aria-label="Remove logo">
                          <IconClose size={12} />
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "var(--fg-subtle)", fontSize: 12 }}>Click to upload</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 0 0" }}>SVG or PNG, transparent. 512×512+</p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Cover image</label>
                  <div className="img-slot filled" style={{ width: "100%", aspectRatio: "1/1" }} onClick={() => setCover({ label: "brand_cover.jpg", variant: "d" })}>
                    {cover ? (
                      <>
                        <Placeholder label={cover.label} variant={cover.variant} />
                        <button className="slot-x" onClick={(e) => { e.stopPropagation(); setCover(null); }} aria-label="Remove cover">
                          <IconClose size={12} />
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "var(--fg-subtle)", fontSize: 12 }}>Click to upload</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 0 0" }}>1600×800px recommended</p>
                </div>
              </div>
            </div>

            <div className="edit-card">
              <h3>Associated categories</h3>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "-8px 0 14px" }}>Select categories this brand sells in.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map(c => {
                  const on = categories.includes(c.name);
                  return (
                    <button key={c.name} type="button" onClick={() => toggleCat(c.name)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: `1px solid ${on ? "var(--accent)" : "var(--border-strong)"}`,
                        background: on ? "var(--accent-soft)" : "var(--bg-elev)",
                        color: on ? "var(--accent)" : "var(--fg)",
                        fontSize: 13,
                        fontWeight: on ? 600 : 500,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}>
                      {on && "✓ "}{c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="edit-card">
              <h3>SEO &amp; metadata</h3>
              <div className="field"><label>Page title</label>
                <input defaultValue={isEdit ? `${name} — Modern Essentials | Jugasaro Store` : ""} placeholder="Appears in browser tab and search results" />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Meta description</label>
                <textarea defaultValue={isEdit ? `Discover ${name} — ${tagline.toLowerCase()} Shop the full collection at Jugasaro Store.` : ""} maxLength={160} rows={3} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="edit-card">
              <h3>Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <span>Active <span style={{ color: "var(--fg-subtle)", fontWeight: 400, fontSize: 12 }}>· visible to shoppers</span></span>
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <span>Featured on home <span style={{ color: "var(--fg-subtle)", fontWeight: 400, fontSize: 12 }}>· top 10 brands rail</span></span>
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                </label>
              </div>
            </div>

            <div className="edit-card">
              <h3>Stats</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Products</span><strong>{isEdit ? 24 : 0}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Followers</span><strong>{isEdit ? "1,284" : 0}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Sales (30d)</span><strong style={{ color: "var(--success)" }}>{isEdit ? "$8,420" : "—"}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Avg. rating</span><strong>{isEdit ? "4.7 ★" : "—"}</strong></div>
              </div>
            </div>

            <div className="edit-card">
              <h3>Preview</h3>
              <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: 14, textAlign: "center" }}>
                {logo && <Placeholder label={logo.label} variant={logo.variant} style={{ width: 56, height: 56, borderRadius: 8, margin: "0 auto 10px" }} />}
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>{name || "Brand name"}</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{country || "Origin"} · {founded || "Year"}</div>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "10px 0 0", lineHeight: 1.4 }}>{tagline || "Tagline will appear here."}</p>
              </div>
            </div>

            {isEdit && (
              <div className="edit-card" style={{ borderColor: "color-mix(in oklab, var(--danger) 30%, var(--border))" }}>
                <h3 style={{ color: "var(--danger)" }}>Danger zone</h3>
                <button className="btn btn-outline" style={{ width: "100%", height: 40, color: "var(--danger)", borderColor: "color-mix(in oklab, var(--danger) 40%, var(--border-strong))" }}>
                  Delete brand
                </button>
                <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 0 0", lineHeight: 1.4 }}>Removes brand and unlinks all 24 products. Cannot be undone.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BrandEditPage />);

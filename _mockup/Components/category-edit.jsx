/* Category create/edit page — admin */

function CategoryEditPage() {
  const isEdit = /Edit Category/.test(document.title);
  const [theme, setTheme] = React.useState(() => localStorage.getItem("theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const seed = isEdit ? CATEGORIES[0] : { name: "", hue: 300, variant: "a" };
  const [name, setName] = React.useState(seed.name);
  const [slug, setSlug] = React.useState(seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  const [description, setDescription] = React.useState(isEdit ? "Furniture, lighting, textiles, and considered objects for the modern home — curated from over 60 brands." : "");
  const [parent, setParent] = React.useState("");
  const [hue, setHue] = React.useState(seed.hue);
  const [variant, setVariant] = React.useState(seed.variant);
  const [active, setActive] = React.useState(true);
  const [featured, setFeatured] = React.useState(isEdit);
  const [showInNav, setShowInNav] = React.useState(true);
  const [seoTitle, setSeoTitle] = React.useState(isEdit ? "Home & Living — Curated Furniture & Decor | Jugasaro" : "");
  const [seoDesc, setSeoDesc] = React.useState(isEdit ? "Shop furniture, lighting, and home decor from 60+ independent brands. Free shipping over $75." : "");

  React.useEffect(() => {
    if (!isEdit) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [name, isEdit]);

  const VARIANTS = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <div className="container">
        <div className="breadcrumb" style={{ paddingTop: 30 }}>
          <a href="Admin.html">Admin</a> / <a href="Admin.html">Categories</a> / <span style={{ color: "var(--fg)" }}>{isEdit ? "Edit category" : "Create category"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 18px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, letterSpacing: "-0.02em", margin: 0 }}>{isEdit ? `Edit ${name}` : "Create new category"}</h1>
            <p style={{ color: "var(--fg-muted)", margin: "4px 0 0", fontSize: 14 }}>{isEdit ? "Update category metadata, visuals, and visibility." : "Organize products into a new category."}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" style={{ height: 42 }}>Preview</button>
            <button className="btn btn-accent" style={{ height: 42 }}>{isEdit ? "Save changes" : "Create category"}</button>
          </div>
        </div>

        <div className="edit-grid">
          <div>
            <div className="edit-card">
              <h3>Basic info</h3>
              <div className="field"><label>Category name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Home & Living" />
              </div>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div className="field"><label>Slug (URL)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="home-living" />
                  <span className="hint">jugasaro.com/c/<strong>{slug || "category"}</strong></span>
                </div>
                <div className="field"><label>Parent category</label>
                  <select value={parent} onChange={e => setParent(e.target.value)}>
                    <option value="">— None (top-level) —</option>
                    {CATEGORIES.filter(c => c.name !== name).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Description <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(shown on category landing page)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="A short, evocative description…" />
              </div>
            </div>

            <div className="edit-card">
              <h3>Visual style</h3>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "-8px 0 14px" }}>Choose a color tone and pattern variant — used for the category card on home and the page hero.</p>

              <div className="form-grid-2">
                <div className="field"><label>Hue (color tone) — {hue}°</label>
                  <input type="range" min={0} max={360} value={hue} onChange={e => setHue(+e.target.value)}
                    style={{ width: "100%", accentColor: "var(--accent)", height: 10 }} />
                  <div style={{
                    height: 8, borderRadius: 4, marginTop: 4,
                    background: "linear-gradient(to right, oklch(70% 0.15 0), oklch(70% 0.15 60), oklch(70% 0.15 120), oklch(70% 0.15 180), oklch(70% 0.15 240), oklch(70% 0.15 300), oklch(70% 0.15 360))"
                  }} />
                </div>
                <div className="field"><label>Pattern variant</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {VARIANTS.map(v => (
                      <button key={v} type="button" onClick={() => setVariant(v)}
                        style={{
                          padding: 4,
                          borderRadius: 8,
                          border: `2px solid ${variant === v ? "var(--accent)" : "transparent"}`,
                          background: "var(--bg-muted)",
                          cursor: "pointer",
                        }} title={`Variant ${v.toUpperCase()}`}>
                        <Placeholder label="" variant={v} style={{ width: "100%", aspectRatio: "1/1", borderRadius: 4, filter: `hue-rotate(${hue - 300}deg)` }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <label>Cover image <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(optional — overrides pattern)</span></label>
                <div className="img-slot" style={{ aspectRatio: "16/9" }}>
                  <span className="slot-idx primary">Cover</span>
                  <span style={{ color: "var(--fg-subtle)", fontSize: 12 }}>Click to upload · 1600×800px</span>
                </div>
              </div>
            </div>

            <div className="edit-card">
              <h3>SEO &amp; metadata</h3>
              <div className="field"><label>Meta title <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(60 chars max)</span></label>
                <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} maxLength={60} placeholder="Shown in search results" />
                <span className="hint">{seoTitle.length}/60</span>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Meta description <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(160 chars max)</span></label>
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} maxLength={160} />
                <span className="hint">{seoDesc.length}/160</span>
              </div>
            </div>
          </div>

          <div>
            <div className="edit-card">
              <h3>Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <span>Active <span style={{ color: "var(--fg-subtle)", fontWeight: 400, fontSize: 12 }}>· visible</span></span>
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <span>Featured on home</span>
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <span>Show in nav menu</span>
                  <input type="checkbox" checked={showInNav} onChange={e => setShowInNav(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                </label>
              </div>
            </div>

            <div className="edit-card">
              <h3>Live preview</h3>
              <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <Placeholder label={name || "Category"} variant={variant} style={{ width: "100%", aspectRatio: "16/10", filter: `hue-rotate(${hue - 300}deg)` }} />
                <div style={{ padding: "12px 14px", background: "var(--bg-elev)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{name || "Category name"}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 2 }}>{isEdit ? `${seed.count || 0} products` : "0 products"}</div>
                </div>
              </div>
            </div>

            <div className="edit-card">
              <h3>Stats</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Products</span><strong>{isEdit ? seed.count : 0}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Brands</span><strong>{isEdit ? 28 : 0}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Avg. price</span><strong>{isEdit ? "$84" : "—"}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--fg-muted)" }}>Page views (30d)</span><strong>{isEdit ? "12,480" : "—"}</strong></div>
              </div>
            </div>

            {isEdit && (
              <div className="edit-card" style={{ borderColor: "color-mix(in oklab, var(--danger) 30%, var(--border))" }}>
                <h3 style={{ color: "var(--danger)" }}>Danger zone</h3>
                <button className="btn btn-outline" style={{ width: "100%", height: 40, color: "var(--danger)", borderColor: "color-mix(in oklab, var(--danger) 40%, var(--border-strong))" }}>
                  Delete category
                </button>
                <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 0 0", lineHeight: 1.4 }}>Cannot delete while products are assigned. Reassign first.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CategoryEditPage />);

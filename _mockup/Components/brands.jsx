/* All Brands page — grouped A–Z with letter index */

function BrandsPage() {
  const [theme, setTheme] = React.useState(() => {
    const saved = localStorage.getItem("jugasaro-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const filtered = query
    ? BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()))
    : BRANDS;

  // Group by first letter
  const groups = React.useMemo(() => {
    const m = {};
    filtered.forEach(b => {
      const L = b.charAt(0).toUpperCase();
      if (!m[L]) m[L] = [];
      m[L].push(b);
    });
    return Object.keys(m).sort().map(L => ({ letter: L, brands: m[L].sort() }));
  }, [filtered]);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const availableLetters = new Set(groups.map(g => g.letter));

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="brands" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="Jugasaro Store.html">Home</a> / <span style={{ color: "var(--fg)" }}>Brands</span>
          </div>
          <span className="eyebrow">Trusted partners · {BRANDS.length} brands</span>
          <h1>Our brands</h1>
          <p>From indie makers to household names — carefully curated, all in one place.</p>
        </div>
      </section>

      <div className="container" style={{ padding: "40px 0 20px" }}>
        <div style={{ position: "relative", maxWidth: 440 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }}>
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search brands…"
            style={{
              width: "100%", height: 46, padding: "0 18px 0 44px",
              border: "1px solid var(--border)", borderRadius: 999,
              background: "var(--bg-muted)", fontSize: 14, outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
          {letters.map(L => (
            <a key={L} href={availableLetters.has(L) ? `#letter-${L}` : undefined}
              style={{
                width: 34, height: 34, display: "grid", placeItems: "center",
                borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12,
                fontWeight: 500,
                background: availableLetters.has(L) ? "var(--bg-muted)" : "transparent",
                color: availableLetters.has(L) ? "var(--fg)" : "var(--fg-subtle)",
                border: "1px solid var(--border)",
                opacity: availableLetters.has(L) ? 1 : 0.4,
                cursor: availableLetters.has(L) ? "pointer" : "not-allowed",
              }}
            >{L}</a>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {groups.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--fg-muted)" }}>
            No brands matching "{query}"
          </div>
        ) : groups.map(g => (
          <div key={g.letter} id={`letter-${g.letter}`} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600,
              letterSpacing: "-0.02em", margin: "0 0 20px",
              paddingBottom: 14, borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "baseline", gap: 14,
            }}>
              <span>{g.letter}</span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 400, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>
                {g.brands.length} BRAND{g.brands.length !== 1 && "S"}
              </span>
            </h2>
            <div className="brands-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
              {g.brands.map(b => (
                <a href={`Brand.html?brand=${encodeURIComponent(b)}`} className="brand-cell" key={b} id={b}>
                  <div className="brand-logo">
                    <div className="logo-glyph">{b.charAt(0)}</div>
                    <span className="lg-name">{b}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BrandsPage />);

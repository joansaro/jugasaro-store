/* All Categories page — visual grid */

function CategoriesPage() {
  const [theme, setTheme] = React.useState(() => {
    const saved = localStorage.getItem("jugasaro-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const total = CATEGORIES.reduce((s, c) => s + c.count, 0);

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} activePage="categories" />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="Jugasaro Store.html">Home</a> / <span style={{ color: "var(--fg)" }}>Categories</span>
          </div>
          <span className="eyebrow">{CATEGORIES.length} categories · {total.toLocaleString()} products</span>
          <h1>Browse by category</h1>
          <p>Jump straight to what you need — every department, every aisle of the Jugasaro store.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {CATEGORIES.map(c => (
              <a href={`Category.html?cat=${encodeURIComponent(c.name)}`} className="cat-card" key={c.name} id={c.name}>
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
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CategoriesPage />);

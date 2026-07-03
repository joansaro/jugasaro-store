/* Navbar with mega-menu dropdowns for Brands & Categories */

const NAV_LINKS = [
  { label: "Home", id: "home", href: "Jugasaro Store.html" },
  { label: "Shop", id: "shop", href: "Shop.html" },
  { label: "Brands", id: "brands", href: "Brands.html", dropdown: "brands" },
  { label: "Categories", id: "categories", href: "Categories.html", dropdown: "categories" },
  { label: "Contact", id: "contact", href: "Jugasaro Store.html#contact" },
];

function Navbar({ theme, onThemeToggle, onOpenMobile, activePage = "home" }) {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [openDd, setOpenDd] = React.useState(null);
  const closeTimer = React.useRef(null);
  const wrapRef = React.useRef(null);

  const openDropdown = (name) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDd(name);
  };
  const closeDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDd(null), 280);
  };

  React.useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const filteredTrending = query
    ? SEARCH_SUGGESTIONS.trending.filter(t => t.q.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_SUGGESTIONS.trending;

  return (
    <div className="nav-wrap">
      <div className="container nav">
        <a href="Jugasaro Store.html" className="nav-logo" aria-label="Jugasaro Store — home">
          <span className="logo-mark">J</span>
          <span>
            Jugasaro
            <span className="logo-text-small">JUGASARO · STORE</span>
          </span>
        </a>

        <div className="nav-search" ref={wrapRef}>
          <span className="nav-search-icon"><IconSearch size={16} /></span>
          <input
            className="nav-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search products, brands, categories…"
            aria-label="Search"
          />
          <span className="nav-search-kbd">⌘K</span>

          {focused && (
            <div className="nav-suggestions">
              <div className="nav-sug-group">
                <div className="nav-sug-label">{query ? "Products" : "Trending right now"}</div>
                {filteredTrending.length ? filteredTrending.map((t, i) => (
                  <div key={i} className="nav-sug-item">
                    <div className="sug-thumb placeholder" style={{
                      "--ph-a": `oklch(88% 0.03 ${290 + i * 8})`,
                      "--ph-b": `oklch(82% 0.05 ${290 + i * 8})`,
                    }} />
                    <span>{t.q}</span>
                    <span className="sug-meta">{t.meta}</span>
                  </div>
                )) : (
                  <div className="nav-sug-item" style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                    No products matching "{query}"
                  </div>
                )}
              </div>
              <div className="nav-sug-group">
                <div className="nav-sug-label">Brands</div>
                {SEARCH_SUGGESTIONS.brands.map((b) => (
                  <div key={b} className="nav-sug-item">
                    <div className="sug-thumb" style={{ display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>
                      {b.charAt(0)}
                    </div>
                    <span>{b}</span>
                    <IconChevronRight size={14} style={{ marginLeft: "auto", color: "var(--fg-subtle)" }} />
                  </div>
                ))}
              </div>
              <div className="nav-sug-group">
                <div className="nav-sug-label">Categories</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 12px 8px" }}>
                  {SEARCH_SUGGESTIONS.categories.map((c) => (
                    <span key={c} style={{
                      fontSize: 12, padding: "5px 10px", borderRadius: 999,
                      border: "1px solid var(--border)", background: "var(--bg-muted)", cursor: "pointer",
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.id} className={link.dropdown ? "nav-dropdown-wrap" : ""}
                  onMouseEnter={() => link.dropdown && openDropdown(link.dropdown)}
                  onMouseLeave={() => link.dropdown && closeDropdown()}>
                <a href={link.href} className={`nav-link ${activePage === link.id ? "active" : ""}`}>
                  {link.label}
                  {link.dropdown && <IconChevronDown size={13} style={{ marginLeft: 2, opacity: 0.6 }} />}
                </a>

                {link.dropdown === "brands" && (
                  <div className={`nav-dropdown ${openDd === "brands" ? "open" : ""}`}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-subtle)", marginBottom: 10 }}>
                      Popular brands
                    </div>
                    <div className="nav-dd-grid">
                      {NAV_BRANDS_TOP.map((b) => (
                        <a key={b.name} href={`Brand.html?brand=${encodeURIComponent(b.name)}`} className="nav-dd-item">
                          <span>{b.name}</span>
                          <span className="cnt">{b.count}</span>
                        </a>
                      ))}
                    </div>
                    <div className="nav-dd-footer">
                      <span className="hint">100+ partner brands</span>
                      <a href="Brands.html">View all brands <IconArrowRight size={14} /></a>
                    </div>
                  </div>
                )}

                {link.dropdown === "categories" && (
                  <div className={`nav-dropdown ${openDd === "categories" ? "open" : ""}`}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-subtle)", marginBottom: 10 }}>
                      Shop by category
                    </div>
                    <div className="nav-dd-grid">
                      {NAV_CATS_TOP.map((c) => (
                        <a key={c.name} href={`Category.html?cat=${encodeURIComponent(c.name)}`} className="nav-dd-item">
                          <span>{c.name}</span>
                          <span className="cnt">{c.count}</span>
                        </a>
                      ))}
                    </div>
                    <div className="nav-dd-footer">
                      <span className="hint">12 categories, 1,000+ products</span>
                      <a href="Categories.html">View all categories <IconArrowRight size={14} /></a>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button className="theme-toggle" onClick={onThemeToggle} aria-label="Toggle theme">
            {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          <a href="Login.html" className="nav-icon-btn account-desktop" aria-label="Account">
            <IconUser size={19} />
          </a>

          <a href="Wishlist.html" className="nav-icon-btn" aria-label="Wishlist">
            <IconHeart size={19} />
          </a>

          <a href="Cart.html" className="nav-icon-btn" aria-label="Cart" style={{ marginRight: -6 }}>
            <IconCart size={19} />
            <span className="badge">3</span>
          </a>

          <button className="mobile-menu-btn" onClick={onOpenMobile} aria-label="Open menu">
            <IconMenu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose, theme, onThemeToggle }) {
  return (
    <div className={`mobile-drawer ${open ? "open" : ""}`}>
      <div className="mobile-drawer-backdrop" onClick={onClose} />
      <div className="mobile-drawer-panel">
        <div className="md-top">
          <div className="nav-logo">
            <span className="logo-mark">J</span>
            <span>Jugasaro</span>
          </div>
          <button className="nav-icon-btn" onClick={onClose} aria-label="Close menu">
            <IconClose size={20} />
          </button>
        </div>
        <ul className="md-links">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a href={l.href} onClick={onClose}>
                {l.label}
                <IconChevronRight size={16} style={{ color: "var(--fg-subtle)" }} />
              </a>
            </li>
          ))}
          <li><a href="Login.html" onClick={onClose}>Account<IconChevronRight size={16} style={{ color: "var(--fg-subtle)" }} /></a></li>
          <li><a href="Wishlist.html" onClick={onClose}>Wishlist<IconChevronRight size={16} style={{ color: "var(--fg-subtle)" }} /></a></li>
          <li><a href="Cart.html" onClick={onClose}>Cart<IconChevronRight size={16} style={{ color: "var(--fg-subtle)" }} /></a></li>
          <li><a href="Contact.html" onClick={onClose}>Contact<IconChevronRight size={16} style={{ color: "var(--fg-subtle)" }} /></a></li>
        </ul>
        <div className="md-theme">
          <span>Dark mode</span>
          <button className="theme-toggle" onClick={onThemeToggle} aria-label="Toggle theme">
            {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Navbar, MobileDrawer });

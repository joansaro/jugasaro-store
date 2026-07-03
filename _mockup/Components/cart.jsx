/* Cart page */

const INITIAL_CART = [
  { id: 1, brand: "Northline", name: "Weekender Leather Duffel Bag", price: 268, was: 320, qty: 1, variant: "Black", size: null, hue: 300, v: "a" },
  { id: 7, brand: "Lumenhaus", name: "Noise-Cancelling Earbuds Pro", price: 199, was: 249, qty: 1, variant: "White", size: null, hue: 290, v: "c" },
  { id: 4, brand: "Kasai", name: "Merino Crewneck Sweater", price: 120, was: 160, qty: 2, variant: null, size: "M", hue: 270, v: "d" },
];

function CartPage() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [items, setItems] = React.useState(INITIAL_CART);
  const [promo, setPromo] = React.useState("");
  const [promoApplied, setPromoApplied] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const updateQty = (id, delta) => {
    setItems(items.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
  };
  const remove = (id) => setItems(items.filter(it => it.id !== id));
  const applyPromo = () => { if (promo.trim()) setPromoApplied(true); };

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const savings = items.reduce((s, it) => s + ((it.was || it.price) - it.price) * it.qty, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.08);
  const total = subtotal + shipping + tax - discount;

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <div className="container cart-wrap">
        <div className="breadcrumb">
          <a href="Jugasaro Store.html">Home</a> / <span style={{ color: "var(--fg)" }}>Cart</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "6px 0 30px" }}>
          Your cart {items.length > 0 && <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>· {items.length} items</span>}
        </h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="icon-wrap"><IconCart size={30} /></div>
            <h2>Your cart is empty</h2>
            <p>Start browsing — we've got 1,000+ products waiting.</p>
            <a href="Shop.html" className="btn btn-accent">Continue shopping <IconArrowRight size={14} /></a>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-list">
              {items.map(it => (
                <div key={it.id} className="cart-item">
                  <div className="ci-img">
                    <Placeholder label={`${it.brand.slice(0,3).toLowerCase()}_${String(it.id).padStart(3,"0")}.jpg`} variant={it.v} />
                  </div>
                  <div className="ci-body">
                    <div className="ci-brand">{it.brand}</div>
                    <a href={`Product.html?id=${it.id}`} className="ci-name">{it.name}</a>
                    <div className="ci-opts">
                      {it.variant && <>Color: <b>{it.variant}</b></>}
                      {it.variant && it.size && " · "}
                      {it.size && <>Size: <b>{it.size}</b></>}
                    </div>
                    <div className="ci-actions">
                      <button>Save for later</button>
                      <button className="remove" onClick={() => remove(it.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="ci-qty-price">
                    <div>
                      <div style={{ textAlign: "right" }}>
                        <span className="price">${it.price * it.qty}</span>
                        {it.was && <div style={{ fontSize: 12, color: "var(--fg-subtle)", textDecoration: "line-through", marginTop: 2 }}>${it.was * it.qty}</div>}
                      </div>
                    </div>
                    <div className="ci-qty">
                      <button onClick={() => updateQty(it.id, -1)}>−</button>
                      <input value={it.qty} readOnly />
                      <button onClick={() => updateQty(it.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              <a href="Shop.html" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--accent)", marginTop: 6 }}>
                <IconArrowLeft size={14} /> Continue shopping
              </a>
            </div>

            <aside className="cart-summary">
              <h3>Order summary</h3>
              <div className="sum-row"><span>Subtotal ({items.reduce((s,it) => s+it.qty, 0)} items)</span><span>${subtotal}</span></div>
              {savings > 0 && <div className="sum-row" style={{ color: "var(--success)" }}><span>You save</span><span>−${savings}</span></div>}
              <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: "var(--success)" }}>Free</span> : `$${shipping}`}</span></div>
              <div className="sum-row"><span>Estimated tax</span><span>${tax}</span></div>
              {promoApplied && <div className="sum-row" style={{ color: "var(--success)" }}><span>Promo · 10% off</span><span>−${discount}</span></div>}

              <div className="promo-input">
                <input type="text" placeholder="Promo code" value={promo} onChange={e => setPromo(e.target.value)} />
                <button onClick={applyPromo}>Apply</button>
              </div>

              <div className="sum-row total"><span>Total</span><span>${total}</span></div>

              <button className="btn btn-accent btn-full" style={{ height: 52, marginTop: 20 }}>
                Checkout · ${total} <IconArrowRight size={16} />
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                <span className="pay-chip" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>VISA</span>
                <span className="pay-chip" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>MC</span>
                <span className="pay-chip" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>AMEX</span>
                <span className="pay-chip" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>APPLE PAY</span>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--fg-muted)", display: "flex", gap: 10 }}>
                <IconShield size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} />
                <span>Secure checkout — SSL encrypted. Your payment details are never stored.</span>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CartPage />);

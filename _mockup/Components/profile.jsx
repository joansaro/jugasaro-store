const { useState } = React;

const USER = {
  name: "Ana García",
  email: "ana@jugasaro.com",
  phone: "+52 55 2847 9301",
  avatar: "AG",
  joined: "March 2024",
  tier: "Gold member"
};

const ORDERS = [
  { id: "JGS-10284", date: "Mar 18, 2026", items: 3, total: 187.50, status: "delivered", product: "Vault Crossbody + 2 more" },
  { id: "JGS-10251", date: "Mar 02, 2026", items: 1, total: 89.00, status: "shipped", product: "Orbit Wireless Headphones" },
  { id: "JGS-10198", date: "Feb 14, 2026", items: 2, total: 124.00, status: "delivered", product: "Harper Knit Sweater + 1 more" },
  { id: "JGS-10156", date: "Jan 29, 2026", items: 4, total: 310.75, status: "delivered", product: "Ceramic Dinner Set + 3 more" },
  { id: "JGS-10112", date: "Jan 12, 2026", items: 1, total: 45.00, status: "cancelled", product: "Linen Throw Pillow" },
  { id: "JGS-10087", date: "Dec 28, 2025", items: 2, total: 156.00, status: "delivered", product: "Cashmere Scarf + 1 more" },
];

const ADDRESSES = [
  { id: 1, label: "Home", name: "Ana García", line1: "Av. Insurgentes Sur 1602, Apt 302", city: "Ciudad de México", zip: "03940", country: "Mexico", phone: "+52 55 2847 9301", default: true },
  { id: 2, label: "Office", name: "Ana García", line1: "Paseo de la Reforma 250, Floor 12", city: "Ciudad de México", zip: "06500", country: "Mexico", phone: "+52 55 2847 9301", default: false },
];

const PAYMENTS = [
  { id: 1, type: "Visa", last4: "4829", exp: "08/27", default: true },
  { id: 2, type: "Mastercard", last4: "1204", exp: "11/26", default: false },
];

const WISHLIST = [
  { name: "Stellar Pendant Lamp", brand: "Northline", price: 189, hue: 42 },
  { name: "Terra Ceramic Vase Set", brand: "Ojai Goods", price: 74, hue: 28 },
  { name: "Cloud Linen Duvet", brand: "Field Studio", price: 245, hue: 220 },
  { name: "Fjord Wool Runner", brand: "Hemlock", price: 320, hue: 200 },
];

function Pattern({ hue = 200, label = "" }) {
  return (
    <div style={{ width: "100%", height: "100%", background: `oklch(88% 0.04 ${hue})`, position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <defs><pattern id={`p${hue}`} width="18" height="18" patternUnits="userSpaceOnUse"><path d="M 18 0 L 0 0 0 18" fill="none" stroke={`oklch(70% 0.06 ${hue})`} strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill={`url(#p${hue})`}/>
      </svg>
      {label && <span style={{ position: "relative", fontFamily: "var(--font-mono)", fontSize: 10, color: `oklch(40% 0.06 ${hue})`, background: "rgba(255,255,255,0.7)", padding: "3px 7px", borderRadius: 4 }}>{label}</span>}
    </div>
  );
}

// ---------- Section components ----------
function Overview() {
  const totalSpent = ORDERS.reduce((s, o) => o.status !== "cancelled" ? s + o.total : s, 0);
  return (
    <div>
      <h1 className="dash-section-title">Welcome back, Ana 👋</h1>
      <p className="dash-section-sub">Here's a snapshot of your account activity.</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="k-label">Total orders</span>
          <span className="k-val">{ORDERS.length}</span>
          <span className="k-delta up">↑ 2 this month</span>
        </div>
        <div className="kpi-card">
          <span className="k-label">Total spent</span>
          <span className="k-val">${totalSpent.toFixed(0)}</span>
          <span className="k-delta up">↑ 18% YoY</span>
        </div>
        <div className="kpi-card">
          <span className="k-label">Reward points</span>
          <span className="k-val">2,847</span>
          <span className="k-delta" style={{ color: "var(--fg-muted)" }}>$28 in credit</span>
        </div>
        <div className="kpi-card">
          <span className="k-label">Wishlist items</span>
          <span className="k-val">{WISHLIST.length}</span>
          <span className="k-delta" style={{ color: "var(--fg-muted)" }}>1 on sale</span>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent orders</h3>
            <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); window.location.hash = "orders"; }}>View all <IconArrowRight size={13} /></a>
          </div>
          <table className="table">
            <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {ORDERS.slice(0, 4).map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 12 }}>{o.id}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>{o.product}</div>
                  </td>
                  <td style={{ color: "var(--fg-muted)" }}>{o.date}</td>
                  <td style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                  <td><span className={`status-pill ${o.status}`}><span className="dot-s"></span>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Account</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Membership</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "linear-gradient(135deg, oklch(75% 0.15 75), oklch(65% 0.18 50))", color: "white", fontSize: 12, fontWeight: 600, borderRadius: 999 }}>★ {USER.tier}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Email</div>
              <div>{USER.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Phone</div>
              <div>{USER.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Member since</div>
              <div>{USER.joined}</div>
            </div>
            <button className="btn btn-outline" style={{ height: 42, marginTop: 8 }} onClick={() => window.location.hash = "settings"}>Edit profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? ORDERS : ORDERS.filter(o => o.status === filter);
  return (
    <div>
      <h1 className="dash-section-title">My orders</h1>
      <p className="dash-section-sub">Track, return, or reorder. You have {ORDERS.length} orders in total.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "processing", "shipped", "delivered", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, textTransform: "capitalize",
              border: "1px solid " + (filter === f ? "var(--fg)" : "var(--border)"),
              background: filter === f ? "var(--fg)" : "var(--bg-elev)",
              color: filter === f ? "var(--bg)" : "var(--fg-muted)" }}>
            {f} {f === "all" && `(${ORDERS.length})`}
          </button>
        ))}
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <table className="table" style={{ padding: "0 8px" }}>
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th style={{ paddingRight: 24, textAlign: "right" }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td style={{ paddingLeft: 24 }}>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 12 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>{o.product}</div>
                </td>
                <td style={{ color: "var(--fg-muted)", whiteSpace: "nowrap" }}>{o.date}</td>
                <td style={{ color: "var(--fg-muted)" }}>{o.items}</td>
                <td style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                <td><span className={`status-pill ${o.status}`}><span className="dot-s"></span>{o.status}</span></td>
                <td style={{ paddingRight: 24, textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 4 }}>
                    <button className="action-icon-btn" title="View"><IconEye size={15} /></button>
                    <button className="action-icon-btn" title="Download invoice"><IconDownload size={15} /></button>
                    {o.status === "delivered" && <button className="action-icon-btn" title="Reorder"><IconReorder size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 60, textAlign: "center", color: "var(--fg-muted)" }}>No orders match this filter.</div>}
      </div>
    </div>
  );
}

function Addresses() {
  const [list, setList] = useState(ADDRESSES);
  return (
    <div>
      <h1 className="dash-section-title">Saved addresses</h1>
      <p className="dash-section-sub">Manage shipping and billing addresses for faster checkout.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {list.map(a => (
          <div key={a.id} className="panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--bg-muted)", color: "var(--fg-muted)", padding: "3px 8px", borderRadius: 999 }}>{a.label}</span>
                {a.default && <span style={{ marginLeft: 6, fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--accent-soft)", color: "var(--accent)", padding: "3px 8px", borderRadius: 999 }}>Default</span>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="action-icon-btn"><IconEdit size={15} /></button>
                <button className="action-icon-btn"><IconTrash size={15} /></button>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div style={{ color: "var(--fg-muted)" }}>{a.line1}</div>
              <div style={{ color: "var(--fg-muted)" }}>{a.city}, {a.zip}</div>
              <div style={{ color: "var(--fg-muted)" }}>{a.country}</div>
              <div style={{ color: "var(--fg-muted)", marginTop: 6 }}>{a.phone}</div>
            </div>
            {!a.default && <button className="btn btn-outline" style={{ height: 36, fontSize: 12 }}>Set as default</button>}
          </div>
        ))}
        <button className="panel" style={{ border: "2px dashed var(--border-strong)", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 200, color: "var(--fg-muted)" }}>
          <IconPlus size={24} />
          <span style={{ fontWeight: 500 }}>Add new address</span>
        </button>
      </div>
    </div>
  );
}

function PaymentMethods() {
  return (
    <div>
      <h1 className="dash-section-title">Payment methods</h1>
      <p className="dash-section-sub">Securely stored — we never see your full card number.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {PAYMENTS.map(p => (
          <div key={p.id} className="panel" style={{ background: "linear-gradient(135deg, oklch(25% 0.06 280), oklch(18% 0.04 280))", color: "white", border: "none", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{p.type}</div>
              {p.default && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: 999 }}>Default</span>}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.2em", marginBottom: 10 }}>•••• •••• •••• {p.last4}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                <span>Expires {p.exp}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="action-icon-btn" style={{ color: "rgba(255,255,255,0.8)" }}><IconEdit size={14} /></button>
                  <button className="action-icon-btn" style={{ color: "rgba(255,255,255,0.8)" }}><IconTrash size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button className="panel" style={{ border: "2px dashed var(--border-strong)", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 180, color: "var(--fg-muted)" }}>
          <IconPlus size={24} />
          <span style={{ fontWeight: 500 }}>Add payment method</span>
        </button>
      </div>
    </div>
  );
}

function Wishlist() {
  return (
    <div>
      <h1 className="dash-section-title">My wishlist</h1>
      <p className="dash-section-sub">{WISHLIST.length} saved items — add them to cart when you're ready.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {WISHLIST.map((p, i) => (
          <div key={i} className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ aspectRatio: "1", position: "relative" }}>
              <Pattern hue={p.hue} label={`${p.brand}_${i}.jpg`} />
              <button className="action-icon-btn" style={{ position: "absolute", top: 10, right: 10, background: "white", color: "var(--danger)" }}><IconTrash size={15} /></button>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.brand}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, margin: "4px 0 8px", fontSize: 14 }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>${p.price}</span>
                <button className="btn btn-primary" style={{ height: 32, fontSize: 12, padding: "0 12px" }}>Add to cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  const [phone, setPhone] = useState(USER.phone);
  const [saved, setSaved] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div>
      <h1 className="dash-section-title">Account settings</h1>
      <p className="dash-section-sub">Update your personal info, password, and notification preferences.</p>

      <div style={{ display: "grid", gap: 20 }}>
        <div className="panel">
          <div className="panel-head"><h3>Profile info</h3></div>
          <form onSubmit={submit} style={{ display: "grid", gap: 14, maxWidth: 520 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 26 }}>{USER.avatar}</div>
              <div>
                <button type="button" className="btn btn-outline" style={{ height: 36, fontSize: 13 }}>Change photo</button>
                <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 6 }}>JPG or PNG, max 2MB</div>
              </div>
            </div>
            <div className="field">
              <label>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Save changes</button>
              {saved && <span style={{ color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>✓ Saved</span>}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Password</h3></div>
          <div style={{ display: "grid", gap: 14, maxWidth: 520 }}>
            <div className="field"><label>Current password</label><input type="password" /></div>
            <div className="field"><label>New password</label><input type="password" /></div>
            <div className="field"><label>Confirm new password</label><input type="password" /></div>
            <button className="btn btn-primary" style={{ height: 42, width: "fit-content" }}>Update password</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Email notifications</h3></div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Order updates", "Shipping, delivery, and return status", true],
              ["Promotions & sales", "Deals, launches, and brand spotlights", true],
              ["Weekly digest", "Curated picks based on your wishlist", false],
              ["New arrivals", "Be first to see fresh stock", false],
            ].map(([t, d, def], i) => (
              <label key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>{d}</div>
                </div>
                <input type="checkbox" defaultChecked={def} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
              </label>
            ))}
          </div>
        </div>

        <div className="panel" style={{ borderColor: "color-mix(in oklab, var(--danger) 40%, var(--border))" }}>
          <div className="panel-head"><h3 style={{ color: "var(--danger)" }}>Danger zone</h3></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Delete account</div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>Permanently remove your account and all data. This can't be undone.</div>
            </div>
            <button className="btn" style={{ height: 42, background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)" }}>Delete my account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Extra icons ----------
function IconEye({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function IconDownload({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function IconReorder({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>; }
function IconEdit({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function IconTrash({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>; }

// ---------- App ----------
function App() {
  const [section, setSection] = useState(() => window.location.hash.replace("#", "") || "overview");
  const [theme, setTheme] = useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const onHash = () => setSection(window.location.hash.replace("#", "") || "overview");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (s) => { window.location.hash = s; setSection(s); };

  const sections = [
    { id: "overview", label: "Overview", icon: <IconHome /> },
    { id: "orders", label: "Orders", icon: <IconPackage />, badge: ORDERS.length },
    { id: "wishlist", label: "Wishlist", icon: <IconHeart size={17} />, badge: WISHLIST.length },
    { id: "addresses", label: "Addresses", icon: <IconMapPin size={17} /> },
    { id: "payments", label: "Payment methods", icon: <IconCard /> },
    { id: "settings", label: "Settings", icon: <IconSettings /> },
  ];

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "light" ? "dark" : "light")} onOpenMobile={() => setMobileOpen(true)} activePage="profile" />
      <div className="container">
        <div className="dash-layout">
          <aside className="dash-side">
            <div className="dash-user">
              <div className="avatar">{USER.avatar}</div>
              <div>
                <div className="du-name">{USER.name}</div>
                <div className="du-email">{USER.email}</div>
              </div>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", background: "linear-gradient(135deg, oklch(75% 0.15 75), oklch(65% 0.18 50))", color: "white", padding: "3px 8px", borderRadius: 999 }}>★ {USER.tier}</span>
            </div>
            <nav className="dash-nav">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); go(s.id); }} className={section === s.id ? "active" : ""}>
                  {s.icon} {s.label}
                  {s.badge && <span className="badge-small">{s.badge}</span>}
                </a>
              ))}
              <a href="Jugasaro Store.html" style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 18, color: "var(--danger)" }}>
                <IconLogout /> Sign out
              </a>
            </nav>
          </aside>
          <main>
            {section === "overview" && <Overview />}
            {section === "orders" && <Orders />}
            {section === "wishlist" && <Wishlist />}
            {section === "addresses" && <Addresses />}
            {section === "payments" && <PaymentMethods />}
            {section === "settings" && <Settings />}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

function IconHome({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconPackage({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function IconCard({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IconSettings({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconLogout({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

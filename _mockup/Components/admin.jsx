const { useState, useMemo } = React;

// --- Extended admin CSS (inline additions) ---
const adminStyles = `
.admin-shell { min-height: 100vh; display: grid; grid-template-columns: 240px 1fr; background: var(--bg-subtle); }
@media (max-width: 1000px) { .admin-shell { grid-template-columns: 1fr; } .admin-sidebar { display: none; } }
.admin-sidebar {
  background: oklch(15% 0.03 300);
  color: oklch(85% 0.01 300);
  padding: 20px 0;
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
}
[data-theme="dark"] .admin-sidebar { background: oklch(12% 0.02 300); }
.admin-brand {
  padding: 0 20px 22px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.admin-brand .logo-sq {
  width: 34px; height: 34px; border-radius: 8px; background: var(--accent); color: var(--accent-fg);
  display: grid; place-items: center; font-family: var(--font-display); font-weight: 700;
}
.admin-brand-text { display: flex; flex-direction: column; }
.admin-brand-text .b1 { font-family: var(--font-display); font-weight: 600; font-size: 14px; color: white; letter-spacing: -0.01em; }
.admin-brand-text .b2 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: oklch(70% 0.02 300); font-family: var(--font-mono); }
.admin-nav { padding: 16px 10px; display: flex; flex-direction: column; gap: 1px; flex: 1; overflow-y: auto; }
.admin-nav .section-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: oklch(55% 0.02 300);
  padding: 14px 12px 8px; font-family: var(--font-mono);
}
.admin-nav a {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
  color: oklch(78% 0.02 300);
  transition: all .15s;
}
.admin-nav a:hover { background: rgba(255,255,255,0.06); color: white; }
.admin-nav a.active { background: var(--accent); color: var(--accent-fg); }
.admin-nav .badge-n { margin-left: auto; font-family: var(--font-mono); font-size: 10px; background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 999px; }
.admin-nav a.active .badge-n { background: rgba(255,255,255,0.25); }
.admin-user {
  padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 10px;
}

.admin-topbar {
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 14px 30px;
  display: flex; align-items: center; gap: 14px;
  position: sticky; top: 0; z-index: 20;
}
.admin-search {
  flex: 1; max-width: 420px;
  position: relative;
}
.admin-search input {
  width: 100%; height: 38px; padding: 0 14px 0 40px;
  background: var(--bg-subtle); border: 1px solid var(--border);
  border-radius: 8px; font-size: 13px; outline: none;
}
.admin-search input:focus { border-color: var(--accent); }
.admin-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--fg-subtle); }

.admin-main { padding: 28px 30px 60px; }
@media (max-width: 600px) { .admin-main { padding: 20px 16px 40px; } }
`;

// --- Mock data ---
const ADMIN_USER = { name: "Carlos Admin", email: "admin@jugasaro.com", role: "Owner", avatar: "CA" };

const KPIS = [
  { label: "Revenue (30d)", value: "$48,291", delta: "+12.4%", dir: "up", sub: "vs last month" },
  { label: "Orders (30d)", value: "1,284", delta: "+8.1%", dir: "up", sub: "vs last month" },
  { label: "New customers", value: "312", delta: "+23.5%", dir: "up", sub: "vs last month" },
  { label: "Avg order value", value: "$37.61", delta: "-2.3%", dir: "down", sub: "vs last month" },
];

const REVENUE_SERIES = [
  28, 32, 30, 38, 42, 36, 44, 48, 52, 45, 58, 62, 55, 68, 72, 65, 78, 82, 75, 88, 92, 85, 95, 102, 98, 110, 118, 112, 125, 132
];

const RECENT_ORDERS_ADMIN = [
  { id: "JGS-10312", customer: "Ana García", email: "ana@jugasaro.com", date: "Apr 23", total: 89.50, status: "processing", items: 2 },
  { id: "JGS-10311", customer: "Marco Reyes", email: "marco.r@mail.com", date: "Apr 23", total: 245.00, status: "shipped", items: 4 },
  { id: "JGS-10310", customer: "Lucia Hernández", email: "lucia.h@mail.com", date: "Apr 22", total: 67.25, status: "delivered", items: 1 },
  { id: "JGS-10309", customer: "David Park", email: "dpark@mail.com", date: "Apr 22", total: 412.80, status: "processing", items: 5 },
  { id: "JGS-10308", customer: "Sofia Mendez", email: "sofia.m@mail.com", date: "Apr 21", total: 124.00, status: "delivered", items: 2 },
  { id: "JGS-10307", customer: "James Walker", email: "jwalker@mail.com", date: "Apr 21", total: 58.90, status: "cancelled", items: 1 },
  { id: "JGS-10306", customer: "Elena Torres", email: "elena.t@mail.com", date: "Apr 20", total: 196.40, status: "delivered", items: 3 },
  { id: "JGS-10305", customer: "Rafael Cruz", email: "rcruz@mail.com", date: "Apr 20", total: 74.00, status: "shipped", items: 2 },
];

const TOP_PRODUCTS = [
  { name: "Orbit Wireless Headphones", brand: "Volta & Co", sold: 284, revenue: 25272, hue: 280 },
  { name: "Harper Knit Sweater", brand: "Field Studio", sold: 219, revenue: 15111, hue: 340 },
  { name: "Vault Leather Crossbody", brand: "Northline", sold: 167, revenue: 20040, hue: 30 },
  { name: "Cloud Linen Duvet Cover", brand: "Hemlock", sold: 143, revenue: 34307, hue: 220 },
  { name: "Terra Ceramic Vase", brand: "Ojai Goods", sold: 128, revenue: 9472, hue: 28 },
];

const INVENTORY_ALERTS = [
  { name: "Orbit Wireless Headphones", sku: "VC-ORB-001", stock: 3, threshold: 20, status: "low" },
  { name: "Meridian Candle — Fig & Cedar", sku: "MR-FC-004", stock: 0, threshold: 25, status: "low" },
  { name: "Harper Knit Sweater — M", sku: "FS-HRP-M", stock: 7, threshold: 15, status: "low" },
  { name: "Vault Crossbody — Tan", sku: "NL-VLT-T", stock: 12, threshold: 15, status: "low" },
];

const CUSTOMERS = [
  { name: "Ana García", email: "ana@jugasaro.com", orders: 12, spent: 1847.50, joined: "Mar 2024", tier: "Gold" },
  { name: "Marco Reyes", email: "marco.r@mail.com", orders: 8, spent: 1245.00, joined: "Jun 2024", tier: "Silver" },
  { name: "Lucia Hernández", email: "lucia.h@mail.com", orders: 15, spent: 2102.75, joined: "Jan 2024", tier: "Gold" },
  { name: "David Park", email: "dpark@mail.com", orders: 6, spent: 890.40, joined: "Sep 2024", tier: "Silver" },
  { name: "Sofia Mendez", email: "sofia.m@mail.com", orders: 22, spent: 3294.80, joined: "Nov 2023", tier: "Platinum" },
  { name: "James Walker", email: "jwalker@mail.com", orders: 3, spent: 312.50, joined: "Feb 2025", tier: "Bronze" },
  { name: "Elena Torres", email: "elena.t@mail.com", orders: 9, spent: 1456.20, joined: "May 2024", tier: "Silver" },
];

const ADMIN_PRODUCTS = [
  { id: 1, name: "Orbit Wireless Headphones", brand: "Volta & Co", category: "Electronics", price: 89, stock: 3, status: "active", hue: 280 },
  { id: 2, name: "Harper Knit Sweater", brand: "Field Studio", category: "Apparel", price: 69, stock: 42, status: "active", hue: 340 },
  { id: 3, name: "Vault Leather Crossbody", brand: "Northline", category: "Accessories", price: 120, stock: 28, status: "active", hue: 30 },
  { id: 4, name: "Cloud Linen Duvet", brand: "Hemlock", category: "Home", price: 239.99, stock: 19, status: "active", hue: 220 },
  { id: 5, name: "Terra Ceramic Vase", brand: "Ojai Goods", category: "Home", price: 74, stock: 62, status: "active", hue: 28 },
  { id: 6, name: "Meridian Candle — Fig & Cedar", brand: "Meridian", category: "Home", price: 38, stock: 0, status: "out_of_stock", hue: 60 },
  { id: 7, name: "Mesa Wool Throw", brand: "Kasai", category: "Home", price: 128, stock: 24, status: "active", hue: 10 },
  { id: 8, name: "North Face Runner", brand: "Tusken", category: "Shoes", price: 145, stock: 8, status: "draft", hue: 195 },
];

// --- Components ---
function Pattern({ hue = 200, label = "" }) {
  return (
    <div style={{ width: "100%", height: "100%", background: `oklch(90% 0.03 ${hue})`, position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <defs><pattern id={`pa${hue}`} width="12" height="12" patternUnits="userSpaceOnUse"><path d="M 12 0 L 0 0 0 12" fill="none" stroke={`oklch(70% 0.06 ${hue})`} strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill={`url(#pa${hue})`}/>
      </svg>
    </div>
  );
}

function SparkChart({ data, color = "var(--accent)" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 10;
  const w = 100, h = 100;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const pathD = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="1 2"/>)}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

function StatusPill({ status }) {
  const labels = { active: "Active", draft: "Draft", out_of_stock: "Out of stock", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
  const cls = { active: "healthy", draft: "shipped", out_of_stock: "low", processing: "processing", shipped: "shipped", delivered: "delivered", cancelled: "cancelled" };
  return <span className={`status-pill ${cls[status] || "healthy"}`}><span className="dot-s"></span>{labels[status] || status}</span>;
}

function TierBadge({ tier }) {
  const colors = {
    Platinum: "linear-gradient(135deg, oklch(75% 0.02 280), oklch(60% 0.04 280))",
    Gold: "linear-gradient(135deg, oklch(75% 0.15 75), oklch(65% 0.18 50))",
    Silver: "linear-gradient(135deg, oklch(75% 0.02 240), oklch(65% 0.03 240))",
    Bronze: "linear-gradient(135deg, oklch(55% 0.12 40), oklch(45% 0.14 30))",
  };
  return <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", background: colors[tier] || colors.Bronze, color: "white", padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>{tier}</span>;
}

// --- Sections ---
function Overview() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="dash-section-title">Dashboard</h1>
          <p className="dash-section-sub" style={{ marginBottom: 0 }}>Welcome back, Carlos. Here's what's happening in your store.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ height: 38, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elev)", fontSize: 13 }}>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
          <button className="btn btn-primary" style={{ height: 38, fontSize: 13, padding: "0 16px" }}>Export report</button>
        </div>
      </div>

      <div className="kpi-grid">
        {KPIS.map(k => (
          <div key={k.label} className="kpi-card">
            <span className="k-label">{k.label}</span>
            <span className="k-val">{k.value}</span>
            <span className={`k-delta ${k.dir}`}>{k.dir === "up" ? "↑" : "↓"} {k.delta.replace("-", "").replace("+", "")} <span style={{ color: "var(--fg-subtle)", fontWeight: 400, marginLeft: 4 }}>{k.sub}</span></span>
          </div>
        ))}
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 20 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Revenue over time</h3>
            <div className="h-actions">
              <button className="btn btn-outline" style={{ height: 32, fontSize: 12, padding: "0 12px" }}>Daily</button>
              <button className="btn btn-outline" style={{ height: 32, fontSize: 12, padding: "0 12px", background: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" }}>Weekly</button>
              <button className="btn btn-outline" style={{ height: 32, fontSize: 12, padding: "0 12px" }}>Monthly</button>
            </div>
          </div>
          <div className="chart-wrap">
            <SparkChart data={REVENUE_SERIES} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", marginTop: 6 }}>
            <span>Mar 25</span><span>Apr 1</span><span>Apr 8</span><span>Apr 15</span><span>Apr 22</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Top products</h3><a href="#products" className="view-all">View all</a></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                  <Pattern hue={p.hue} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{p.sold} sold · ${p.revenue.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)" }}>#{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent orders</h3>
            <a href="#orders" className="view-all">View all</a>
          </div>
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {RECENT_ORDERS_ADMIN.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td><div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{o.id}</div><div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{o.date}</div></td>
                  <td><div style={{ fontWeight: 500, fontSize: 13 }}>{o.customer}</div><div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{o.email}</div></td>
                  <td style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Inventory alerts</h3>
            <span className="status-pill low"><span className="dot-s"></span>{INVENTORY_ALERTS.length} items</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {INVENTORY_ALERTS.map((p, i) => (
              <div key={i} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: p.stock === 0 ? "color-mix(in oklab, var(--danger) 8%, var(--bg-elev))" : "var(--bg-elev)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)" }}>{p.sku}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: p.stock === 0 ? "var(--danger)" : "oklch(55% 0.16 75)", fontSize: 16 }}>{p.stock}</div>
                    <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>in stock</div>
                  </div>
                </div>
                <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (p.stock / p.threshold) * 100)}%`, background: p.stock === 0 ? "var(--danger)" : "var(--warning)" }}></div>
                </div>
                <button className="btn btn-primary" style={{ height: 30, fontSize: 12, padding: "0 12px", marginTop: 10 }}>Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? RECENT_ORDERS_ADMIN : RECENT_ORDERS_ADMIN.filter(o => o.status === filter);
  return (
    <div>
      <h1 className="dash-section-title">Orders</h1>
      <p className="dash-section-sub">{RECENT_ORDERS_ADMIN.length} total orders — manage fulfillment and returns.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "processing", "shipped", "delivered", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, textTransform: "capitalize",
              border: "1px solid " + (filter === f ? "var(--fg)" : "var(--border)"),
              background: filter === f ? "var(--fg)" : "var(--bg-elev)",
              color: filter === f ? "var(--bg)" : "var(--fg-muted)" }}>{f}</button>
        ))}
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th style={{ paddingRight: 24, textAlign: "right" }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td style={{ paddingLeft: 24, fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12 }}>{o.id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar sm">{o.customer.split(" ").map(n => n[0]).join("")}</div>
                    <div><div style={{ fontWeight: 500, fontSize: 13 }}>{o.customer}</div><div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{o.email}</div></div>
                  </div>
                </td>
                <td style={{ color: "var(--fg-muted)" }}>{o.date}</td>
                <td>{o.items}</td>
                <td style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                <td><StatusPill status={o.status} /></td>
                <td style={{ paddingRight: 24, textAlign: "right" }}>
                  <button className="action-icon-btn"><IconMore /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Products() {
  const [q, setQ] = useState("");
  const filtered = ADMIN_PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="dash-section-title">Products</h1>
          <p className="dash-section-sub" style={{ marginBottom: 0 }}>{ADMIN_PRODUCTS.length} products · {ADMIN_PRODUCTS.filter(p => p.status === "active").length} active</p>
        </div>
        <a href="Create Product.html" className="btn btn-primary" style={{ height: 40 }}><IconPlus size={15} /> New product</a>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, SKUs..."
            style={{ width: "100%", height: 40, padding: "0 14px 0 40px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-elev)", fontSize: 13 }} />
          <IconSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)" }} size={16} />
        </div>
        <select style={{ height: 40, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elev)", fontSize: 13 }}>
          <option>All categories</option><option>Apparel</option><option>Home</option><option>Electronics</option>
        </select>
        <select style={{ height: 40, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elev)", fontSize: 13 }}>
          <option>All statuses</option><option>Active</option><option>Draft</option><option>Out of stock</option>
        </select>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}><input type="checkbox" /></th>
            <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th>
            <th style={{ paddingRight: 24, textAlign: "right" }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ paddingLeft: 24 }}><input type="checkbox" /></td>
                <td>
                  <div className="prod-row">
                    <div className="prod-thumb"><Pattern hue={p.hue} /></div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--fg-muted)" }}>{p.category}</td>
                <td style={{ fontWeight: 600 }}>${p.price}</td>
                <td style={{ color: p.stock < 15 ? "var(--danger)" : "var(--fg)", fontWeight: p.stock < 15 ? 600 : 400 }}>{p.stock}</td>
                <td><StatusPill status={p.status} /></td>
                <td style={{ paddingRight: 24, textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 4 }}>
                    <a href="Edit Product.html" className="action-icon-btn"><IconEdit /></a>
                    <button className="action-icon-btn"><IconMore /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Customers() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="dash-section-title">Customers</h1>
          <p className="dash-section-sub" style={{ marginBottom: 0 }}>{CUSTOMERS.length} customers · 312 new this month</p>
        </div>
        <button className="btn btn-outline" style={{ height: 40 }}><IconDownload /> Export CSV</button>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>Customer</th><th>Orders</th><th>Total spent</th><th>Joined</th><th>Tier</th>
            <th style={{ paddingRight: 24, textAlign: "right" }}></th>
          </tr></thead>
          <tbody>
            {CUSTOMERS.map((c, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar sm">{c.name.split(" ").map(n => n[0]).join("")}</div>
                    <div><div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{c.email}</div></div>
                  </div>
                </td>
                <td>{c.orders}</td>
                <td style={{ fontWeight: 600 }}>${c.spent.toFixed(2)}</td>
                <td style={{ color: "var(--fg-muted)" }}>{c.joined}</td>
                <td><TierBadge tier={c.tier} /></td>
                <td style={{ paddingRight: 24, textAlign: "right" }}>
                  <button className="action-icon-btn"><IconMore /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <div>
      <h1 className="dash-section-title">Analytics</h1>
      <p className="dash-section-sub">Deep-dive performance metrics and trends.</p>

      <div className="kpi-grid">
        <div className="kpi-card"><span className="k-label">Conversion rate</span><span className="k-val">3.42%</span><span className="k-delta up">↑ 0.3pp</span></div>
        <div className="kpi-card"><span className="k-label">Cart abandonment</span><span className="k-val">68.2%</span><span className="k-delta down">↑ 2.1pp</span></div>
        <div className="kpi-card"><span className="k-label">Repeat customer rate</span><span className="k-val">42%</span><span className="k-delta up">↑ 5pp</span></div>
        <div className="kpi-card"><span className="k-label">Sessions (30d)</span><span className="k-val">37,482</span><span className="k-delta up">↑ 14%</span></div>
      </div>

      <div className="dash-grid-2">
        <div className="panel">
          <div className="panel-head"><h3>Sales by category</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Home & Living", 32, 15440],
              ["Apparel", 24, 11560],
              ["Electronics", 18, 8680],
              ["Accessories", 14, 6740],
              ["Beauty", 8, 3850],
              ["Sports", 4, 2020],
            ].map(([n, pct, rev], i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{n}</span>
                  <span style={{ color: "var(--fg-muted)" }}>${rev.toLocaleString()} <span style={{ color: "var(--fg-subtle)", marginLeft: 6 }}>{pct}%</span></span>
                </div>
                <div style={{ height: 6, background: "var(--bg-muted)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 3}%`, background: "var(--accent)" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Traffic sources</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Direct", 38, "oklch(55% 0.2 300)"],
              ["Google search", 28, "oklch(65% 0.18 200)"],
              ["Instagram", 18, "oklch(60% 0.2 340)"],
              ["Email", 10, "oklch(60% 0.18 140)"],
              ["Other", 6, "oklch(55% 0.02 280)"],
            ].map(([n, pct, color], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: color }}></span>
                <span style={{ fontSize: 13, flex: 1 }}>{n}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div>
      <h1 className="dash-section-title">Store settings</h1>
      <p className="dash-section-sub">Configure your storefront, payments, shipping, and team.</p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head"><h3>Store details</h3></div>
        <div style={{ display: "grid", gap: 14, maxWidth: 560 }}>
          <div className="field"><label>Store name</label><input defaultValue="Jugasaro Store" /></div>
          <div className="field"><label>Contact email</label><input type="email" defaultValue="hello@jugasaro.com" /></div>
          <div className="field"><label>Support phone</label><input type="tel" defaultValue="+52 55 2847 9300" /></div>
          <div className="field"><label>Currency</label><select><option>USD — US Dollar</option><option>MXN — Mexican Peso</option><option>EUR — Euro</option></select></div>
          <button className="btn btn-primary" style={{ height: 42, width: "fit-content" }}>Save changes</button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head"><h3>Shipping zones</h3><button className="btn btn-outline" style={{ height: 34, fontSize: 12 }}><IconPlus size={14} /> Add zone</button></div>
        <table className="table">
          <thead><tr><th>Zone</th><th>Countries</th><th>Rate</th><th>Free over</th><th></th></tr></thead>
          <tbody>
            <tr><td>Mexico</td><td>Mexico</td><td>$4.99</td><td>$50</td><td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconEdit /></button></td></tr>
            <tr><td>United States</td><td>USA, Canada</td><td>$9.99</td><td>$80</td><td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconEdit /></button></td></tr>
            <tr><td>International</td><td>All other</td><td>$24.99</td><td>$200</td><td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconEdit /></button></td></tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Team members</h3><button className="btn btn-outline" style={{ height: 34, fontSize: 12 }}><IconPlus size={14} /> Invite</button></div>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last active</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar sm">CA</div><span style={{ fontWeight: 500 }}>Carlos Admin</span></div></td>
              <td>admin@jugasaro.com</td><td><span className="status-pill healthy"><span className="dot-s"></span>Owner</span></td><td style={{ color: "var(--fg-muted)" }}>Active now</td>
              <td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconMore /></button></td>
            </tr>
            <tr>
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar sm">MR</div><span style={{ fontWeight: 500 }}>Maria Rojas</span></div></td>
              <td>maria@jugasaro.com</td><td><span className="status-pill shipped"><span className="dot-s"></span>Editor</span></td><td style={{ color: "var(--fg-muted)" }}>2h ago</td>
              <td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconMore /></button></td>
            </tr>
            <tr>
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar sm">JT</div><span style={{ fontWeight: 500 }}>Juan Torres</span></div></td>
              <td>juan@jugasaro.com</td><td><span className="status-pill processing"><span className="dot-s"></span>Support</span></td><td style={{ color: "var(--fg-muted)" }}>Yesterday</td>
              <td style={{ textAlign: "right" }}><button className="action-icon-btn"><IconMore /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Icons ---
function IconSearch({ size = 17, style }) { return <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconMore({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>; }
function IconEdit({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function IconDownload({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function IconBell({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function IconHome({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconBox({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function IconCart2({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>; }
function IconUsers({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconChart({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IconTag({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IconSettings({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconLogout({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconMoon({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
function IconSun({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>; }
function IconPlus({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }

// --- App ---
function App() {
  const [section, setSection] = useState(() => window.location.hash.replace("#", "") || "overview");
  const [theme, setTheme] = useState(() => localStorage.getItem("jugasaro-theme") || "light");

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

  const navSections = [
    { group: "Main", items: [
      { id: "overview", label: "Dashboard", icon: <IconHome /> },
      { id: "analytics", label: "Analytics", icon: <IconChart /> },
    ]},
    { group: "Catalog", items: [
      { id: "products", label: "Products", icon: <IconBox />, badge: ADMIN_PRODUCTS.length },
      { id: "orders", label: "Orders", icon: <IconCart2 />, badge: 12 },
      { id: "customers", label: "Customers", icon: <IconUsers />, badge: CUSTOMERS.length },
    ]},
    { group: "Marketing", items: [
      { id: "discounts", label: "Discounts", icon: <IconTag /> },
    ]},
    { group: "System", items: [
      { id: "settings", label: "Settings", icon: <IconSettings /> },
    ]},
  ];

  const titleMap = { overview: "Dashboard", analytics: "Analytics", products: "Products", orders: "Orders", customers: "Customers", discounts: "Discounts", settings: "Settings" };

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="logo-sq">J</div>
            <div className="admin-brand-text">
              <span className="b1">Jugasaro</span>
              <span className="b2">Admin</span>
            </div>
          </div>
          <nav className="admin-nav">
            {navSections.map(g => (
              <React.Fragment key={g.group}>
                <div className="section-label">{g.group}</div>
                {g.items.map(it => (
                  <a key={it.id} href={`#${it.id}`} onClick={(e) => { e.preventDefault(); go(it.id); }} className={section === it.id ? "active" : ""}>
                    {it.icon} {it.label}
                    {it.badge != null && <span className="badge-n">{it.badge}</span>}
                  </a>
                ))}
              </React.Fragment>
            ))}
          </nav>
          <div className="admin-user">
            <div className="avatar sm">{ADMIN_USER.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "white", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{ADMIN_USER.name}</div>
              <div style={{ fontSize: 11, color: "oklch(60% 0.02 300)", overflow: "hidden", textOverflow: "ellipsis" }}>{ADMIN_USER.role}</div>
            </div>
            <a href="Jugasaro Store.html" style={{ color: "oklch(70% 0.02 300)" }} title="Sign out"><IconLogout size={16} /></a>
          </div>
        </aside>

        <div>
          <div className="admin-topbar">
            <div className="admin-search">
              <IconSearch size={15} />
              <input placeholder="Search products, orders, customers..." />
            </div>
            <div style={{ flex: 1 }}></div>
            <button className="action-icon-btn" onClick={() => setTheme(t => t === "light" ? "dark" : "light")} title="Toggle theme">
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <button className="action-icon-btn" title="Notifications" style={{ position: "relative" }}>
              <IconBell size={16} />
              <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "var(--danger)", borderRadius: 999 }}></span>
            </button>
            <a href="Jugasaro Store.html" className="btn btn-outline" style={{ height: 36, fontSize: 13 }}>View store →</a>
          </div>

          <main className="admin-main">
            {section === "overview" && <Overview />}
            {section === "analytics" && <Analytics />}
            {section === "products" && <Products />}
            {section === "orders" && <Orders />}
            {section === "customers" && <Customers />}
            {section === "discounts" && (
              <div>
                <h1 className="dash-section-title">Discounts</h1>
                <p className="dash-section-sub">Create promo codes and automatic discounts.</p>
                <div className="panel" style={{ textAlign: "center", padding: 60 }}>
                  <IconTag size={48} style={{ color: "var(--fg-subtle)", margin: "0 auto 14px" }} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 6 }}>No discounts yet</div>
                  <div style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 16 }}>Create your first promo code to start offering deals.</div>
                  <button className="btn btn-primary" style={{ height: 42, padding: "0 20px" }}><IconPlus size={15} /> Create discount</button>
                </div>
              </div>
            )}
            {section === "settings" && <Settings />}
          </main>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

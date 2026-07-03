/* Product edit/create — admin-facing form with rich text editor + 5-image uploader */

function RichTextEditor({ value, onChange }) {
  const editorRef = React.useRef(null);
  const [activeStates, setActiveStates] = React.useState({});

  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || `<p>A carefully considered piece, made from premium materials. Designed for everyday use without compromise.</p><h3>Key features</h3><ul><li>Premium full-grain materials</li><li>Stitched, not glued — built to be repaired</li><li>Quality-checked before shipping</li></ul>`;
    }
  }, []);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateStates();
    onChange?.(editorRef.current?.innerHTML || "");
  };
  const updateStates = () => {
    const s = {};
    ["bold","italic","underline","insertUnorderedList","insertOrderedList"].forEach(c => {
      try { s[c] = document.queryCommandState(c); } catch {}
    });
    setActiveStates(s);
  };

  const Btn = ({ cmd, val, children, title }) => (
    <button type="button" className={`rte-btn ${activeStates[cmd] ? "active" : ""}`} onMouseDown={e => { e.preventDefault(); exec(cmd, val); }} title={title}>
      {children}
    </button>
  );

  return (
    <div>
      <div className="rte-toolbar">
        <select onChange={e => exec("formatBlock", e.target.value)} defaultValue="p" style={{ height: 32, padding: "0 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-elev)", fontSize: 12 }}>
          <option value="p">Paragraph</option>
          <option value="h2">Heading 1</option>
          <option value="h3">Heading 2</option>
          <option value="blockquote">Quote</option>
        </select>
        <div className="rte-sep" />
        <Btn cmd="bold" title="Bold"><b>B</b></Btn>
        <Btn cmd="italic" title="Italic"><i>I</i></Btn>
        <Btn cmd="underline" title="Underline"><u>U</u></Btn>
        <Btn cmd="strikeThrough" title="Strikethrough"><s>S</s></Btn>
        <div className="rte-sep" />
        <Btn cmd="insertUnorderedList" title="Bulleted list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>
        </Btn>
        <Btn cmd="insertOrderedList" title="Numbered list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </Btn>
        <div className="rte-sep" />
        <Btn cmd="justifyLeft" title="Align left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h12M3 18h15"/></svg>
        </Btn>
        <Btn cmd="justifyCenter" title="Align center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M4 18h16"/></svg>
        </Btn>
        <div className="rte-sep" />
        <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); const url = prompt("Link URL:"); if (url) exec("createLink", url); }} title="Insert link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
        </button>
        <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); exec("removeFormat"); }} title="Clear formatting">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4h12v2h-5l-3 14H8l3-14H6z"/><path d="M14 15l6 6M20 15l-6 6"/></svg>
        </button>
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={() => { updateStates(); onChange?.(editorRef.current?.innerHTML || ""); }}
        onKeyUp={updateStates}
        onMouseUp={updateStates}
      />
    </div>
  );
}

function ImageUploader({ images, onChange }) {
  const slots = 5;
  const setSlot = (i, val) => {
    const next = [...images];
    next[i] = val;
    onChange(next);
  };
  return (
    <div>
      <div className="img-upload-grid">
        {Array.from({ length: slots }).map((_, i) => {
          const filled = !!images[i];
          return (
            <div key={i} className={`img-slot ${filled ? "filled" : ""}`} onClick={() => !filled && setSlot(i, { label: `product_0${i+1}.jpg`, variant: (["a","b","c","d","e"])[i] })}>
              <span className={`slot-idx ${i === 0 ? "primary" : ""}`}>{i === 0 ? "Primary" : `${i+1}`}</span>
              {filled ? (
                <>
                  <Placeholder label={images[i].label} variant={images[i].variant} />
                  <button className="slot-x" onClick={(e) => { e.stopPropagation(); setSlot(i, null); }} aria-label="Remove image">
                    <IconClose size={12} />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 10, position: "relative", zIndex: 1 }}>
                  <IconPlus size={20} />
                  <div style={{ marginTop: 6, fontSize: 11 }}>Add image</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "12px 0 0" }}>
        First image is used as the primary product photo · JPG, PNG or WebP · up to 8MB each · 1200×1500 recommended
      </p>
    </div>
  );
}

function TagInput({ tags, onChange, placeholder = "Type and press Enter" }) {
  const [input, setInput] = React.useState("");
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div className="tag-input" onClick={(e) => e.currentTarget.querySelector("input")?.focus()}>
      {tags.map(t => (
        <span key={t} className="tag-chip">{t}<button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>×</button></span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} placeholder={tags.length === 0 ? placeholder : ""}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0,-1)); }} />
    </div>
  );
}

function ProductEditPage() {
  const isCreate = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "create") || /create/i.test((typeof document !== "undefined" && document.title) || "");
  const [theme, setTheme] = React.useState(() => localStorage.getItem("jugasaro-theme") || "light");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [images, setImages] = React.useState(isCreate
    ? [null, null, null, null, null]
    : [{ label: "product_01.jpg", variant: "a" }, { label: "product_02.jpg", variant: "b" }, null, null, null]);
  const [desc, setDesc] = React.useState("");
  const [tags, setTags] = React.useState(isCreate ? [] : ["bestseller", "premium", "handmade"]);
  const [variants, setVariants] = React.useState(isCreate
    ? [{ name: "", sku: "", stock: 0 }]
    : [{ name: "Black", sku: "JUG-001-BLK", stock: 24 }, { name: "Natural", sku: "JUG-001-NAT", stock: 12 }]);
  const [title, setTitle] = React.useState(isCreate ? "" : "Weekender Leather Duffel Bag");
  const [status, setStatus] = React.useState(isCreate ? "draft" : "active");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  const addVariant = () => setVariants([...variants, { name: "", sku: "", stock: 0 }]);
  const updateVariant = (i, k, v) => {
    const n = [...variants]; n[i] = { ...n[i], [k]: v }; setVariants(n);
  };
  const removeVariant = (i) => setVariants(variants.filter((_, j) => j !== i));

  return (
    <>
      <Navbar theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} onOpenMobile={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />

      <div className="container">
        <div className="breadcrumb" style={{ paddingTop: 30 }}>
          <a href="Admin.html">Admin</a> / <a href="Admin.html">Products</a> / <span style={{ color: "var(--fg)" }}>{isCreate ? "Create product" : "Edit product"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "6px 0 6px" }}>{isCreate ? "Create new product" : "Edit product"}</h1>
            <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: 14 }}>{isCreate ? "Fill in the details below · nothing is published until you hit Save" : <>Make changes below · last saved 2m ago · <span style={{ color: "var(--success)" }}>● Live on store</span></>}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" style={{ height: 42 }}>Preview</button>
            <button className="btn btn-outline" style={{ height: 42 }}>Save draft</button>
            <button className="btn btn-accent" style={{ height: 42 }}>{isCreate ? "Publish product" : "Save changes"}</button>
          </div>
        </div>

        <div className="edit-grid">
          {/* Main column */}
          <div>
            <div className="edit-card">
              <h3>Basic info</h3>
              <div className="field"><label>Product title</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div style={{ marginTop: 14 }} className="form-grid-2">
                <div className="field"><label>Brand</label>
                  <select>{BRANDS.slice(0,30).map(b => <option key={b}>{b}</option>)}</select>
                </div>
                <div className="field"><label>Category</label>
                  <select>{CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}</select>
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Short tagline <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(shown below the title on product page)</span></label>
                <input placeholder="e.g. The only bag you'll pack for a weekend away" />
              </div>
            </div>

            <div className="edit-card">
              <h3>Images · up to 5</h3>
              <ImageUploader images={images} onChange={setImages} />
            </div>

            <div className="edit-card">
              <h3>Description</h3>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "-8px 0 14px" }}>Full rich-text description shown on the product detail page.</p>
              <RichTextEditor value={desc} onChange={setDesc} />
            </div>

            <div className="edit-card">
              <h3>Pricing &amp; inventory</h3>
              <div className="form-grid-2">
                <div className="field"><label>Price</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)", fontSize: 14 }}>$</span>
                    <input type="number" defaultValue="268" style={{ paddingLeft: 28, width: "100%" }} />
                  </div>
                </div>
                <div className="field"><label>Compare at (was) <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>optional</span></label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)", fontSize: 14 }}>$</span>
                    <input type="number" defaultValue="320" style={{ paddingLeft: 28, width: "100%" }} />
                  </div>
                </div>
              </div>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div className="field"><label>Cost per item <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>internal</span></label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)", fontSize: 14 }}>$</span>
                    <input type="number" defaultValue="124" style={{ paddingLeft: 28, width: "100%" }} />
                  </div>
                </div>
                <div className="field"><label>Profit margin</label>
                  <input readOnly value="53.7% · $144 profit" style={{ background: "var(--bg-muted)", color: "var(--success)" }} />
                </div>
              </div>
            </div>

            <div className="edit-card">
              <h3>Variants</h3>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "-8px 0 14px" }}>Add different color or size options — each with its own SKU and stock count.</p>
              {variants.map((v, i) => (
                <div key={i} className="variant-row">
                  <input placeholder="Variant name (e.g. Black)" value={v.name} onChange={e => updateVariant(i, "name", e.target.value)}
                    style={{ height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-elev)", fontSize: 13 }} />
                  <input placeholder="SKU" value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)}
                    style={{ height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-elev)", fontSize: 13, fontFamily: "var(--font-mono)" }} />
                  <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, "stock", Number(e.target.value))}
                    style={{ height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-elev)", fontSize: 13 }} />
                  <button type="button" onClick={() => removeVariant(i)} className="action-icon-btn" aria-label="Remove variant">
                    <IconClose size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="btn btn-outline" style={{ height: 40, fontSize: 13, marginTop: 12 }}>
                <IconPlus size={14} /> Add variant
              </button>
            </div>

            <div className="edit-card">
              <h3>SEO &amp; metadata</h3>
              <div className="field"><label>Page title <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(appears in browser tab)</span></label>
                <input defaultValue="Weekender Leather Duffel Bag — Northline | Jugasaro Store" />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Meta description <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(155 chars max)</span></label>
                <textarea defaultValue="Premium full-grain leather weekender bag from Northline. Built to last, designed for travel. Free shipping over $75." />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>URL handle</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>jugasaro.store/products/</span>
                  <input defaultValue="weekender-leather-duffel-bag" style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="edit-card">
              <h3>Status</h3>
              <div className="field">
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="active">Active — live on store</option>
                  <option value="draft">Draft — hidden</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: status === "active" ? "color-mix(in oklab, var(--success) 12%, transparent)" : "var(--bg-muted)", borderRadius: "var(--radius-md)", fontSize: 12, color: status === "active" ? "var(--success)" : "var(--fg-muted)", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "currentColor" }} />
                {status === "active" ? "This product is visible to all shoppers" : status === "draft" ? "Not visible — only you can see this" : "Archived — hidden from all views"}
              </div>
            </div>

            <div className="edit-card">
              <h3>Organization</h3>
              <div className="field"><label>Tags</label>
                <TagInput tags={tags} onChange={setTags} placeholder="Add tag + Enter" />
              </div>
              <div className="field" style={{ marginTop: 14 }}><label>Collections</label>
                <select multiple size={4} style={{ height: "auto", padding: 8 }}>
                  <option>Best sellers</option>
                  <option>New arrivals</option>
                  <option>Summer sale</option>
                  <option>Gift guide</option>
                  <option>Wholesale eligible</option>
                </select>
              </div>
            </div>

            <div className="edit-card">
              <h3>Shipping</h3>
              <div className="form-grid-2">
                <div className="field"><label>Weight</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input type="number" defaultValue="1.4" style={{ flex: 1 }} />
                    <select style={{ width: 70, height: 46, padding: "0 8px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--bg-elev)", fontSize: 13 }}>
                      <option>kg</option><option>lb</option>
                    </select>
                  </div>
                </div>
                <div className="field"><label>HS code</label>
                  <input defaultValue="4202.91" style={{ fontFamily: "var(--font-mono)" }} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked /> Requires shipping
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 8 }}>
                  <input type="checkbox" /> Eligible for free shipping
                </label>
              </div>
            </div>

            <div className="edit-card" style={{ background: "color-mix(in oklab, var(--danger) 6%, var(--bg-elev))", borderColor: "color-mix(in oklab, var(--danger) 20%, var(--border))" }}>
              <h3 style={{ color: "var(--danger)" }}>Danger zone</h3>
              <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "-8px 0 14px" }}>Permanently remove this product — cannot be undone.</p>
              <button type="button" className="btn btn-outline" style={{ height: 40, fontSize: 13, color: "var(--danger)", borderColor: "var(--danger)" }}>
                Delete product
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProductEditPage />);

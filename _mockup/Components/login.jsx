const { useState } = React;

// Demo credentials
const DEMO_USER = { email: "ana@jugasaro.com", password: "Demo1234!" };
const DEMO_ADMIN = { email: "admin@jugasaro.com", password: "Admin1234!" };

// --- Validation helpers ---
const validateEmail = (e) => {
  if (!e) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email address";
  return null;
};
const passwordStrength = (p) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
};
const validatePassword = (p, strict = false) => {
  if (!p) return "Password is required";
  if (strict) {
    if (p.length < 8) return "At least 8 characters";
    if (!/[A-Z]/.test(p)) return "Include an uppercase letter";
    if (!/\d/.test(p)) return "Include a number";
  }
  return null;
};

// ---------- Field ----------
function Field({ label, error, hint, children }) {
  return (
    <div className={`field ${error ? "error" : ""}`}>
      <label>{label}</label>
      {children}
      {error && <span className="err-msg"><IconAlert size={13} /> {error}</span>}
      {!error && hint && <span className="hint">{hint}</span>}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, autoComplete = "current-password", showStrength = false }) {
  const [show, setShow] = useState(false);
  const strength = showStrength ? passwordStrength(value) : 0;
  return (
    <div>
      <div className="pw-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)} aria-label="Toggle password">
          {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
        </button>
      </div>
      {showStrength && value && (
        <div className={`pw-strength s-${strength}`}>
          <span className="seg"></span>
          <span className="seg"></span>
          <span className="seg"></span>
          <span className="seg"></span>
        </div>
      )}
    </div>
  );
}

// ---------- Icons specific to login ----------
function IconEye({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function IconEyeOff({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function IconAlert({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IconCheck({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconBack({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

// ---------- Login Tab ----------
function LoginTab({ onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const eErr = validateEmail(email); if (eErr) errs.email = eErr;
    const pErr = validatePassword(password); if (pErr) errs.password = pErr;
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        window.location.href = "Admin.html";
      } else if (email === DEMO_USER.email && password === DEMO_USER.password) {
        window.location.href = "Profile.html";
      } else {
        setFormError("Invalid email or password. Try the demo credentials below.");
      }
    }, 500);
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Welcome back</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0 }}>Sign in to your Jugasaro account to continue.</p>
      </div>

      {formError && (
        <div style={{ padding: "10px 14px", background: "color-mix(in oklab, var(--danger) 12%, transparent)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
          <IconAlert size={14} /> {formError}
        </div>
      )}

      <Field label="Email" error={errors.email}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </Field>

      <Field label={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span>Password</span>
          <button type="button" onClick={onForgot} style={{ color: "var(--accent)", fontSize: 13, fontWeight: 500 }}>Forgot password?</button>
        </div>
      } error={errors.password}>
        <PasswordInput value={password} onChange={setPassword} placeholder="Enter your password" />
      </Field>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-muted)", cursor: "pointer" }}>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
        Remember me for 30 days
      </label>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48 }}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="auth-divider">or continue with</div>

      <div className="social-auth">
        <button type="button"><GoogleIcon /> Google</button>
        <button type="button"><AppleIcon /> Apple</button>
      </div>

      <div style={{ marginTop: 8, padding: 14, background: "var(--bg-subtle)", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-md)", fontSize: 12, lineHeight: 1.6, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
        <strong style={{ color: "var(--fg)", fontFamily: "var(--font-sans)" }}>Demo credentials:</strong><br />
        Customer: ana@jugasaro.com / Demo1234!<br />
        Admin: admin@jugasaro.com / Admin1234!
      </div>
    </form>
  );
}

// ---------- Register Tab ----------
function RegisterTab() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    const eErr = validateEmail(email); if (eErr) errs.email = eErr;
    const pErr = validatePassword(password, true); if (pErr) errs.password = pErr;
    if (password !== confirm) errs.confirm = "Passwords don't match";
    if (!terms) errs.terms = "You must accept the terms";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => { window.location.href = "Profile.html"; }, 1600);
    }, 600);
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="success-state">
          <div className="circle"><IconCheck /></div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>Account created!</h2>
          <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: 14 }}>Redirecting you to your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Create an account</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0 }}>Join Jugasaro to save your wishlist and track orders.</p>
      </div>

      <Field label="Full name" error={errors.name}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana García" />
      </Field>

      <Field label="Email" error={errors.email}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>

      <Field label="Password" error={errors.password} hint="8+ chars, with an uppercase letter and a number">
        <PasswordInput value={password} onChange={setPassword} placeholder="Create a password" autoComplete="new-password" showStrength />
      </Field>

      <Field label="Confirm password" error={errors.confirm}>
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter your password" autoComplete="new-password" />
      </Field>

      <div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--fg-muted)", cursor: "pointer", lineHeight: 1.5 }}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--accent)" }} />
          <span>I agree to the <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Terms of Service</a> and <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Privacy Policy</a></span>
        </label>
        {errors.terms && <span className="err-msg" style={{ marginTop: 4 }}><IconAlert size={13} /> {errors.terms}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48 }}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <div className="auth-divider">or sign up with</div>

      <div className="social-auth">
        <button type="button"><GoogleIcon /> Google</button>
        <button type="button"><AppleIcon /> Apple</button>
      </div>
    </form>
  );
}

// ---------- Forgot Password Flow ----------
function ForgotFlow({ onBack }) {
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=new pw, 4=done
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submitEmail = (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    if (eErr) { setErrors({ email: eErr }); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 600);
  };

  const submitCode = (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setErrors({ code: "Enter the 6-digit code" }); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 500);
  };

  const submitPassword = (e) => {
    e.preventDefault();
    const errs = {};
    const pErr = validatePassword(password, true); if (pErr) errs.password = pErr;
    if (password !== confirm) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 600);
  };

  const handleCodeChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) {
      const el = document.getElementById(`code-${i + 1}`);
      if (el) el.focus();
    }
  };
  const handleCodeKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const el = document.getElementById(`code-${i - 1}`);
      if (el) el.focus();
    }
  };

  if (step === 1) {
    return (
      <form className="auth-form" onSubmit={submitEmail} noValidate>
        <button type="button" onClick={onBack} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-muted)", fontSize: 13, fontWeight: 500 }}>
          <IconBack /> Back to sign in
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Forgot your password?</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0 }}>Enter your email and we'll send you a 6-digit recovery code.</p>
        </div>
        <Field label="Email" error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48 }}>
          {loading ? "Sending..." : "Send recovery code"}
        </button>
      </form>
    );
  }

  if (step === 2) {
    return (
      <form className="auth-form" onSubmit={submitCode} noValidate>
        <button type="button" onClick={() => setStep(1)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-muted)", fontSize: 13, fontWeight: 500 }}>
          <IconBack /> Back
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Check your email</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0 }}>We sent a 6-digit code to <strong style={{ color: "var(--fg)" }}>{email}</strong>. It expires in 10 minutes.</p>
        </div>

        <div className={`field ${errors.code ? "error" : ""}`}>
          <label>Recovery code</label>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {code.map((c, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKey(i, e)}
                style={{ width: "100%", textAlign: "center", fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)", height: 56, padding: 0 }}
              />
            ))}
          </div>
          {errors.code && <span className="err-msg"><IconAlert size={13} /> {errors.code}</span>}
          <span className="hint">Hint: in this demo, any 6-digit code works</span>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48 }}>
          {loading ? "Verifying..." : "Verify code"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
          Didn't get it? <button type="button" style={{ color: "var(--accent)", fontWeight: 500 }}>Resend code</button>
        </p>
      </form>
    );
  }

  if (step === 3) {
    return (
      <form className="auth-form" onSubmit={submitPassword} noValidate>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Create a new password</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0 }}>Choose a strong password you haven't used before.</p>
        </div>

        <Field label="New password" error={errors.password} hint="8+ chars, with an uppercase letter and a number">
          <PasswordInput value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" showStrength />
        </Field>

        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" autoComplete="new-password" />
        </Field>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48 }}>
          {loading ? "Saving..." : "Reset password"}
        </button>
      </form>
    );
  }

  return (
    <div className="auth-form">
      <div className="success-state">
        <div className="circle"><IconCheck /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>Password reset!</h2>
        <p style={{ color: "var(--fg-muted)", margin: "0 0 24px", fontSize: 14 }}>Your password has been successfully updated. You can now sign in with your new password.</p>
        <button className="btn btn-primary" onClick={onBack} style={{ height: 44, padding: "0 24px" }}>Back to sign in</button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
function AppleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>;
}

// ---------- App ----------
function App() {
  const [tab, setTab] = useState("signin");
  const [mode, setMode] = useState("tabs"); // "tabs" or "forgot"

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem("jugasaro-theme") || "light");
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jugasaro-theme", theme);
  }, [theme]);

  return (
    <div className="auth-split">
      <div className="auth-side">
        <div className="placeholder" style={{ background: "linear-gradient(135deg, oklch(26% 0.14 300), oklch(18% 0.08 280))" }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            <circle cx="20%" cy="30%" r="180" fill="oklch(60% 0.25 320 / 0.3)" filter="blur(60px)"/>
            <circle cx="80%" cy="75%" r="220" fill="oklch(55% 0.22 280 / 0.35)" filter="blur(80px)"/>
          </svg>
        </div>

        <div className="as-content" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="Jugasaro Store.html" style={{ color: "white", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "white", color: "oklch(20% 0.06 300)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>J</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em" }}>Jugasaro Store</span>
          </a>
        </div>

        <div className="as-content">
          <h2>Curated goods,<br/>delivered with care.</h2>
          <p>Shop 100+ trusted brands across 12 categories. Free shipping over $60, 30-day returns, and rewards on every order.</p>
        </div>

        <div className="as-content" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "white" }}>100+</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Partner brands</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "white" }}>24k</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Happy customers</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "white" }}>4.9★</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Average rating</div>
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, maxWidth: 420, margin: "0 auto 30px", width: "100%" }}>
          <a href="Jugasaro Store.html" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-muted)", fontSize: 13, fontWeight: 500 }}>
            <IconBack /> Back to store
          </a>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} className="action-icon-btn" aria-label="Toggle theme">
            {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </div>

        {mode === "tabs" && (
          <div style={{ maxWidth: 420, margin: "0 auto", width: "100%" }}>
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => setTab("signin")}>Sign in</button>
              <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Create account</button>
            </div>
          </div>
        )}

        {mode === "tabs" && tab === "signin" && <LoginTab onForgot={() => setMode("forgot")} />}
        {mode === "tabs" && tab === "register" && <RegisterTab />}
        {mode === "forgot" && <ForgotFlow onBack={() => setMode("tabs")} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

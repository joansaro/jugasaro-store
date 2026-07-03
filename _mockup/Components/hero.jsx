/* Hero carousel — full-viewport banner with dots, arrows, counter, auto-advance. */

function Hero() {
  const [idx, setIdx] = React.useState(0);
  const total = HERO_SLIDES.length;

  React.useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % total), 6000);
    return () => clearTimeout(t);
  }, [idx, total]);

  const go = (n) => setIdx(((n % total) + total) % total);

  return (
    <section className="hero" id="home">
      <div className="hero-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {HERO_SLIDES.map((s, i) => (
          <div className="hero-slide" key={i}>
            <div className="hero-bg">
              <DarkPlaceholder hue={s.hue} tone={s.tone} label={s.phLabel} className="hero-ph" />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, oklch(10% 0.03 " + s.hue + " / 0.85) 0%, oklch(15% 0.04 " + s.hue + " / 0.55) 50%, oklch(15% 0.04 " + s.hue + " / 0.2) 100%)",
              }} />
            </div>
            <div className="container hero-content">
              <div className="hero-eyebrow">{s.eyebrow}</div>
              <h1>{s.title}</h1>
              <p className="hero-sub">{s.sub}</p>
              <div className="hero-cta-row">
                <a href="#store" className="btn btn-primary">
                  {s.cta} <IconArrowRight size={16} />
                </a>
                <a href="#brands" className="btn btn-ghost">{s.alt}</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-controls container">
        <div className="hero-dots" role="tablist">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === idx ? "active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="hero-counter">
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="hero-arrows">
            <button className="hero-arrow" onClick={() => go(idx - 1)} aria-label="Previous slide">
              <IconArrowLeft size={18} />
            </button>
            <button className="hero-arrow" onClick={() => go(idx + 1)} aria-label="Next slide">
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });

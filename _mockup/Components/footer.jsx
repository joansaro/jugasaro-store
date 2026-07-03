/* Footer + floating buttons */

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-mark">J</div>
            <h4>Jugasaro Store</h4>
            <p>A curated marketplace of 100+ brands and 1,000+ products — built for everyday shoppers and wholesale partners alike.</p>
            <div className="socials">
              <a href="#ig" className="social-icon" aria-label="Instagram"><IconInstagram size={16} /></a>
              <a href="#fb" className="social-icon" aria-label="Facebook"><IconFacebook size={16} /></a>
              <a href="#tw" className="social-icon" aria-label="Twitter / X"><IconTwitter size={16} /></a>
              <a href="#yt" className="social-icon" aria-label="YouTube"><IconYoutube size={16} /></a>
              <a href="#tt" className="social-icon" aria-label="TikTok"><IconTiktok size={16} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Shop</h5>
            <ul>
              <li><a href="Shop.html?sort=new">New arrivals</a></li>
              <li><a href="Shop.html?sort=best">Best sellers</a></li>
              <li><a href="Shop.html?sort=sale">On sale</a></li>
              <li><a href="Brands.html">All brands</a></li>
              <li><a href="Categories.html">Categories</a></li>
              <li><a href="Wishlist.html">My wishlist</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><a href="Contact.html">Contact us</a></li>
              <li><a href="Profile.html">My account</a></li>
              <li><a href="Cart.html">My cart</a></li>
              <li><a href="Login.html">Sign in / Register</a></li>
              <li><a href="Profile.html#orders">Track your order</a></li>
              <li><a href="Contact.html">FAQ &amp; help</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#about">About Jugasaro</a></li>
              <li><a href="#wholesale">Wholesale / B2B</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press &amp; media</a></li>
              <li><a href="#affiliate">Affiliate program</a></li>
              <li><a href="#sustain">Sustainability</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Stay in the loop</h5>
            <p style={{ fontSize: 13, color: "oklch(72% 0.01 300)", margin: "0 0 14px", lineHeight: 1.6 }}>
              New drops, early access and members-only offers. No spam.
            </p>
            <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="your@email.com" aria-label="Email address" />
              <button type="submit">Join</button>
            </form>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "oklch(70% 0.01 300)" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <IconMail size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>hello@jugasaro.store</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <IconPhone size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>+1 (555) 284-0411</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 Jugasaro Store. All rights reserved.</div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="#privacy" style={{ color: "oklch(70% 0.01 300)", fontSize: 12 }}>Privacy</a>
            <a href="#terms" style={{ color: "oklch(70% 0.01 300)", fontSize: 12 }}>Terms</a>
            <a href="#cookies" style={{ color: "oklch(70% 0.01 300)", fontSize: 12 }}>Cookies</a>
          </div>
          <div className="payments">
            <span className="pay-chip">VISA</span>
            <span className="pay-chip">MC</span>
            <span className="pay-chip">AMEX</span>
            <span className="pay-chip">PAYPAL</span>
            <span className="pay-chip">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatButtons() {
  const [showTop, setShowTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="float-stack">
      <button
        className={`float-btn top ${showTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <IconArrowUp size={20} />
      </button>
      <a
        href="https://wa.me/15552840411?text=Hi%20Jugasaro!"
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn whatsapp"
        aria-label="Contact us on WhatsApp"
      >
        <IconWhatsapp size={26} />
        <span className="wa-tooltip">Chat with us</span>
      </a>
    </div>
  );
}

Object.assign(window, { Footer, FloatButtons });

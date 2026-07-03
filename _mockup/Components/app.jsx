/* App entry — wires everything together, manages theme */

function App() {
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

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <Navbar theme={theme} onThemeToggle={toggleTheme} onOpenMobile={() => setMobileOpen(true)} activePage="home" />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main>
        <Hero />
        <BestSelling />
        <Categories />
        <NewArrivals />
        <Promotions />
        <TrendingDeals />
        <ThinBanner />
        <OurBrands />
        <Locations />
      </main>

      <Footer />
      <FloatButtons />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

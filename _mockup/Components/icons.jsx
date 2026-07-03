/* Lucide-inspired SVG icons — single stroke, 1.75 width */
const Ico = ({ size = 18, stroke = 1.75, children, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

const IconSearch = (p) => <Ico {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Ico>;
const IconHeart = (p) => <Ico {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></Ico>;
const IconCart = (p) => <Ico {...p}><path d="M3 3h2l.5 3M7 13h11l3-8H5.5" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></Ico>;
const IconUser = (p) => <Ico {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Ico>;
const IconMenu = (p) => <Ico {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Ico>;
const IconClose = (p) => <Ico {...p}><path d="M6 6l12 12M18 6 6 18" /></Ico>;
const IconArrowRight = (p) => <Ico {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Ico>;
const IconArrowLeft = (p) => <Ico {...p}><path d="M19 12H5M11 5l-7 7 7 7" /></Ico>;
const IconArrowUp = (p) => <Ico {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Ico>;
const IconChevronRight = (p) => <Ico {...p}><path d="m9 18 6-6-6-6" /></Ico>;
const IconChevronDown = (p) => <Ico {...p}><path d="m6 9 6 6 6-6" /></Ico>;
const IconSun = (p) => <Ico {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Ico>;
const IconMoon = (p) => <Ico {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Ico>;
const IconMapPin = (p) => <Ico {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Ico>;
const IconPhone = (p) => <Ico {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Ico>;
const IconClock = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico>;
const IconMail = (p) => <Ico {...p}><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3 6 9 7 9-7" /></Ico>;
const IconPlus = (p) => <Ico {...p}><path d="M12 5v14M5 12h14" /></Ico>;
const IconWhatsapp = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1s-.7.9-.8 1-.3.2-.6 0c-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2s0-.3.1-.4l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7 1.8 2.8 4.5 3.9c.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2zm5.9 14.3a8.2 8.2 0 0 1-12.6-1l-.3-.5-2.9.8.8-2.8-.3-.5a8.2 8.2 0 1 1 15.3-.4 8.2 8.2 0 0 1 0 4.4z"/>
  </svg>
);
const IconInstagram = (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></Ico>;
const IconFacebook = (p) => <Ico {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Ico>;
const IconTwitter = (p) => <Ico {...p}><path d="M18 3 13 11l6 10h-4l-4-7-5 7H3l7-10L3.5 3H8l3.5 6z" /></Ico>;
const IconYoutube = (p) => <Ico {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="3" /><path d="M10 9v6l5-3z" fill="currentColor" stroke="none" /></Ico>;
const IconTiktok = (p) => <Ico {...p}><path d="M13 3v12a3 3 0 1 1-3-3" /><path d="M13 3c0 3 2 5 5 5" /></Ico>;
const IconTruck = (p) => <Ico {...p}><rect x="1" y="6" width="14" height="10" rx="1" /><path d="M15 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" /></Ico>;
const IconShield = (p) => <Ico {...p}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" /></Ico>;
const IconGift = (p) => <Ico {...p}><rect x="3" y="8" width="18" height="13" rx="1.5" /><path d="M3 13h18M12 8v13" /><path d="M12 8c-2 0-4-1-4-3s2-2 3-1 1 4 1 4zM12 8c2 0 4-1 4-3s-2-2-3-1-1 4-1 4z" /></Ico>;
const IconPercent = (p) => <Ico {...p}><path d="m5 19 14-14" /><circle cx="7.5" cy="7.5" r="2" /><circle cx="16.5" cy="16.5" r="2" /></Ico>;

Object.assign(window, {
  Ico, IconSearch, IconHeart, IconCart, IconUser, IconMenu, IconClose,
  IconArrowRight, IconArrowLeft, IconArrowUp, IconChevronRight, IconChevronDown,
  IconSun, IconMoon, IconMapPin, IconPhone, IconClock, IconMail, IconPlus,
  IconWhatsapp, IconInstagram, IconFacebook, IconTwitter, IconYoutube, IconTiktok,
  IconTruck, IconShield, IconGift, IconPercent,
});

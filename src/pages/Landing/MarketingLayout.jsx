import { useState } from "react";
import { FiArrowRight, FiPhone, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import "./Landing.css";

// Shared chrome for every marketing page — topbar, nav, footer,
// floating WhatsApp button. The actual page content slots between
// nav and footer via {children}.
export default function MarketingLayout({ onGoto, currentPath, children }) {
  return (
    <div className="ln">
      <Topbar />
      <Nav onGoto={onGoto} currentPath={currentPath} />
      {children}
      <Footer onGoto={onGoto} />
      <FloatingWhatsApp />
    </div>
  );
}

function Topbar() {
  return (
    <div className="ln-topbar">
      <div className="ln-container ln-topbar-inner">
        <span className="ln-topbar-badge">
          <span className="ln-topbar-dot" /> Powered by Official WhatsApp APIs, Meta Ads & AI ⚡
        </span>
        <div className="ln-topbar-right">
          <a href="tel:+919594686906"><FiPhone /> Sales: +91 9594 686 906</a>
          <a href="https://wa.me/919594686906" className="ln-topbar-wa"><FaWhatsapp /> Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

function Nav({ onGoto, currentPath }) {
  const [open, setOpen] = useState(false);
  const LINKS = [
    { to: "/",         label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/pricing",  label: "Pricing" },
    { to: "/compare",  label: "Compare" },
    { to: "/api-docs", label: "Developer API" },
    { to: "/contact",  label: "Contact" },
  ];
  return (
    <header className="ln-nav">
      <div className="ln-container ln-nav-inner">
        <a href="/" className="ln-brand" onClick={(e) => { e.preventDefault(); onGoto("/"); }}>
          <span className="ln-brand-lead">Lead</span><span className="ln-brand-nator">nator</span>
        </a>

        <nav className={`ln-links ${open ? "open" : ""}`}>
          {LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={currentPath === l.to ? "active" : ""}
              onClick={(e) => { e.preventDefault(); onGoto(l.to); setOpen(false); }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ln-nav-cta">
          <button className="ln-btn ln-btn-ghost" onClick={() => onGoto("/login")}>Sign in</button>
          <button className="ln-btn ln-btn-primary" onClick={() => onGoto("/signup")}>
            Start FREE Trial <FiArrowRight />
          </button>
        </div>

        <button className="ln-nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <FiChevronDown />
        </button>
      </div>
    </header>
  );
}

function Footer({ onGoto }) {
  const safeNav = (path) => (e) => { e.preventDefault(); onGoto(path); };
  return (
    <footer className="ln-footer">
      <div className="ln-container ln-footer-grid">
        <div>
          <a href="/" className="ln-brand ln-brand-light" onClick={safeNav("/")}>
            <span className="ln-brand-lead">Lead</span><span className="ln-brand-nator">nator</span>
          </a>
          <p className="ln-footer-mission">
            The all-in-one AI growth platform — WhatsApp Cloud API, Meta Ads, Email
            Marketing, Leads CRM, File Storage, Calendar and 20+ AI tools on one login.
          </p>
          <div className="ln-footer-social">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://wa.me/919594686906" aria-label="WhatsApp"><FaWhatsapp /></a>
          </div>
          <div className="ln-footer-badges">
            <span>🏆 Meta Business Partner</span>
            <span>✨ Featured in The Indian Express</span>
            <span>🔐 SOC-2 ready infrastructure</span>
          </div>
        </div>

        <FooterCol
          title="Product"
          onGoto={onGoto}
          items={[
            { label: "Features",      to: "/features" },
            { label: "Pricing",       to: "/pricing" },
            { label: "Compare",       to: "/compare" },
            { label: "WhatsApp API",  to: "/features#whatsapp" },
            { label: "Meta Ads",      to: "/features#meta" },
            { label: "Email Marketing", to: "/features#email" },
            { label: "AI Studio",     to: "/features#ai" },
          ]}
        />
        <FooterCol
          title="Resources"
          onGoto={onGoto}
          items={[
            { label: "Documentation", to: "/contact" },
            { label: "API Reference", to: "/contact" },
            { label: "FAQ",           to: "/faq" },
            { label: "Status",        to: "/contact" },
            { label: "Support",       to: "/contact" },
            { label: "Blog",          to: "/contact" },
          ]}
        />
        <FooterCol
          title="Company"
          onGoto={onGoto}
          items={[
            { label: "About",         to: "/contact" },
            { label: "Careers",       to: "/contact" },
            { label: "Contact",       to: "/contact" },
            { label: "Privacy",       to: "/contact" },
            { label: "Terms",         to: "/contact" },
          ]}
        />
      </div>

      <div className="ln-container ln-footer-bottom">
        <span>© {new Date().getFullYear()} Leadnator. Made with ❤️ in India.</span>
        <span className="ln-footer-regions">India · Singapore · UAE · USA</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items, onGoto }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map((i) => (
          <li key={i.label}>
            <a href={i.to} onClick={(e) => { e.preventDefault(); onGoto(i.to); }}>{i.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingWhatsApp() {
  return (
    <a className="ln-float-wa" href="https://wa.me/919594686906" aria-label="Chat on WhatsApp">
      <FaWhatsapp />
    </a>
  );
}

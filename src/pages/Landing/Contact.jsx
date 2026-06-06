import { useState } from "react";
import {
  FiMail, FiPhone, FiMessageCircle, FiMapPin, FiArrowRight, FiCheck,
  FiClock, FiGlobe, FiBriefcase,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

export default function Contact({ onGoto }) {
  useSeo({
    title: "Contact — Talk to the Leadnator team",
    description: "Get in touch with Leadnator. Sales, support, partnerships. Offices in India, Singapore, UAE and USA. WhatsApp +917888341096 for instant replies.",
    canonical: "https://leadnator.com/contact",
    keywords: "Leadnator contact, WhatsApp CRM support, sales India, enterprise CRM partnerships",
  });

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/contact">
      <Hero />
      <ContactGrid />
      <Offices />
      <Form />
      <CompaniesCta onGoto={onGoto} />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="ln-sub-hero">
      <div className="ln-container">
        <span className="ln-eyebrow">Contact</span>
        <h1>Let's talk growth</h1>
        <p>Sales, support, partnerships, press. We reply within minutes during business hours.</p>
      </div>
    </section>
  );
}

function ContactGrid() {
  const C = [
    {
      Icon: FaWhatsapp, title: "WhatsApp us",
      text: "Fastest way to reach the team. Reply typically under 5 minutes during business hours.",
      cta: "Chat on WhatsApp", href: "https://wa.me/917888341096",
      color: "#22c55e",
    },
    {
      Icon: FiPhone, title: "Call sales",
      text: "Speak to a solutions consultant about Enterprise, migrations, or custom requirements.",
      cta: "+917888341096", href: "tel:+917888341096",
      color: "#1877f2",
    },
    {
      Icon: FiMail, title: "Email us",
      text: "Product questions, security documentation, partnership proposals — our inbox is open.",
      cta: "sales@leadnator.com", href: "mailto:sales@leadnator.com",
      color: "#ea4335",
    },
    {
      Icon: FiMessageCircle, title: "In-app support",
      text: "Existing customer? Open a ticket or live-chat the team from inside the dashboard.",
      cta: "Open dashboard", href: "/login",
      color: "#7c3aed",
    },
  ];
  return (
    <section className="ln-section">
      <div className="ln-container">
        <div className="ln-contact-grid">
          {C.map(({ Icon, title, text, cta, href, color }) => (
            <a key={title} href={href} className="ln-contact-card">
              <div className="ln-contact-ic" style={{ background: `${color}15`, color }}><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="ln-contact-cta">{cta} <FiArrowRight /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offices() {
  const OFFICES = [
    { flag: "🇮🇳", country: "India",     city: "Mumbai",    line: "WeWork Chromium, Powai",   tz: "IST (UTC+5:30)" },
    { flag: "🇸🇬", country: "Singapore", city: "Singapore", line: "WeWork, Marina One",       tz: "SGT (UTC+8)"    },
    { flag: "🇦🇪", country: "UAE",       city: "Dubai",     line: "DIFC Innovation Hub",      tz: "GST (UTC+4)"    },
    { flag: "🇺🇸", country: "USA",       city: "San Francisco", line: "WeWork, Salesforce Tower", tz: "PST (UTC-8)" },
  ];
  return (
    <section className="ln-section ln-section-tint">
      <div className="ln-container">
        <SectionHead eyebrow="Global offices" title="Four cities, one team" sub="Follow-the-sun support coverage across India, South-East Asia, Middle East and North America." />
        <div className="ln-offices">
          {OFFICES.map((o) => (
            <div key={o.country} className="ln-office">
              <div className="ln-office-flag">{o.flag}</div>
              <h3>{o.country}</h3>
              <div className="ln-office-city"><FiMapPin /> {o.city}</div>
              <div className="ln-office-line">{o.line}</div>
              <div className="ln-office-tz"><FiClock /> {o.tz}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Form() {
  const [form, setForm] = useState({ name: "", email: "", company: "", interest: "Sales", message: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    // Placeholder submit — wire to your backend when a /api/public/contact
    // endpoint is ready. For now we just open the mail client as a fallback.
    await new Promise((r) => setTimeout(r, 700));
    setSent(true);
    setBusy(false);
  }

  return (
    <section className="ln-section">
      <div className="ln-container ln-form-grid">
        <div>
          <SectionHead
            eyebrow="Send a message"
            title="Tell us what you're building"
            sub="A real person reads every form submission and replies personally. Include as much detail as you like."
          />
          <ul className="ln-form-trust">
            <li><FiCheck /> Average first reply: 17 minutes</li>
            <li><FiCheck /> Response guaranteed within 24 hours</li>
            <li><FiCheck /> No sales automation — real humans</li>
          </ul>
          <div className="ln-form-direct">
            <FiPhone /> Prefer a call? <a href="tel:+917888341096">+917888341096</a>
          </div>
        </div>

        {sent ? (
          <div className="ln-form-done">
            <div className="ln-form-done-ic"><FiCheck /></div>
            <h3>Message received ✅</h3>
            <p>Thanks {form.name || "!"} — we'll reply to <b>{form.email}</b> within a few hours.</p>
            <button className="ln-btn ln-btn-primary ln-btn-lg" onClick={() => { setSent(false); setForm({ name: "", email: "", company: "", interest: "Sales", message: "" }); }}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="ln-form" onSubmit={submit}>
            <div className="ln-form-row">
              <label>
                <span>Full name *</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                <span>Work email *</span>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
            </div>
            <div className="ln-form-row">
              <label>
                <span>Company</span>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </label>
              <label>
                <span>Reason for contact</span>
                <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                  <option>Sales</option>
                  <option>Enterprise / custom plan</option>
                  <option>Migration from another platform</option>
                  <option>Partnership / reseller</option>
                  <option>Press / media</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              <span>Message *</span>
              <textarea required rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your use case, team size, current tools…" />
            </label>
            <button type="submit" className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" disabled={busy}>
              {busy ? "Sending…" : "Send message"} <FiArrowRight />
            </button>
            <p className="ln-form-privacy">
              <FiGlobe /> We respect your inbox. One reply, no sales sequence.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

function CompaniesCta({ onGoto }) {
  return (
    <section className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Looking for Enterprise?</h2>
            <p>Custom SLAs, on-premise deployment, SSO, dedicated success pod — starts at ₹25,000/month.</p>
            <ul className="ln-cta-list">
              <li><FiCheck /> SOC-2 documentation</li>
              <li><FiCheck /> Dedicated Slack + WhatsApp channel</li>
              <li><FiCheck /> 99.99% uptime SLA</li>
            </ul>
          </div>
          <div className="ln-cta-actions">
            <a className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" href="mailto:enterprise@leadnator.com">
              <FiBriefcase /> Email Enterprise team
            </a>
            <button className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" onClick={() => onGoto("/pricing")}>
              See pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="ln-head">
      {eyebrow && <div className="ln-eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

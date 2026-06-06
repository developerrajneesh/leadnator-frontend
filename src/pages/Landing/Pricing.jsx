import { useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiStar, FiAward, FiHelpCircle, FiZap, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

/* ==========================================================
   Marketing Pricing page — mirrors the dashboard's
   /pricing/plans view (same plan data, same duration toggle,
   same discount math). CTAs route unauthed visitors to
   /signup instead of opening Razorpay.
   ========================================================== */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function Pricing({ onGoto }) {
  useSeo({
    title: "Pricing — Simple plans with zero setup fees",
    description: "Transparent pricing for Leadnator's WhatsApp, Meta Ads, Email and CRM platform. Monthly, quarterly, 6-month and yearly billing with up to 15% savings.",
    canonical: "https://leadnator.com/pricing",
    keywords: "Leadnator pricing, WhatsApp API pricing, CRM pricing India, marketing platform cost",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Leadnator — AI Growth CRM",
      description: "All-in-one CRM with WhatsApp Cloud API, Meta Ads, Email, pipelines, storage, calendar and AI Studio.",
      brand: { "@type": "Brand", name: "Leadnator" },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: "0",
        highPrice: "4999",
        offerCount: "3",
        url: "https://leadnator.com/pricing",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1240",
      },
    },
  });

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/pricing">
      <Hero />
      <Plans onGoto={onGoto} />
      <Terms />
      <Enterprise onGoto={onGoto} />
      <FaqSlice />
    </MarketingLayout>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="ln-sub-hero">
      <div className="ln-container">
        <span className="ln-eyebrow">Pricing</span>
        <h1>Simple pricing with zero setup fees</h1>
        <p>
          Pay for what you actually use. No hidden template markups. No per-seat
          games. Start on Starter, upgrade the day you hit a limit.
        </p>
      </div>
    </section>
  );
}

/* ---------- PLANS (live data from /api/public/plans) ---------- */
function Plans({ onGoto }) {
  const [plans, setPlans] = useState([]);
  const [durations, setDurations] = useState([]);
  const [durId, setDurId] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/public/plans`)
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.plans || []);
        setDurations(data.durations || []);
      })
      .catch((e) => setError(e.message || "Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const duration = durations.find((d) => d.id === durId);

  function priceFor(plan) {
    if (!duration) return { base: plan.price, after: plan.price };
    const base  = plan.price * duration.multiplier;
    const after = Math.round(base * (1 - duration.discount));
    return { base, after };
  }

  if (loading) {
    return (
      <section className="ln-section">
        <div className="ln-container" style={{ textAlign: "center", padding: 60, color: "var(--ln-muted)" }}>
          Loading plans…
        </div>
      </section>
    );
  }
  if (error || plans.length === 0) {
    return (
      <section className="ln-section">
        <div className="ln-container" style={{ textAlign: "center", padding: 60, color: "#b91c1c" }}>
          {error || "No plans available. Please contact sales."}
        </div>
      </section>
    );
  }

  return (
    <section className="ln-section">
      <div className="ln-container">
        {/* Duration toggle — identical set as the dashboard version */}
        <div className="ln-dur-toggle">
          {durations.map((d) => (
            <button
              key={d.id}
              className={durId === d.id ? "active" : ""}
              onClick={() => setDurId(d.id)}
            >
              {d.label}
              {d.discount > 0 && (
                <span className="ln-save-pill">SAVE {Math.round(d.discount * 100)}%</span>
              )}
            </button>
          ))}
        </div>

        <div className="ln-pub-price-grid">
          {plans.map((p) => {
            const { base, after } = priceFor(p);
            const perMonth = duration ? Math.round(after / duration.multiplier) : p.price;
            return (
              <div
                key={p.id || p.key || p.name}
                className={`ln-pub-price ${p.popular ? "popular" : ""}`}
              >
                {p.popular && (
                  <div className="ln-pub-badge popular">
                    <FiStar /> MOST POPULAR
                  </div>
                )}
                {duration?.bestValue && (
                  <div className="ln-pub-badge best">
                    <FiAward /> BEST VALUE
                  </div>
                )}
                <h3>{p.name}</h3>
                <p className="ln-pub-tagline">{p.tagline || ""}</p>
                <div className="ln-pub-price-amount">
                  <span className="ln-pub-price-num">₹{perMonth.toLocaleString("en-IN")}</span>
                  <span className="ln-pub-price-per">/mo</span>
                  {duration?.discount > 0 && (
                    <span className="ln-pub-price-old">
                      ₹{Math.round(base / duration.multiplier).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="ln-pub-price-note">
                  Billed ₹{after.toLocaleString("en-IN")} for{" "}
                  {duration?.months} {duration?.months === 1 ? "month" : "months"}
                </div>

                <button
                  className={`ln-pub-cta ${p.popular ? "primary" : "outline"}`}
                  onClick={() => onGoto("/signup")}
                >
                  {p.popular ? "Get started" : "Choose plan"}
                </button>

                <ul className="ln-pub-feat-list">
                  {(p.features || []).map((f) => (
                    <li key={f}><FiCheck /> {f}</li>
                  ))}
                  {(p.disabled || []).map((f) => (
                    <li key={f} className="disabled"><FiX /> {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- WA CONVERSATION PRICING TERMS ---------- */
function Terms() {
  const TERMS = [
    { tag: "Marketing",      color: "#ec4899", rate: "₹0.80",  desc: "Promotional messages, offers, product updates — charged per 24-hour conversation window, zero markup from Meta's rates." },
    { tag: "Utility",        color: "#7c3aed", rate: "₹0.125", desc: "Transactional updates like order confirmations, payment receipts, appointment reminders." },
    { tag: "Authentication", color: "#0ea5e9", rate: "₹0.125", desc: "OTPs and login confirmations. Per-message pricing applies to template sends." },
    { tag: "Service",        color: "#22c55e", rate: "FREE",   desc: "User-initiated conversations within a 24-hour service window are free. Unlimited." },
  ];
  return (
    <section className="ln-section ln-section-soft">
      <div className="ln-container">
        <SectionHead
          eyebrow="WhatsApp conversation pricing"
          title="Meta's rates, passed through at cost"
          sub="We don't mark up WhatsApp conversations. You pay exactly what Meta bills us. No per-template fees, no hidden charges."
        />
        <div className="ln-terms">
          {TERMS.map((t) => (
            <div key={t.tag} className="ln-term">
              <span className="ln-term-tag" style={{ background: `${t.color}20`, color: t.color }}>{t.tag}</span>
              <div className="ln-term-rate">{t.rate}</div>
              <div className="ln-term-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ENTERPRISE ---------- */
function Enterprise({ onGoto }) {
  return (
    <section className="ln-section">
      <div className="ln-container">
        <div className="ln-enterprise">
          <div>
            <span className="ln-eyebrow"><FiZap /> Enterprise</span>
            <h2>Need more? We scale with you.</h2>
            <p>
              On-premise deployment, SOC-2 compliance docs, SSO / SAML, custom
              contract terms, dedicated success pod. Starts at ₹25,000/month.
            </p>
            <ul className="ln-enterprise-list">
              <li><FiCheck /> Custom SLAs including 99.99% uptime</li>
              <li><FiCheck /> SSO (SAML 2.0) and SCIM provisioning</li>
              <li><FiCheck /> On-premise / VPC deployment</li>
              <li><FiCheck /> Annual security audits</li>
              <li><FiCheck /> Dedicated Slack channel + pod</li>
            </ul>
          </div>
          <div className="ln-enterprise-cta">
            <button className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" onClick={() => onGoto("/contact")}>
              Talk to sales <FiArrowRight />
            </button>
            <a className="ln-btn ln-btn-outline ln-btn-lg ln-btn-block" href="https://wa.me/917888341096">
              <FaWhatsapp /> WhatsApp sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ slice ---------- */
function FaqSlice() {
  const F = [
    { q: "Is there a minimum credit balance?",   a: "No. There's no minimum. Your WhatsApp API stops when your wallet hits ₹0 and resumes instantly once you top up." },
    { q: "Can I cancel anytime?",                a: "Yes. Monthly plans can be cancelled with no questions asked. Yearly plans are refundable pro-rata within 14 days." },
    { q: "Do you charge per template?",          a: "Never. We don't mark up templates. Meta bills you for conversations at their published rate; we pass that through at cost." },
    { q: "What about taxes?",                    a: "Indian customers are charged 18% GST. International plans are tax-exclusive." },
    { q: "Can I switch between monthly and yearly?", a: "Yes. Switch anytime — we pro-rate the difference automatically and credit your wallet." },
  ];
  return (
    <section className="ln-section">
      <div className="ln-container ln-faq-wrap">
        <SectionHead eyebrow="FAQs" title="Common pricing questions" />
        <div className="ln-faq">
          {F.map((f, i) => (
            <div key={i} className="ln-faq-item open">
              <div className="ln-faq-q"><FiHelpCircle style={{ color: "var(--ln-green-600)" }} /> {f.q}</div>
              <div className="ln-faq-a">{f.a}</div>
            </div>
          ))}
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

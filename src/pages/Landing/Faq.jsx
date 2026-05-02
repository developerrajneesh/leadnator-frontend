import { useMemo, useState } from "react";
import { FiSearch, FiChevronDown, FiHelpCircle, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

const FAQS = [
  // Getting started
  { cat: "Getting started", q: "What does Leadnator do?",                     a: "Leadnator is an all-in-one CRM and growth platform. One login gives you WhatsApp Cloud API with an AI chatbot, Meta Ads manager, email marketing with your own SMTP, a leads pipeline, file storage in your own S3 bucket, a booking calendar, 20+ AI tools and an in-app support system." },
  { cat: "Getting started", q: "How do I sign up?",                            a: "Click \"Start FREE Trial\" on any page and fill in your name, email and password. You'll land in the app in under 30 seconds. No credit card required for the 14-day trial." },
  { cat: "Getting started", q: "How long does setup take?",                    a: "About 12 minutes end-to-end. Embedded Signup creates your WhatsApp Business Account and issues a permanent token in one popup. Meta Ads connects with a single OAuth. Your S3 bucket and SMTP are one-field each." },
  { cat: "Getting started", q: "Can I see a demo first?",                      a: "Absolutely. Click \"Book a demo\" or WhatsApp us at +91 9594 686 906 — we'll walk you through the full platform live." },
  { cat: "Getting started", q: "Do I need technical skills?",                  a: "No. Every feature is no-code — drag-and-drop chatbot, visual flow builder, click-to-configure integrations. Most customers are marketers and founders, not engineers." },

  // WhatsApp
  { cat: "WhatsApp", q: "Is Leadnator an Official WhatsApp Business Partner?", a: "Yes. Leadnator is built on the official WhatsApp Business Cloud API from Meta. We are a registered Meta Business Partner." },
  { cat: "WhatsApp", q: "Can I use my existing WhatsApp number?",              a: "Yes. If your number is already on WhatsApp Business API, we migrate it in under 30 minutes. If not, our Embedded Signup provisions a new one." },
  { cat: "WhatsApp", q: "Can I get the blue tick verification?",               a: "Yes. As a Meta Business Partner we help submit your blue-tick application once your WABA is registered. Approval timelines depend on Meta." },
  { cat: "WhatsApp", q: "How does the pricing work?",                          a: "You pay Meta's published per-conversation rates directly through your wallet. Marketing ₹0.80, Utility ₹0.125, Authentication ₹0.125, Service conversations FREE. We don't add a markup on templates." },
  { cat: "WhatsApp", q: "Can I run multiple WhatsApp numbers?",                a: "Yes. The Pro plan supports unlimited numbers/channels. Growth supports up to 3. Each number has its own broadcast quota and routing rules." },

  // Meta Ads
  { cat: "Meta Ads", q: "Can I create Meta Ads from inside Leadnator?",        a: "Yes. The campaign wizard covers Lead Gen, Traffic, Conversions, Engagement and Messages objectives. You connect your ad account via OAuth — we call the Marketing API on your behalf." },
  { cat: "Meta Ads", q: "How do Meta Lead Ads flow in?",                       a: "Every lead-form submission on Facebook or Instagram arrives in Leadnator through a page-level webhook. Your CRM captures name, email, phone, ad attribution and any custom fields — in real time." },
  { cat: "Meta Ads", q: "Can I see ad spend and conversions per campaign?",    a: "Yes. Real-time analytics show spend, CPC, CPM, CTR, conversions and CPL per ad, adset and campaign — refreshed every 5 minutes." },

  // Email
  { cat: "Email", q: "Do you provide email delivery?",                         a: "No — and that's by design. You plug in your own SMTP (Amazon SES, Gmail, SendGrid, Postmark, anything). Your domain reputation, your sending cost, zero markup from us." },
  { cat: "Email", q: "Can I run drip campaigns?",                              a: "Yes. Visual flow builder triggers on events like user_signup, cart_abandoned, status_changed. Each step is a wait / email / branch node." },
  { cat: "Email", q: "How do bounces and unsubscribes work?",                  a: "Bounces are tracked per campaign and per subscriber. Unsubscribes honor globally — once a contact unsubscribes, they're skipped from all future sends automatically." },

  // Billing
  { cat: "Billing", q: "Is there a free plan?",                                a: "Yes. Starter is free forever for up to 500 leads. No card required to sign up. You get WhatsApp Cloud API, basic email (500/mo), CRM pipeline and 1 team member." },
  { cat: "Billing", q: "Can I cancel anytime?",                                a: "Yes. Monthly plans cancel with no questions asked. Yearly plans are pro-rata refundable within 14 days." },
  { cat: "Billing", q: "What is the minimum WhatsApp wallet balance?",         a: "No minimum required. Your WhatsApp API simply stops when your wallet hits ₹0 and resumes instantly once you top up from the billing hub." },
  { cat: "Billing", q: "Do you charge GST?",                                   a: "Indian customers are charged 18% GST on platform fees. International customers are billed tax-exclusive." },
  { cat: "Billing", q: "Can I switch plans?",                                  a: "Yes. Switch between Starter/Growth/Pro anytime. We pro-rate the difference automatically and credit your wallet." },

  // Security
  { cat: "Security", q: "Is Leadnator secure?",                                a: "Yes. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Your credentials (Meta tokens, SMTP passwords, S3 keys) never leave your account and are stored with field-level encryption." },
  { cat: "Security", q: "Where does my data live?",                            a: "Your leads sit in our managed MongoDB cluster in Mumbai (India) or Frankfurt (EU), depending on your region. Your files live in your own S3/R2/Supabase bucket — we never host media by default." },
  { cat: "Security", q: "Do you offer SSO and SAML?",                          a: "Yes — on the Enterprise plan. Standard plans use secure email+password with optional 2FA." },
  { cat: "Security", q: "Can I export my data?",                               a: "Always. One-click CSV export for leads and email campaigns. Full API access for programmatic export. No vendor lock-in." },

  // Integrations
  { cat: "Integrations", q: "What integrations are available?",                a: "25+ native apps — Shopify, WooCommerce, Razorpay, Stripe, Google Sheets, Zapier, Make, HubSpot, Salesforce, Calendly, Zoom, Indiamart, JustDial, Facebook, Instagram and more. Plus open REST APIs and webhooks." },
  { cat: "Integrations", q: "Can I build custom integrations?",                a: "Yes. REST APIs for every resource, inbound webhooks for any event, outbound webhooks on any lead change. Zapier and Make have native triggers/actions." },

  // Support
  { cat: "Support", q: "How do I talk to support?",                            a: "Open a ticket from inside the app (Support → New ticket) or use live chat. Pro plans get <4h first reply SLA. Starter gets <24h. All plans get human responses." },
  { cat: "Support", q: "Is there a phone number?",                             a: "Yes: +91 9594 686 906 for sales. Support is primarily in-app and over WhatsApp — we find it faster than phone for most cases." },
  { cat: "Support", q: "Do you offer onboarding?",                             a: "Yes. Growth and Pro plans include personalised onboarding. We migrate your leads, set up templates and wire up your first campaign together." },
];

export default function Faq({ onGoto }) {
  useSeo({
    title: "FAQ — Questions about WhatsApp CRM, pricing & security",
    description: "Detailed answers to every question about Leadnator: WhatsApp Business API setup, Meta Ads, email marketing SMTP, billing, security, integrations and support.",
    canonical: "https://leadnator.com/faq",
    keywords: "WhatsApp API FAQ, CRM pricing FAQ, Meta Ads integration, email marketing SMTP, SOC-2 compliance CRM",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  });

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  const cats = Array.from(new Set(FAQS.map((f) => f.cat)));
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(ql) || f.a.toLowerCase().includes(ql));
  }, [q]);

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/faq">
      <Hero q={q} setQ={setQ} />

      <section className="ln-section">
        <div className="ln-container ln-faq-wrap">
          {cats.map((cat) => {
            const items = filtered.filter((f) => f.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat} className="ln-faq-cat">
                <h2>{cat}</h2>
                <div className="ln-faq">
                  {items.map((f, i) => {
                    const key = `${cat}-${i}`;
                    const isOpen = open === key;
                    return (
                      <div key={key} className={`ln-faq-item ${isOpen ? "open" : ""}`} onClick={() => setOpen(isOpen ? null : key)}>
                        <div className="ln-faq-q">
                          <span><FiHelpCircle style={{ color: "var(--ln-green-600)", marginRight: 8 }} />{f.q}</span>
                          <FiChevronDown />
                        </div>
                        {isOpen && <div className="ln-faq-a">{f.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--ln-muted)" }}>
              No FAQs match "{q}". Try a different keyword or{" "}
              <a onClick={() => onGoto("/contact")} style={{ color: "var(--ln-green-600)", cursor: "pointer", fontWeight: 600 }}>ask us directly</a>.
            </div>
          )}
        </div>
      </section>

      <StillHave onGoto={onGoto} />
    </MarketingLayout>
  );
}

function Hero({ q, setQ }) {
  return (
    <section className="ln-sub-hero">
      <div className="ln-container">
        <span className="ln-eyebrow">FAQs</span>
        <h1>Answers, not fluff</h1>
        <p>Everything you might ask before signing up — and a lot of what customers ask after.</p>
        <div className="ln-faq-search">
          <FiSearch />
          <input
            placeholder="Search questions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

function StillHave({ onGoto }) {
  return (
    <section className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Still have a question?</h2>
            <p>Our team replies within minutes during business hours (10am–8pm IST, Mon–Sat).</p>
          </div>
          <div className="ln-cta-actions">
            <a className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" href="https://wa.me/919594686906">
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <button className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" onClick={() => onGoto("/contact")}>
              Contact sales <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

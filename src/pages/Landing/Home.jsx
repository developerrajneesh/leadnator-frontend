import { useState } from "react";
import {
  FiArrowRight, FiCheck, FiMessageCircle, FiMail, FiTarget, FiZap,
  FiBarChart2, FiLayers, FiUsers, FiCpu, FiTool, FiCalendar,
  FiFolder, FiPhone, FiCreditCard, FiShoppingBag, FiSend, FiLink,
  FiChevronDown, FiPieChart, FiLifeBuoy, FiTrendingUp,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SiMeta } from "react-icons/si";
import MarketingLayout from "./MarketingLayout";
import MarketingArt from "./MarketingArt";
import IntegrationsHub from "./IntegrationsHub";
import AIShowcase from "./AIShowcase";
import HierarchyFlow from "./HierarchyFlow";
import { appPath } from "../../lib/app-url";
import { useSeo } from "./seo";

export default function Home({ onGoto }) {
  useSeo({
    title: "All-in-one AI Growth Platform — WhatsApp, Meta Ads, Email & CRM",
    description: "Leadnator is the only CRM you need. Run WhatsApp campaigns, Meta Ads, Email marketing, lead pipelines, AI automations, file storage and 20+ growth tools from one login.",
    canonical: "https://leadnator.com/",
    keywords: "CRM, WhatsApp Business API, Meta Ads, Email Marketing, lead management, AI automation, WhatsApp chatbot, marketing platform India",
  });

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/">
      <Hero onGoto={onGoto} />
      <LogosStrip />
      <ModuleGrid onGoto={onGoto} />
      <ProductPreview />
      <WhyUs />
      <AiSection onGoto={onGoto} />
      <HierarchyFlow />
      <IntegrationsHub />
      <Testimonials />
      <CtaBanner onGoto={onGoto} />
    </MarketingLayout>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ onGoto }) {
  return (
    <section className="ln-hero">
      <div className="ln-hero-grain" />
      <div className="ln-container ln-hero-grid">
        <div className="ln-hero-copy">
          <span className="ln-hero-pill">
            <FaWhatsapp style={{ color: "#22c55e" }} /> Meta Business Partner · AI-Powered CRM
          </span>
          <h1>
            One CRM for <span className="ln-hero-hl">WhatsApp, Meta Ads &amp; Email</span> —
            wired together with <span className="ln-hero-hl alt">AI automation</span>.
          </h1>
          <p className="ln-hero-sub">
            Leadnator unifies your entire growth stack: WhatsApp Business API, Meta Lead
            Ads, Email campaigns, CRM pipeline, 20+ AI tools, file storage and booking
            calendar — all on one login. Launch in 12 minutes, no engineering needed.
          </p>

          <div className="ln-hero-cta">
            <a href={appPath("/signup")} className="ln-btn ln-btn-primary ln-btn-lg">
              Start FREE Trial <FiArrowRight />
            </a>
            <a href="/features" className="ln-btn ln-btn-outline ln-btn-lg" onClick={(e) => { e.preventDefault(); onGoto("/features"); }}>
              <FiPieChart /> See all features
            </a>
          </div>

          <ul className="ln-hero-check">
            <li><FiCheck /> 2-day free trial</li>
            <li><FiCheck /> No credit card required</li>
            <li><FiCheck /> Zero-fee WhatsApp setup</li>
            <li><FiCheck /> Cancel anytime</li>
          </ul>

          <div className="ln-hero-trust">
            <div className="ln-hero-avatars">
              {["a","b","c","d","e"].map((x, i) => (
                <span key={x} className="ln-hero-avatar" style={{ background: `hsl(${140 + i * 30} 70% 55%)` }}>{x.toUpperCase()}</span>
              ))}
            </div>
            <div>
              <strong>50,000+ businesses</strong> across 20+ countries
              <div className="ln-hero-stars">
                {"★".repeat(5)} <span>4.9 / 5 average rating</span>
              </div>
            </div>
          </div>
        </div>

        <MarketingArt />
      </div>
    </section>
  );
}

// eslint-disable-next-line no-unused-vars -- kept for reference, no longer rendered
function PhoneMock() {
  return (
    <div className="ln-phone-wrap">
      <div className="ln-phone">
        <div className="ln-phone-notch" />
        <div className="ln-phone-screen">
          <div className="ln-phone-header">
            <div className="ln-phone-avatar">L</div>
            <div>
              <div className="ln-phone-name">Leadnator <FiCheck style={{ fontSize: 12, color: "#22c55e", verticalAlign: "middle" }} /></div>
              <div className="ln-phone-status">● online</div>
            </div>
          </div>
          <div className="ln-phone-chat">
            <Bubble side="in">👋 Hi! I saw your Meta ad.</Bubble>
            <Bubble side="out">Awesome! Welcome 🎉</Bubble>
            <Bubble side="out">
              <div className="ln-phone-card">
                <div className="ln-phone-card-title">📦 Growth Plan</div>
                <div className="ln-phone-card-price">₹1,499 <small>/ month</small></div>
                <div className="ln-phone-card-btn">View details</div>
              </div>
            </Bubble>
            <Bubble side="in">Show me a demo 🚀</Bubble>
            <Bubble side="out typing"><span /><span /><span /></Bubble>
          </div>
          <div className="ln-phone-input">
            <span>Type a message</span>
            <FiSend style={{ color: "#22c55e" }} />
          </div>
        </div>
      </div>
      <div className="ln-phone-badge ln-phone-badge-1">
        <FiTrendingUp /> +384% reply rate
      </div>
      <div className="ln-phone-badge ln-phone-badge-2">
        <FaWhatsapp style={{ color: "#22c55e" }} /> 98.7% delivered
      </div>
    </div>
  );
}
function Bubble({ side, children }) { return <div className={`ln-bubble ${side}`}>{children}</div>; }

/* ---------------- LOGOS ---------------- */
function LogosStrip() {
  const LOGOS = ["Acme Retail", "Kira Labs", "Nova Capital", "Finchly", "Looma", "Zenith BPO", "Blueprint", "OneMore"];
  return (
    <section className="ln-logos">
      <div className="ln-container">
        <p className="ln-logos-sub">Trusted by fast-growing teams across 20+ countries</p>
        <div className="ln-logos-row">
          {LOGOS.map((n) => <span key={n} className="ln-logo-chip">{n}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- MODULES (the full product surface) ---------------- */
function ModuleGrid({ onGoto }) {
  const MODULES = [
    {
      key: "whatsapp", color: "#22c55e", Icon: FaWhatsapp,
      title: "WhatsApp Cloud API",
      blurb: "Broadcasts, templates, live inbox, drag-drop chatbot, Click-to-WhatsApp ads, catalog + payments.",
      bullets: ["Unlimited broadcasting", "AI chatbot builder", "Multi-agent inbox"],
    },
    {
      key: "meta", color: "#1877f2", Icon: SiMeta,
      title: "Meta Ads Manager",
      blurb: "Create, run and analyze Facebook & Instagram campaigns with native Meta Marketing API integration.",
      bullets: ["Campaign creator wizard", "Lead form sync", "Real-time ad analytics"],
    },
    {
      key: "email", color: "#ea4335", Icon: FiMail,
      title: "Email Marketing",
      blurb: "Bring-your-own SMTP. Drip automations, templates, subscribers, delivery analytics, signature designer.",
      bullets: ["Own SMTP — zero markup", "Drip + trigger flows", "Open / click tracking"],
    },
    {
      key: "crm", color: "#7c3aed", Icon: FiUsers,
      title: "Leads CRM",
      blurb: "Kanban pipeline, hot/qualified stages, CSV import, source attribution, tags, automations.",
      bullets: ["Pipeline (Kanban)", "Lead scoring & tags", "Auto-capture from WhatsApp + Meta"],
    },
    {
      key: "ai", color: "#f59e0b", Icon: FiCpu,
      title: "AI Studio",
      blurb: "20+ AI tools — ad copy, email writer, rewriter, translator, lead scorer, hashtags and more.",
      bullets: ["Powered by GPT-4", "One-click content", "Multi-language"],
    },
    {
      key: "dash", color: "#0ea5e9", Icon: FiBarChart2,
      title: "Dashboard & Analytics",
      blurb: "Real-time overview, funnel, source attribution, revenue-by-source, reports and CSV exports.",
      bullets: ["Live metrics", "CSV exports", "Revenue attribution"],
    },
    {
      key: "storage", color: "#facc15", Icon: FiFolder,
      title: "File Storage",
      blurb: "Your own S3 / R2 / Wasabi / Supabase bucket. Upload, share, versioning and per-user quota.",
      bullets: ["Any S3-compatible bucket", "Shared links", "Version history"],
    },
    {
      key: "calendar", color: "#4285f4", Icon: FiCalendar,
      title: "Calendar & Booking",
      blurb: "Month/week/agenda views, availability rules, and public booking links for sales calls.",
      bullets: ["Team availability", "Public booking links", "WhatsApp reminders"],
    },
    {
      key: "tools", color: "#f97316", Icon: FiTool,
      title: "Growth Tools",
      blurb: "Form builder, invoice generator, UTM builder, link shortener, QR code, email validator, A/B calc.",
      bullets: ["20+ free tools", "Brand-safe outputs", "Export-ready"],
    },
    {
      key: "support", color: "#ef4444", Icon: FiLifeBuoy,
      title: "In-app Support",
      blurb: "Ticket threads, live chat with the team, FAQs and documentation — no external helpdesk needed.",
      bullets: ["Ticket + live chat", "Socket-powered real-time", "Admin-authored FAQ"],
    },
    {
      key: "integrations", color: "#06b6d4", Icon: FiLink,
      title: "Integrations",
      blurb: "Shopify, WooCommerce, Razorpay, Google Sheets, Zapier, webhooks and 25+ native connectors.",
      bullets: ["25+ native apps", "Zapier / Make", "REST APIs + webhooks"],
    },
    {
      key: "automation", color: "#ec4899", Icon: FiZap,
      title: "Visual Automations",
      blurb: "Trigger-based flows across every module. Branch, wait, call APIs, send messages — all no-code.",
      bullets: ["Drag-drop builder", "Cross-module triggers", "Webhooks + conditionals"],
    },
  ];

  return (
    <section id="modules" className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Everything in one platform"
          title="A complete growth stack — not just WhatsApp"
          sub="Most CRMs force you to duct-tape seven tools together. Leadnator ships ten products behind one login, each plugged into the next."
        />
        <div className="ln-mods">
          {MODULES.map(({ key, color, Icon, title, blurb, bullets }) => (
            <article key={key} className="ln-mod-card">
              <div className="ln-mod-ic" style={{ background: `${color}15`, color }}><Icon /></div>
              <h3>{title}</h3>
              <p>{blurb}</p>
              <ul>
                {bullets.map((b) => <li key={b}><FiCheck /> {b}</li>)}
              </ul>
              <a onClick={() => onGoto(`/features#${key}`)} className="ln-mod-link">
                Learn more <FiArrowRight />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PRODUCT PREVIEW (hero_dashboard.png) ---------------- */
function ProductPreview() {
  return (
    <section className="ln-preview">
      <div className="ln-container">
        <SectionHead
          eyebrow="Product preview"
          title="See your entire growth stack on one screen"
          sub="Leads, WhatsApp chats, Meta ads, email performance and storage usage — unified in a dashboard your whole team can live in."
        />
        <div className="ln-preview-frame">
          <div className="ln-preview-chrome">
            <span className="ln-preview-dot r" />
            <span className="ln-preview-dot y" />
            <span className="ln-preview-dot g" />
            <span className="ln-preview-url">app.leadnator.com/dashboard</span>
          </div>
          <img
            src="/hero_dashboard.png"
            alt="Leadnator dashboard showing WhatsApp, Meta Ads and Email analytics on a single screen"
            className="ln-preview-img"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  return (
    <section className="ln-stats">
      <div className="ln-container ln-stats-grid">
        <Stat value="50,000+" label="Businesses trust us" />
        <Stat value="2.4B+"   label="Messages delivered" />
        <Stat value="20+"     label="Countries supported" />
        <Stat value="98.7%"   label="Deliverability rate" />
      </div>
    </section>
  );
}
function Stat({ value, label }) {
  return (
    <div className="ln-stat">
      <div className="ln-stat-value">{value}</div>
      <div className="ln-stat-label">{label}</div>
    </div>
  );
}

/* ---------------- WHY US ---------------- */
function WhyUs() {
  const REASONS = [
    { Icon: FiZap,        title: "Launch in 12 minutes", text: "Embedded Signup handles Meta's approval. Your number, your template, your ads — all wired in the first coffee." },
    { Icon: FiCreditCard, title: "Zero markup pricing",  text: "Meta bills you at cost. We don't take a cut on every template send. Your WhatsApp wallet is yours." },
    { Icon: FiShoppingBag,title: "Own your data",        text: "Leads sit in your DB. Files live in your S3 bucket. Templates on your WABA. You can export and leave any day." },
    { Icon: FiPhone,      title: "Real support",         text: "Open tickets or live-chat the team from inside the app. Replies in minutes during business hours, not days." },
  ];
  return (
    <section className="ln-section ln-section-tint">
      <div className="ln-container">
        <SectionHead
          eyebrow="Why Leadnator"
          title="Built by operators, for operators"
          sub="Every feature is because we hit the pain ourselves running growth for D2C brands."
        />
        <div className="ln-feat-grid">
          {REASONS.map(({ Icon, title, text }) => (
            <div key={title} className="ln-feat">
              <div className="ln-feat-ic"><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- AI ---------------- */
function AiSection({ onGoto }) {
  return (
    <section className="ln-ai">
      <div className="ln-container ln-ai-grid">
        <div>
          <span className="ln-eyebrow">AI inside every module</span>
          <h2>Write, score, translate, classify — at the speed of thought</h2>
          <p className="ln-ai-sub">
            Leadnator's AI Studio ships 20+ specialized tools. Write ad copy, craft
            emails, rewrite tone, translate into 40 languages, score lead quality,
            generate hashtags — all powered by GPT-4 and wired into the workflows
            you already run.
          </p>
          <ul className="ln-ai-list">
            <li><FiCheck /> AI ad-copy generator for Meta &amp; Google</li>
            <li><FiCheck /> Email writer with subject-line A/B tester</li>
            <li><FiCheck /> Lead scorer with trainable signals</li>
            <li><FiCheck /> Multi-language translator &amp; rewriter</li>
            <li><FiCheck /> Bring-your-own OpenAI key (bill it to yourself)</li>
          </ul>
          <button className="ln-btn ln-btn-primary" onClick={() => onGoto("/features#ai")}>
            Explore AI Studio <FiArrowRight />
          </button>
        </div>
        <AIShowcase />
      </div>
    </section>
  );
}

/* ---------------- INTEGRATIONS ---------------- */
function Integrations() {
  const INT = [
    "Shopify", "WooCommerce", "Google Sheets", "Razorpay", "Stripe", "Zapier", "Make",
    "Facebook", "Instagram", "Indiamart", "JustDial", "Zoom", "HubSpot", "Salesforce",
    "Calendly", "Tradelindia", "AWS S3", "Cloudflare R2", "Wasabi", "25+ more",
  ];
  return (
    <section className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Smooth integrations"
          title="Plug into the stack you already use"
          sub="Native apps for e-commerce, CRMs, payments, storage and no-code tools — or build your own with our REST APIs and webhooks."
        />
        <div className="ln-int-grid">
          {INT.map((n) => <div key={n} className="ln-int">{n}</div>)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  const T = [
    { name: "Anita Desai",  role: "Founder · Kira Labs",   quote: "Replaced three tools with Leadnator in a weekend. The WhatsApp chatbot paid for a year of subscription in its first week." },
    { name: "Mohit Khanna", role: "Growth · Nova Capital", quote: "Seeing Meta ads, WhatsApp chats and email campaigns on one dashboard is unreal. Our CPL dropped 38%." },
    { name: "Priya Kapoor", role: "CEO · Finchly",         quote: "Support is embarrassingly fast. Feels like having our own team. I recommend Leadnator to every founder I meet." },
  ];
  return (
    <section className="ln-section ln-section-tint">
      <div className="ln-container">
        <SectionHead eyebrow="Loved by operators" title="Teams ship faster on Leadnator" />
        <div className="ln-test-grid">
          {T.map((t) => (
            <div key={t.name} className="ln-test">
              <div className="ln-test-stars">{"★".repeat(5)}</div>
              <p>"{t.quote}"</p>
              <div className="ln-test-who">
                <div className="ln-test-avatar">{t.name.split(" ").map((w) => w[0]).join("")}</div>
                <div><b>{t.name}</b><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PRICING PREVIEW ---------------- */
function PricingPreview({ onGoto }) {
  const plans = [
    { name: "Starter", price: "₹0",     period: "Free forever",  desc: "For solo founders validating an offer.",
      features: ["500 leads", "WhatsApp Cloud API", "Email 500/mo"], highlight: false, cta: "Start free" },
    { name: "Growth",  price: "₹1,499", period: "/ month",       desc: "For teams scaling past product-market fit.",
      features: ["25,000 leads", "All modules included", "AI Studio (GPT-4)"], highlight: true, cta: "Start 2-day trial" },
    { name: "Pro",     price: "₹3,999", period: "/ month",       desc: "For revenue teams living in the CRM.",
      features: ["Unlimited leads", "API + webhooks", "Dedicated CSM"], highlight: false, cta: "Talk to sales" },
  ];
  return (
    <section className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Simple pricing"
          title="Pay only when you grow"
          sub="Start free. Upgrade the day you hit a limit. Downgrade anytime."
        />
        <div className="ln-price-grid">
          {plans.map((p) => (
            <div key={p.name} className={`ln-price ${p.highlight ? "pop" : ""}`}>
              {p.highlight && <span className="ln-price-tag">Most popular</span>}
              <h3>{p.name}</h3>
              <p className="ln-price-desc">{p.desc}</p>
              <div className="ln-price-amount">
                <span className="num">{p.price}</span>
                <span className="per">{p.period}</span>
              </div>
              <button className={`ln-btn ${p.highlight ? "ln-btn-primary" : "ln-btn-outline"} ln-btn-block`} onClick={() => onGoto("/signup")}>
                {p.cta}
              </button>
              <ul>{p.features.map((f) => <li key={f}><FiCheck /> {f}</li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <a onClick={() => onGoto("/pricing")} className="ln-link-arrow">See full pricing & feature matrix <FiArrowRight /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ PREVIEW ---------------- */
function FaqPreview({ onGoto }) {
  const F = [
    { q: "What does Leadnator do?",                          a: "Leadnator is an all-in-one growth CRM that ships WhatsApp Cloud API, Meta Ads, Email marketing, lead pipeline, AI Studio, file storage and booking calendar behind one login." },
    { q: "Do I need a Meta developer account?",              a: "No. Our Embedded Signup creates your WhatsApp Business Account, registers your number and issues a permanent token in one popup." },
    { q: "Can I bring my own SMTP and S3 bucket?",           a: "Yes — Email uses your SMTP (SES, Gmail, SendGrid). Files live in your S3/R2/Supabase bucket. We never host your data by default." },
    { q: "Is there a free plan?",                            a: "Yes. Starter is free forever for up to 500 leads. No card required to sign up." },
    { q: "How do I talk to support?",                        a: "Open a ticket or live-chat the team from inside the app. Replies in minutes during business hours." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="ln-section ln-section-soft">
      <div className="ln-container ln-faq-wrap">
        <SectionHead eyebrow="FAQ" title="Frequently asked questions" sub="Quick answers. See the full list on the FAQ page." />
        <div className="ln-faq">
          {F.map((f, i) => (
            <div key={i} className={`ln-faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="ln-faq-q">{f.q}<FiChevronDown /></div>
              {open === i && <div className="ln-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a onClick={() => onGoto("/faq")} className="ln-link-arrow">View all FAQs <FiArrowRight /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA BANNER ---------------- */
function CtaBanner({ onGoto }) {
  return (
    <section className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Ready to 10× your sales?</h2>
            <p>Start your 2-day free trial. No credit card. Cancel anytime. Setup in under 12 minutes.</p>
            <ul className="ln-cta-list">
              <li><FiCheck /> All modules unlocked in the trial</li>
              <li><FiCheck /> Personalised onboarding</li>
              <li><FiCheck /> Blue-tick verification help</li>
            </ul>
          </div>
          <div className="ln-cta-actions">
            <button className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" onClick={() => onGoto("/signup")}>
              Start FREE Trial <FiArrowRight />
            </button>
            <a className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" href="https://wa.me/917888341096">
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <div className="ln-cta-call">
              <FiPhone /> Sales: <a href="tel:+917888341096">+917888341096</a>
            </div>
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

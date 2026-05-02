import { useState } from "react";
import {
  FiArrowRight, FiCheck, FiX, FiMessageCircle, FiMail, FiTarget, FiZap,
  FiBarChart2, FiLayers, FiShield, FiGlobe, FiPhone, FiPlayCircle,
  FiTrendingUp, FiUsers, FiChevronDown, FiCpu, FiShoppingBag, FiSend,
  FiCreditCard, FiHeart, FiStar, FiLink, FiSmartphone, FiClock, FiAward,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import "./Landing.css";

export default function Landing({ onGoto }) {
  const go = (path) => {
    if (typeof onGoto === "function") onGoto(path);
    else {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <div className="ln">
      <Topbar />
      <Nav onGoto={go} />
      <Hero onGoto={go} />
      <LogosStrip />
      <Features />
      <Stats />
      <Comparison />
      <AiSection onGoto={go} />
      <Integrations />
      <OfferBanner onGoto={go} />
      <Pricing onGoto={go} />
      <PricingTerms />
      <Testimonials />
      <Faq />
      <ContactCta onGoto={go} />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* ==========================================================
   TOPBAR — slim announcement strip above the main nav
   ========================================================== */
function Topbar() {
  return (
    <div className="ln-topbar">
      <div className="ln-container ln-topbar-inner">
        <span className="ln-topbar-badge">
          <span className="ln-topbar-dot" /> Powered by Official WhatsApp APIs ⚡
        </span>
        <div className="ln-topbar-right">
          <a href="tel:+919594686906"><FiPhone /> Sales: +91 9594 686 906</a>
          <a href="https://wa.me/919594686906" className="ln-topbar-wa"><FaWhatsapp /> Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   NAV
   ========================================================== */
function Nav({ onGoto }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="ln-nav">
      <div className="ln-container ln-nav-inner">
        <a href="/" className="ln-brand" onClick={(e) => { e.preventDefault(); onGoto("/"); }}>
          <span className="ln-brand-lead">Lead</span><span className="ln-brand-nator">nator</span>
        </a>

        <nav className={`ln-links ${open ? "open" : ""}`}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#compare">Compare</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
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

/* ==========================================================
   HERO — left copy + right phone mockup with chat bubbles
   ========================================================== */
function Hero({ onGoto }) {
  return (
    <section className="ln-hero">
      <div className="ln-hero-grain" />
      <div className="ln-container ln-hero-grid">
        <div className="ln-hero-copy">
          <span className="ln-hero-pill">
            <FaWhatsapp style={{ color: "#22c55e" }} /> Meta Business Partner · Official WhatsApp API
          </span>
          <h1>
            Best WhatsApp Marketing & Automation Tools with{" "}
            <span className="ln-hero-hl">Affordable Pricing</span> and{" "}
            <span className="ln-hero-hl alt">Zero Setup Fees</span>.
          </h1>
          <p className="ln-hero-sub">
            Broadcast Messages, Automate, Engage, Sell — do everything with India's
            No.1 WhatsApp Official API Platform. Launch CTWA ads, capture leads,
            route chats to the right team, and close deals faster.
          </p>

          <div className="ln-hero-cta">
            <button className="ln-btn ln-btn-primary ln-btn-lg" onClick={() => onGoto("/signup")}>
              Start FREE Trial <FiArrowRight />
            </button>
            <a className="ln-btn ln-btn-outline ln-btn-lg" href="https://wa.me/919594686906">
              <FaWhatsapp /> Book a demo
            </a>
          </div>

          <ul className="ln-hero-check">
            <li><FiCheck /> Zero-fee WhatsApp setup</li>
            <li><FiCheck /> Blue-tick verification help</li>
            <li><FiCheck /> No credit card required</li>
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
                {"★".repeat(5)} <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>

        <PhoneMock />
      </div>
    </section>
  );
}

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
            <Bubble side="in">👋 Hi! I'm interested in your WhatsApp platform.</Bubble>
            <Bubble side="out">
              Hello! 🎉 Thanks for reaching out.<br />
              We'd love to show you how Leadnator works.
            </Bubble>
            <Bubble side="out">
              <div className="ln-phone-card">
                <div className="ln-phone-card-title">📦 Growth Plan</div>
                <div className="ln-phone-card-price">₹1,499 <small>/ month</small></div>
                <div className="ln-phone-card-btn">View details</div>
              </div>
            </Bubble>
            <Bubble side="in">Show me a demo 🚀</Bubble>
            <Bubble side="out typing">
              <span /><span /><span />
            </Bubble>
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

function Bubble({ side, children }) {
  return <div className={`ln-bubble ${side}`}>{children}</div>;
}

/* ==========================================================
   LOGOS STRIP
   ========================================================== */
function LogosStrip() {
  const LOGOS = ["Acme Retail", "Kira Labs", "Nova Capital", "Finchly", "Looma", "Zenith BPO", "Blueprint", "OneMore"];
  return (
    <section className="ln-logos">
      <div className="ln-container">
        <p className="ln-logos-sub">Trusted by fast-growing teams</p>
        <div className="ln-logos-row">
          {LOGOS.map((n) => <span key={n} className="ln-logo-chip">{n}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   FEATURES GRID
   ========================================================== */
function Features() {
  const F = [
    { Icon: FiSend,         title: "WhatsApp Broadcasting",   text: "Reach thousands with a single click. Run multi-media campaigns, view open & read rates." },
    { Icon: FiCpu,          title: "AI No-Code Chatbot",       text: "Drag-and-drop chatbot builder with branching, API calls and AI-powered dynamic replies." },
    { Icon: FiUsers,        title: "Shared Team Inbox",        text: "Role-based / round-robin chat routing, quick replies, agent performance, tickets." },
    { Icon: FiTarget,       title: "Click-to-WhatsApp Ads",    text: "Launch CTWA campaigns from Meta Ads Manager and capture every lead into your CRM." },
    { Icon: FiShoppingBag,  title: "WhatsApp Catalog",         text: "Setup product catalog, cart, payment gateway. Shopify & WooCommerce integrations." },
    { Icon: FiCreditCard,   title: "WhatsApp Payments",        text: "Collect payments via UPI & cards right inside the chat. Automate reminders too." },
    { Icon: FiLayers,       title: "Drip & Trigger Campaigns", text: "Auto message campaigns, schedulers, sequences — turn every signup into a customer." },
    { Icon: FiBarChart2,    title: "Advanced Analytics",        text: "Campaign, chatbot, agent & budget analytics with smart audience segregation." },
    { Icon: FiLink,         title: "Carousels & Flows",        text: "WhatsApp Carousel with click tracking. WhatsApp Flows/Forms for data collection." },
  ];
  return (
    <section id="features" className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Everything you need"
          title="Best WhatsApp tools in one platform"
          sub="Stop paying five different tools to run WhatsApp. Leadnator is the end-to-end growth stack — from first ad click to closed deal."
        />
        <div className="ln-feat-grid">
          {F.map(({ Icon, title, text }) => (
            <div key={title} className="ln-feat">
              <div className="ln-feat-ic"><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a className="ln-link-arrow" href="#pricing">See all features <FiArrowRight /></a>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   STATS
   ========================================================== */
function Stats() {
  return (
    <section className="ln-stats">
      <div className="ln-container ln-stats-grid">
        <Stat value="50,000+" label="Businesses trust us" />
        <Stat value="20+"     label="Countries supported" />
        <Stat value="2.4B+"   label="Messages delivered" />
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

/* ==========================================================
   COMPARISON — us vs other platforms
   ========================================================== */
function Comparison() {
  const rows = [
    ["Zero-fee WhatsApp setup",               true,  false],
    ["No template markups",                   true,  false],
    ["Unlimited broadcasting / month",        true,  false],
    ["AI chatbot builder",                    true,  false],
    ["No-code automation",                    true,  false],
    ["Shared team inbox with collaboration",  true,  true],
    ["Click-to-WhatsApp ads manager",         true,  false],
    ["Shopify / WooCommerce integrations",    true,  true],
    ["WhatsApp payments + catalog",           true,  false],
    ["Dedicated customer success manager",    true,  false],
  ];
  return (
    <section id="compare" className="ln-section ln-section-tint">
      <div className="ln-container">
        <SectionHead
          eyebrow="Compare & save"
          title="Why teams switch to Leadnator"
          sub="Get more value with our all-in-one platform at a fraction of the cost of other WhatsApp Business API providers."
        />
        <div className="ln-compare">
          <div className="ln-compare-head">
            <div></div>
            <div className="ln-compare-col-us">
              <span className="ln-brand-mini"><span className="ln-brand-lead">Lead</span><span className="ln-brand-nator">nator</span></span>
              <div className="ln-compare-tag">All-in-one</div>
            </div>
            <div className="ln-compare-col-other">Other platforms</div>
          </div>
          {rows.map(([label, us, them]) => (
            <div key={label} className="ln-compare-row">
              <div className="ln-compare-label">{label}</div>
              <div className={`ln-compare-cell ${us ? "yes" : "no"}`}>{us ? <FiCheck /> : <FiX />}</div>
              <div className={`ln-compare-cell ${them ? "yes" : "no"}`}>{them ? <FiCheck /> : <FiX />}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   AI SECTION
   ========================================================== */
function AiSection({ onGoto }) {
  return (
    <section className="ln-ai">
      <div className="ln-container ln-ai-grid">
        <div>
          <span className="ln-eyebrow" style={{ color: "#16a34a" }}>AI inside WhatsApp</span>
          <h2>Harness the power of AI within WhatsApp</h2>
          <p className="ln-ai-sub">
            Craft intelligent, dynamic and human-like replies. Collect data, trigger
            automations, route chats, write attributes and jump between flows —
            without writing a single line of code.
          </p>
          <ul className="ln-ai-list">
            <li><FiCheck /> Tailored AI responses powered by GPT</li>
            <li><FiCheck /> Answer queries, collect info, send reminders</li>
            <li><FiCheck /> Visual drag-and-drop flow builder</li>
            <li><FiCheck /> Integrates with Google Sheets, Razorpay & Shopify</li>
          </ul>
          <button className="ln-btn ln-btn-primary" onClick={() => onGoto("/signup")}>
            Build your chatbot <FiArrowRight />
          </button>
        </div>
        <div className="ln-ai-mock">
          <div className="ln-ai-step">
            <div className="ln-ai-step-dot">1</div>
            <div>
              <div className="ln-ai-step-t">Trigger</div>
              <div className="ln-ai-step-s">User sends "Hi"</div>
            </div>
          </div>
          <div className="ln-ai-arrow" />
          <div className="ln-ai-step">
            <div className="ln-ai-step-dot">2</div>
            <div>
              <div className="ln-ai-step-t">Ask question</div>
              <div className="ln-ai-step-s">What are you looking for?</div>
            </div>
          </div>
          <div className="ln-ai-arrow" />
          <div className="ln-ai-step">
            <div className="ln-ai-step-dot">3</div>
            <div>
              <div className="ln-ai-step-t">Route to agent</div>
              <div className="ln-ai-step-s">Hand off to sales team</div>
            </div>
          </div>
          <div className="ln-ai-arrow" />
          <div className="ln-ai-step ok">
            <div className="ln-ai-step-dot"><FiCheck /></div>
            <div>
              <div className="ln-ai-step-t">Conversion tracked</div>
              <div className="ln-ai-step-s">Lead saved in CRM</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   INTEGRATIONS
   ========================================================== */
function Integrations() {
  const INT = [
    "Shopify", "WooCommerce", "Google Sheets", "Razorpay", "Zapier",
    "Facebook", "Instagram", "Indiamart", "JustDial", "Zoom",
    "HubSpot", "Salesforce", "Calendly", "Stripe", "Tradelindia", "25+ more",
  ];
  return (
    <section className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Smooth integrations"
          title="Works with the tools you already use"
          sub="Connect CRMs, payment gateways and ecom stores in a couple of clicks."
        />
        <div className="ln-int-grid">
          {INT.map((n) => <div key={n} className="ln-int">{n}</div>)}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   OFFER BANNER
   ========================================================== */
function OfferBanner({ onGoto }) {
  return (
    <section className="ln-offer">
      <div className="ln-container">
        <div className="ln-offer-card">
          <div className="ln-offer-tag">Exclusive Offer — Limited Period</div>
          <h2>
            Upgrade your WhatsApp experience and grab an
            <span className="ln-offer-hl"> Extra 50% OFF</span>
          </h2>
          <p>Applicable on annual plans. Zero setup fee. Launch in under 24 hours.</p>
          <button className="ln-btn ln-btn-yellow ln-btn-lg" onClick={() => onGoto("/signup")}>
            Get Started — Save 50% Today <FiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   PRICING — monthly/yearly toggle
   ========================================================== */
function Pricing({ onGoto }) {
  const [billing, setBilling] = useState("yearly");
  const factor = billing === "yearly" ? 0.7 : 1;

  const plans = [
    {
      name: "Basic",
      monthly: 999, desc: "Everything you need to get started.",
      features: [
        "Unlimited contacts", "Unlimited broadcasting",
        "No-code chatbot + automation", "1 WhatsApp number",
        "Shared inbox (2 users)", "Standard analytics", "Email support",
      ],
      cta: "Start FREE Trial", highlight: false,
    },
    {
      name: "Growth",
      monthly: 2499, desc: "Recommended for businesses scaling past PMF.",
      features: [
        "All Basic features",
        "Advanced chatbot flows (branching + API)",
        "Drip + trigger campaigns, scheduler",
        "Multi-agent live chat (5 users)",
        "CTWA ads manager",
        "AI-rewrite & smart replies",
        "Priority support",
      ],
      cta: "Start FREE Trial", highlight: true,
    },
    {
      name: "Pro",
      monthly: 4999, desc: "For revenue teams that live inside the CRM.",
      features: [
        "All Growth features",
        "WhatsApp catalog + payments",
        "Shopify / WooCommerce ecommerce",
        "Role-based / round-robin routing",
        "Custom agent rules + project APIs",
        "Unlimited team seats",
        "Dedicated customer success manager",
      ],
      cta: "Talk to Sales", highlight: false,
    },
  ];

  return (
    <section id="pricing" className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Simple pricing"
          title="Affordable pricing with zero setup fees"
          sub="Pay only for what you use. No hidden template markups. Cancel anytime."
        />

        <div className="ln-billing-toggle">
          <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
            Monthly
          </button>
          <button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>
            Yearly <span className="ln-save">Save 30%</span>
          </button>
        </div>

        <div className="ln-price-grid">
          {plans.map((p) => (
            <div key={p.name} className={`ln-price ${p.highlight ? "pop" : ""}`}>
              {p.highlight && <span className="ln-price-tag">Most popular</span>}
              <h3>{p.name}</h3>
              <p className="ln-price-desc">{p.desc}</p>
              <div className="ln-price-amount">
                <span className="num">₹{Math.round(p.monthly * factor).toLocaleString("en-IN")}</span>
                <span className="per">/ month</span>
              </div>
              {billing === "yearly" && (
                <div className="ln-price-note">Billed yearly · 30% saved</div>
              )}
              <button className={`ln-btn ${p.highlight ? "ln-btn-primary" : "ln-btn-outline"} ln-btn-block`} onClick={() => onGoto("/signup")}>
                {p.cta}
              </button>
              <ul>
                {p.features.map((f) => <li key={f}><FiCheck /> {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   PRICING TERMINOLOGY (WhatsApp conversation charges)
   ========================================================== */
function PricingTerms() {
  const TERMS = [
    { tag: "Marketing",     color: "#ec4899", rate: "₹0.80", desc: "Promotional messages, offers, product updates — charged per 24-hour conversation window." },
    { tag: "Utility",       color: "#7c3aed", rate: "₹0.125", desc: "Transactional updates like order confirmations, payment receipts, appointment reminders." },
    { tag: "Authentication",color: "#0ea5e9", rate: "₹0.125", desc: "OTPs and login confirmations. Per-message pricing applies to template sends." },
    { tag: "Service",       color: "#22c55e", rate: "FREE",   desc: "User-initiated conversations within 24 hours are free. Unlimited service chats." },
  ];
  return (
    <section className="ln-section ln-section-soft">
      <div className="ln-container">
        <SectionHead
          eyebrow="Important pricing terminology"
          title="WhatsApp conversation pricing, simplified"
          sub="We charge you exactly what Meta charges — zero markups, zero setup fee."
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

/* ==========================================================
   TESTIMONIALS
   ========================================================== */
function Testimonials() {
  const T = [
    { name: "Anita Desai",  role: "Founder · Kira Labs",     quote: "Replaced three tools with Leadnator in a weekend. The WhatsApp chatbot alone paid for a year of subscription in its first week." },
    { name: "Mohit Khanna", role: "Growth · Nova Capital",   quote: "Being able to see Meta ads, WhatsApp chats and email campaigns on one dashboard is unreal. Our CPL dropped 38%." },
    { name: "Priya Kapoor", role: "CEO · Finchly",           quote: "Support is embarrassingly fast. Feels like having our own team. I recommend Leadnator to every founder I meet." },
  ];
  return (
    <section className="ln-section">
      <div className="ln-container">
        <SectionHead eyebrow="Loved by operators" title="Teams ship faster on Leadnator" />
        <div className="ln-test-grid">
          {T.map((t) => (
            <div key={t.name} className="ln-test">
              <div className="ln-test-stars">{"★".repeat(5)}</div>
              <p>"{t.quote}"</p>
              <div className="ln-test-who">
                <div className="ln-test-avatar">{t.name.split(" ").map((w) => w[0]).join("")}</div>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   FAQ
   ========================================================== */
function Faq() {
  const F = [
    { q: "What does Leadnator do?",                             a: "Leadnator is an all-in-one WhatsApp Business API platform that lets you broadcast messages, build chatbots, run CTWA ads, accept payments, and run email + Meta Ads campaigns from one CRM." },
    { q: "Is Leadnator an Official WhatsApp Marketing Software?", a: "Yes. Leadnator is built on the official WhatsApp Business Cloud API from Meta. We're a registered Meta Business Partner." },
    { q: "Is Leadnator secure?",                                a: "Absolutely. Data is encrypted at rest and in transit, your credentials never leave your account, and storage runs on your own S3-compatible bucket." },
    { q: "Can I integrate Leadnator with my existing system?",   a: "Yes. Open REST APIs, webhooks, Zapier, Shopify, WooCommerce, Razorpay, Google Sheets and 25+ more native integrations." },
    { q: "Can I use an existing WhatsApp number?",              a: "Yes — if your number is already on WhatsApp Business API, we'll migrate it in under 30 minutes. Otherwise our Embedded Signup creates a fresh one." },
    { q: "Is there a minimum credit balance?",                  a: "No minimum required. Your WhatsApp API stops when your wallet hits ₹0 and resumes instantly once you top up from the billing hub." },
    { q: "Can I get a demo?",                                   a: "Absolutely. Click \"Book a demo\" above or WhatsApp us at +91 9594 686 906 and we'll walk you through the platform live." },
    { q: "Can I get a refund?",                                 a: "Yearly plans are refundable pro-rata within 14 days. Monthly plans can be cancelled anytime with no questions asked." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="ln-section ln-section-tint">
      <div className="ln-container ln-faq-wrap">
        <SectionHead eyebrow="FAQ" title="Want to know more?" sub="Quick answers to the most common questions." />
        <div className="ln-faq">
          {F.map((f, i) => (
            <div key={i} className={`ln-faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="ln-faq-q">
                {f.q}
                <FiChevronDown />
              </div>
              {open === i && <div className="ln-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   CONTACT CTA — form + WhatsApp CTA
   ========================================================== */
function ContactCta({ onGoto }) {
  return (
    <section id="contact" className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Ready to 10× your sales on WhatsApp?</h2>
            <p>
              We'd love to know your WhatsApp use-case and help your business
              grow. Start your 14-day free trial — no credit card needed.
            </p>
            <ul className="ln-cta-list">
              <li><FiCheck /> Official WhatsApp API + Blue Tick help</li>
              <li><FiCheck /> Personalised onboarding</li>
              <li><FiCheck /> Setup in under 24 hours</li>
            </ul>
          </div>
          <div className="ln-cta-actions">
            <button className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" onClick={() => onGoto("/signup")}>
              Start FREE Trial <FiArrowRight />
            </button>
            <a className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" href="https://wa.me/919594686906">
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <div className="ln-cta-call">
              <FiPhone /> Sales: <a href="tel:+919594686906">+91 9594 686 906</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   FOOTER
   ========================================================== */
function Footer() {
  return (
    <footer className="ln-footer">
      <div className="ln-container ln-footer-grid">
        <div>
          <a href="/" className="ln-brand ln-brand-light">
            <span className="ln-brand-lead">Lead</span><span className="ln-brand-nator">nator</span>
          </a>
          <p className="ln-footer-mission">
            AI-powered WhatsApp Marketing & Growth Platform for modern businesses.
          </p>
          <div className="ln-footer-social">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaYoutube /></a>
            <a href="#"><FaLinkedin /></a>
            <a href="https://wa.me/919594686906"><FaWhatsapp /></a>
          </div>
          <div className="ln-footer-badges">
            <span>🏆 Meta Business Partner</span>
            <span>✨ The Indian Express featured</span>
          </div>
        </div>
        <FooterCol title="Product"   items={["Features", "Pricing", "Integrations", "Changelog", "Roadmap"]} />
        <FooterCol title="Resources" items={["Documentation", "API Reference", "FAQ", "Status", "Support"]} />
        <FooterCol title="Company"   items={["About", "Careers", "Contact", "Privacy", "Terms"]} />
      </div>

      <div className="ln-container ln-footer-bottom">
        <span>© {new Date().getFullYear()} Leadnator. Made with ❤️ in India.</span>
        <span className="ln-footer-regions">India · Singapore · UAE · USA</span>
      </div>
    </footer>
  );
}
function FooterCol({ title, items }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>{items.map((i) => <li key={i}><a href="#">{i}</a></li>)}</ul>
    </div>
  );
}

/* ==========================================================
   FLOATING WHATSAPP BUTTON
   ========================================================== */
function FloatingWhatsApp() {
  return (
    <a className="ln-float-wa" href="https://wa.me/919594686906" aria-label="Chat on WhatsApp">
      <FaWhatsapp />
    </a>
  );
}

/* ==========================================================
   HELPERS
   ========================================================== */
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="ln-head">
      {eyebrow && <div className="ln-eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

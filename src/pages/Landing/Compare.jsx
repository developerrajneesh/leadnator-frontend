import { FiArrowRight, FiCheck, FiX, FiTrendingUp, FiDollarSign, FiZap, FiShield } from "react-icons/fi";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

export default function Compare({ onGoto }) {
  useSeo({
    title: "Compare — Why teams switch to Leadnator",
    description: "See how Leadnator stacks up against other WhatsApp CRMs and marketing platforms. Feature-by-feature comparison, cost savings breakdown, and why 50,000+ businesses made the switch.",
    canonical: "https://leadnator.com/compare",
    keywords: "WhatsApp CRM comparison, AiSensy alternative, Gallabox alternative, Interakt alternative, best WhatsApp platform India",
  });

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/compare">
      <Hero />
      <BigMatrix />
      <Savings onGoto={onGoto} />
      <Reasons />
      <Switching onGoto={onGoto} />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="ln-sub-hero">
      <div className="ln-container">
        <span className="ln-eyebrow">Compare</span>
        <h1>One platform, ten products, zero markups</h1>
        <p>
          Most competitors charge you separately for WhatsApp, email, ads and CRM.
          Leadnator ships all of them under one subscription — and doesn't mark up
          Meta's per-conversation rates. Here's the math.
        </p>
      </div>
    </section>
  );
}

function BigMatrix() {
  const ROWS = [
    { section: "Platform coverage", items: [
      ["WhatsApp Cloud API + chatbot",         true, true,  true,  false],
      ["Meta Ads manager inside CRM",          true, false, false, false],
      ["Email marketing (own SMTP)",           true, false, true,  true],
      ["Leads CRM with pipeline",              true, true,  true,  true],
      ["File storage (own S3 bucket)",         true, false, false, false],
      ["Calendar & booking links",             true, false, false, false],
      ["AI Studio (20+ tools)",                true, false, false, false],
      ["In-app support tickets + live chat",   true, false, false, false],
    ]},
    { section: "WhatsApp pricing", items: [
      ["Zero markup on Meta rates",            true, false, false, false],
      ["No per-template fees",                 true, false, false, true],
      ["Unlimited broadcasts",                 true, true,  false, true],
      ["AI-powered chatbot included",          true, false, true,  false],
      ["Click-to-WhatsApp ads manager",        true, true,  false, false],
      ["Catalog + payments",                   true, true,  true,  false],
    ]},
    { section: "Ownership & data", items: [
      ["Your S3 bucket for files",             true, false, false, false],
      ["Your SMTP for email",                  true, false, false, true],
      ["Export leads to CSV anytime",          true, true,  true,  true],
      ["Open REST APIs",                       true, false, true,  false],
      ["SOC-2 ready infrastructure",           true, false, false, false],
    ]},
    { section: "Support & success", items: [
      ["In-app ticket system",                 true, false, false, false],
      ["Live chat with team",                  true, false, false, false],
      ["<4h reply on paid plans",              true, false, true,  false],
      ["Dedicated success manager (Pro)",      true, false, false, false],
      ["Personalised onboarding",              true, true,  true,  false],
    ]},
  ];

  const cell = (v) => v === true ? <FiCheck className="ln-mx-yes" /> : <FiX className="ln-mx-no" />;

  return (
    <section className="ln-section ln-section-tint">
      <div className="ln-container">
        <SectionHead
          eyebrow="Head to head"
          title="Feature-by-feature comparison"
          sub="Compared against the three most popular WhatsApp CRMs in India."
        />
        <div className="ln-matrix ln-matrix-4">
          <div className="ln-matrix-head">
            <div></div>
            <div className="pop">Leadnator</div>
            <div>Platform A</div>
            <div>Platform B</div>
            <div>Platform C</div>
          </div>
          {ROWS.map((g) => (
            <div key={g.section}>
              <div className="ln-matrix-section">{g.section}</div>
              {g.items.map(([label, us, a, b, c]) => (
                <div key={label} className="ln-matrix-row">
                  <div className="ln-matrix-label">{label}</div>
                  <div className="pop">{cell(us)}</div>
                  <div>{cell(a)}</div>
                  <div>{cell(b)}</div>
                  <div>{cell(c)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Savings({ onGoto }) {
  const COMPETITORS = [
    { name: "Other WhatsApp CRM",  wa: 3499, email: 1999, ads: 2499, crm: 1499 },
    { name: "With Leadnator",      wa: 0,    email: 0,    ads: 0,    crm: 1499, us: true },
  ];
  const totalOther = COMPETITORS[0].wa + COMPETITORS[0].email + COMPETITORS[0].ads + COMPETITORS[0].crm;
  const totalUs    = COMPETITORS[1].crm;
  const savings    = totalOther - totalUs;

  return (
    <section className="ln-section">
      <div className="ln-container">
        <SectionHead
          eyebrow="Cost savings"
          title="Save an average of ₹72,000 per year"
          sub="Stop paying for four tools. Leadnator's ₹1,499/month Growth plan includes what you used to buy separately."
        />
        <div className="ln-savings">
          {COMPETITORS.map((c, idx) => (
            <div key={c.name} className={`ln-savings-col ${c.us ? "us" : ""}`}>
              <h3>{c.name}</h3>
              <ul>
                <li><span>WhatsApp CRM</span><b>₹{c.wa.toLocaleString("en-IN")}</b></li>
                <li><span>Email platform</span><b>₹{c.email.toLocaleString("en-IN")}</b></li>
                <li><span>Ad manager tool</span><b>₹{c.ads.toLocaleString("en-IN")}</b></li>
                <li><span>Lead CRM</span><b>₹{c.crm.toLocaleString("en-IN")}</b></li>
              </ul>
              <div className="ln-savings-total">
                <span>Total / month</span>
                <b>₹{(c.wa + c.email + c.ads + c.crm).toLocaleString("en-IN")}</b>
              </div>
            </div>
          ))}
        </div>
        <div className="ln-savings-diff">
          <div>
            <span>You save</span>
            <strong>₹{savings.toLocaleString("en-IN")} / month</strong>
            <span>That's ₹{(savings * 12).toLocaleString("en-IN")} a year.</span>
          </div>
          <button className="ln-btn ln-btn-primary ln-btn-lg" onClick={() => onGoto("/signup")}>
            Start saving today <FiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

function Reasons() {
  const R = [
    { Icon: FiDollarSign, title: "Zero markup pricing",    text: "Meta bills you at cost. We don't take a cut on template sends or conversations." },
    { Icon: FiZap,        title: "12-minute setup",        text: "Embedded Signup handles Meta's WABA approval. No phone support runaround." },
    { Icon: FiShield,     title: "You own the data",       text: "Leads in your DB, files in your S3 bucket, templates on your WABA. Export and leave anytime." },
    { Icon: FiTrendingUp, title: "Real growth features",   text: "Not just messaging — full Meta Ads manager, Email marketing, CRM pipeline, AI tools." },
  ];
  return (
    <section className="ln-section ln-section-soft">
      <div className="ln-container">
        <SectionHead eyebrow="Why switch" title="The 4 reasons teams move to Leadnator" />
        <div className="ln-feat-grid">
          {R.map(({ Icon, title, text }) => (
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

function Switching({ onGoto }) {
  return (
    <section className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Migrating? We'll do the heavy lifting.</h2>
            <p>
              Our team will migrate your leads, templates and automations from
              any platform in under 48 hours. No downtime, no data loss.
            </p>
            <ul className="ln-cta-list">
              <li><FiCheck /> Free migration from any WhatsApp CRM</li>
              <li><FiCheck /> White-glove onboarding included</li>
              <li><FiCheck /> 2-day extended trial for switchers</li>
            </ul>
          </div>
          <div className="ln-cta-actions">
            <button className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" onClick={() => onGoto("/contact")}>
              Book a migration call <FiArrowRight />
            </button>
            <button className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" onClick={() => onGoto("/signup")}>
              Try free first
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

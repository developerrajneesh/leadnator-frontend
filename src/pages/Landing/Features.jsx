import {
  FiArrowRight, FiCheck, FiMessageCircle, FiMail, FiUsers, FiCpu,
  FiLayers, FiBarChart2, FiFolder, FiCalendar, FiTool, FiLifeBuoy,
  FiLink, FiZap, FiSend, FiTarget, FiShoppingBag, FiCreditCard,
  FiClock, FiPhone, FiFileText, FiInbox, FiPlus, FiTrendingUp,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SiMeta } from "react-icons/si";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

/**
 * Every marketing section here is semantically an <article> with a deep-link
 * id (#whatsapp, #meta, #email, …) so we can deep-link from the Home page
 * module tiles and from SEO landing sitemaps.
 */
export default function Features({ onGoto }) {
  useSeo({
    title: "Features — WhatsApp, Meta Ads, Email, CRM, AI & more",
    description: "Every Leadnator feature in detail. WhatsApp Cloud API broadcasts & chatbot, Meta Ads campaigns, email marketing with SMTP, lead CRM pipeline, AI Studio, file storage, calendar booking and 20+ growth tools.",
    canonical: "https://leadnator.com/features",
    keywords: "WhatsApp chatbot, WhatsApp broadcast, Meta Ads manager, email marketing SMTP, lead CRM, AI marketing tools, file storage S3, booking calendar",
  });

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/features">
      <Hero />
      <Module
        id="whatsapp" Icon={FaWhatsapp} color="#22c55e"
        eyebrow="WhatsApp Marketing"
        title="Official WhatsApp Business Cloud API — full stack"
        sub="Everything you need to run WhatsApp-first growth: broadcasts, templates, live inbox, AI chatbot, CTWA ads, catalog and payments."
        features={[
          { Icon: FiSend,         title: "Unlimited broadcasting",   text: "Reach thousands with a single click. Schedule campaigns, track opens and read rates, and segment by tags." },
          { Icon: FiCpu,          title: "AI no-code chatbot",       text: "Drag-and-drop flow builder with branching, API calls, conditionals, and GPT-powered replies." },
          { Icon: FiInbox,        title: "Multi-agent shared inbox", text: "Role-based / round-robin routing, quick replies, labels, ticketing, mark-as-important, agent analytics." },
          { Icon: FiTarget,       title: "Click-to-WhatsApp ads",    text: "Launch CTWA campaigns from Meta Ads Manager and capture every click into your Leadnator CRM." },
          { Icon: FiShoppingBag,  title: "Catalog & e-commerce",     text: "Product catalog, cart, checkout. Native Shopify + WooCommerce sync for inventory and orders." },
          { Icon: FiCreditCard,   title: "WhatsApp Payments",        text: "Accept UPI & card payments inside the chat. Auto-collect + reminders + retry logic." },
        ]}
      />
      <Module
        id="meta" Icon={SiMeta} color="#1877f2"
        eyebrow="Meta Ads"
        title="Full Meta Marketing API — campaigns, adsets, ads, audiences"
        sub="Create, run and analyze Facebook + Instagram campaigns without leaving the CRM. Lead forms sync into your pipeline instantly."
        features={[
          { Icon: FiPlus,         title: "Campaign creator wizard",  text: "Step-by-step wizard for Lead Gen, Traffic, Conversions, Engagement and Messages objectives." },
          { Icon: FiFileText,     title: "Lead form sync",           text: "Every Meta Lead Ads submission flows into your CRM via webhook — with full lead metadata and ad attribution." },
          { Icon: FiBarChart2,    title: "Real-time ad analytics",   text: "Live spend, CPC, CPM, CTR, conversions and CPL for every ad, adset and campaign." },
          { Icon: FiUsers,        title: "Custom audiences",         text: "Build lookalikes from your CRM leads. Retarget WhatsApp contacts. Sync audiences to Meta." },
          { Icon: FiTrendingUp,   title: "A/B creative testing",     text: "Run split-test campaigns with auto-budget shifting. Identify winners with statistical significance." },
          { Icon: FiLink,         title: "Lead webhook capture",     text: "Page-level Meta webhook auto-discovery — add a page once and every new lead flows in forever." },
        ]}
      />
      <Module
        id="email" Icon={FiMail} color="#ea4335"
        eyebrow="Email Marketing"
        title="Bring-your-own-SMTP email that actually delivers"
        sub="Route email through your Amazon SES, Gmail, SendGrid or any SMTP. Zero markups. Full delivery analytics."
        features={[
          { Icon: FiSend,         title: "Campaign composer",        text: "Visual email builder with templates, merge fields, subject-line A/B testing and scheduled sends." },
          { Icon: FiZap,          title: "Drip automations",         text: "Trigger-based sequences for onboarding, abandoned cart, re-engagement and upsells." },
          { Icon: FiBarChart2,    title: "Delivery analytics",       text: "Opens, clicks, bounces, unsubscribes — per campaign and per subscriber." },
          { Icon: FiFileText,     title: "Signature designer",       text: "Personal signature with social links, brand colors and avatar — used across all team members." },
          { Icon: FiUsers,        title: "Subscriber management",    text: "Import CSV, segment by tag, honor unsubscribes globally across campaigns." },
          { Icon: FiMessageCircle,title: "Own SMTP, zero markup",    text: "Pay what Amazon SES / Gmail charges. No per-email surcharge from us." },
        ]}
      />
      <Module
        id="crm" Icon={FiUsers} color="#7c3aed"
        eyebrow="Leads CRM"
        title="A CRM designed for marketers, not for data entry"
        sub="Kanban pipeline, hot-lead filters, source attribution, tags and automations — wired into WhatsApp and Meta for zero-touch capture."
        features={[
          { Icon: FiLayers,       title: "Kanban pipeline",          text: "Drag leads across stages: New → Contacted → Hot → Qualified. Multi-pipeline support for different products." },
          { Icon: FiTrendingUp,   title: "Lead scoring & funnel",    text: "AI-powered lead scoring, visual funnel analytics, conversion-rate-by-source breakdown." },
          { Icon: FiTarget,       title: "Auto-capture toggles",     text: "Decide per source whether WhatsApp inbounds / Meta form fills create leads — with defaults for status, value, tags." },
          { Icon: FiZap,          title: "Visual automations",       text: "Flow builder: trigger on new_lead / status_changed, call webhooks, send WhatsApp/email, update fields." },
          { Icon: FiFileText,     title: "CSV import & export",      text: "Bring existing leads in with column mapping. Export any filtered view to CSV in one click." },
          { Icon: FiLink,         title: "Webhooks + Zapier",        text: "Send every lead event to any URL. Native Zapier / Make integration for no-code workflows." },
        ]}
      />
      <Module
        id="ai" Icon={FiCpu} color="#f59e0b"
        eyebrow="AI Studio"
        title="20+ specialized AI tools, wired into every workflow"
        sub="Skip the blank page. Generate, rewrite, translate, score — all powered by GPT-4 and your own OpenAI key if you prefer."
        features={[
          { Icon: FiZap,          title: "AI Ad copy",               text: "Generate Meta, Google and LinkedIn ad copy tuned for your offer and audience." },
          { Icon: FiMail,         title: "AI Email writer",          text: "Write cold outreach, follow-ups, newsletters and drip sequences in seconds." },
          { Icon: FiMessageCircle,title: "AI Rewriter",              text: "Shorten, lengthen, formalize or casualize any copy. Tone slider from CEO to TikTok." },
          { Icon: FiLink,         title: "AI Translator",            text: "40+ languages with brand-voice preservation. One-click translation across campaigns." },
          { Icon: FiTrendingUp,   title: "AI Lead scorer",           text: "Rank leads 0–100 on conversion likelihood. Trainable on your closed-deal data." },
          { Icon: FiTool,         title: "Generators galore",        text: "Hashtag generator, form generator, invoice generator, UTM builder, QR code, slug, OG tag preview." },
        ]}
      />
      <Module
        id="dashboard" Icon={FiBarChart2} color="#0ea5e9"
        eyebrow="Dashboard"
        title="Real-time metrics that actually drive decisions"
        sub="A single overview that shows every channel. Funnel, source attribution, revenue-by-source, exports — no more Excel juggling."
        features={[
          { Icon: FiBarChart2,    title: "Live overview",            text: "Total leads, pipeline value, conversion rate, emails sent, WhatsApp messages — refreshed in real-time." },
          { Icon: FiLayers,       title: "Lead funnel",              text: "New → Contacted → Hot → Qualified visualization with percentage drop-off per stage." },
          { Icon: FiTarget,       title: "Source attribution",       text: "Which source (Meta, WhatsApp, referral, manual) is generating your highest-LTV leads." },
          { Icon: FiCreditCard,   title: "Revenue by source",        text: "Actual pipeline ₹ mapped back to its origin channel. Prove ROI, not vanity." },
          { Icon: FiClock,        title: "Activity feed",            text: "Real-time stream of lead_created, status_changed and campaign events across the whole team." },
          { Icon: FiFileText,     title: "Exports & reports",        text: "One-click CSV export for leads and email campaigns. Reports emailed on schedule." },
        ]}
      />
      <Module
        id="storage" Icon={FiFolder} color="#facc15"
        eyebrow="File Storage"
        title="Your S3 bucket, your files, your rules"
        sub="Every doc, image and video lives in a bucket you own. Leadnator never hosts your media by default."
        features={[
          { Icon: FiFolder,       title: "Any S3-compatible provider", text: "AWS S3, Cloudflare R2, Wasabi, Supabase Storage, MinIO — plug in your credentials and go." },
          { Icon: FiLink,         title: "Shared links",             text: "Public or signed share URLs. Expiry times, download counters, per-link analytics." },
          { Icon: FiClock,        title: "Version history",          text: "Every upload is versioned. Roll back or diff file contents on demand." },
          { Icon: FiUsers,        title: "Per-user quota",           text: "Cap storage usage per team member. Cost control without hand-holding." },
          { Icon: FiZap,          title: "Drag-drop upload",         text: "Browser upload, Gmail-style progress, parallel uploads. Automatic thumbnails." },
        ]}
      />
      <Module
        id="calendar" Icon={FiCalendar} color="#4285f4"
        eyebrow="Calendar & Booking"
        title="Calendly-style booking built into the CRM"
        sub="Public booking pages, availability rules, and reminders over WhatsApp + email — all threading back to the lead record."
        features={[
          { Icon: FiCalendar,     title: "Month / week / agenda",    text: "Three views of the same schedule. Drag-and-drop to reschedule. Color-coded by event type." },
          { Icon: FiLink,         title: "Public booking links",     text: "Share a URL (book.leadnator.com/you/sales-call) — leads pick a slot, no back-and-forth." },
          { Icon: FiClock,        title: "Availability rules",       text: "Per-day hours, buffer times, daily caps, blackout dates. Timezone-aware." },
          { Icon: FiUsers,        title: "Team round-robin",         text: "Assign bookings to whoever has capacity. Weight by seniority or geography." },
          { Icon: FaWhatsapp,     title: "WhatsApp reminders",       text: "Auto-send 24h and 1h reminders via WhatsApp + email. Reduce no-shows by 62%." },
        ]}
      />
      <Module
        id="tools" Icon={FiTool} color="#f97316"
        eyebrow="Growth Tools"
        title="20+ free utilities for everyday marketing"
        sub="Because great marketers need ten tools every day. We ship them with your account — no extra charge."
        features={[
          { Icon: FiFileText,     title: "Form generator",           text: "Build embeddable forms with custom fields. Post to any webhook or straight into your CRM." },
          { Icon: FiCreditCard,   title: "Invoice generator",        text: "Professional invoices with GST. Export PDF, email direct, mark paid." },
          { Icon: FiLink,         title: "UTM builder & shortener",  text: "Consistent UTM tags + branded short links with click analytics." },
          { Icon: FiTool,         title: "QR + OG + slug",           text: "QR codes, Open Graph preview, URL slug generator — all the internet plumbing." },
          { Icon: FiMail,         title: "Email validator",          text: "Bulk-validate emails before sending. SPF/DKIM/MX check + disposable detection." },
          { Icon: FiTrendingUp,   title: "A/B + ROI calculators",    text: "Statistical significance calculator for A/B tests. ROI calculator for ad campaigns." },
        ]}
      />
      <Module
        id="support" Icon={FiLifeBuoy} color="#ef4444"
        eyebrow="In-app Support"
        title="Support that lives inside your product"
        sub="No external helpdesk. Tickets, live chat, FAQs and docs are all inside Leadnator — Socket-powered and real-time."
        features={[
          { Icon: FiMessageCircle,title: "Ticket threads",           text: "Open tickets, reply with attachments, change priority / status / category. Admin answers pop up live." },
          { Icon: FiPhone,        title: "Live chat",                text: "Dedicated live-chat thread with the Leadnator team. Socket-powered, typing indicators, delivered receipts." },
          { Icon: FiFileText,     title: "FAQs & docs",              text: "Admin-authored FAQ + documentation library. Searchable, categorized, always up-to-date." },
          { Icon: FiZap,          title: "Priority escalation",      text: "Pro plans get <2h first-reply SLA. Starter gets <24h. All plans get human responses." },
        ]}
      />
      <Module
        id="automation" Icon={FiZap} color="#ec4899"
        eyebrow="Automation"
        title="Visual flow builder across every module"
        sub="Triggers from any channel, actions into any channel. Branch, wait, call APIs — no code, no Zapier."
        features={[
          { Icon: FiLayers,       title: "Cross-module triggers",    text: "new_lead, status_changed, message_received, form_submitted, booking_created — trigger on anything." },
          { Icon: FiLink,         title: "Any-channel actions",      text: "Send WhatsApp, email, SMS; call webhook; update field; assign owner; add tag; schedule follow-up." },
          { Icon: FiTool,         title: "Branching + conditionals", text: "If/else, switch-case, wait-for-event, wait-X-days. Build flows as complex as you need." },
          { Icon: FiMessageCircle,title: "Testable & versioned",     text: "Dry-run flows before enabling. Full event logs. Revert to any past version in one click." },
        ]}
      />
      <CtaBanner onGoto={onGoto} />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="ln-sub-hero">
      <div className="ln-container">
        <span className="ln-eyebrow">Features</span>
        <h1>Every tool you need to 10× your growth</h1>
        <p>
          Leadnator replaces WhatsApp tools, email platforms, ad managers, CRMs,
          storage, and calendar apps — all under one login, one bill, one team.
          Explore every module below.
        </p>
      </div>
    </section>
  );
}

function Module({ id, Icon, color, eyebrow, title, sub, features }) {
  return (
    <article id={id} className="ln-module">
      <div className="ln-container">
        <div className="ln-module-head">
          <div className="ln-module-ic" style={{ background: `${color}15`, color }}><Icon /></div>
          <div>
            <div className="ln-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
        </div>
        <div className="ln-feat-grid">
          {features.map(({ Icon: FI, title, text }) => (
            <div key={title} className="ln-feat">
              <div className="ln-feat-ic"><FI /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function CtaBanner({ onGoto }) {
  return (
    <section className="ln-cta">
      <div className="ln-container">
        <div className="ln-cta-card">
          <div className="ln-cta-copy">
            <h2>Try every module free for 14 days</h2>
            <p>All features unlocked. No credit card. Setup in 12 minutes.</p>
          </div>
          <div className="ln-cta-actions">
            <button className="ln-btn ln-btn-primary ln-btn-lg ln-btn-block" onClick={() => onGoto("/signup")}>
              Start FREE Trial <FiArrowRight />
            </button>
            <button className="ln-btn ln-btn-outline-dark ln-btn-lg ln-btn-block" onClick={() => onGoto("/pricing")}>
              See pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

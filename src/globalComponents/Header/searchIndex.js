import { SECTIONS } from "../Sidebar/Sidebar";

// Per-module brand color + free-form keyword aliases. These are searched
// alongside the route label so users can find pages by the names they
// actually call them in conversation ("fb ads" → Meta, "wa" → WhatsApp).
const MODULE_META = {
  dashboard:    { color: "#a78bfa", keywords: ["home", "main", "summary"] },
  leads:        { color: "#6366f1", keywords: ["crm", "contacts", "customers", "prospects", "people"] },
  meta:         { color: "#1877f2", keywords: ["facebook", "ads", "fb", "advertising", "social"] },
  instagram:    { color: "#e1306c", keywords: ["ig", "insta", "dm", "reels", "stories", "inbox"] },
  whatsapp:     { color: "#25d366", keywords: ["wa", "whatapp", "chat", "messaging", "msg", "wp"] },
  email:        { color: "#ea4335", keywords: ["mail", "smtp", "gmail", "newsletter", "outbox"] },
  integrations: { color: "#06b6d4", keywords: ["api", "connect", "third party", "apps", "plugins"] },
  storage:      { color: "#facc15", keywords: ["files", "drive", "documents", "media", "uploads"] },
  tools:        { color: "#f97316", keywords: ["utilities", "ai", "generator", "helpers"] },
  calendar:     { color: "#4285f4", keywords: ["events", "schedule", "meetings", "appointments", "agenda"] },
  pricing:      { color: "#fbbf24", keywords: ["billing", "plans", "subscription", "upgrade", "payments", "money"] },
  support:      { color: "#ef4444", keywords: ["help", "tickets", "docs", "issue", "contact us"] },
  settings:     { color: "#64748b", keywords: ["profile", "account", "preferences", "config"] },
};

// Extra keywords keyed by full path. Use these when the route's label
// alone is not enough — e.g. "/tools/qr" should also match "qr code".
const EXTRA_KEYWORDS = {
  // Dashboard
  "/dashboard/overview":   ["kpi", "stats", "metrics"],
  "/dashboard/activity":   ["timeline", "log", "feed"],
  "/dashboard/analytics":  ["insights", "charts"],
  "/dashboard/reports":    ["pdf", "export"],
  "/dashboard/exports":    ["download", "csv"],

  // Leads
  "/leads/all":            ["list", "contacts", "people"],
  "/leads/pipeline":       ["kanban", "stages", "deals", "board"],
  "/leads/funnel":         ["conversion", "stages"],
  "/leads/hot":            ["priority", "qualified"],
  "/leads/meta-forms":     ["facebook leads", "fb forms"],
  "/leads/automation":     ["workflows", "drip", "rules"],
  "/leads/import":         ["csv", "upload", "bulk"],
  "/leads/sources":        ["channels", "utm"],
  "/leads/tags":           ["labels", "lists", "segments"],
  "/leads/settings":       ["fields", "stages", "lead config"],

  // Meta Ads
  "/meta/overview":        ["fb ads dashboard", "ads home"],
  "/meta/campaigns":       ["fb campaigns", "facebook ads", "instagram ads", "boost"],
  "/meta/create":          ["new ad", "launch campaign"],
  "/meta/analytics":       ["ad performance", "spend", "roas"],
  "/meta/forms":           ["lead form", "instant form"],
  "/meta/webhook":         ["lead webhook", "fb webhook"],
  "/meta/accounts":        ["ad account", "business manager", "bm"],
  "/meta/audiences":       ["custom audience", "lookalike", "retargeting"],

  // Instagram
  "/instagram/overview":    ["ig home", "insta"],
  "/instagram/inbox":       ["dm", "direct message", "chat"],
  "/instagram/comments":    ["comment reply", "post comments"],
  "/instagram/automation":  ["ig flow", "auto dm", "keyword"],
  "/instagram/content":     ["posts", "reels", "media"],
  "/instagram/analytics":   ["ig stats"],
  "/instagram/webhook":     ["ig webhook"],
  "/instagram/settings":    ["ig config", "connect instagram"],

  // WhatsApp
  "/whatsapp/overview":    ["wa home"],
  "/whatsapp/broadcasts":  ["bulk send", "campaign", "blast", "marketing"],
  "/whatsapp/templates":   ["message template", "hsm", "approved"],
  "/whatsapp/inbox":       ["chat", "conversations", "messages"],
  "/whatsapp/automation":  ["flow", "drip", "workflow", "auto reply"],
  "/whatsapp/contacts":    ["wa contacts", "phone book"],
  "/whatsapp/chatbot":     ["bot", "auto reply", "ai bot"],
  "/whatsapp/webhook":     ["wa webhook", "incoming"],
  "/whatsapp/analytics":   ["wa stats", "delivery"],
  "/whatsapp/reports":     ["wa report"],
  "/whatsapp/forms":       ["wa form", "lead form"],
  "/whatsapp/settings":    ["wa config", "phone number", "wabа"],

  // Email
  "/email/overview":       ["email home"],
  "/email/campaigns":      ["email blast", "mail campaign", "newsletter"],
  "/email/create":         ["new email", "compose"],
  "/email/templates":      ["mail template"],
  "/email/automation":     ["drip", "sequence", "nurture"],
  "/email/subscribers":    ["mailing list", "audience"],
  "/email/analytics":      ["open rate", "click rate"],
  "/email/signature":      ["sig"],
  "/email/config":         ["smtp", "imap", "mail server", "sender"],

  // Integrations
  "/integrations/overview":  ["integrations home"],
  "/integrations/browse":    ["all apps", "marketplace", "discover"],
  "/integrations/connected": ["installed", "active apps"],
  "/integrations/webhooks":  ["incoming", "outgoing", "events"],
  "/integrations/zapier":    ["make", "n8n", "automation"],
  "/integrations/custom":    ["custom api", "build your own"],

  // Storage
  "/storage/overview": ["storage home", "drive"],
  "/storage/browse":   ["files", "folders", "my drive"],
  "/storage/recent":   ["latest files"],
  "/storage/shared":   ["shared files", "team files"],
  "/storage/trash":    ["deleted", "bin", "recycle"],
  "/storage/upload":   ["new file", "add file"],
  "/storage/settings": ["storage config"],

  // Tools
  "/tools/overview":     ["tools home"],
  "/tools/ai-ad-copy":   ["ad writer", "copy writer", "ai copy"],
  "/tools/ai-email":     ["ai mail", "email gpt"],
  "/tools/ai-rewriter":  ["paraphrase", "rephrase"],
  "/tools/ai-translator":["translate", "language"],
  "/tools/ai-hashtags":  ["tags", "hashtag generator"],
  "/tools/ai-lead-score":["scoring", "qualify lead"],
  "/tools/form":         ["form builder", "html form"],
  "/tools/invoice":      ["bill", "pdf invoice", "billing"],
  "/tools/utm":          ["url builder", "tracking links"],
  "/tools/shortener":    ["short url", "short link", "tiny url"],
  "/tools/qr":           ["qr code", "barcode"],
  "/tools/signature":    ["email signature", "sig generator"],
  "/tools/subject":      ["subject line", "email subject"],
  "/tools/validator":    ["email check", "verify email"],
  "/tools/counter":      ["word count", "character count"],
  "/tools/password":     ["pwd generator", "secure password"],
  "/tools/abtest":       ["ab test", "split test"],
  "/tools/roi":          ["roi calc", "return on investment"],
  "/tools/slug":         ["url slug", "permalink"],
  "/tools/og":           ["open graph", "social preview"],

  // Calendar
  "/calendar/overview":     ["calendar home"],
  "/calendar/month":        ["month"],
  "/calendar/week":         ["week"],
  "/calendar/agenda":       ["list", "schedule"],
  "/calendar/upcoming":     ["next events"],
  "/calendar/create":       ["new event", "schedule meeting"],
  "/calendar/availability": ["working hours", "slots"],
  "/calendar/booking":      ["book a meeting", "calendly", "scheduling link"],

  // Pricing
  "/pricing/overview": ["billing home"],
  "/pricing/plans":    ["upgrade", "subscription tiers"],
  "/pricing/current":  ["my plan", "my subscription"],
  "/pricing/invoices": ["receipts", "bills"],
  "/pricing/payment":  ["card", "payment method"],
  "/pricing/history":  ["billing log", "past invoices"],

  // Support
  "/support/overview": ["support home"],
  "/support/tickets":  ["my issues", "case"],
  "/support/new":      ["raise ticket", "open ticket"],
  "/support/faq":      ["faq", "questions"],
  "/support/docs":     ["documentation", "guide", "help center"],
  "/support/chat":     ["live chat", "talk to us"],

  // Settings
  "/settings/overview":      ["settings home"],
  "/settings/info":          ["my profile", "personal info"],
  "/settings/account":       ["account"],
  "/settings/password":      ["change password", "security", "2fa"],
  "/settings/notifications": ["alerts", "email prefs"],
  "/settings/sms":           ["sms config", "twilio"],
  "/settings/api":           ["api keys", "tokens", "developers"],
  "/settings/team":          ["users", "members", "permissions", "rbac", "roles"],
};

// Extra "virtual" entries — top-level destinations that aren't a sub-route
// of any sidebar section. Lets users search "partners" or jump to a
// module's root page directly.
const EXTRA_ENTRIES = [
  { path: "/partners", label: "Partners", module: "Public", moduleKey: "partners",
    color: "#a855f7", keywords: ["affiliate", "partner program"] },
];

let CACHED = null;

export function getSearchIndex() {
  if (CACHED) return CACHED;

  const items = [];
  Object.entries(SECTIONS).forEach(([key, sec]) => {
    const meta = MODULE_META[key] || {};
    sec.items.forEach(({ to, Icon, label }) => {
      const path = `${sec.base}/${to}`;
      const keywordSet = new Set([
        label.toLowerCase(),
        to.replace(/-/g, " "),
        key,
        sec.title.toLowerCase(),
        ...(meta.keywords || []),
        ...(EXTRA_KEYWORDS[path] || []),
      ]);
      items.push({
        path,
        label,
        module: sec.title,
        moduleKey: key,
        color: meta.color || "#64748b",
        Icon,
        keywords: Array.from(keywordSet),
      });
    });
  });

  EXTRA_ENTRIES.forEach((e) => {
    items.push({
      ...e,
      Icon: null,
      keywords: [e.label.toLowerCase(), ...(e.keywords || [])],
    });
  });

  CACHED = items;
  return items;
}

// Score how well one item matches one query token. Higher is better.
// Returns 0 if the token doesn't match the item at all.
function scoreToken(item, token) {
  if (!token) return 0;
  const t = token.toLowerCase();
  const label = item.label.toLowerCase();
  const mod   = item.module.toLowerCase();

  if (label === t)              return 200;
  if (label.startsWith(t))      return 140;
  if (label.includes(t))        return 90;
  if (mod === t)                return 110;
  if (mod.startsWith(t))        return 80;
  if (mod.includes(t))          return 50;

  let best = 0;
  for (const kw of item.keywords) {
    if (kw === t)             { best = Math.max(best, 100); continue; }
    if (kw.startsWith(t))     { best = Math.max(best, 70);  continue; }
    if (kw.includes(t))       { best = Math.max(best, 40);  continue; }
  }
  return best;
}

// Match items against a multi-token query (AND across tokens). All
// tokens must hit something on the item; the item's score is the sum.
// Pass an explicit `items` list to apply caller-side filtering (e.g.
// permission gating) before scoring.
export function searchRoutes(query, items, limit = 12) {
  const list = items || getSearchIndex();
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const item of list) {
    let total = 0;
    let allMatched = true;
    for (const t of tokens) {
      const s = scoreToken(item, t);
      if (s === 0) { allMatched = false; break; }
      total += s;
    }
    if (allMatched) scored.push({ item, score: total });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

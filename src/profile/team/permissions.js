import {
  FiGrid, FiUsers, FiTarget, FiMessageCircle, FiMail, FiLink, FiFolder,
  FiTool, FiCalendar, FiAward, FiLifeBuoy, FiSettings,
} from "react-icons/fi";

/* Module + sub-route map used by the Add/Edit Team Member permissions tree.
   The keys here line up with route path segments so the permissions
   object can be checked at render time with a simple lookup:

     perms?.[module]?.[subroute] === true

   Kept as a single source of truth for both the UI picker AND any
   future server-side gate that needs to enforce the map.
*/
export const MODULE_PERMISSIONS = [
  {
    key: "dashboard", label: "Dashboard", color: "#7c3aed", Icon: FiGrid,
    routes: [
      { key: "overview",  label: "Overview" },
      { key: "activity",  label: "Recent activity" },
      { key: "analytics", label: "Analytics" },
      { key: "reports",   label: "Reports" },
      { key: "exports",   label: "Exports" },
    ],
  },
  {
    key: "leads", label: "Leads CRM", color: "#6366f1", Icon: FiUsers,
    routes: [
      { key: "all",        label: "All leads" },
      { key: "conversations", label: "Conversations" },
      { key: "pipeline",   label: "Pipeline (Kanban)" },
      { key: "funnel",     label: "Funnel" },
      { key: "hot",        label: "Hot leads" },
      { key: "meta-forms", label: "Meta Form leads" },
      { key: "automation", label: "Automation flows" },
      { key: "import",     label: "Import CSV" },
      { key: "sources",    label: "Sources" },
      { key: "tags",       label: "Tags & lists" },
      { key: "settings",   label: "Lead settings" },
    ],
  },
  {
    key: "meta", label: "Meta Ads", color: "#1877f2", Icon: FiTarget,
    routes: [
      { key: "overview",  label: "Overview" },
      { key: "campaigns", label: "Campaigns" },
      { key: "create",    label: "Create campaign" },
      { key: "analytics", label: "Analytics" },
      { key: "forms",     label: "Lead forms" },
      { key: "webhook",   label: "Lead webhook" },
      { key: "accounts",  label: "Ad accounts" },
      { key: "audiences", label: "Audiences" },
    ],
  },
  {
    key: "instagram", label: "Instagram", color: "#e1306c", Icon: FiMessageCircle,
    routes: [
      { key: "overview",   label: "Overview" },
      { key: "inbox",      label: "DM Inbox" },
      { key: "comments",   label: "Comments" },
      { key: "automation", label: "Automation flows" },
      { key: "content",    label: "Content" },
      { key: "analytics",  label: "Analytics" },
      { key: "webhook",    label: "Webhook" },
      { key: "settings",   label: "Settings" },
    ],
  },
  {
    key: "whatsapp", label: "WhatsApp Marketing", color: "#25d366", Icon: FiMessageCircle,
    routes: [
      { key: "broadcasts", label: "Broadcasts" },
      { key: "templates",  label: "Templates" },
      { key: "inbox",      label: "Inbox" },
      { key: "automation", label: "Automation flows" },
      { key: "contacts",   label: "Contacts" },
      { key: "chatbot",    label: "Chatbot builder" },
      { key: "webhook",    label: "Webhook" },
      { key: "analytics",  label: "Analytics" },
      { key: "forms",      label: "Flows / Forms" },
      { key: "settings",   label: "Settings" },
    ],
  },
  {
    key: "email", label: "Email Marketing", color: "#ea4335", Icon: FiMail,
    routes: [
      { key: "inbox",       label: "Inbox" },
      { key: "campaigns",   label: "Campaigns" },
      { key: "create",      label: "Create campaign" },
      { key: "templates",   label: "Templates" },
      { key: "automation",  label: "Automation" },
      { key: "subscribers", label: "Subscribers" },
      { key: "analytics",   label: "Analytics" },
      { key: "signature",   label: "Signature" },
      { key: "config",      label: "SMTP config" },
    ],
  },
  {
    key: "integrations", label: "Integrations", color: "#06b6d4", Icon: FiLink,
    routes: [
      { key: "browse",    label: "Browse all" },
      { key: "connected", label: "Connected" },
      { key: "webhooks",  label: "Webhooks" },
      { key: "zapier",    label: "Zapier & Make" },
      { key: "custom",    label: "Custom integrations" },
    ],
  },
  {
    key: "storage", label: "File Storage", color: "#facc15", Icon: FiFolder,
    routes: [
      { key: "browse",   label: "My files" },
      { key: "recent",   label: "Recent" },
      { key: "shared",   label: "Shared with me" },
      { key: "trash",    label: "Trash" },
      { key: "upload",   label: "Upload" },
      { key: "settings", label: "Settings" },
    ],
  },
  {
    key: "tools", label: "Free Tools", color: "#f97316", Icon: FiTool,
    routes: [
      { key: "ai-ad-copy",    label: "AI Ad copy" },
      { key: "ai-email",      label: "AI Email writer" },
      { key: "ai-rewriter",   label: "AI Rewriter" },
      { key: "ai-translator", label: "AI Translator" },
      { key: "ai-hashtags",   label: "AI Hashtag gen" },
      { key: "ai-lead-score", label: "AI Lead scorer" },
      { key: "form",          label: "Form generator" },
      { key: "invoice",       label: "Invoice generator" },
      { key: "utm",           label: "UTM builder" },
      { key: "shortener",     label: "Link shortener" },
      { key: "qr",            label: "QR code" },
      { key: "signature",     label: "Email signature" },
      { key: "signature-creator", label: "Signature creator" },
      { key: "stamp-creator", label: "Stamp creator" },
      { key: "subject",       label: "Subject tester" },
      { key: "validator",     label: "Email validator" },
      { key: "counter",       label: "Word counter" },
      { key: "password",      label: "Password gen" },
      { key: "abtest",        label: "A/B calculator" },
      { key: "roi",           label: "ROI calculator" },
      { key: "slug",          label: "Slug generator" },
      { key: "og",            label: "OG preview" },
    ],
  },
  {
    key: "calendar", label: "Calendar", color: "#4285f4", Icon: FiCalendar,
    routes: [
      { key: "month",        label: "Month view" },
      { key: "week",         label: "Week view" },
      { key: "agenda",       label: "Agenda" },
      { key: "upcoming",     label: "Upcoming" },
      { key: "create",       label: "Create event" },
      { key: "availability", label: "Availability" },
      { key: "booking",      label: "Booking links" },
    ],
  },
  {
    key: "pricing", label: "Pricing & Billing", color: "#fbbf24", Icon: FiAward,
    routes: [
      { key: "plans",    label: "Plans" },
      { key: "current",  label: "Current subscription" },
      { key: "invoices", label: "Invoices" },
      { key: "payment",  label: "Payment methods" },
      { key: "history",  label: "Billing history" },
    ],
  },
  {
    key: "support", label: "Support", color: "#ef4444", Icon: FiLifeBuoy,
    routes: [
      { key: "tickets", label: "My tickets" },
      { key: "new",     label: "New ticket" },
      { key: "faq",     label: "FAQs" },
      { key: "docs",    label: "Documentation" },
      { key: "chat",    label: "Live chat" },
    ],
  },
  {
    key: "settings", label: "Settings", color: "#64748b", Icon: FiSettings,
    routes: [
      { key: "info",          label: "Profile info" },
      { key: "account",       label: "Account settings" },
      { key: "password",      label: "Password & security" },
      { key: "notifications", label: "Notifications" },
      { key: "sms",           label: "SMS settings" },
      { key: "api",           label: "API keys" },
      { key: "team",          label: "Team members" },
    ],
  },
];

// Return a permissions object with every sub-route set to the given value.
export function makeAllPermissions(enabled) {
  const out = {};
  for (const m of MODULE_PERMISSIONS) {
    out[m.key] = {};
    for (const r of m.routes) out[m.key][r.key] = !!enabled;
  }
  return out;
}

// Role presets — defaults when a role is picked.
export function presetForRole(role) {
  if (role === "Admin")  return makeAllPermissions(true);
  if (role === "Viewer") {
    // View-only: dashboards + list views only.
    const p = makeAllPermissions(false);
    p.dashboard = makeAllPermissions(true).dashboard;
    p.leads.all = p.leads.pipeline = p.leads.funnel = p.leads.hot = true;
    p.meta.overview = p.meta.analytics = true;
    p.instagram.inbox = p.instagram.comments = p.instagram.analytics = true;
    p.whatsapp.inbox = p.whatsapp.contacts = p.whatsapp.analytics = true;
    p.email.campaigns = p.email.analytics = true;
    p.calendar.month = p.calendar.week = p.calendar.agenda = p.calendar.upcoming = true;
    return p;
  }
  // Member: everything except admin-sensitive areas.
  const p = makeAllPermissions(true);
  p.settings.api  = false;
  p.settings.team = false;
  p.pricing.payment = false;
  return p;
}

// Count how many of a module's routes are enabled in `perms`.
export function countEnabled(perms, moduleKey) {
  const m = MODULE_PERMISSIONS.find((x) => x.key === moduleKey);
  if (!m) return { on: 0, total: 0 };
  const p = perms?.[moduleKey] || {};
  const on = m.routes.reduce((sum, r) => sum + (p[r.key] ? 1 : 0), 0);
  return { on, total: m.routes.length };
}

/* ============================================================
   Permission enforcement helpers
   Use these anywhere in the app to conditionally render/gate UI
   based on the logged-in user's permissions.

   The "owner" role (the user themselves, not a TeamMember) always
   returns true — only TeamMembers carry a permissions map.
   ============================================================ */

// Is the current user a TeamMember (rather than the Owner)?
// Backend flags this in the /auth/me + /auth/login response when the
// session belongs to a TeamMember (see TeamMember.toSafeJSON).
export function isTeamMember(user) {
  return !!(user?.isTeamMember || user?.teamMemberId);
}

// Check a single (module, subroute) pair against a permissions map.
export function canAccess(user, moduleKey, subRouteKey) {
  if (!user || !isTeamMember(user)) return true;                 // owner = full access
  const perms = user.permissions || {};
  if (!perms[moduleKey]) return false;
  // Module-level "overview" pages are read-only landing pages that just
  // describe what's inside. Anyone with ANY access to the module can see
  // them — the granular sub-route grants then control real actions.
  if (subRouteKey === "overview") {
    return Object.values(perms[moduleKey]).some((v) => v);
  }
  return !!perms[moduleKey][subRouteKey];
}

// Does the user have access to ANY sub-route in this module? Used to
// decide whether the top-level sidebar entry should be shown at all.
export function canAccessModule(user, moduleKey) {
  if (!user || !isTeamMember(user)) return true;
  const mod = user.permissions?.[moduleKey];
  if (!mod) return false;
  return Object.values(mod).some((v) => v);
}

// Return the first allowed sub-route key for a module (used for the
// landing redirect when a module has mixed permissions).
export function firstAllowedRoute(user, moduleKey) {
  if (!user || !isTeamMember(user)) {
    return MODULE_PERMISSIONS.find((m) => m.key === moduleKey)?.routes[0]?.key || null;
  }
  const mod = user.permissions?.[moduleKey] || {};
  // Prefer the overview page when the member has any access to this
  // module — it's the natural landing page (and always allowed).
  if (Object.values(mod).some((v) => v)) return "overview";
  return null;
}

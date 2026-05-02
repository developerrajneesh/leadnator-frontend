import { useMemo, useState } from "react";
import {
  FiLock, FiUsers, FiTarget, FiMessageCircle, FiMail, FiCalendar,
  FiFolder, FiCpu, FiLifeBuoy, FiUser, FiBarChart2, FiCreditCard,
  FiCopy, FiCheck, FiSearch, FiKey, FiZap, FiSettings, FiGlobe,
} from "react-icons/fi";
import MarketingLayout from "./MarketingLayout";
import { useSeo } from "./seo";

/* ==========================================================
   ApiDocs.jsx — developer-facing API reference
   Left: module sidebar · Right: grouped endpoints with
   method badges, payloads, responses, and copy-paste curl.
   Pure client-side — every module + endpoint lives in the
   `MODULES` array below so adding more is a one-liner.
   ========================================================== */

const MODULES = [
  /* ---------------- AUTH ---------------- */
  {
    id: "auth", name: "Authentication", Icon: FiLock, color: "#7c3aed",
    intro: "JWT-based auth. Every request needs an Authorization: Bearer <token> header after login, or ?token= as a query fallback for download/media URLs.",
    endpoints: [
      {
        method: "POST", path: "/api/auth/signup", auth: false,
        desc: "Create a new user and return a 7-day JWT.",
        body: { name: "Alice", email: "alice@example.com", password: "minimum-6-chars" },
        response: { token: "eyJhbGciOi…", user: { id: "u_123", name: "Alice", email: "alice@example.com", role: "user", plan: "Starter", status: "active" } },
        errors: [{ status: 400, msg: "Missing fields" }, { status: 409, msg: "Email already in use" }],
      },
      {
        method: "POST", path: "/api/auth/login", auth: false,
        desc: "Exchange email + password for a JWT.",
        body: { email: "alice@example.com", password: "…" },
        response: { token: "eyJhbGciOi…", user: { id: "u_123", name: "Alice", role: "user" } },
        errors: [{ status: 401, msg: "Invalid credentials" }],
      },
      {
        method: "GET", path: "/api/auth/me", auth: true,
        desc: "Return the logged-in user. Use to verify a stored token is still valid.",
        response: { user: { id: "u_123", name: "Alice", email: "alice@example.com", role: "user", plan: "Growth" } },
      },
      {
        method: "POST", path: "/api/auth/forgot-password", auth: false,
        desc: "Email a password-reset link (via system SMTP).",
        body: { email: "alice@example.com" },
        response: { ok: true },
      },
      {
        method: "POST", path: "/api/auth/reset-password", auth: false,
        desc: "Apply a new password given a valid reset token.",
        body: { token: "reset_xyz…", password: "new-password" },
        response: { ok: true },
      },
    ],
  },

  /* ---------------- LEADS ---------------- */
  {
    id: "leads", name: "Leads CRM", Icon: FiUsers, color: "#0ea5e9",
    intro: "CRUD your lead pipeline. Filter / search / pipeline drag-to-change-status all hit these.",
    endpoints: [
      {
        method: "GET", path: "/api/leads", auth: true,
        query: { q: "string — search name/email/phone", status: "new|contacted|hot|qualified|lost|all", source: "Facebook|WhatsApp|Manual|…|all" },
        desc: "List leads, optionally filtered.",
        response: { leads: [{ id: "l_1", name: "Bob", email: "bob@x.com", phone: "+91…", status: "new", source: "Meta Lead Ad", value: 0, tags: [], createdAt: "2026-04-20T…" }], total: 1 },
      },
      {
        method: "GET", path: "/api/leads/:id", auth: true,
        desc: "Fetch a single lead with full detail.",
        response: { id: "l_1", name: "Bob", /* … */ metaLead: { leadgenId: "…", adName: "…" } },
      },
      {
        method: "POST", path: "/api/leads", auth: true,
        body: { name: "Bob", email: "bob@x.com", phone: "+91…", source: "Manual", status: "new", tags: ["hot"], notes: "Met at conf", value: 0 },
        desc: "Create a lead. Only `owner` is forced — everything else is optional.",
        response: { id: "l_1", /* …full lead… */ },
      },
      {
        method: "PUT", path: "/api/leads/:id", auth: true,
        body: { status: "hot", value: 5000 },
        desc: "Partial update. Used by pipeline Kanban when you drag a card to another column.",
        response: { id: "l_1", status: "hot", value: 5000 },
      },
      {
        method: "DELETE", path: "/api/leads/:id", auth: true,
        desc: "Permanently delete a lead.",
        response: { deleted: "l_1" },
      },
      {
        method: "GET", path: "/api/lead-settings", auth: true,
        desc: "Per-user toggles for auto-capture from Meta Forms and WhatsApp inbound.",
        response: {
          settings: {
            metaForms: { enabled: true, defaultStatus: "new", defaultValue: 0, defaultTags: [] },
            whatsapp:  { enabled: false, firstMessageOnly: true, defaultStatus: "new", defaultValue: 0, defaultTags: ["whatsapp"] },
          },
        },
      },
      {
        method: "PUT", path: "/api/lead-settings", auth: true,
        body: { metaForms: { enabled: true }, whatsapp: { enabled: true, firstMessageOnly: true } },
        desc: "Update capture toggles. Only the fields you send are changed.",
        response: { settings: { /* …updated doc… */ } },
      },
    ],
  },

  /* ---------------- WHATSAPP ---------------- */
  {
    id: "whatsapp", name: "WhatsApp Cloud API", Icon: FiMessageCircle, color: "#22c55e",
    intro: "Every WhatsApp feature is reachable at /api/wa/*. Connection must be established via /connect or Embedded Signup before send endpoints will work.",
    endpoints: [
      {
        method: "GET", path: "/api/wa/status", auth: true,
        desc: "Current connection state + cached WABA metadata.",
        response: { connected: true, connection: { phoneNumberId: "109…", businessAccountId: "442…", verifiedName: "Acme Inc.", quality: "GREEN" } },
      },
      {
        method: "POST", path: "/api/wa/connect", auth: true,
        body: { phoneNumberId: "109…", accessToken: "EAAG…", businessAccountId: "442…", webhookVerifyToken: "optional" },
        desc: "Manual credential paste (alternative to Embedded Signup).",
        response: { connected: true, connection: { /* … */ } },
      },
      {
        method: "POST", path: "/api/wa/embedded-connect", auth: true,
        body: { code: "AUTH_CODE_FROM_FB_LOGIN", phoneNumberId: "…", wabaId: "…", businessId: "…" },
        desc: "Exchanges the OAuth code returned by Meta's Embedded Signup popup for a permanent access token.",
        response: { connected: true, connection: { /* … */ } },
      },
      {
        method: "GET", path: "/api/wa/account-info", auth: true,
        desc: "Rich WABA + phone-number info fetched from Meta Graph (tiered so permission gaps don't blank the whole payload). Cached on your connection doc.",
        response: {
          phone: { display_phone_number: "+91 95196 90019", verified_name: "Acme Inc.", quality_rating: "GREEN", messaging_limit_tier: "TIER_250", platform_type: "CLOUD_API" },
          waba:  { name: "Acme", currency: "INR", timezone_id: "71", business_verification_status: "verified", message_template_namespace: "b19a…" },
          phoneNumbers: [/* … all numbers linked to this WABA … */],
          warnings: [],
        },
      },
      {
        method: "GET", path: "/api/wa/contacts", auth: true,
        query: { q: "search term (optional)" },
        desc: "List your WhatsApp contacts. `isOnWhatsapp` is backfilled from message history automatically.",
        response: { contacts: [{ id: "c_1", name: "Bob", phone: "+919…", email: "", isOnWhatsapp: true, labels: [] }] },
      },
      {
        method: "POST", path: "/api/wa/contacts", auth: true,
        body: { name: "Bob", phone: "+919…", email: "bob@x.com", tags: ["vip"] },
        desc: "Create a contact. Probes `isOnWhatsapp` against Meta at create time; the flag may come back null if the probe can't reach Meta.",
        response: { contact: { id: "c_1", /* … */ } },
      },
      {
        method: "POST", path: "/api/wa/contacts/:id/verify", auth: true,
        body: { template: "hello_world", language: "en_US" },
        desc: "Send a template message probe to confirm whether the contact is on WhatsApp. Uses 1 message credit.",
        response: { isOnWhatsapp: true, waId: "919…" },
      },
      {
        method: "POST", path: "/api/wa/send-template", auth: true,
        body: { to: "919…", templateName: "order_shipped", language: "en_US", parameters: ["Bob", "TRK123"] },
        desc: "Send a pre-approved template message. Parameters are substituted positionally into {{1}} {{2}} … of the template body.",
        response: { messaging_product: "whatsapp", contacts: [{ wa_id: "919…", input: "919…" }], messages: [{ id: "wamid.HBgL…" }] },
      },
      {
        method: "POST", path: "/api/wa/send-text", auth: true,
        body: { to: "919…", body: "Hi there 👋" },
        desc: "Send a free-form text message. Only valid within a 24-hour active chat window (service conversation).",
        response: { messages: [{ id: "wamid.HBgL…" }] },
      },
      {
        method: "POST", path: "/api/wa/bulk-messages", auth: true,
        body: { contactIds: ["c_1", "c_2"], templateName: "flash_sale", language: "en_US", parameters: ["50% OFF"] },
        desc: "Send a template to N contacts in one call. A WhatsAppCampaign doc is created and each send is logged per-recipient.",
        response: { campaignId: "cmp_1", sent: 2, failed: 0 },
      },
      {
        method: "POST", path: "/api/wa/media/upload", auth: true,
        desc: "Multipart upload. Attach `file` field. Returns the Meta media ID usable as a header/body media reference.",
        body: { "_multipart": true, file: "<binary>" },
        response: { mediaId: "123456789" },
      },
      {
        method: "GET", path: "/api/wa/conversations", auth: true,
        desc: "Aggregated chat list with latest message + unread counts, sorted by last activity.",
        response: { conversations: [{ phone: "+919…", name: "Bob", lastMessage: { body: "Thanks!" }, lastActivity: "…", unread: 2 }] },
      },
      {
        method: "GET", path: "/api/wa/conversations/:phone", auth: true,
        desc: "Full message thread for a single contact.",
        response: { messages: [{ id: "wamid.…", direction: "inbound", type: "text", text: "Hi", ts: "…" }] },
      },
      {
        method: "POST", path: "/api/wa/conversations/:phone/reply", auth: true,
        body: { body: "Thanks for messaging!" },
        desc: "Send a text reply within an active 24-hour service window.",
        response: { message: { id: "wamid.…", direction: "outbound" } },
      },
      {
        method: "GET", path: "/api/wa/analytics", auth: true,
        query: { days: "7|14|30 (default 14)" },
        desc: "Detailed WhatsApp stats — totals, direction split, per-day, per-status, per-hour, top contacts, chatbot hits.",
        response: { totals: { /* …many fields… */ } },
      },
    ],
  },

  /* ---------------- META ADS ---------------- */
  {
    id: "meta", name: "Meta Ads", Icon: FiTarget, color: "#1877f2",
    intro: "Graph-API proxy. You connect your Meta account with OAuth, then these endpoints manage campaigns, adsets, ads, audiences and lead forms.",
    endpoints: [
      {
        method: "GET", path: "/api/meta/status", auth: true,
        desc: "Meta connection state.",
        response: { connected: true, accountId: "act_123", currency: "INR" },
      },
      {
        method: "POST", path: "/api/meta/connect", auth: true,
        body: { shortLivedToken: "EAAB…" },
        desc: "Exchange a short-lived FB token for a long-lived one and save it.",
        response: { connected: true },
      },
      {
        method: "GET", path: "/api/meta/overview/:adAccountId", auth: true,
        desc: "Aggregated 30-day overview — spend, clicks, impressions, CTR, CPC, CPL, conversions.",
        response: { spend: 12500, clicks: 2450, impressions: 120000, ctr: 2.04, cpc: 5.1, cpl: 85, conversions: 146 },
      },
      {
        method: "GET", path: "/api/meta/campaigns", auth: true,
        query: { adAccountId: "act_123" },
        desc: "List campaigns with live status.",
        response: { campaigns: [{ id: "23856…", name: "Diwali Sale", objective: "OUTCOME_LEADS", status: "ACTIVE", daily_budget: 50000 }] },
      },
      {
        method: "POST", path: "/api/meta/campaigns", auth: true,
        body: { adAccountId: "act_123", name: "Launch", objective: "OUTCOME_LEADS", daily_budget: 50000 },
        desc: "Create a campaign. Ad sets + ads are separate calls.",
        response: { id: "23857…", status: "PAUSED" },
      },
      {
        method: "POST", path: "/api/meta/campaigns/:id/pause", auth: true,
        desc: "Pause a live campaign.",
        response: { success: true },
      },
      {
        method: "POST", path: "/api/meta/campaigns/:id/activate", auth: true,
        desc: "Resume a paused campaign.",
        response: { success: true },
      },
      {
        method: "POST", path: "/api/meta/adsets", auth: true,
        body: { campaignId: "23857…", name: "Adset 1", daily_budget: 20000, targeting: { geo_locations: { countries: ["IN"] } }, destination_type: "WHATSAPP" },
        desc: "Create an ad set. `destination_type` drives the campaign flavor (WHATSAPP / PHONE_CALL / WEBSITE / ON_AD).",
        response: { id: "238572…" },
      },
      {
        method: "POST", path: "/api/meta/ads", auth: true,
        body: { adsetId: "238572…", name: "Ad 1", creative: { object_story_spec: { /* … */ } } },
        desc: "Create an ad with its creative.",
        response: { id: "238573…" },
      },
      {
        method: "GET", path: "/api/meta/insights", auth: true,
        query: { level: "ad|adset|campaign", id: "238573…", since: "2026-03-24", until: "2026-04-23" },
        desc: "Performance metrics for any ad object over a date range.",
        response: { spend: "3200", clicks: "520", impressions: "24100", ctr: "2.15", cpc: "6.15", cpl: "78" },
      },
      {
        method: "POST", path: "/api/meta/forms", auth: true,
        body: { page_id: "108…", name: "Lead form", questions: [{ type: "FULL_NAME" }, { type: "EMAIL" }] },
        desc: "Create a Meta Lead Ads form on one of your pages.",
        response: { id: "1108…" },
      },
      {
        method: "GET", path: "/api/meta/lead-forms/:formId/leads", auth: true,
        desc: "Stream lead submissions for a form (with CSV export option).",
        response: { leads: [{ id: "lgn_1", created_time: "…", field_data: [{ name: "email", values: ["bob@x.com"] }] }] },
      },
    ],
  },

  /* ---------------- EMAIL ---------------- */
  {
    id: "email", name: "Email Marketing", Icon: FiMail, color: "#ea4335",
    intro: "Bring-your-own SMTP. Configure once, then send campaigns + automations. Zero markup.",
    endpoints: [
      {
        method: "GET", path: "/api/email/config", auth: true,
        desc: "Your per-user SMTP config (password not returned).",
        response: { host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false, user: "AKIA…", fromName: "Acme", fromEmail: "hi@acme.com" },
      },
      {
        method: "PUT", path: "/api/email/config", auth: true,
        body: { host: "smtp.gmail.com", port: 587, secure: false, user: "me@acme.com", password: "app-password", fromName: "Acme", fromEmail: "me@acme.com" },
        desc: "Save SMTP credentials. Password is encrypted at rest and never re-read.",
        response: { ok: true },
      },
      {
        method: "POST", path: "/api/email/config/test", auth: true,
        body: { to: "you@example.com" },
        desc: "Send a test email to verify the SMTP config before enabling campaigns.",
        response: { ok: true, messageId: "<abc@host>" },
      },
      {
        method: "POST", path: "/api/email/campaigns", auth: true,
        body: { name: "Newsletter", subject: "April update", html: "<h1>Hi</h1>", audience: "all|segment", segmentId: null, scheduleAt: null },
        desc: "Create a campaign. `scheduleAt` null = save as draft.",
        response: { id: "ecp_1", status: "draft" },
      },
      {
        method: "POST", path: "/api/email/campaigns/:id/send", auth: true,
        desc: "Send a campaign immediately. Each recipient is tracked for opens/clicks/bounces.",
        response: { queued: 512 },
      },
      {
        method: "GET", path: "/api/email/analytics", auth: true,
        query: { days: "7|14|30" },
        desc: "Aggregate delivery metrics + per-campaign rows.",
        response: { totals: { sent: 5000, opens: 1340, clicks: 420 }, campaigns: [/* … */] },
      },
    ],
  },

  /* ---------------- CALENDAR ---------------- */
  {
    id: "calendar", name: "Calendar & Booking", Icon: FiCalendar, color: "#4285f4",
    intro: "Events, weekly availability rules and public booking pages. Public endpoints live under /api/public/booking/:id (no auth needed).",
    endpoints: [
      {
        method: "GET", path: "/api/calendar/events", auth: true,
        query: { from: "2026-04-01", to: "2026-05-01", type: "meeting|demo|…" },
        desc: "List events in a window, optionally filtered by type.",
        response: { events: [{ id: "ev_1", title: "Demo · Bob", startAt: "…", endAt: "…", type: "demo", attendees: ["bob@x.com"] }] },
      },
      {
        method: "POST", path: "/api/calendar/events", auth: true,
        body: { title: "Demo · Bob", startAt: "2026-04-25T10:00Z", endAt: "2026-04-25T10:30Z", type: "demo", attendees: ["bob@x.com"] },
        response: { event: { id: "ev_1", /* … */ } },
      },
      {
        method: "GET", path: "/api/calendar/availability", auth: true,
        desc: "Your weekly schedule + buffer + min-notice settings.",
        response: { days: [{ weekday: 1, hours: [["09:00", "13:00"], ["14:00", "18:00"]] }, /* … */ ], buffer: 15, minNotice: 60 },
      },
      {
        method: "PUT", path: "/api/calendar/availability", auth: true,
        body: { days: [/* … */], buffer: 15, minNotice: 60 },
        response: { ok: true },
      },
      {
        method: "GET", path: "/api/public/booking/:bookingTypeId", auth: false,
        desc: "Public — fetch a booking type + its available time slots for the next 14 days. Used by the public /book/:id page.",
        response: { type: { name: "15-min intro", durationMinutes: 15 }, slots: ["2026-04-24T09:00Z", "…"] },
      },
      {
        method: "POST", path: "/api/public/booking/:bookingTypeId", auth: false,
        body: { name: "Visitor", email: "v@example.com", slot: "2026-04-24T09:00Z" },
        desc: "Public — book a slot. Also creates a CalendarEvent so the host sees it in their schedule.",
        response: { booking: { id: "bk_1" } },
      },
    ],
  },

  /* ---------------- STORAGE ---------------- */
  {
    id: "storage", name: "File Storage (S3)", Icon: FiFolder, color: "#facc15",
    intro: "Your files live in your own S3-compatible bucket (AWS / R2 / Supabase / Wasabi). We never host media by default.",
    endpoints: [
      {
        method: "GET", path: "/api/storage/config", auth: true,
        desc: "Current storage credentials (keys not returned).",
        response: { provider: "aws", region: "ap-south-1", bucket: "acme-leadnator", endpoint: "" },
      },
      {
        method: "PUT", path: "/api/storage/config", auth: true,
        body: { provider: "aws|r2|supabase|wasabi|custom", accessKeyId: "AKIA…", secretAccessKey: "…", region: "ap-south-1", bucket: "acme-leadnator", endpoint: "" },
        desc: "Save S3 credentials. `endpoint` only used for custom / non-AWS providers.",
        response: { ok: true },
      },
      {
        method: "POST", path: "/api/storage/config/test", auth: true,
        desc: "Ping the configured bucket to verify credentials + permissions.",
        response: { ok: true },
      },
      {
        method: "POST", path: "/api/storage/upload", auth: true,
        body: { "_multipart": true, file: "<binary>", folder: "/" },
        desc: "Multipart upload. Writes straight to your bucket. Returns the new item record.",
        response: { item: { id: "st_1", name: "Logo.png", path: "/Logo.png", size: 18345, mime: "image/png", url: "https://…" } },
      },
      {
        method: "GET", path: "/api/storage/items", auth: true,
        query: { folder: "/", search: "optional" },
        desc: "List files + folders under a path.",
        response: { items: [{ id: "st_1", name: "Logo.png", type: "file", size: 18345 }, { id: "fd_1", name: "Invoices", type: "folder" }] },
      },
      {
        method: "GET", path: "/api/storage/items/:id/download", auth: true,
        desc: "Returns a time-limited signed download URL.",
        response: { url: "https://…?X-Amz-Signature=…" },
      },
    ],
  },

  /* ---------------- AI ---------------- */
  {
    id: "ai", name: "AI Studio", Icon: FiCpu, color: "#f59e0b",
    intro: "Single endpoint, typed generation. Provider is selected by env (gemini / openai / template). Built-in system prompts for ad / email / sms / subject / whatsapp / generic.",
    endpoints: [
      {
        method: "POST", path: "/api/ai/generate", auth: true,
        body: { type: "ad|email|sms|subject|whatsapp|generic", brief: "Diwali sale for premium kurtas, audience: women 25-45", model: "optional" },
        desc: "Generate copy using the typed prompt library.",
        response: { text: "✨ This Diwali, drape yourself in royalty…", provider: "gemini", model: "gemini-flash-latest" },
      },
      {
        method: "POST", path: "/api/ai/text", auth: true,
        body: { prompt: "Write a tweet about …", system: "You are a witty marketer.", temperature: 0.7 },
        desc: "Free-form generation with your own system prompt.",
        response: { text: "…" },
      },
      {
        method: "GET", path: "/api/ai/status", auth: true,
        desc: "Active AI provider + model.",
        response: { provider: "gemini", model: "gemini-flash-latest", ready: true },
      },
    ],
  },

  /* ---------------- DASHBOARD ---------------- */
  {
    id: "dashboard", name: "Dashboard & Reports", Icon: FiBarChart2, color: "#10b981",
    intro: "Aggregated stats powering the home dashboard. CSV exports accept JWT via ?token= for <a download> links.",
    endpoints: [
      {
        method: "GET", path: "/api/dashboard/overview", auth: true,
        desc: "Merged payload — user, leads, email campaigns, WhatsApp, storage — used by the main dashboard.",
        response: { user: { name: "…", plan: "Growth" }, leads: { total: 124, byStatus: {}, recent: [], top: [], leadsByDay: [], sourceBreakdown: [] }, email: { campaigns: 8 }, whatsapp: { contacts: 230, messages: 1820 }, storage: { files: 42 } },
      },
      {
        method: "GET", path: "/api/dashboard/activity", auth: true,
        desc: "40 most recent lead events (created / status_changed).",
        response: { events: [{ kind: "lead_created", text: "New lead Bob", ts: "…", leadId: "l_1" }] },
      },
      {
        method: "GET", path: "/api/dashboard/export/:kind", auth: true,
        query: { token: "JWT (query fallback for <a download> links)" },
        desc: "CSV export. `kind` = `leads` or `campaigns`. Returns Content-Type text/csv with attachment filename.",
        response: "(text/csv stream)",
      },
    ],
  },

  /* ---------------- SUPPORT ---------------- */
  {
    id: "support", name: "Support Tickets", Icon: FiLifeBuoy, color: "#ef4444",
    intro: "User-facing tickets + admin CRUD live here. Real-time via Socket.IO — listen for support.ticket.replied / .updated.",
    endpoints: [
      {
        method: "GET", path: "/api/support/tickets", auth: true,
        desc: "List tickets owned by the calling user.",
        response: { tickets: [{ id: "t_1", code: "T-1042", subject: "Cannot import CSV", status: "open", priority: "high", unreadForUser: 1 }] },
      },
      {
        method: "POST", path: "/api/support/tickets", auth: true,
        body: { subject: "Cannot import CSV", description: "File over 5MB errors out", category: "Technical", priority: "high" },
        desc: "Create a ticket. The description becomes the first message in the thread.",
        response: { ticket: { id: "t_1", /* … */ } },
      },
      {
        method: "POST", path: "/api/support/tickets/:id/reply", auth: true,
        body: { body: "Still happening — here's a screenshot link." },
        desc: "Reply to your own ticket. A resolved ticket auto-reopens on reply.",
        response: { ticket: { /* … */ } },
      },
      {
        method: "GET", path: "/api/support/faqs", auth: true,
        desc: "List published FAQs (admin-authored).",
        response: { faqs: [{ id: "f_1", question: "How do I…", answer: "…", category: "Getting started" }] },
      },
    ],
  },

  /* ---------------- PROFILE ---------------- */
  {
    id: "profile", name: "Profile & Team", Icon: FiUser, color: "#ec4899",
    intro: "User profile, account prefs, API keys and team member invites.",
    endpoints: [
      {
        method: "PUT", path: "/api/profile/info", auth: true,
        body: { name: "Alice", phone: "+91…", company: "Acme", bio: "…", website: "https://…" },
        response: { user: { /* … */ } },
      },
      {
        method: "PUT", path: "/api/profile/password", auth: true,
        body: { currentPassword: "…", newPassword: "…" },
        desc: "Change password. Current password is bcrypt-verified server-side.",
        response: { ok: true },
      },
      {
        method: "GET", path: "/api/profile/api-keys", auth: true,
        desc: "List your API keys (values are redacted after creation).",
        response: { keys: [{ id: "k_1", label: "Production", prefix: "ldn_live_a1b2", createdAt: "…" }] },
      },
      {
        method: "POST", path: "/api/profile/api-keys", auth: true,
        body: { label: "Production", mode: "test|live" },
        desc: "Generate a new key. The plaintext value is returned ONCE — store it immediately.",
        response: { key: { id: "k_1", label: "Production", value: "ldn_live_a1b2c3d4…" } },
      },
      {
        method: "POST", path: "/api/profile/team", auth: true,
        body: { name: "Carol", email: "carol@acme.com", role: "Admin|Member|Viewer" },
        desc: "Invite a team member. Emails them an invite link via system SMTP.",
        response: { member: { id: "m_1", status: "pending" } },
      },
    ],
  },

  /* ---------------- BILLING ---------------- */
  {
    id: "pricing", name: "Pricing & Billing", Icon: FiCreditCard, color: "#a855f7",
    intro: "Razorpay-powered. HMAC webhook verifies payments server-side before activating a subscription.",
    endpoints: [
      {
        method: "GET", path: "/api/pricing/plans", auth: true,
        desc: "All plans + duration tiers with discount %s.",
        response: { plans: [{ name: "Starter", price: 0 }, { name: "Growth", price: 1499 }, { name: "Pro", price: 3999 }] },
      },
      {
        method: "POST", path: "/api/pricing/order", auth: true,
        body: { plan: "Growth", duration: "yearly" },
        desc: "Create a Razorpay order. Client then opens the Razorpay checkout popup with the returned order id.",
        response: { orderId: "order_…", amount: 1259160, currency: "INR", razorpayKey: "rzp_test_…" },
      },
      {
        method: "POST", path: "/api/pricing/verify", auth: true,
        body: { razorpayOrderId: "order_…", razorpayPaymentId: "pay_…", razorpaySignature: "…" },
        desc: "HMAC-verify the payment, then activate the subscription and create the Invoice.",
        response: { ok: true, subscription: { /* … */ }, invoice: { id: "inv_…" } },
      },
      {
        method: "GET", path: "/api/pricing/current", auth: true,
        response: { subscription: { plan: "Growth", status: "active", renewsAt: "…" } },
      },
      {
        method: "GET", path: "/api/pricing/invoices", auth: true,
        response: { invoices: [{ id: "inv_1", amount: 1499, status: "paid", paidAt: "…" }] },
      },
    ],
  },

  /* ---------------- WEBHOOKS ---------------- */
  {
    id: "webhooks", name: "Webhooks", Icon: FiGlobe, color: "#06b6d4",
    intro: "Meta-facing webhooks. All three verify signatures from the raw request body — the server mounts these BEFORE express.json().",
    endpoints: [
      {
        method: "GET", path: "/webhooks/whatsapp", auth: false,
        desc: "Meta verification handshake. Returns hub.challenge if hub.verify_token matches your configured token.",
        query: { "hub.mode": "subscribe", "hub.verify_token": "your_token", "hub.challenge": "echo_me" },
        response: "(echoes hub.challenge)",
      },
      {
        method: "POST", path: "/webhooks/whatsapp", auth: false,
        desc: "Inbound messages + status callbacks from Meta. Persists the message, emits wa.inbound over Socket.IO, upserts the contact, and optionally triggers the chatbot + auto-creates a Lead.",
        body: { /* Meta's WhatsApp event payload */ },
        response: "200 OK (ack fast — Meta retries)",
      },
      {
        method: "POST", path: "/webhooks/facebook", auth: false,
        desc: "Meta Lead Ads events. Auto-discovers unknown pages across users' tokens, fetches the full lead via Graph, then creates a Lead if LeadSettings.metaForms.enabled = true.",
        response: "200 OK",
      },
      {
        method: "POST", path: "/webhooks/razorpay", auth: false,
        desc: "Razorpay payment events. HMAC signature verified against env RAZORPAY_WEBHOOK_SECRET before acting.",
        response: "200 OK",
      },
    ],
  },
];

/* ==========================================================
   PAGE COMPONENT
   ========================================================== */
export default function ApiDocs({ onGoto }) {
  useSeo({
    title: "Developer API — Full REST reference for WhatsApp, Meta, Email, CRM",
    description: "Complete Leadnator REST API reference. Every endpoint documented with auth, payloads, responses and curl examples. WhatsApp Cloud API, Meta Ads, Email, Leads CRM, Calendar, Storage, AI, Webhooks.",
    canonical: "https://leadnator.com/api-docs",
    keywords: "Leadnator API, WhatsApp API docs, Meta Ads API, REST API reference, webhooks, developer documentation",
  });

  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    if (!q.trim()) return MODULES;
    const ql = q.toLowerCase();
    return MODULES.map((m) => ({
      ...m,
      endpoints: m.endpoints.filter((e) =>
        e.path.toLowerCase().includes(ql) ||
        (e.desc || "").toLowerCase().includes(ql) ||
        e.method.toLowerCase().includes(ql)
      ),
    })).filter((m) => m.endpoints.length > 0);
  }, [q]);

  const active = visible.find((m) => m.id === activeId) || visible[0];

  return (
    <MarketingLayout onGoto={onGoto} currentPath="/api-docs">
      <section className="ln-sub-hero ln-api-hero">
        <div className="ln-container">
          <span className="ln-eyebrow">Developer API</span>
          <h1>REST API reference</h1>
          <p>
            Every Leadnator feature is an HTTP API. Authenticate with a JWT,
            call a dozen endpoints, ship production integrations. Docs below
            are grouped by module and include request payloads, response
            shapes, auth requirements and copy-paste curl snippets.
          </p>

          <div className="ln-api-meta">
            <div><b>Base URL</b><code>https://api.leadnator.com</code></div>
            <div><b>Auth</b><code>Authorization: Bearer &lt;JWT&gt;</code></div>
            <div><b>Content-Type</b><code>application/json</code></div>
            <div><b>API version</b><code>v1 (implied)</code></div>
          </div>
        </div>
      </section>

      <section className="ln-api-body">
        <div className="ln-container ln-api-grid">
          {/* Left — module nav */}
          <aside className="ln-api-side">
            <div className="ln-api-search">
              <FiSearch />
              <input
                placeholder="Search endpoints…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="ln-api-sidetitle">Modules</div>
            <nav className="ln-api-nav">
              {visible.map((m) => (
                <button
                  key={m.id}
                  className={`ln-api-nav-item ${activeId === m.id ? "active" : ""}`}
                  onClick={() => { setActiveId(m.id); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                >
                  <span className="ln-api-nav-ic" style={{ background: `${m.color}15`, color: m.color }}>
                    <m.Icon />
                  </span>
                  <span className="ln-api-nav-label">
                    {m.name}
                    <small>{m.endpoints.length} endpoint{m.endpoints.length === 1 ? "" : "s"}</small>
                  </span>
                </button>
              ))}
            </nav>

            <div className="ln-api-side-foot">
              <div className="ln-api-key-hint">
                <FiKey />
                <div>
                  <b>Need a key?</b>
                  <span>Sign in → Settings → API keys. Keys come in <code>ldn_test_</code> or <code>ldn_live_</code> prefixes.</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right — endpoints */}
          <main className="ln-api-main">
            {active ? (
              <ModuleDetail mod={active} />
            ) : (
              <div className="ln-api-empty">No endpoints match "{q}".</div>
            )}
          </main>
        </div>
      </section>
    </MarketingLayout>
  );
}

/* ---------------- MODULE DETAIL ---------------- */
function ModuleDetail({ mod }) {
  return (
    <div>
      <header className="ln-api-mod-head">
        <div className="ln-api-mod-ic" style={{ background: `${mod.color}15`, color: mod.color }}>
          <mod.Icon />
        </div>
        <div>
          <h2>{mod.name}</h2>
          <p>{mod.intro}</p>
        </div>
      </header>

      <div className="ln-api-endpoints">
        {mod.endpoints.map((e, i) => (
          <Endpoint key={`${e.method}-${e.path}-${i}`} e={e} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- ENDPOINT BLOCK ---------------- */
function Endpoint({ e }) {
  const [copied, setCopied] = useState(false);
  const curl = buildCurl(e);

  function copy() {
    navigator.clipboard?.writeText(curl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <article className="ln-api-ep">
      <header className="ln-api-ep-head">
        <div className="ln-api-ep-head-left">
          <span className={`ln-api-method m-${e.method.toLowerCase()}`}>{e.method}</span>
          <code className="ln-api-path">{e.path}</code>
        </div>
        <span className={`ln-api-auth ${e.auth ? "req" : "free"}`}>
          {e.auth ? <><FiLock /> Auth required</> : <><FiZap /> Public</>}
        </span>
      </header>

      {e.desc && <p className="ln-api-ep-desc">{e.desc}</p>}

      <div className="ln-api-ep-grid">
        <div>
          {e.query && (
            <>
              <div className="ln-api-ep-h">Query params</div>
              <CodeBlock data={e.query} />
            </>
          )}
          {e.body && (
            <>
              <div className="ln-api-ep-h">Request body</div>
              <CodeBlock data={e.body} />
            </>
          )}
        </div>
        <div>
          <div className="ln-api-ep-h">Response <small>200 OK</small></div>
          <CodeBlock data={e.response} />
          {e.errors && e.errors.length > 0 && (
            <>
              <div className="ln-api-ep-h">Errors</div>
              <ul className="ln-api-errors">
                {e.errors.map((err, i) => (
                  <li key={i}><code>{err.status}</code> {err.msg}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="ln-api-ep-example">
        <div className="ln-api-ep-example-head">
          <span>curl example</span>
          <button onClick={copy} className="ln-api-copy">
            {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
          </button>
        </div>
        <pre className="ln-api-code"><code>{curl}</code></pre>
      </div>
    </article>
  );
}

/* ---------------- Helpers ---------------- */
function CodeBlock({ data }) {
  const formatted = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return <pre className="ln-api-code"><code>{formatted}</code></pre>;
}

function buildCurl(e) {
  const base = "https://api.leadnator.com";
  const lines = [];
  const method = e.method === "GET" ? "" : `  -X ${e.method} \\`;
  lines.push(`curl '${base}${e.path}' \\`);
  if (method) lines.push(method);
  if (e.auth) lines.push(`  -H 'Authorization: Bearer YOUR_JWT' \\`);
  if (e.body && !(e.body && e.body._multipart)) {
    lines.push(`  -H 'Content-Type: application/json' \\`);
    lines.push(`  -d '${JSON.stringify(e.body)}'`);
  } else if (e.body && e.body._multipart) {
    lines.push(`  -F 'file=@/path/to/file.png'`);
  }
  const last = lines[lines.length - 1];
  if (last.endsWith(" \\")) lines[lines.length - 1] = last.slice(0, -2);
  return lines.join("\n");
}

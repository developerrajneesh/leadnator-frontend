// ==========================================
// Dummy data — Leadnator frontend
// Replace with real API responses later
// ==========================================

export const CURRENT_USER = {
  id: "u_001",
  name: "Deepak Sharma",
  email: "deepak.sharma@worksdelight.com",
  role: "admin",
  plan: "Growth",
  joinedAt: "2026-01-11",
};

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 299,
    tagline: "Great for solopreneurs starting out.",
    features: [
      "Up to 100 leads",
      "Basic email marketing",
      "Lead import (CSV)",
      "Email support",
    ],
    disabled: [
      "AI ad copy generation",
      "Meta Ads integration",
      "Team access",
      "API access",
    ],
    leadLimit: 100,
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    tagline: "Scale your funnel with AI and paid ads.",
    popular: true,
    features: [
      "Up to 500 leads",
      "AI content generation",
      "Meta Ads integration",
      "Advanced email automation",
      "Priority support",
    ],
    disabled: ["Unlimited API access", "Dedicated account manager"],
    leadLimit: 500,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    tagline: "Full firepower for growing teams.",
    features: [
      "Unlimited leads",
      "Full AI automation suite",
      "Meta + Google Ads",
      "API access & webhooks",
      "Team seats (up to 10)",
      "Dedicated account manager",
    ],
    disabled: [],
    leadLimit: Infinity,
  },
];

export const DURATIONS = [
  { id: "monthly",  label: "Monthly",  discount: 0,    multiplier: 1,   months: 1  },
  { id: "quarter",  label: "3 Months", discount: 0.05, multiplier: 3,   months: 3  },
  { id: "half",     label: "6 Months", discount: 0.10, multiplier: 6,   months: 6  },
  { id: "yearly",   label: "Yearly",   discount: 0.15, multiplier: 12,  months: 12, bestValue: true },
];

// -------- LEADS --------
const STATUSES = ["new", "contacted", "qualified", "hot", "lost"];
const SOURCES  = ["Meta Ads", "Google Ads", "Website", "Referral", "LinkedIn", "Manual", "Import"];
const TAGS     = ["warm", "enterprise", "startup", "b2b", "b2c", "priority"];

const FIRST = ["Aarav","Isha","Rohan","Priya","Karan","Neha","Ankit","Sneha","Rahul","Kavya","Vivek","Anjali","Arjun","Meera","Siddharth","Pooja","Nikhil","Tanya","Raj","Zoya"];
const LAST  = ["Sharma","Verma","Patel","Gupta","Singh","Khan","Mehta","Joshi","Kapoor","Reddy","Das","Iyer","Nair","Banerjee","Chopra","Malhotra"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function phoneIN()  { return "+91 " + (90000 + Math.floor(Math.random()*9999)) + " " + (10000 + Math.floor(Math.random()*89999)); }

export const LEADS = Array.from({ length: 42 }).map((_, i) => {
  const first = pick(FIRST);
  const last  = pick(LAST);
  const name  = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
  const daysAgo = Math.floor(Math.random() * 40);
  const date = new Date(Date.now() - daysAgo * 86400000);
  const tagsCount = 1 + Math.floor(Math.random() * 2);
  const tags = Array.from({ length: tagsCount }).map(() => pick(TAGS));
  return {
    id: `lead_${1000 + i}`,
    name,
    email,
    phone: phoneIN(),
    source: pick(SOURCES),
    status: pick(STATUSES),
    tags: [...new Set(tags)],
    notes: i % 4 === 0 ? "Asked for pricing. Follow up next week." : "",
    createdAt: date.toISOString(),
    value: 5000 + Math.floor(Math.random() * 95000),
  };
});

// -------- CAMPAIGNS --------
export const CAMPAIGNS = [
  { id: "c1", name: "Spring Sale Blast", status: "active",  sent: 2480, opens: 1320, clicks: 412, createdAt: "2026-04-02" },
  { id: "c2", name: "Welcome Drip",       status: "active",  sent: 980,  opens: 720,  clicks: 215, createdAt: "2026-03-18" },
  { id: "c3", name: "Re-engage Cold Leads", status: "paused", sent: 540,  opens: 122,  clicks: 33,  createdAt: "2026-03-05" },
  { id: "c4", name: "Pro Plan Upsell",    status: "draft",   sent: 0,    opens: 0,    clicks: 0,   createdAt: "2026-04-14" },
];

// -------- CHART DATA --------
export const LEADS_BY_DAY = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 14 },
  { label: "Thu", value: 25 },
  { label: "Fri", value: 32 },
  { label: "Sat", value: 19 },
  { label: "Sun", value: 22 },
];

export const SOURCE_BREAKDOWN = [
  { label: "Meta Ads",    value: 38, color: "#7c3aed" },
  { label: "Website",     value: 26, color: "#ec4899" },
  { label: "Google Ads",  value: 18, color: "#10b981" },
  { label: "Referral",    value: 12, color: "#f59e0b" },
  { label: "Other",       value: 6,  color: "#6b7280" },
];

// -------- ADMIN USERS --------
export const ADMIN_USERS = [
  { id: "u_001", name: "Deepak Sharma",   email: "deepak@worksdelight.com",  plan: "Growth",  role: "admin", leads: 214, status: "active",  joinedAt: "2026-01-11" },
  { id: "u_002", name: "Anita Desai",     email: "anita@acme.in",            plan: "Pro",     role: "user",  leads: 1280, status: "active",  joinedAt: "2025-11-30" },
  { id: "u_003", name: "Rakesh Jain",     email: "rakesh@zenstore.com",      plan: "Starter", role: "user",  leads: 72,   status: "active",  joinedAt: "2026-02-18" },
  { id: "u_004", name: "Priya Kapoor",    email: "priya@lotusco.in",         plan: "Growth",  role: "user",  leads: 418,  status: "paused",  joinedAt: "2026-02-02" },
  { id: "u_005", name: "Mohit Khanna",    email: "mohit@cloudplex.io",       plan: "Pro",     role: "user",  leads: 2140, status: "active",  joinedAt: "2025-12-09" },
];

// -------- META ADS MOCK --------
export const META_ACCOUNTS = [
  { id: "act_001", name: "Leadnator Main Ad Account", connected: true,  spend: 18420, leads: 312 },
  { id: "act_002", name: "Client - Acme Retail",     connected: true,  spend: 9200,  leads: 148 },
  { id: "act_003", name: "Client - Zen Store",       connected: false, spend: 0,     leads: 0   },
];

// -------- AI PRESETS --------
export const AI_SAMPLES = {
  ad: `🚀 Attention founders! Tired of chasing cold leads?
Leadnator turns every click into a conversation — with AI that writes your ads, emails and follow-ups in seconds.
✅ AI-generated ad copy
✅ Meta + Google Ads leads piped straight in
✅ Automated drip that closes while you sleep

Start free → leadnator.app`,
  email: `Subject: A 3-minute favour (worth ₹10k in saved time)

Hi {{firstName}},

Noticed you downloaded our pricing guide last week — quick question:
what's the #1 thing slowing your lead flow right now?

Reply with one word and I'll send a custom playbook (no pitch, promise).

— Deepak, Leadnator`,
  close: `Hey {{firstName}}, circling back one more time.
You asked about the Pro plan on Monday. Locked in 15% off if you activate before Friday — here's your link: {{upgradeLink}}
Happy to jump on a 10-min call if easier?`,
};

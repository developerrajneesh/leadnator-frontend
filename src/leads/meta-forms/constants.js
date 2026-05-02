// Dummy Meta Lead Ad accounts, forms and the leads they captured.
// Shape mirrors what Facebook Marketing API returns from
//   GET /{ad-account-id}/lead_gen_forms and
//   GET /{form-id}/leads

export const META_FORM_ACCOUNTS = [
  {
    id: "act_001",
    name: "Leadnator Main Ad Account",
    currency: "INR",
    forms: [
      { id: "f_101", name: "Spring Sale Lead Form",      createdAt: "2026-03-15", status: "active", leadsCount: 42  },
      { id: "f_102", name: "Webinar Registration",       createdAt: "2026-02-20", status: "active", leadsCount: 28  },
      { id: "f_103", name: "Pro Plan Waitlist",          createdAt: "2026-01-05", status: "archived", leadsCount: 16 },
    ],
  },
  {
    id: "act_002",
    name: "Client — Acme Retail",
    currency: "INR",
    forms: [
      { id: "f_201", name: "Diwali Offer Sign-up",       createdAt: "2026-01-10", status: "active", leadsCount: 156 },
      { id: "f_202", name: "Free Trial Request",         createdAt: "2025-12-05", status: "active", leadsCount: 72  },
    ],
  },
  {
    id: "act_003",
    name: "Client — Zen Store",
    currency: "INR",
    forms: [
      { id: "f_301", name: "Newsletter Subscribe",       createdAt: "2026-04-01", status: "active", leadsCount: 34 },
    ],
  },
];

// Pool of sample names + merged into leads below
const FIRST = ["Aarav","Isha","Rohan","Priya","Karan","Neha","Ankit","Sneha","Rahul","Kavya","Vivek","Anjali","Arjun","Meera","Siddharth","Pooja"];
const LAST  = ["Sharma","Verma","Patel","Gupta","Singh","Khan","Mehta","Joshi","Kapoor","Reddy","Das","Iyer","Nair"];
const ad    = (i) => new Date(Date.now() - i * 86400000 - Math.floor(Math.random()*3600000)).toISOString();

function build(formId, n) {
  return Array.from({ length: n }).map((_, i) => {
    const first = FIRST[(formId.charCodeAt(formId.length - 1) + i) % FIRST.length];
    const last  = LAST[(formId.charCodeAt(0) + i * 3) % LAST.length];
    return {
      id: `${formId}_l${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `+91 ${90000 + Math.floor(Math.random()*9999)} ${10000 + Math.floor(Math.random()*89999)}`,
      submittedAt: ad(Math.floor(Math.random() * 20)),
      // "answers" — what the user answered in the Meta Lead form
      answers: {
        company: ["Acme Retail", "Zen Store", "Lotus Co", "Cloudplex", "Indie Studio"][i % 5],
        jobTitle: ["Founder", "Marketing Head", "Sales Lead", "CEO", "Manager"][i % 5],
        interest: ["Pricing", "Demo", "Partnership", "Support", "Integration"][i % 5],
        budget: ["< ₹10k", "₹10–50k", "₹50k–1L", "> ₹1L"][i % 4],
      },
      synced: Math.random() > 0.3,
    };
  });
}

// Keyed by form id
export const META_FORM_LEADS = {
  f_101: build("f_101", 14),
  f_102: build("f_102", 10),
  f_103: build("f_103", 8),
  f_201: build("f_201", 20),
  f_202: build("f_202", 16),
  f_301: build("f_301", 12),
};

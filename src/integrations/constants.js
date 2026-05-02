export const CATEGORIES = [
  "All",
  "CRM",
  "Ads",
  "Email",
  "Chat",
  "Payments",
  "Analytics",
  "Storage",
  "Forms",
  "Calendar",
  "Automation",
  "AI",
  "Social",
  "Productivity",
  "E-commerce",
  "Telephony",
];

export const APPS = [
  // ───────────────────────── CRM ─────────────────────────
  { id: "hubspot",     name: "HubSpot",          category: "CRM",         desc: "Sync leads and contacts both ways.",                color: "#ff7a59", initial: "H", connected: true  },
  { id: "salesforce",  name: "Salesforce",       category: "CRM",         desc: "Enterprise CRM sync with custom field mapping.",    color: "#00a1e0", initial: "S", connected: false },
  { id: "zoho",        name: "Zoho CRM",         category: "CRM",         desc: "Push Leadnator leads into Zoho modules.",           color: "#e42527", initial: "Z", connected: false },
  { id: "pipedrive",   name: "Pipedrive",        category: "CRM",         desc: "Sync deals, leads and pipeline stages.",            color: "#1a1a1a", initial: "P", connected: false },
  { id: "freshsales",  name: "Freshsales",       category: "CRM",         desc: "Two-way contact + deal sync with Freshworks.",      color: "#16a34a", initial: "F", connected: false },
  { id: "monday",      name: "monday.com",       category: "CRM",         desc: "Push leads into monday boards.",                    color: "#ff3d57", initial: "M", connected: false },

  // ───────────────────────── Ads ─────────────────────────
  { id: "meta-ads",    name: "Meta Ads",         category: "Ads",         desc: "Auto-import leads from Lead Gen forms.",            color: "#1877f2", initial: "M", connected: true  },
  { id: "google-ads",  name: "Google Ads",       category: "Ads",         desc: "Pull conversions and audiences.",                   color: "#4285f4", initial: "G", connected: false },
  { id: "linkedin-ads",name: "LinkedIn Ads",     category: "Ads",         desc: "Sync Lead Gen Forms from LinkedIn.",                color: "#0a66c2", initial: "L", connected: false },
  { id: "tiktok-ads",  name: "TikTok Ads",       category: "Ads",         desc: "Pull leads from TikTok Lead Gen ads.",              color: "#000000", initial: "T", connected: false },
  { id: "x-ads",       name: "X (Twitter) Ads",  category: "Ads",         desc: "Promoted-tweet conversions and audiences.",         color: "#000000", initial: "X", connected: false },

  // ───────────────────────── Email ────────────────────────
  { id: "mailchimp",   name: "Mailchimp",        category: "Email",       desc: "Sync subscribers and campaign stats.",              color: "#ffe01b", initial: "M", connected: true  },
  { id: "sendgrid",    name: "SendGrid",         category: "Email",       desc: "Transactional + marketing email via SMTP / API.",   color: "#1a82e2", initial: "S", connected: false },
  { id: "ses",         name: "Amazon SES",       category: "Email",       desc: "Cheap high-deliverability email at scale.",         color: "#ff9900", initial: "A", connected: false },
  { id: "postmark",    name: "Postmark",         category: "Email",       desc: "Fast transactional email + open tracking.",         color: "#ffde00", initial: "P", connected: false },
  { id: "resend",      name: "Resend",           category: "Email",       desc: "Developer-friendly email API.",                     color: "#000000", initial: "R", connected: false },
  { id: "mailgun",     name: "Mailgun",          category: "Email",       desc: "Email APIs + bulk sending.",                        color: "#f06b22", initial: "M", connected: false },
  { id: "brevo",       name: "Brevo (Sendinblue)", category: "Email",     desc: "Email + SMS marketing.",                            color: "#0b996e", initial: "B", connected: false },

  // ───────────────────────── Chat ─────────────────────────
  { id: "slack",       name: "Slack",            category: "Chat",        desc: "Get lead notifications in a channel.",              color: "#4a154b", initial: "S", connected: true  },
  { id: "whatsapp",    name: "WhatsApp Cloud",   category: "Chat",        desc: "Official Business API for broadcasts + inbox.",     color: "#25d366", initial: "W", connected: true  },
  { id: "telegram",    name: "Telegram Bot",     category: "Chat",        desc: "Notify a chat / channel on every new lead.",        color: "#26a5e4", initial: "T", connected: false },
  { id: "discord",     name: "Discord",          category: "Chat",        desc: "Webhook lead alerts to a server channel.",          color: "#5865f2", initial: "D", connected: false },
  { id: "msteams",     name: "Microsoft Teams",  category: "Chat",        desc: "Push lead and campaign cards to Teams.",            color: "#5059c9", initial: "T", connected: false },
  { id: "intercom",    name: "Intercom",         category: "Chat",        desc: "Sync conversations and contacts.",                  color: "#0057ff", initial: "I", connected: false },
  { id: "crisp",       name: "Crisp",            category: "Chat",        desc: "Live-chat website visitors → Leadnator leads.",     color: "#1972f5", initial: "C", connected: false },

  // ────────────────────── Payments ────────────────────────
  { id: "stripe",      name: "Stripe",           category: "Payments",    desc: "Payments, subscriptions and invoicing.",            color: "#635bff", initial: "S", connected: false },
  { id: "razorpay",    name: "Razorpay",         category: "Payments",    desc: "UPI, cards and net-banking for India.",             color: "#0d2d5e", initial: "R", connected: true  },
  { id: "paypal",      name: "PayPal",           category: "Payments",    desc: "Accept global PayPal payments.",                    color: "#003087", initial: "P", connected: false },
  { id: "phonepe",     name: "PhonePe",          category: "Payments",    desc: "UPI + wallet payments at checkout.",                color: "#5f259f", initial: "P", connected: false },
  { id: "paytm",       name: "Paytm",            category: "Payments",    desc: "UPI, wallet and card payments.",                    color: "#00baf2", initial: "P", connected: false },
  { id: "cashfree",    name: "Cashfree",         category: "Payments",    desc: "Indian payment gateway + payouts.",                 color: "#0c8aff", initial: "C", connected: false },

  // ────────────────────── Analytics ───────────────────────
  { id: "ga4",         name: "Google Analytics", category: "Analytics",   desc: "Track lead-source attribution end-to-end.",         color: "#f9ab00", initial: "G", connected: true  },
  { id: "mixpanel",    name: "Mixpanel",         category: "Analytics",   desc: "Product analytics, funnels and cohorts.",           color: "#7856ff", initial: "M", connected: false },
  { id: "amplitude",   name: "Amplitude",        category: "Analytics",   desc: "Behavioural analytics + retention.",                color: "#1e61f0", initial: "A", connected: false },
  { id: "posthog",     name: "PostHog",          category: "Analytics",   desc: "Open-source product analytics + feature flags.",    color: "#1d4aff", initial: "P", connected: false },
  { id: "plausible",   name: "Plausible",        category: "Analytics",   desc: "Privacy-first website analytics.",                  color: "#5850ec", initial: "P", connected: false },
  { id: "metabase",    name: "Metabase",         category: "Analytics",   desc: "Open BI dashboards on top of your DB.",             color: "#509ee3", initial: "M", connected: false },

  // ────────────────────── Storage / DB ────────────────────
  { id: "supabase",    name: "Supabase",         category: "Storage",     desc: "Postgres backend + auth + storage + realtime.",     color: "#3ecf8e", initial: "S", connected: false },
  { id: "firebase",    name: "Firebase",         category: "Storage",     desc: "Firestore, Auth, Storage and Functions.",           color: "#ffca28", initial: "F", connected: false },
  { id: "s3",          name: "Amazon S3",        category: "Storage",     desc: "Store form attachments, exports and backups.",      color: "#569a31", initial: "S", connected: false },
  { id: "cloudinary",  name: "Cloudinary",       category: "Storage",     desc: "Image / video uploads, transformation & CDN.",      color: "#3448c5", initial: "C", connected: false },
  { id: "mongodb",     name: "MongoDB Atlas",    category: "Storage",     desc: "Managed MongoDB — already powering Leadnator.",     color: "#47a248", initial: "M", connected: true  },
  { id: "googledrive", name: "Google Drive",     category: "Storage",     desc: "Sync exports and attachments to your Drive.",       color: "#0f9d58", initial: "G", connected: false },
  { id: "dropbox",     name: "Dropbox",          category: "Storage",     desc: "Backup CSV exports automatically.",                 color: "#0061ff", initial: "D", connected: false },
  { id: "neon",        name: "Neon Postgres",    category: "Storage",     desc: "Serverless Postgres for analytics workloads.",      color: "#00e599", initial: "N", connected: false },

  // ────────────────────── Forms ──────────────────────────
  { id: "google-forms",name: "Google Forms",     category: "Forms",       desc: "Pipe form submissions straight into your leads.",   color: "#673ab7", initial: "G", connected: false },
  { id: "typeform",    name: "Typeform",         category: "Forms",       desc: "Conversational forms → Leadnator contacts.",        color: "#262627", initial: "T", connected: false },
  { id: "jotform",     name: "Jotform",          category: "Forms",       desc: "Form responses become qualified leads.",            color: "#ff6100", initial: "J", connected: false },
  { id: "tally",       name: "Tally",            category: "Forms",       desc: "Free Notion-style forms + webhook on submit.",      color: "#000000", initial: "T", connected: false },
  { id: "google-sheets",name:"Google Sheets",    category: "Forms",       desc: "2-way sync — leads update a sheet & vice-versa.",   color: "#0f9d58", initial: "G", connected: false },
  { id: "airtable",    name: "Airtable",         category: "Forms",       desc: "Use Airtable as a flexible lead database.",         color: "#fcb400", initial: "A", connected: false },

  // ────────────────────── Calendar ───────────────────────
  { id: "gcal",        name: "Google Calendar",  category: "Calendar",    desc: "Create events from appointment bookings.",          color: "#4285f4", initial: "G", connected: false },
  { id: "outlook-cal", name: "Outlook Calendar", category: "Calendar",    desc: "Sync bookings with Microsoft 365 calendars.",       color: "#0078d4", initial: "O", connected: false },
  { id: "calendly",    name: "Calendly",         category: "Calendar",    desc: "Pull every Calendly booking as a new lead.",        color: "#006bff", initial: "C", connected: false },
  { id: "calcom",      name: "Cal.com",          category: "Calendar",    desc: "Open-source scheduling with full webhooks.",        color: "#000000", initial: "C", connected: false },

  // ────────────────────── Automation ─────────────────────
  { id: "zapier",      name: "Zapier",           category: "Automation",  desc: "5,000+ apps, no code.",                             color: "#ff4a00", initial: "Z", connected: false },
  { id: "make",        name: "Make (Integromat)",category: "Automation",  desc: "Visual scenarios — multi-step automations.",        color: "#6d00cc", initial: "M", connected: false },
  { id: "n8n",         name: "n8n",              category: "Automation",  desc: "Self-hostable open-source workflow automation.",    color: "#ff6d5a", initial: "N", connected: false },
  { id: "ifttt",       name: "IFTTT",            category: "Automation",  desc: "Simple if-this-then-that triggers.",                color: "#000000", initial: "I", connected: false },
  { id: "pabbly",      name: "Pabbly Connect",   category: "Automation",  desc: "Affordable workflow automation (India-friendly).",  color: "#1f2c5b", initial: "P", connected: false },

  // ────────────────────── AI ─────────────────────────────
  { id: "gemini",      name: "Google Gemini",    category: "AI",          desc: "Default AI provider — already in services/aiService.", color: "#4285f4", initial: "G", connected: true  },
  { id: "openai",      name: "OpenAI",           category: "AI",          desc: "GPT-4o for content generation + chat.",             color: "#000000", initial: "O", connected: false },
  { id: "claude",      name: "Anthropic Claude", category: "AI",          desc: "Claude models for nuanced copy + summaries.",       color: "#cc785c", initial: "C", connected: false },
  { id: "groq",        name: "Groq",             category: "AI",          desc: "Ultra-fast LLM inference (Llama, Mixtral).",        color: "#f55036", initial: "G", connected: false },
  { id: "huggingface", name: "Hugging Face",     category: "AI",          desc: "Self-hosted open-source models.",                   color: "#ffd21e", initial: "H", connected: false },
  { id: "elevenlabs",  name: "ElevenLabs",       category: "AI",          desc: "AI voice for IVR + video voiceovers.",              color: "#000000", initial: "E", connected: false },

  // ────────────────────── Social ─────────────────────────
  { id: "instagram",   name: "Instagram",        category: "Social",      desc: "DMs, stories and posting via Meta Graph.",          color: "#e4405f", initial: "I", connected: false },
  { id: "linkedin",    name: "LinkedIn",         category: "Social",      desc: "Post company updates + scrape connection forms.",   color: "#0a66c2", initial: "L", connected: false },
  { id: "x-twitter",   name: "X (Twitter)",      category: "Social",      desc: "Schedule posts + capture replies as leads.",        color: "#000000", initial: "X", connected: false },
  { id: "youtube",     name: "YouTube",          category: "Social",      desc: "Pull video performance + comment leads.",           color: "#ff0000", initial: "Y", connected: false },

  // ────────────────────── Productivity ───────────────────
  { id: "notion",      name: "Notion",           category: "Productivity",desc: "Push qualified leads into a Notion DB.",            color: "#000000", initial: "N", connected: false },
  { id: "clickup",     name: "ClickUp",          category: "Productivity",desc: "Create tasks from new leads or campaign jobs.",     color: "#7b68ee", initial: "C", connected: false },
  { id: "asana",       name: "Asana",            category: "Productivity",desc: "New lead → new task in your project.",              color: "#f06a6a", initial: "A", connected: false },
  { id: "trello",      name: "Trello",           category: "Productivity",desc: "Push leads as cards onto a board.",                 color: "#0079bf", initial: "T", connected: false },
  { id: "linear",      name: "Linear",           category: "Productivity",desc: "Create issues from support tickets.",               color: "#5e6ad2", initial: "L", connected: false },
  { id: "github",      name: "GitHub",           category: "Productivity",desc: "Open issues from bug reports.",                     color: "#181717", initial: "G", connected: false },
  { id: "evernote",    name: "Evernote",         category: "Productivity",desc: "Save lead notes to a notebook.",                    color: "#00a82d", initial: "E", connected: false },

  // ────────────────────── E-commerce ─────────────────────
  { id: "shopify",     name: "Shopify",          category: "E-commerce",  desc: "Customers + orders sync as Leadnator leads.",       color: "#95bf47", initial: "S", connected: false },
  { id: "woocommerce", name: "WooCommerce",      category: "E-commerce",  desc: "WordPress store → leads + abandoned-cart flows.",   color: "#7f54b3", initial: "W", connected: false },
  { id: "magento",     name: "Magento",          category: "E-commerce",  desc: "Adobe Commerce orders + customers.",                color: "#ee672f", initial: "M", connected: false },
  { id: "bigcommerce", name: "BigCommerce",      category: "E-commerce",  desc: "Sync customers, orders and reviews.",               color: "#121118", initial: "B", connected: false },

  // ────────────────────── Telephony ──────────────────────
  { id: "twilio",      name: "Twilio",           category: "Telephony",   desc: "SMS + voice + WhatsApp fall-back.",                 color: "#f22f46", initial: "T", connected: false },
  { id: "exotel",      name: "Exotel",           category: "Telephony",   desc: "India-first cloud telephony + SMS.",                color: "#3a3aff", initial: "E", connected: false },
  { id: "plivo",       name: "Plivo",            category: "Telephony",   desc: "SMS + voice APIs (BYOC supported).",                color: "#3a82f7", initial: "P", connected: false },
  { id: "knowlarity",  name: "Knowlarity",       category: "Telephony",   desc: "Cloud calls + IVR + click-to-call.",                color: "#0096d6", initial: "K", connected: false },
];

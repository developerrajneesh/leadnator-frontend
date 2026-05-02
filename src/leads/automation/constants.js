export const TRIGGER_LABELS = {
  new_lead:         "New lead arrives",
  no_reply_24h:     "No reply in 24 hours",
  status_hot:       "Lead marked as Hot",
  status_qualified: "Lead marked as Qualified",
};

export const DEFAULT_AUTOMATIONS = [
  {
    id: "auto1", name: "Welcome new Meta Ads lead", trigger: "new_lead", source: "Meta Ads",
    status: "active", delay: 0, channels: { email: true, whatsapp: true },
    emailSubject: "Welcome to Leadnator, {{firstName}}!",
    emailBody: "Hi {{firstName}},\n\nThanks for showing interest. I'll personally follow up shortly.\n\n— Deepak",
    whatsappBody: "Hey {{firstName}}! Thanks for reaching out. Quick question — what's the #1 thing slowing your lead flow?",
    triggered: 128, lastRun: "2m ago",
  },
  {
    id: "auto2", name: "Website form instant reply", trigger: "new_lead", source: "Website",
    status: "active", delay: 0, channels: { email: true, whatsapp: false },
    emailSubject: "We got your message, {{firstName}}",
    emailBody: "Hi {{firstName}},\n\nYour message just landed — we'll reply within 2 hours.\n\nCheers,\nTeam Leadnator",
    whatsappBody: "", triggered: 52, lastRun: "1h ago",
  },
  {
    id: "auto3", name: "24h follow-up on no reply", trigger: "no_reply_24h", source: "any",
    status: "paused", delay: 1440, channels: { email: false, whatsapp: true },
    emailSubject: "", emailBody: "",
    whatsappBody: "Hey {{firstName}}, just checking in. Need any help?",
    triggered: 18, lastRun: "3d ago",
  },
];

// Frontend mirror of the plan feature matrix used for PAGE-ACCESS gating.
// Keep in sync with backend/config/plans.js. Only the features that fully gate a
// page live here (quota-based limits are enforced server-side per action).
const PLAN_FEATURES = {
  starter: { whatsapp: true, whatsappChatbot: false, aiChatbot: false, aiTools: false },
  growth:  { whatsapp: true, whatsappChatbot: true,  aiChatbot: false, aiTools: false },
  pro:     { whatsapp: true, whatsappChatbot: true,  aiChatbot: true,  aiTools: true },
};

export const PLAN_LABEL = { starter: "Starter", growth: "Growth", pro: "Pro" };

// The plan a feature first becomes available on (for the upgrade message).
export const FEATURE_MIN_PLAN = {
  whatsapp: "growth",
  whatsappChatbot: "growth", // manual chatbot
  aiChatbot: "pro",
  aiTools: "pro",
};

export function planKeyOf(user) {
  const key = String(user?.planKey || "").toLowerCase();
  if (PLAN_FEATURES[key]) return key;
  const name = String(user?.plan || "").toLowerCase();
  return PLAN_FEATURES[name] ? name : "starter";
}

export function hasFeature(user, feature) {
  return !!PLAN_FEATURES[planKeyOf(user)]?.[feature];
}

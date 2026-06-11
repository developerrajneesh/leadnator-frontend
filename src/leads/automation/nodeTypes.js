import {
  FiUserPlus, FiTag, FiSend, FiClock, FiZap, FiCheckSquare,
  FiMail, FiMessageSquare, FiAlertTriangle, FiHelpCircle, FiRepeat,
} from "react-icons/fi";

export const CATEGORIES = {
  trigger:   { color: "#7c3aed", bg: "#ede9fe", label: "Trigger",   subtitle: "Starts the flow" },
  action:    { color: "#0ea5e9", bg: "#e0f2fe", label: "Action",    subtitle: "Does something" },
  wait:      { color: "#f59e0b", bg: "#fef3c7", label: "Wait",      subtitle: "Delay" },
  condition: { color: "#10b981", bg: "#d1fae5", label: "Condition", subtitle: "Branches the flow" },
};

// NOTE: The "Send message" action supports Email / WhatsApp / both via a
// multi-checkbox config below. Runner (backend/services/flowRunner.js)
// reads `config.channels` and dispatches accordingly.
export const NODE_TYPES = [
  // ---- Triggers ----
  { type: "trigger.new_lead",       cat: "trigger", title: "New lead arrives",        Icon: FiUserPlus,     fields: [] },
  { type: "trigger.tag_added",      cat: "trigger", title: "Tag added to lead",       Icon: FiTag,          fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "vip" }] },
  { type: "trigger.status_changed", cat: "trigger", title: "Status changed",          Icon: FiRepeat,       fields: [{ key: "status", label: "New status", type: "select", options: ["new","contacted","qualified","hot","lost"], default: "hot" }] },

  // ---- Actions ----
  {
    type: "action.send_message", cat: "action", title: "Send message",  Icon: FiSend,
    // `channel` marks a field as email-only or whatsapp-only — the inspector
    // hides fields whose channel isn't selected. Unmarked fields always show.
    fields: [
      { key: "channels",    label: "Channels", type: "channels", default: ["email"] },
      { key: "senderId",    label: "Send from", type: "emailSender", channel: "email" },
      { key: "subject",     label: "Email subject (supports {{firstName}})", type: "text", channel: "email", placeholder: "Hi {{firstName}}, welcome to Leadnator" },
      { key: "templateId",  label: "Email template (optional — fills the body below)", type: "emailTemplate", channel: "email" },
      { key: "body",        label: "Message body (HTML for email, plain for WhatsApp)", type: "textarea", placeholder: "<p>Hi {{firstName}},</p><p>Thanks!</p>" },
      { key: "templateName",label: "WhatsApp template name (optional)", type: "text", channel: "whatsapp", placeholder: "welcome_offer" },
      { key: "language",    label: "WhatsApp template language", type: "text", channel: "whatsapp", default: "en_US" },
    ],
  },
  { type: "action.add_tag",       cat: "action", title: "Add tag to lead",       Icon: FiTag,
    fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "engaged" }] },
  { type: "action.change_status", cat: "action", title: "Change lead status",    Icon: FiZap,
    fields: [{ key: "status", label: "New status", type: "select", options: ["new","contacted","qualified","hot","lost"], default: "contacted" }] },

  // ---- Waits ----
  { type: "wait.minutes", cat: "wait", title: "Wait minutes", Icon: FiClock, fields: [{ key: "minutes", label: "Minutes", type: "number", default: 5 }] },
  { type: "wait.hours",   cat: "wait", title: "Wait hours",   Icon: FiClock, fields: [{ key: "hours",   label: "Hours",   type: "number", default: 1 }] },
  { type: "wait.days",    cat: "wait", title: "Wait days",    Icon: FiClock, fields: [{ key: "days",    label: "Days",    type: "number", default: 1 }] },

  // ---- Conditions ----
  { type: "condition.has_tag",   cat: "condition", title: "If lead has tag",   Icon: FiCheckSquare, fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "vip" }] },
  { type: "condition.has_email", cat: "condition", title: "If lead has email", Icon: FiMail,        fields: [] },
  { type: "condition.has_phone", cat: "condition", title: "If lead has phone", Icon: FiMessageSquare, fields: [] },
  { type: "condition.status_is", cat: "condition", title: "If status is",      Icon: FiHelpCircle,  fields: [{ key: "status", label: "Status", type: "select", options: ["new","contacted","qualified","hot","lost"], default: "hot" }] },
];

export function nodeMeta(type) {
  return NODE_TYPES.find((n) => n.type === type) || { type, cat: "action", title: type, Icon: FiZap, fields: [] };
}
export function isCondition(type) { return String(type || "").startsWith("condition."); }
export function isTrigger(type)   { return String(type || "").startsWith("trigger."); }

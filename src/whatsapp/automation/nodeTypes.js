import {
  FiUserPlus, FiTag, FiMessageSquare, FiClock, FiSend,
  FiCheckSquare, FiAlertTriangle, FiZap, FiHelpCircle,
} from "react-icons/fi";

export const CATEGORIES = {
  trigger:   { color: "#7c3aed", bg: "#ede9fe", label: "Trigger",   subtitle: "Starts the flow" },
  action:    { color: "#0ea5e9", bg: "#e0f2fe", label: "Action",    subtitle: "Does something" },
  wait:      { color: "#f59e0b", bg: "#fef3c7", label: "Wait",      subtitle: "Delay" },
  condition: { color: "#10b981", bg: "#d1fae5", label: "Condition", subtitle: "Branches the flow" },
};

export const NODE_TYPES = [
  // Triggers
  { type: "trigger.new_lead",      cat: "trigger", title: "New lead arrives",     Icon: FiUserPlus,    fields: [] },
  { type: "trigger.tag_added",     cat: "trigger", title: "Tag added to contact", Icon: FiTag,         fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "vip" }] },
  { type: "trigger.message_received", cat: "trigger", title: "Inbound WhatsApp message", Icon: FiMessageSquare, fields: [{ key: "keyword", label: "Contains keyword (optional)", type: "text" }] },
  { type: "trigger.no_reply",      cat: "trigger", title: "No reply for X hours", Icon: FiAlertTriangle, fields: [{ key: "hours", label: "Hours", type: "number", default: 24 }] },

  // Actions
  { type: "action.send_template",  cat: "action", title: "Send WhatsApp template", Icon: FiSend, fields: [
    { key: "templateName", label: "Template name", type: "text", placeholder: "welcome_offer" },
    { key: "language",     label: "Language",      type: "text", default: "en_US" },
  ] },
  { type: "action.send_text",      cat: "action", title: "Send plain text",        Icon: FiMessageSquare, fields: [
    { key: "body", label: "Message", type: "textarea", placeholder: "Hi {{customer_name}}, …" },
  ] },
  { type: "action.add_tag",        cat: "action", title: "Add tag to contact",     Icon: FiTag, fields: [
    { key: "tag", label: "Tag", type: "text", placeholder: "engaged" },
  ] },
  { type: "action.move_pipeline",  cat: "action", title: "Move lead to stage",     Icon: FiZap, fields: [
    { key: "stage", label: "Pipeline stage", type: "select", options: ["new","contacted","qualified","hot","lost"], default: "contacted" },
  ] },

  // Waits
  { type: "wait.minutes",  cat: "wait", title: "Wait minutes", Icon: FiClock, fields: [{ key: "minutes", label: "Minutes", type: "number", default: 5 }] },
  { type: "wait.hours",    cat: "wait", title: "Wait hours",   Icon: FiClock, fields: [{ key: "hours",   label: "Hours",   type: "number", default: 1 }] },
  { type: "wait.days",     cat: "wait", title: "Wait days",    Icon: FiClock, fields: [{ key: "days",    label: "Days",    type: "number", default: 1 }] },

  // Conditions (have two output ports: yes / no)
  { type: "condition.has_tag",     cat: "condition", title: "If contact has tag",  Icon: FiCheckSquare, fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "vip" }] },
  { type: "condition.replied",     cat: "condition", title: "If contact replied",  Icon: FiHelpCircle,  fields: [{ key: "withinHours", label: "Within hours", type: "number", default: 24 }] },
];

export function nodeMeta(type) {
  return NODE_TYPES.find((n) => n.type === type) || { type, cat: "action", title: type, Icon: FiZap, fields: [] };
}

export function isCondition(type) {
  return String(type || "").startsWith("condition.");
}

export function isTrigger(type) {
  return String(type || "").startsWith("trigger.");
}

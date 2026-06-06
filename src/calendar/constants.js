import { FiUsers, FiVideo, FiPhone, FiMail, FiCalendar } from "react-icons/fi";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const EVENT_TYPES = [
  { key: "meeting",  label: "Meeting",    color: "#7c3aed", Icon: FiUsers },
  { key: "demo",     label: "Demo",       color: "#10b981", Icon: FiVideo },
  { key: "call",     label: "Call",       color: "#f59e0b", Icon: FiPhone },
  { key: "followup", label: "Follow-up",  color: "#ec4899", Icon: FiMail },
  { key: "task",     label: "Task",       color: "#3b82f6", Icon: FiCalendar },
];

export const typeMeta = (k) => EVENT_TYPES.find((t) => t.key === k) || EVENT_TYPES[0];

export function buildDummyEvents() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = (offset, h = 10, m = 0) => {
    const x = new Date(today); x.setDate(x.getDate() + offset); x.setHours(h, m, 0, 0);
    return x.toISOString();
  };
  return [
    { id: "e1",  type: "demo",     title: "Product demo — Acme Retail",  start: d(0, 11),   end: d(0, 12),    attendees: ["anita@acme.in"], location: "Google Meet", notes: "Walk through Pro plan." },
    { id: "e2",  type: "call",     title: "Discovery call — Zen Store",  start: d(0, 15),   end: d(0, 16),    attendees: ["rakesh@zenstore.com"], location: "Phone", notes: "" },
    { id: "e3",  type: "followup", title: "Follow-up: Aarav Sharma",     start: d(1, 10),   end: d(1, 10, 30),attendees: ["aarav@example.com"], location: "Email", notes: "Send pricing." },
    { id: "e4",  type: "meeting",  title: "Weekly team sync",            start: d(2, 9, 30),end: d(2, 10, 30),attendees: ["team@leadnator.com"], location: "Conference room", notes: "" },
    { id: "e5",  type: "task",     title: "Write April newsletter",      start: d(3, 14),   end: d(3, 16),    attendees: [], location: "", notes: "Theme: deliverability." },
    { id: "e6",  type: "demo",     title: "Demo — Lotus Co",             start: d(4, 11),   end: d(4, 12),    attendees: ["priya@lotusco.in"], location: "Zoom", notes: "" },
    { id: "e7",  type: "followup", title: "Re-engage cold leads",        start: d(5, 13),   end: d(5, 14),    attendees: [], location: "Email", notes: "" },
    { id: "e8",  type: "meeting",  title: "Investor call",               start: d(7, 16),   end: d(7, 17),    attendees: ["partner@vc.com"], location: "Google Meet", notes: "" },
    { id: "e9",  type: "call",     title: "Support escalation",          start: d(-2, 10),  end: d(-2, 10, 45), attendees: [], location: "Phone", notes: "" },
    { id: "e10", type: "demo",     title: "Demo — Cloudplex",            start: d(9, 14),   end: d(9, 15),    attendees: ["mohit@cloudplex.io"], location: "Zoom", notes: "" },
    { id: "e11", type: "task",     title: "QBR prep",                    start: d(10, 10),  end: d(10, 12),   attendees: [], location: "", notes: "" },
    { id: "e12", type: "meeting",  title: "1:1 with Anita",              start: d(-1, 15),  end: d(-1, 15, 45), attendees: ["anita@worksdelight.com"], location: "Office", notes: "" },
  ];
}

export function sameDay(a, b) {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}
export function fmtTime(iso) { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
export function fmtDate(iso) { return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); }

export const DEFAULT_AVAIL = {
  timezone: "Asia/Kolkata",
  slots: [
    { day: 0, enabled: false, start: "10:00", end: "17:00" },
    { day: 1, enabled: true,  start: "10:00", end: "17:00" },
    { day: 2, enabled: true,  start: "10:00", end: "17:00" },
    { day: 3, enabled: true,  start: "10:00", end: "17:00" },
    { day: 4, enabled: true,  start: "10:00", end: "17:00" },
    { day: 5, enabled: true,  start: "10:00", end: "17:00" },
    { day: 6, enabled: false, start: "10:00", end: "14:00" },
  ],
  buffer: 15,
  minNotice: 60,
};

export const DEFAULT_BOOKING_TYPES = [
  { id: "intro-15", name: "Quick intro call", duration: 15, location: "Google Meet",
    description: "A 15-minute intro to understand your needs.", color: "#10b981" },
  { id: "demo-30", name: "Product demo", duration: 30, location: "Zoom",
    description: "Walk through Leadnator's AI and automation features.", color: "#7c3aed" },
];

export function loadAvail() {
  try { return JSON.parse(localStorage.getItem("leadnator_availability")) || DEFAULT_AVAIL; }
  catch { return DEFAULT_AVAIL; }
}
export function saveAvail(a) { localStorage.setItem("leadnator_availability", JSON.stringify(a)); }
export function loadBookingTypes() {
  try { return JSON.parse(localStorage.getItem("leadnator_booking_types")) || DEFAULT_BOOKING_TYPES; }
  catch { return DEFAULT_BOOKING_TYPES; }
}
export function saveBookingTypes(list) { localStorage.setItem("leadnator_booking_types", JSON.stringify(list)); }

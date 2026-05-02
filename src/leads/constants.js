export const PIPELINE_STAGES = [
  { key: "new",       label: "New",        color: "#3b82f6" },
  { key: "contacted", label: "Contacted",  color: "#f59e0b" },
  { key: "qualified", label: "Qualified",  color: "#10b981" },
  { key: "hot",       label: "Hot",        color: "#ef4444" },
  { key: "lost",      label: "Lost",       color: "#9ca3af" },
];

export const STATUSES = ["all", "new", "contacted", "qualified", "hot", "lost"];

export function waNumber(phone) {
  return (phone || "").replace(/\D/g, "");
}

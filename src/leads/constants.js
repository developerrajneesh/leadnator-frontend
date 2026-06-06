/** Default columns — server copies these per user until customized. */
export const DEFAULT_PIPELINE_STAGES = [
  { key: "new",       label: "New",        color: "#3b82f6", system: true },
  { key: "contacted", label: "Contacted",  color: "#f59e0b", system: true },
  { key: "qualified", label: "Qualified",  color: "#10b981", system: true },
  { key: "hot",       label: "Hot",        color: "#ef4444", system: true },
  { key: "lost",      label: "Lost",       color: "#9ca3af", system: true },
];

/** @deprecated use usePipelineStages() */
export const PIPELINE_STAGES = DEFAULT_PIPELINE_STAGES;

/** Keys of auto-created default columns (metadata only — still editable/deletable). */
export const SYSTEM_STAGE_KEYS = new Set(DEFAULT_PIPELINE_STAGES.map((s) => s.key));

export function normalizePipelineStages(list) {
  const defaultKeys = SYSTEM_STAGE_KEYS;
  return (list || []).map((s) => {
    const key = String(s?.key ?? "").trim().toLowerCase();
    return {
      ...s,
      key,
      label: String(s?.label ?? "").trim() || key,
      color: s?.color || "#7c3aed",
      system: !!(s?.system || defaultKeys.has(key)),
    };
  });
}

export function waNumber(phone) {
  return (phone || "").replace(/\D/g, "");
}

// Per-type wizard state lives in sessionStorage so refresh doesn't lose work.

const KEY = (type) => `leadnator_meta_wizard_${type}`;

export function loadState(type) {
  try { return JSON.parse(sessionStorage.getItem(KEY(type)) || "{}"); }
  catch { return {}; }
}

export function saveState(type, patch) {
  const cur = loadState(type);
  const next = { ...cur, ...patch };
  sessionStorage.setItem(KEY(type), JSON.stringify(next));
  return next;
}

export function clearState(type) {
  sessionStorage.removeItem(KEY(type));
}

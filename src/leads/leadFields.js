// Shared helpers for user-customizable lead fields (table columns + card fields).

export const HIDDEN_FIRST = new Set(["id", "_id", "__v", "owner", "organization", "ownerId"]);
export const DEFAULT_CARD_FIELDS = ["email", "source", "value", "tags"];

// Flatten an object into dot-paths. Nested objects recurse; arrays are leaves.
export function flattenKeys(obj, prefix, set) {
  for (const [k, v] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flattenKeys(v, path, set);
    else set.add(path);
  }
}

// Union of all (flattened) keys across the leads, minus internal ones.
export function discoverFields(leads, limit = 300) {
  const set = new Set();
  for (const l of (leads || []).slice(0, limit)) flattenKeys(l, "", set);
  return [...set].filter((k) => !HIDDEN_FIRST.has(k.split(".")[0]));
}

// Defaults first (in order), then everything else alphabetically.
export function orderFields(allFields, defaults) {
  const inDefault = defaults.filter((k) => allFields.includes(k));
  const rest = allFields.filter((k) => !defaults.includes(k)).sort();
  return [...inDefault, ...rest];
}

export function humanize(key) {
  return key.split(".").pop()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function getByPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function formatValue(val, key) {
  if (val == null || val === "") return "—";
  if (Array.isArray(val)) {
    return val.length ? val.map((v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ") : "—";
  }
  if (typeof val === "object") return JSON.stringify(val);
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (/(at|date)$/i.test(key) && typeof val === "string" && !Number.isNaN(Date.parse(val))) {
    return new Date(val).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  return String(val);
}

import { useEffect, useMemo, useState } from "react";
import { FiUpload, FiPlus, FiRefreshCw, FiColumns } from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import { profileApi } from "../../api/profile";
import { usePipelineStages } from "../usePipelineStages";
import LeadTable from "./components/LeadTable";
import LeadTableSkeleton from "./components/LeadTableSkeleton";
import AddLeadModal from "./components/AddLeadModal";

const COLS_KEY = "leadnator_lead_columns";
const DEFAULT_COLS = ["name", "email", "phone", "source", "status", "tags", "value", "createdAt"];
// First-segment keys to never offer as columns (internal/relations).
const HIDDEN_FIRST = new Set(["id", "_id", "__v", "owner", "organization", "ownerId"]);

// Flatten an object into dot-paths. Nested objects recurse; arrays are leaves.
function flattenKeys(obj, prefix, set) {
  for (const [k, v] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flattenKeys(v, path, set);
    else set.add(path);
  }
}
function humanize(key) {
  return key.split(".").pop()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function AllLeads() {
  const { leads, loading, error, reload, addLead } = useLeads();
  const { stages } = usePipelineStages();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showCols, setShowCols] = useState(false);
  // localStorage gives an instant first paint; the DB is the source of truth and
  // is loaded just after mount so the preference follows the user across devices.
  const [visibleCols, setVisibleCols] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(COLS_KEY)); return Array.isArray(s) && s.length ? s : DEFAULT_COLS; }
    catch { return DEFAULT_COLS; }
  });

  useEffect(() => {
    let alive = true;
    profileApi.settings()
      .then((r) => {
        const cols = r?.settings?.leadColumns;
        if (alive && Array.isArray(cols) && cols.length) {
          setVisibleCols(cols);
          try { localStorage.setItem(COLS_KEY, JSON.stringify(cols)); } catch { /* ignore */ }
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (source !== "all" && l.source !== source) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !(l.phone || "").includes(q)) return false;
      }
      return true;
    });
  }, [leads, query, status, source]);

  const sources = useMemo(() => ["all", ...new Set(leads.map((l) => l.source))], [leads]);

  // All available columns discovered from the lead objects (incl. nested keys).
  const allColumns = useMemo(() => {
    const set = new Set();
    for (const l of leads.slice(0, 300)) flattenKeys(l, "", set);
    return [...set].filter((k) => !HIDDEN_FIRST.has(k.split(".")[0]));
  }, [leads]);

  // Defaults first (in order), then the rest alphabetically.
  const orderedAll = useMemo(() => {
    const inDefault = DEFAULT_COLS.filter((k) => allColumns.includes(k));
    const rest = allColumns.filter((k) => !DEFAULT_COLS.includes(k)).sort();
    return [...inDefault, ...rest];
  }, [allColumns]);

  const tableCols = useMemo(
    () => orderedAll.filter((k) => visibleCols.includes(k)).map((k) => ({ key: k, label: humanize(k) })),
    [orderedAll, visibleCols],
  );

  // Persist to localStorage (instant) + the user's settings in the DB.
  function persistCols(next) {
    try { localStorage.setItem(COLS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    profileApi.saveSettings({ leadColumns: next }).catch(() => {});
  }
  function toggleCol(key) {
    setVisibleCols((cur) => {
      const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
      persistCols(next);
      return next;
    });
  }
  function resetCols() {
    setVisibleCols(DEFAULT_COLS);
    persistCols(DEFAULT_COLS);
  }

  async function handleAdd(lead) {
    try {
      await addLead(lead);
      setShowAdd(false);
    } catch (err) {
      alert(err.message || "Failed to add lead.");
    }
  }

  return (
    <>
      <h1 className="page-title">All leads</h1>
      <p className="page-subtitle">Manage, search and convert your full lead database.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        {/* Manage columns */}
        <div style={{ position: "relative" }}>
          <button className="btn btn-outline" onClick={() => setShowCols((v) => !v)}>
            <FiColumns /> Columns
          </button>
          {showCols && (
            <>
              <div onClick={() => setShowCols(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 41, width: 290, maxHeight: 400,
                overflowY: "auto", background: "white", border: "1px solid var(--border)", borderRadius: 12,
                boxShadow: "0 12px 32px rgba(15,23,42,0.16)", padding: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ fontSize: 13 }}>Manage columns</strong>
                  <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 12 }} onClick={resetCols}>Reset</button>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                  Pick what the table shows. Nested fields appear as <code>parent.child</code>.
                </div>
                {orderedAll.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>No leads yet.</div>
                ) : (
                  orderedAll.map((k) => (
                    <label
                      key={k}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <input type="checkbox" checked={visibleCols.includes(k)} onChange={() => toggleCol(k)} />
                      <span style={{ flex: 1 }}>{humanize(k)}</span>
                      {k.includes(".") && <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{k}</span>}
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <button className="btn btn-outline" onClick={reload} disabled={loading}>
          <FiRefreshCw /> Refresh
        </button>
        <button className="btn btn-outline"><FiUpload /> Import CSV</button>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiPlus /> Add lead</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
          <button onClick={reload} style={{ marginLeft: 10, color: "#b91c1c", background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      <div className="toolbar">
        <input placeholder="Search by name, email or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          {sources.map((s) => <option key={s} value={s}>{s === "all" ? "All sources" : s}</option>)}
        </select>
      </div>

      {loading && leads.length === 0 ? (
        <LeadTableSkeleton rows={8} />
      ) : (
        <LeadTable leads={filtered} columns={tableCols} />
      )}

      {showAdd && (
        <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </>
  );
}

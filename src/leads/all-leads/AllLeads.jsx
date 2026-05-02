import { useMemo, useState } from "react";
import { FiUpload, FiPlus, FiRefreshCw } from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import { STATUSES } from "../constants";
import LeadTable from "./components/LeadTable";
import LeadTableSkeleton from "./components/LeadTableSkeleton";
import AddLeadModal from "./components/AddLeadModal";

export default function AllLeads() {
  const { leads, loading, error, reload, addLead } = useLeads();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

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
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          {sources.map((s) => <option key={s} value={s}>{s === "all" ? "All sources" : s}</option>)}
        </select>
      </div>

      {loading && leads.length === 0 ? (
        <LeadTableSkeleton rows={8} />
      ) : (
        <LeadTable leads={filtered} />
      )}

      {showAdd && (
        <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </>
  );
}

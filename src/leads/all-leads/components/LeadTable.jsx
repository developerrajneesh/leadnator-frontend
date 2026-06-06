import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useLeads } from "../../../api/hooks";
import EditLeadModal from "./EditLeadModal";
import LeadStatusBadge from "../../components/LeadStatusBadge";
import { usePipelineStages } from "../../usePipelineStages";

// Read a dot-path value (e.g. "metaLead.leadgenId") from a lead object.
function getByPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Render any value sensibly: arrays joined, objects as JSON, dates formatted.
function formatValue(val, key) {
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

const FALLBACK_COLS = [
  { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
  { key: "source", label: "Source" }, { key: "status", label: "Status" }, { key: "tags", label: "Tags" },
  { key: "value", label: "Value" }, { key: "createdAt", label: "Created" },
];

export default function LeadTable({ leads, columns }) {
  const navigate = useNavigate();
  const { updateLead, removeLead } = useLeads();
  const { stages } = usePipelineStages();
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState("");

  const cols = columns && columns.length ? columns : FALLBACK_COLS;

  async function handleDelete(lead) {
    if (!confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    setBusy(lead.id);
    try { await removeLead(lead.id); }
    catch (err) { alert(err.message || "Failed to delete lead."); }
    finally { setBusy(""); }
  }

  async function handleSave(patch) {
    try {
      await updateLead(editing.id, patch);
      setEditing(null);
    } catch (err) { alert(err.message || "Failed to update lead."); }
  }

  // Special-cased rendering for known columns; everything else is generic.
  function renderCell(l, key) {
    if (key === "name") return (<><span className="avatar-sm">{(l.name || "?")[0]}</span><strong>{l.name}</strong></>);
    if (key === "status") return <LeadStatusBadge status={l.status} stages={stages} />;
    if (key === "tags") {
      return (l.tags || []).length
        ? l.tags.map((t) => <span key={t} className="badge" style={{ background: "#f3f4f6", color: "#374151", marginRight: 4 }}>{t}</span>)
        : "—";
    }
    if (key === "value") return `₹${Number(l.value || 0).toLocaleString()}`;
    if (key === "email" || key === "phone") return getByPath(l, key) || "—";
    return formatValue(getByPath(l, key), key);
  }

  return (
    <>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cols.map((c) => <th key={c.key}>{c.label}</th>)}
                <th style={{ width: 140, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  {cols.map((c) => <td key={c.key}>{renderCell(l, c.key)}</td>)}
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="admin-action" title="View details" onClick={() => navigate(`/leads/all/${l.id}`)}><FiEye /></button>
                      <button className="admin-action" title="Edit" onClick={() => setEditing(l)}><FiEdit2 /></button>
                      <button className="admin-action danger" title="Delete" disabled={busy === l.id} onClick={() => handleDelete(l)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={cols.length + 1} className="empty">No leads match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditLeadModal
          lead={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

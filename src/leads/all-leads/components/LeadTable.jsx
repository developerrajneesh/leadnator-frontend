import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useLeads } from "../../../api/hooks";
import EditLeadModal from "./EditLeadModal";

export default function LeadTable({ leads }) {
  const navigate = useNavigate();
  const { updateLead, removeLead } = useLeads();
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState("");

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

  return (
    <>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Contact</th><th>Source</th><th>Status</th><th>Tags</th>
                <th>Created</th><th>Value</th><th style={{ width: 140, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td><span className="avatar-sm">{l.name[0]}</span><strong>{l.name}</strong></td>
                  <td><div>{l.email}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{l.phone}</div></td>
                  <td>{l.source}</td>
                  <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                  <td>{l.tags.map(t => <span key={t} className="badge" style={{ background: "#f3f4f6", color: "#374151", marginRight: 4 }}>{t}</span>)}</td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>₹{l.value.toLocaleString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        className="admin-action"
                        title="View details"
                        onClick={() => navigate(`/leads/all/${l.id}`)}
                      ><FiEye /></button>
                      <button
                        className="admin-action"
                        title="Edit"
                        onClick={() => setEditing(l)}
                      ><FiEdit2 /></button>
                      <button
                        className="admin-action danger"
                        title="Delete"
                        disabled={busy === l.id}
                        onClick={() => handleDelete(l)}
                      ><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={8} className="empty">No leads match your filters.</td></tr>}
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

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiTag, FiCalendar,
  FiTrendingUp, FiMessageCircle, FiUser, FiFileText, FiRefreshCw,
} from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";
import { api } from "../../api/client";
import { useLeads } from "../../api/hooks";
import EditLeadModal from "./components/EditLeadModal";
import QuickContactModal from "../pipeline/components/QuickContactModal";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateLead, removeLead } = useLeads();

  const [lead, setLead]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");
  const [editing, setEdit]  = useState(false);
  const [contactTab, setContactTab] = useState(null);

  async function load() {
    setLoad(true); setError("");
    try { const r = await api.leads.get(id); setLead(r.lead); }
    catch (err) { setError(err.message); }
    finally { setLoad(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function handleSave(patch) {
    try {
      const updated = await updateLead(id, patch);
      setLead(updated);
      setEdit(false);
    } catch (err) { alert(err.message || "Failed to update."); }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    try { await removeLead(id); navigate("/leads/all"); }
    catch (err) { alert(err.message || "Failed to delete."); }
  }

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading lead…</div>;
  }
  if (error || !lead) {
    return (
      <div className="card" style={{ padding: 30 }}>
        <div style={{ color: "#b91c1c", marginBottom: 10 }}>{error || "Lead not found."}</div>
        <button className="btn btn-outline" onClick={() => navigate("/leads/all")}><FiArrowLeft /> Back to leads</button>
      </div>
    );
  }

  const initial = (lead.name || "?")[0].toUpperCase();
  const created = lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const updated = lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <>
      {/* Back + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="btn btn-ghost" onClick={() => navigate("/leads/all")}>
          <FiArrowLeft /> All leads
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
          <button className="btn btn-outline" onClick={() => setEdit(true)}><FiEdit2 /> Edit</button>
          <button className="btn btn-outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={handleDelete}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="card" style={{ padding: 24, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
            color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, flexShrink: 0,
          }}>{initial}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 24, display: "flex", alignItems: "center", gap: 10 }}>
              {lead.name}
              <span className={`badge ${lead.status}`} style={{ fontSize: 11 }}>{lead.status}</span>
            </h1>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              {lead.source} · Added {created}
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Lead value</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>
              ₹{(lead.value || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick contact buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            disabled={!lead.email}
            onClick={() => setContactTab("email")}
            title={lead.email || "No email on file"}
          ><FiMail /> Email</button>
          <button
            className="btn btn-outline"
            disabled={!lead.phone}
            onClick={() => setContactTab("whatsapp")}
            style={{ color: "#25d366", borderColor: "#bbf7d0" }}
            title={lead.phone || "No phone on file"}
          ><SiWhatsapp /> WhatsApp</button>
          <a className="btn btn-outline" href={lead.phone ? `tel:${lead.phone}` : undefined} style={{ pointerEvents: lead.phone ? "auto" : "none", opacity: lead.phone ? 1 : 0.5 }}>
            <FiPhone /> Call
          </a>
        </div>
      </div>

      {/* Details + notes grid */}
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}><FiUser /> Contact details</div>
          <DetailRow icon={<FiMail />} label="Email" value={lead.email || "—"} />
          <DetailRow icon={<FiPhone />} label="Phone" value={lead.phone || "—"} />
          <DetailRow icon={<FiTrendingUp />} label="Source" value={lead.source || "—"} />
          <DetailRow icon={<FiMessageCircle />} label="Status" value={<span className={`badge ${lead.status}`}>{lead.status}</span>} />
          <DetailRow icon={<FiCalendar />} label="Created" value={created} />
          <DetailRow icon={<FiCalendar />} label="Updated" value={updated} />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}><FiTag /> Tags & notes</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Tags</div>
            {(lead.tags || []).length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No tags yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {lead.tags.map((t) => (
                  <span key={t} className="badge" style={{ background: "#eef2ff", color: "#4338ca" }}>{t}</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <FiFileText /> Notes
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap",
              padding: 12, background: "#f9fafb", borderRadius: 8,
              minHeight: 80, color: lead.notes ? "var(--text)" : "var(--text-muted)",
              fontStyle: lead.notes ? "normal" : "italic",
            }}>
              {lead.notes || "No notes. Click Edit to add notes for this lead."}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditLeadModal lead={lead} onClose={() => setEdit(false)} onSave={handleSave} />
      )}
      {contactTab && (
        <QuickContactModal key={`${lead.id}-${contactTab}`} lead={lead} initialTab={contactTab} onClose={() => setContactTab(null)} />
      )}
    </>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 16, flexShrink: 0, width: 20 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, wordBreak: "break-word" }}>{value}</div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClipboard, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiExternalLink,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const CATEGORIES = [
  "SIGN_UP", "SIGN_IN", "APPOINTMENT_BOOKING", "LEAD_GENERATION",
  "CONTACT_US", "CUSTOMER_SUPPORT", "SURVEY", "OTHER",
];

export default function Forms() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [cats, setCats] = useState(["LEAD_GENERATION"]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.metaFlows(); setFlows(r.flows || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await waApi.createMetaFlow({ name: name.trim(), categories: cats });
      notify.success(`Flow "${name}" created`);
      setShowNew(false); setName(""); setCats(["LEAD_GENERATION"]);
      navigate(`/whatsapp/forms/${r.flow.id}`);
    } catch (err) { notify.error(err.message); }
    finally { setCreating(false); }
  }

  async function remove(f) {
    if (f.status !== "DRAFT") {
      notify.warn("Only DRAFT flows can be deleted. Use Meta Business Manager to deprecate a published flow.");
      return;
    }
    if (!confirm(`Delete draft "${f.name}"? This cannot be undone.`)) return;
    setDeletingId(f.id);
    try { await waApi.deleteMetaFlow(f.id); notify.success("Flow deleted"); load(); }
    catch (err) { notify.error(err.message); }
    finally { setDeletingId(""); }
  }

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiClipboard style={{ color: "#7c3aed" }} /> WhatsApp Forms
      </h1>
      <p className="page-subtitle">
        Interactive multi-screen forms (WhatsApp Flows) — appointment booking, lead capture, surveys. Build once, send from the inbox or chatbot.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><FiPlus /> New form</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card" style={{ width: 520, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiClipboard /> New WhatsApp Form</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Appointment booking" />
            </div>
            <div className="form-group">
              <label>Categories * (pick at least one)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CATEGORIES.map((c) => {
                  const on = cats.includes(c);
                  return (
                    <button
                      key={c} type="button"
                      onClick={() => setCats(on ? cats.filter((x) => x !== c) : [...cats, c])}
                      style={{
                        padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                        border: `1px solid ${on ? "#7c3aed" : "var(--border)"}`,
                        background: on ? "#f5f3ff" : "white", color: on ? "#7c3aed" : "var(--text-muted)",
                      }}
                    >{c.replace(/_/g, " ")}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: 10, background: "#f5f3ff", color: "#5b21b6", borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
              We'll create the flow as <strong>DRAFT</strong> on your WABA. You'll edit the JSON next, then publish.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim() || !cats.length}>
                {creating ? "Creating…" : "Create & open editor"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiClipboard /> {flows.length} flow{flows.length === 1 ? "" : "s"}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Name</th><th>Categories</th><th>Status</th><th>Updated</th>
              <th style={{ width: 180, textAlign: "right" }}>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 140 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <span className="skel" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : flows.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  No forms yet. Click <strong>New form</strong> to create your first one.
                </td></tr>
              ) : flows.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong><div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{f.id}</div></td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)" }}>{(f.categories || []).join(", ")}</td>
                  <td>
                    <span className={`badge ${f.status === "PUBLISHED" ? "qualified" : f.status === "DRAFT" ? "contacted" : "lost"}`}>
                      {f.status?.toLowerCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {f.updated_time ? new Date(f.updated_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="admin-action" onClick={() => navigate(`/whatsapp/forms/${f.id}`)}><FiEdit /> Edit</button>
                      <button
                        className="admin-action danger"
                        onClick={() => remove(f)}
                        disabled={deletingId === f.id}
                        title={f.status !== "DRAFT" ? "Only drafts can be deleted" : "Delete"}
                      ><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

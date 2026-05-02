import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCpu, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiPlay, FiPause,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

export default function Chatbot() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.chatbots(); setBots(r.chatbots || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await waApi.createChatbot({ name: name.trim() });
      notify.success(`Chatbot "${r.chatbot.name}" created`);
      navigate(`/whatsapp/chatbot/${r.chatbot.id}`);
    } catch (err) { notify.error(err.message); }
    finally { setCreating(false); }
  }

  async function toggle(bot) {
    const status = bot.status === "active" ? "paused" : "active";
    try {
      await waApi.updateChatbot(bot.id, { status });
      notify.info(`Chatbot ${status === "active" ? "activated" : "paused"}`);
      load();
    } catch (err) { notify.error(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this chatbot? This cannot be undone.")) return;
    try { await waApi.deleteChatbot(id); notify.success("Chatbot deleted"); load(); }
    catch (err) { notify.error(err.message); }
  }

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiCpu style={{ color: "#7c3aed" }} /> WhatsApp Chatbot
      </h1>
      <p className="page-subtitle">
        Build a keyword-driven bot that replies to incoming WhatsApp messages with interactive CTAs — quick-reply, open URL, call a number, or copy a promo code.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); setName(""); }}>
          <FiPlus /> New chatbot
        </button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiCpu /> New chatbot</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Chatbot name *</label>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Support bot" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
                {creating ? "Creating…" : "Create & open builder"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiCpu /> {bots.length} chatbot{bots.length === 1 ? "" : "s"}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Status</th><th>Steps</th><th>Messages handled</th>
                <th>Last active</th><th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 50 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 90 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="skel" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel" style={{ width: 70, height: 28, borderRadius: 6 }} />
                        <span className="skel" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : bots.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  No chatbots yet. Click "New chatbot" to build your first one.
                </td></tr>
              ) : bots.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.name}</strong>
                    {b.description && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.description}</div>}
                  </td>
                  <td><span className={`badge ${b.status === "active" ? "qualified" : b.status === "paused" ? "contacted" : "lost"}`}>{b.status}</span></td>
                  <td>{(b.steps || []).length}</td>
                  <td>{b.messagesHandled || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {b.lastHandledAt ? new Date(b.lastHandledAt).toLocaleString("en-IN") : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" onClick={() => navigate(`/whatsapp/chatbot/${b.id}`)}><FiEdit /> Edit</button>
                      <button
                        className="admin-action"
                        onClick={() => toggle(b)}
                        style={b.status !== "active" ? { background: "#dcfce7", color: "#166534", fontWeight: 600 } : undefined}
                      >
                        {b.status === "active" ? <><FiPause /> Pause</> : <><FiPlay /> Activate</>}
                      </button>
                      <button className="admin-action danger" onClick={() => remove(b.id)}><FiTrash2 /></button>
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

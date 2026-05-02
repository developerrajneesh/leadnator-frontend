import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiPlay, FiPause } from "react-icons/fi";
import { waApi } from "../../api/whatsapp";

export default function Automation() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await waApi.flows();
      setFlows(res.flows || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function createFlow(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await waApi.createFlow({
        name: name.trim(),
        nodes: [],
        edges: [],
        status: "draft",
      });
      navigate(`/whatsapp/automation/${res.flow.id}`);
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  }

  async function toggleStatus(flow) {
    const status = flow.status === "active" ? "paused" : "active";
    try {
      await waApi.updateFlow(flow.id, { ...flow, status });
      await load();
    } catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this flow? This cannot be undone.")) return;
    try {
      await waApi.deleteFlow(id);
      await load();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">WhatsApp — Automation</h1>
      <p className="page-subtitle">Visual flows that trigger on lead actions and send WhatsApp messages.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); setName(""); }}><FiPlus /> New flow</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={createFlow} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiZap /> New automation flow</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Flow name *</label>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome new leads" />
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
          <FiZap /> {flows.length} flow{flows.length === 1 ? "" : "s"}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Flow</th><th>Status</th><th>Nodes</th><th>Runs</th><th>Updated</th><th style={{ width: 200 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 120 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
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
              ) : flows.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  No flows yet. Click "New flow" to start building one.
                </td></tr>
              ) : flows.map((f) => (
                <tr key={f.id}>
                  <td>
                    <strong>{f.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>{f.id}</div>
                  </td>
                  <td>
                    <span className={`badge ${f.status === "active" ? "qualified" : f.status === "paused" ? "contacted" : "lost"}`}>{f.status}</span>
                  </td>
                  <td>{(f.nodes || []).length} nodes · {(f.edges || []).length} links</td>
                  <td>{f.runs || 0}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {f.updatedAt ? new Date(f.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" onClick={() => navigate(`/whatsapp/automation/${f.id}`)} title="Edit">
                        <FiEdit /> Edit
                      </button>
                      <button className="admin-action" onClick={() => toggleStatus(f)} title={f.status === "active" ? "Pause" : "Activate"}>
                        {f.status === "active" ? <FiPause /> : <FiPlay />}
                      </button>
                      <button className="admin-action danger" onClick={() => remove(f.id)} title="Delete"><FiTrash2 /></button>
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiPlay, FiPause } from "react-icons/fi";
import { igApi } from "../../api/instagram";

const TRIGGERS = {
  "dm.received": "New DM received",
  "comment.new": "New comment on post",
  "story.mention": "Story mention",
  "keyword.dm": "DM contains keyword",
};

export default function Automation() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("dm.received");

  async function load() {
    setLoading(true);
    try {
      const r = await igApi.flows();
      setFlows(r.flows || []);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createFlow(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const r = await igApi.createFlow({ name: name.trim(), trigger, nodes: [], edges: [], status: "draft" });
      navigate(`/instagram/automation/${r.flow.id}`);
    } catch (err) { alert(err.message); }
  }

  async function toggleStatus(flow) {
    const status = flow.status === "active" ? "paused" : "active";
    try {
      await igApi.updateFlow(flow.id, { ...flow, status });
      await load();
    } catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this flow?")) return;
    try {
      await igApi.deleteFlow(id);
      await load();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Instagram — Automation</h1>
      <p className="page-subtitle">Automate DMs, comment replies, and keyword triggers.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><FiPlus /> New flow</button>
      </div>

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={createFlow} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiZap /> New automation</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Flow name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome DM" />
            </div>
            <div className="form-group">
              <label>Trigger</label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
                {Object.entries(TRIGGERS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Flow</th><th>Trigger</th><th>Status</th><th>Runs</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 24 }}>Loading…</td></tr>
              ) : flows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, color: "var(--text-muted)" }}>No flows yet. Create one to automate DMs and comments.</td></tr>
              ) : flows.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td style={{ fontSize: 12 }}>{TRIGGERS[f.trigger] || f.trigger}</td>
                  <td><span className={`badge badge-${f.status === "active" ? "green" : "gray"}`}>{f.status}</span></td>
                  <td>{f.runs || 0}</td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => navigate(`/instagram/automation/${f.id}`)}>
                      <FiEdit /> Edit
                    </button>
                    <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => toggleStatus(f)}>
                      {f.status === "active" ? <FiPause /> : <FiPlay />}
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: "#b91c1c" }} onClick={() => remove(f.id)}>
                      <FiTrash2 />
                    </button>
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

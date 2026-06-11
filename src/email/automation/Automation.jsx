import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiPlus, FiPlay, FiPause, FiTrash2, FiEdit2, FiInfo } from "react-icons/fi";
import { leadFlowApi } from "../../api/leadFlows";
import { isEmailFlow, summarize } from "./emailFlowModel";

export default function Automation() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await leadFlowApi.list();
      setFlows((res.flows || []).filter(isEmailFlow));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function toggleStatus(flow) {
    const next = flow.status === "active" ? "paused" : "active";
    setBusy(flow.id);
    try {
      await leadFlowApi.update(flow.id, { status: next });
      await load();
    } catch (err) { alert(err.message); }
    finally { setBusy(""); }
  }

  async function remove(flow) {
    if (!confirm(`Delete "${flow.name}"? This can't be undone.`)) return;
    setBusy(flow.id);
    try { await leadFlowApi.remove(flow.id); await load(); }
    catch (err) { alert(err.message); }
    finally { setBusy(""); }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Email — Automation</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Drip sequences that send emails when a lead does something.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/email/automation/new")}><FiPlus /> New email flow</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, margin: "14px 0", fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div className="card" style={{ padding: 0, marginTop: 16 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Flow</th><th>Trigger</th><th>Emails</th><th>Status</th><th>Runs</th><th style={{ width: 170 }}>Actions</th></tr></thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 160 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 120 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 50 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 30 }} /></td>
                    <td><span className="skel" style={{ width: 120, height: 28, borderRadius: 6 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : flows.length === 0 ? (
        <div className="card" style={{ maxWidth: 720, padding: 30, textAlign: "center", marginTop: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ede9fe", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>
            <FiZap />
          </div>
          <h3 style={{ marginBottom: 6 }}>No email automations yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
            Build a drip sequence — pick a trigger, then add wait + send-email steps. Emails go out from
            your verified domain automatically.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/email/automation/new")}><FiPlus /> Create your first flow</button>

          <div style={{ marginTop: 24, padding: 14, background: "#f9fafb", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", textAlign: "left", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: 6 }}><FiInfo /> Quick recipes:</strong>
            • <strong>Welcome series:</strong> New lead → Wait 5 min → "Welcome" → Wait 2 days → "Tips"<br />
            • <strong>Re-engagement:</strong> Tag "cold" added → Send "Win-back offer"<br />
            • <strong>Demo follow-up:</strong> New lead → Wait 1 hour → Send "Demo invite"
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginTop: 16 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Flow</th><th>Trigger</th><th>Emails</th><th>Status</th><th>Runs</th><th style={{ width: 170 }}>Actions</th></tr></thead>
              <tbody>
                {flows.map((f) => {
                  const trig = (f.nodes || []).find((n) => n.type?.startsWith("trigger."));
                  return (
                    <tr key={f.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/email/automation/${f.id}`)}>
                      <td><strong>{f.name}</strong></td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{trig?.title || trig?.type || "—"}</td>
                      <td>{summarize(f)}</td>
                      <td>
                        <span className={`badge ${f.status === "active" ? "qualified" : f.status === "paused" ? "lost" : "contacted"}`}>{f.status}</span>
                      </td>
                      <td>{f.runs || 0}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="admin-action" disabled={busy === f.id} onClick={() => toggleStatus(f)} title={f.status === "active" ? "Pause" : "Activate"}>
                            {f.status === "active" ? <FiPause /> : <FiPlay />}
                          </button>
                          <button className="admin-action" onClick={() => navigate(`/email/automation/${f.id}`)} title="Edit"><FiEdit2 /></button>
                          <button className="admin-action danger" disabled={busy === f.id} onClick={() => remove(f)} title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

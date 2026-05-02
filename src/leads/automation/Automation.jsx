import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiZap, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiPlay, FiPause, FiSend,
  FiAlertTriangle, FiList, FiCheck, FiX, FiMail, FiMessageSquare,
} from "react-icons/fi";
import { leadFlowApi } from "../../api/leadFlows";

export default function Automation() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [testResult, setTestResult] = useState(null);     // { flowName, lead, steps, ok, message }
  const [logsFor, setLogsFor] = useState(null);           // { name, runs, lastRunAt, runLog }
  const [logsLoading, setLogsLoading] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try { const r = await leadFlowApi.list(); setFlows(r.flows || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await leadFlowApi.create({ name: name.trim(), nodes: [], edges: [], status: "draft" });
      navigate(`/leads/automation/${r.flow.id}`);
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  }

  async function toggle(flow) {
    const status = flow.status === "active" ? "paused" : "active";
    try { await leadFlowApi.update(flow.id, { ...flow, status }); load(); }
    catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this flow? This cannot be undone.")) return;
    try { await leadFlowApi.remove(id); load(); } catch (err) { alert(err.message); }
  }

  async function testRun(flow) {
    setTesting(flow.id);
    try {
      const r = await leadFlowApi.test(flow.id);
      setTestResult({ flowName: flow.name, ...r });
      load();
    } catch (err) {
      setTestResult({ flowName: flow.name, ok: false, message: err.message, steps: [] });
    } finally { setTesting(""); }
  }

  async function openLogs(flow) {
    setLogsLoading(true);
    setLogsFor({ name: flow.name, runs: flow.runs || 0, lastRunAt: flow.lastRunAt, runLog: [] });
    try { const r = await leadFlowApi.logs(flow.id); setLogsFor(r); }
    catch (err) { setLogsFor({ name: flow.name, error: err.message, runLog: [] }); }
    finally { setLogsLoading(false); }
  }

  const draftCount = flows.filter((f) => f.status === "draft").length;

  return (
    <>
      <h1 className="page-title">Leads — Automation</h1>
      <p className="page-subtitle">Visual flows that trigger on lead events and send Email, WhatsApp, or both — using <strong>your</strong> saved SMTP + WhatsApp credentials.</p>

      {draftCount > 0 && (
        <div style={{
          padding: 14, background: "#fef3c7", color: "#92400e", borderRadius: 10,
          marginBottom: 14, fontSize: 13, display: "flex", gap: 10, alignItems: "flex-start",
          border: "1px solid #fde68a",
        }}>
          <FiAlertTriangle style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>{draftCount} flow{draftCount === 1 ? " is" : "s are"} in draft</strong> — draft flows do <u>not</u> auto-fire when a new lead is added.
            Click the <FiPlay style={{ verticalAlign: "middle" }} /> <strong>Activate</strong> button to make them live, or click <FiSend style={{ verticalAlign: "middle" }} /> <strong>Test</strong> to run once against your latest lead.
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); setName(""); }}>
          <FiPlus /> New flow
        </button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiZap /> New lead automation</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group"><label>Flow name *</label>
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
          <FiZap />{" "}
          {loading
            ? <span className="skel skel-line" style={{ width: 80, verticalAlign: "middle" }} />
            : `${flows.length} flow${flows.length === 1 ? "" : "s"}`}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Flow</th><th>Status</th><th>Nodes</th><th>Runs</th><th>Last run</th><th style={{ width: 320 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 120 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="skel skel-square" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel skel-square" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel skel-square" style={{ width: 70, height: 28, borderRadius: 6 }} />
                        <span className="skel skel-square" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : flows.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No flows yet. Click "New flow" to start building.</td></tr>
              ) : flows.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td><span className={`badge ${f.status === "active" ? "qualified" : f.status === "paused" ? "contacted" : "lost"}`}>{f.status}</span></td>
                  <td>{(f.nodes || []).length} nodes · {(f.edges || []).length} links</td>
                  <td>{f.runs || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {f.lastRunAt ? new Date(f.lastRunAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="admin-action" onClick={() => navigate(`/leads/automation/${f.id}`)}><FiEdit /> Edit</button>
                      <button className="admin-action" onClick={() => testRun(f)} disabled={testing === f.id} title="Run once against your most recent lead">
                        <FiSend /> {testing === f.id ? "Running…" : "Test"}
                      </button>
                      <button
                        className="admin-action"
                        onClick={() => toggle(f)}
                        title={f.status === "active" ? "Pause (stop auto-firing)" : "Activate (auto-fire on trigger)"}
                        style={f.status !== "active" ? { background: "#dcfce7", color: "#166534", fontWeight: 600 } : undefined}
                      >
                        {f.status === "active" ? <><FiPause /> Pause</> : <><FiPlay /> Activate</>}
                      </button>
                      <button className="admin-action" onClick={() => openLogs(f)} title="View run history"><FiList /> Logs</button>
                      <button className="admin-action danger" onClick={() => remove(f.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Test-run result modal ---- */}
      {testResult && (
        <div onClick={() => setTestResult(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 620, maxWidth: "96vw", maxHeight: "86vh", overflowY: "auto" }}>
            <div className="card-header">
              <div className="card-title">
                {testResult.ok ? <FiCheck style={{ color: "#10b981" }} /> : <FiX style={{ color: "#b91c1c" }} />}
                Test run — {testResult.flowName}
              </div>
              <button className="btn btn-ghost" onClick={() => setTestResult(null)}>×</button>
            </div>
            {testResult.lead && (
              <div style={{ padding: 12, background: "var(--primary-50)", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                Ran against lead: <strong>{testResult.lead.name}</strong>
                {testResult.lead.email && <> · <FiMail style={{ verticalAlign: "middle" }} /> {testResult.lead.email}</>}
                {testResult.lead.phone && <> · <FiMessageSquare style={{ verticalAlign: "middle" }} /> {testResult.lead.phone}</>}
              </div>
            )}
            {testResult.message && !testResult.ok && (
              <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                {testResult.message}
              </div>
            )}
            <StepList steps={testResult.steps} />
            <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
              💡 Sends use <strong>your</strong> creds from <a href="/email/config">/email/config</a> (SMTP) and <a href="/whatsapp/settings">/whatsapp/settings</a> (WhatsApp API).
            </div>
          </div>
        </div>
      )}

      {/* ---- Logs modal ---- */}
      {logsFor && (
        <div onClick={() => setLogsFor(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 720, maxWidth: "96vw", maxHeight: "88vh", overflowY: "auto" }}>
            <div className="card-header">
              <div className="card-title"><FiList /> Run history — {logsFor.name}</div>
              <button className="btn btn-ghost" onClick={() => setLogsFor(null)}>×</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              Total runs: <strong>{logsFor.runs || 0}</strong>
              {logsFor.lastRunAt && <> · Last: {new Date(logsFor.lastRunAt).toLocaleString("en-IN")}</>}
            </div>
            {logsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span className="skel skel-line" style={{ width: 180 }} />
                      <span className="skel skel-line skel-line-sm" style={{ width: 120 }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8 }} />
                      <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (logsFor.runLog || []).length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No runs yet. Click <strong>Test</strong> on the flow to do a trial run, or <strong>Activate</strong> it to fire automatically when new leads are added.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(logsFor.runLog || []).map((run, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      <span><strong>{run.trigger}</strong> · {run.leadName || run.leadEmail || run.leadPhone || "Unknown lead"}</span>
                      <span>{new Date(run.ts).toLocaleString("en-IN")}</span>
                    </div>
                    <StepList steps={run.steps || []} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function StepList({ steps }) {
  if (!steps || steps.length === 0) {
    return <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 10 }}>No steps executed.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, padding: 10, borderRadius: 8,
          background: s.ok ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${s.ok ? "#bbf7d0" : "#fecaca"}`,
          fontSize: 13,
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            {s.ok ? <FiCheck style={{ color: "#10b981" }} /> : <FiX style={{ color: "#b91c1c" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-muted)" }}>
              {s.nodeType}{s.nodeTitle ? ` · ${s.nodeTitle}` : ""}
            </div>
            <div style={{ wordBreak: "break-word" }}>{s.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

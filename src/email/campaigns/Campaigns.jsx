import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { emailApi } from "../../api/email";

export default function Campaigns() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.campaigns();
      setList(res.campaigns || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function send(id) {
    if (!confirm("Send this campaign now to all selected recipients?")) return;
    setSending(id);
    try {
      const res = await emailApi.sendCampaign(id);
      alert(`Sent to ${res.sent} · ${res.failed} failed.`);
      load();
    } catch (err) { alert(err.message); }
    finally { setSending(""); }
  }

  async function remove(id) {
    if (!confirm("Delete this campaign?")) return;
    try { await emailApi.deleteCampaign(id); load(); } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Email Marketing — Campaigns</h1>
      <p className="page-subtitle">All your past and draft email campaigns.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => navigate("/email/create")}><FiPlus /> New campaign</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Campaign</th><th>Subject</th><th>Status</th><th>Sent</th><th>Failed</th><th>Created</th><th style={{ width: 160 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 170 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 220 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="skel" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel skel-square" />
                        <span className="skel skel-square" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No campaigns yet.</td></tr>
              ) : list.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.subject}</td>
                  <td><span className={`badge ${c.status === "completed" ? "qualified" : c.status === "failed" ? "lost" : "contacted"}`}>{c.status}</span></td>
                  <td>{c.sent || 0}</td>
                  <td>{c.failed || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" disabled={sending === c.id || c.status === "sending"} onClick={() => send(c.id)}>
                        <FiSend /> {sending === c.id ? "Sending…" : "Send"}
                      </button>
                      <button className="admin-action danger" onClick={() => remove(c.id)}><FiTrash2 /></button>
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

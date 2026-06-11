import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiSend, FiUsers, FiCheckCircle, FiAlertCircle,
  FiEye, FiMousePointer, FiClock, FiMail,
} from "react-icons/fi";
import { emailApi } from "../../api/email";

const STATUS_BADGE = {
  completed: "qualified",
  failed: "lost",
  sending: "contacted",
  scheduled: "contacted",
  draft: "contacted",
};

function fmtDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camp, setCamp] = useState(null);
  const [from, setFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.campaign(id);
      setCamp(res.campaign);
      setFrom(res.from || null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function send() {
    if (!confirm("Send this campaign now to all selected recipients?")) return;
    setSending(true);
    try {
      const res = await emailApi.sendCampaign(id);
      alert(`Sent to ${res.sent} · ${res.failed} failed.`);
      await load();
    } catch (err) { alert(err.message); }
    finally { setSending(false); }
  }

  if (loading) {
    return (
      <>
        <button className="btn btn-outline" onClick={() => navigate("/email/campaigns")} style={{ marginBottom: 14 }}>
          <FiArrowLeft /> Back
        </button>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 80, height: 22, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 110, display: "block" }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error || !camp) {
    return (
      <>
        <button className="btn btn-outline" onClick={() => navigate("/email/campaigns")} style={{ marginBottom: 14 }}>
          <FiArrowLeft /> Back
        </button>
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13 }}>
          {error || "Campaign not found."}
        </div>
      </>
    );
  }

  const recipientCount = (camp.recipients || []).length;
  const sent = camp.sent || 0;
  const failed = camp.failed || 0;
  const opens = camp.opens || 0;
  const clicks = camp.clicks || 0;
  const attempted = sent + failed;
  const deliveryRate = attempted ? Math.round((sent / attempted) * 100) : 0;
  const openRate = sent ? Math.round((opens / sent) * 100) : 0;
  const clickRate = sent ? Math.round((clicks / sent) * 100) : 0;
  const log = [...(camp.log || [])].reverse(); // newest first

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <button className="btn btn-outline" onClick={() => navigate("/email/campaigns")}>
          <FiArrowLeft /> Back to campaigns
        </button>
        <button className="btn btn-primary" onClick={send} disabled={sending || camp.status === "sending"}>
          <FiSend /> {sending ? "Sending…" : sent > 0 ? "Resend" : "Send now"}
        </button>
      </div>

      <h1 className="page-title" style={{ marginBottom: 4 }}>{camp.name}</h1>
      <p className="page-subtitle" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className={`badge ${STATUS_BADGE[camp.status] || "contacted"}`}>{camp.status}</span>
        {from?.email && <span><FiMail style={{ verticalAlign: "middle", marginRight: 4 }} />From {from.name ? `${from.name} <${from.email}>` : from.email}</span>}
        <span><FiClock style={{ verticalAlign: "middle", marginRight: 4 }} />Created {fmtDateTime(camp.createdAt)}</span>
        {camp.sentAt && <span>· Sent {fmtDateTime(camp.sentAt)}</span>}
      </p>

      {/* Analytics cards */}
      <div className="stats-grid" style={{ marginTop: 18 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiUsers /></div>
          <div className="stat-value">{recipientCount}</div>
          <div className="stat-label">Recipients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiCheckCircle /></div>
          <div className="stat-value">{sent}</div>
          <div className="stat-label">Delivered ({deliveryRate}%)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiAlertCircle /></div>
          <div className="stat-value">{failed}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiEye /></div>
          <div className="stat-value">{opens}</div>
          <div className="stat-label">Opens ({openRate}%)</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16, alignItems: "start" }}>
        {/* Email preview */}
        <div className="card">
          <div className="card-header"><div className="card-title"><FiMail /> Email content</div></div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Subject</div>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>{camp.subject}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Body</div>
          <div
            style={{
              border: "1px solid var(--border)", borderRadius: 10, padding: 14,
              maxHeight: 320, overflow: "auto", fontSize: 14, lineHeight: 1.5, background: "#fff",
            }}
            dangerouslySetInnerHTML={{ __html: camp.body || "<em>No content</em>" }}
          />
        </div>

        {/* Engagement summary */}
        <div className="card">
          <div className="card-header"><div className="card-title">Engagement</div></div>
          {[
            { label: "Delivery rate", value: `${deliveryRate}%`, sub: `${sent} of ${attempted || recipientCount}`, icon: <FiCheckCircle /> },
            { label: "Open rate", value: `${openRate}%`, sub: `${opens} opens`, icon: <FiEye /> },
            { label: "Click rate", value: `${clickRate}%`, sub: `${clicks} clicks`, icon: <FiMousePointer /> },
            { label: "Bounced / failed", value: failed, sub: failed ? "needs attention" : "all good", icon: <FiAlertCircle /> },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", fontSize: 13 }}>
                <span style={{ color: "var(--accent)" }}>{row.icon}</span>{row.label}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{row.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{row.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-recipient delivery log */}
      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        <div style={{ padding: "14px 18px", fontWeight: 800, fontSize: 14 }}>Delivery log ({log.length})</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Recipient</th><th>Status</th><th>Opened</th><th>Detail</th><th>Time</th></tr></thead>
            <tbody>
              {log.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 26, color: "var(--text-muted)" }}>
                  Not sent yet — no delivery log.
                </td></tr>
              ) : log.map((row, i) => (
                <tr key={i}>
                  <td>{row.email}</td>
                  <td>
                    <span className={`badge ${row.status === "sent" ? "qualified" : "lost"}`}>{row.status}</span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {row.openedAt
                      ? <span style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4 }}><FiEye /> {fmtDateTime(row.openedAt)}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.error || row.messageId || "—"}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDateTime(row.ts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

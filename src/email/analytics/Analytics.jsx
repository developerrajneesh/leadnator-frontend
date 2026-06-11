import { useEffect, useState } from "react";
import { FiArrowUp, FiSend, FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { emailApi } from "../../api/email";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [s, c] = await Promise.all([emailApi.stats(), emailApi.campaigns()]);
      setStats(s);
      setCampaigns(c.campaigns || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Email Analytics</h1>
        <p className="page-subtitle">Open, click and delivery stats across your campaigns.</p>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 100, height: 22, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title"><span className="skel skel-line" style={{ width: 180, height: 14 }} /></div></div>
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 6, padding: "10px 0" }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="skel" style={{ flex: 1, height: `${30 + (i * 11) % 60}%`, borderRadius: 4 }} />
            ))}
          </div>
        </div>
        <div className="card" style={{ marginTop: 16, padding: 0 }}>
          <div style={{ padding: "14px 18px" }}><span className="skel skel-line" style={{ width: 160, height: 14 }} /></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Campaign</th><th>Sent</th><th>Opens</th><th>Clicks</th><th>Bounces</th><th>Open %</th></tr></thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 50 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // Build a mini bar chart from the last 7 campaigns
  const recent = [...campaigns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7).reverse();
  const max = Math.max(...recent.map((c) => c.sent || 0), 1);

  return (
    <>
      <h1 className="page-title">Email — Analytics</h1>
      <p className="page-subtitle">Performance summary across all your campaigns.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FiSend /></div>
          <div className="stat-value">{(stats?.totalSent || 0).toLocaleString()}</div>
          <div className="stat-label">Emails sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiUsers /></div>
          <div className="stat-value">{stats?.activeSubscribers || 0}</div>
          <div className="stat-label">Active subscribers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiAlertCircle /></div>
          <div className="stat-value">{stats?.totalFailed || 0}</div>
          <div className="stat-label">Failures</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiCheckCircle /></div>
          <div className="stat-value">{stats?.configured ? "✅" : "—"}</div>
          <div className="stat-label">Domain {stats?.configured ? "verified" : "not verified"}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Last 7 campaigns — sent volume</div></div>
          {recent.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No campaigns yet.</div>
          ) : (
            <div className="bar-chart">
              {recent.map((c) => (
                <div className="bar-col" key={c.id}>
                  <div className="bar" style={{ height: `${((c.sent || 0) / max) * 100}%` }} />
                  <span title={c.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 60 }}>
                    {c.name?.slice(0, 8) || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Recent campaigns</div></div>
          {campaigns.slice(0, 5).map((c) => (
            <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 13 }}>{c.name}</strong>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.subject}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div style={{ color: "var(--accent)", fontWeight: 600 }}><FiArrowUp /> {c.sent || 0} sent</div>
                <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                  {c.failed > 0 && `${c.failed} failed · `}
                  <span className={`badge ${c.status === "completed" ? "qualified" : "contacted"}`}>{c.status}</span>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <div style={{ padding: 18, textAlign: "center", color: "var(--text-muted)" }}>No campaigns yet.</div>}
        </div>
      </div>
    </>
  );
}

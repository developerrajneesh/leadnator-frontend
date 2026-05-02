import { FiTarget, FiMail, FiActivity, FiPause, FiPlay, FiTrash2 } from "react-icons/fi";
import { CAMPAIGNS, META_ACCOUNTS } from "../../data/dummy";
import GroupedBar from "../../dashboard/analytics/components/GroupedBar";

const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

export default function AdminCampaigns() {
  const totalSent = CAMPAIGNS.reduce((s, c) => s + c.sent, 0);
  const totalOpens = CAMPAIGNS.reduce((s, c) => s + c.opens, 0);
  const totalClicks = CAMPAIGNS.reduce((s, c) => s + c.clicks, 0);
  const activeCount = CAMPAIGNS.filter((c) => c.status === "active").length;

  const openRate = ((totalOpens / totalSent) * 100).toFixed(1);
  const clickRate = ((totalClicks / totalSent) * 100).toFixed(1);

  const metaSpend = META_ACCOUNTS.reduce((s, a) => s + a.spend, 0);
  const metaLeads = META_ACCOUNTS.reduce((s, a) => s + a.leads, 0);

  return (
    <>
      <h1 className="page-title">Campaigns</h1>
      <p className="page-subtitle">All email and Meta campaigns across the platform.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FiActivity /></div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active campaigns</div>
          <div className="stat-change up">{CAMPAIGNS.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiMail /></div>
          <div className="stat-value">{totalSent.toLocaleString()}</div>
          <div className="stat-label">Emails sent</div>
          <div className="stat-change up">{openRate}% open rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiTarget /></div>
          <div className="stat-value">{totalClicks.toLocaleString()}</div>
          <div className="stat-label">Total clicks</div>
          <div className="stat-change up">{clickRate}% CTR</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiTarget /></div>
          <div className="stat-value">{metaLeads}</div>
          <div className="stat-label">Meta leads</div>
          <div className="stat-change up">{fmtINR(metaSpend)} spend</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Campaign performance</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Open {openRate}% · Click {clickRate}%
          </span>
        </div>
        <GroupedBar
          data={CAMPAIGNS.filter((c) => c.sent > 0).map((c) => ({
            label: c.name,
            sent: c.sent,
            opens: c.opens,
            clicks: c.clicks,
          }))}
          series={[
            { key: "sent",   label: "Sent",   color: "#7c3aed" },
            { key: "opens",  label: "Opens",  color: "#ec4899" },
            { key: "clicks", label: "Clicks", color: "#10b981" },
          ]}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">All campaigns</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Opens</th>
                <th>Clicks</th>
                <th>Open rate</th>
                <th>Created</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <span className={`status-dot ${c.status}`} style={{ marginRight: 6 }} />
                    {c.status}
                  </td>
                  <td>{c.sent.toLocaleString()}</td>
                  <td>{c.opens.toLocaleString()}</td>
                  <td>{c.clicks.toLocaleString()}</td>
                  <td>{c.sent > 0 ? ((c.opens / c.sent) * 100).toFixed(1) + "%" : "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.status === "active" ? (
                        <button className="admin-action" title="Pause"><FiPause /></button>
                      ) : (
                        <button className="admin-action" title="Start"><FiPlay /></button>
                      )}
                      <button className="admin-action danger" title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Meta Ads accounts</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {META_ACCOUNTS.filter((a) => a.connected).length} connected
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Status</th>
                <th>Spend</th>
                <th>Leads</th>
                <th>CPL</th>
              </tr>
            </thead>
            <tbody>
              {META_ACCOUNTS.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>
                    <span className={`status-dot ${a.connected ? "active" : "draft"}`} style={{ marginRight: 6 }} />
                    {a.connected ? "Connected" : "Disconnected"}
                  </td>
                  <td>{fmtINR(a.spend)}</td>
                  <td>{a.leads}</td>
                  <td>{a.leads > 0 ? fmtINR(Math.round(a.spend / a.leads)) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

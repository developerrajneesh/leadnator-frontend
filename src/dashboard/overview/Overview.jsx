import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiCheckCircle, FiTrendingUp, FiMail, FiArrowUp,
  FiDollarSign, FiTarget, FiClock, FiMessageCircle, FiFolder,
} from "react-icons/fi";
import { api } from "../../api/client";
import BarChart from "./components/BarChart";
import Donut from "./components/Donut";

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const initials = (name) => String(name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard.overview()
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <OverviewSkeleton />;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!data)   return null;

  const { user, leads, email, whatsapp, storage } = data;
  const byStatus = leads.byStatus || {};
  const total = leads.total || 0;
  const converted = byStatus.qualified || 0;
  const hot       = byStatus.hot       || 0;
  const newLeads  = byStatus.new       || 0;
  const contacted = byStatus.contacted || 0;
  const conversionRate = total ? ((converted / total) * 100).toFixed(1) : "0";
  const openRate  = email.sent ? ((email.opens  / email.sent) * 100).toFixed(1) : "0";
  const clickRate = email.sent ? ((email.clicks / email.sent) * 100).toFixed(1) : "0";

  const funnelData = [
    { label: "New",        value: newLeads,  color: "#3b82f6" },
    { label: "Contacted",  value: contacted, color: "#f59e0b" },
    { label: "Hot",        value: hot,       color: "#ef4444" },
    { label: "Qualified",  value: converted, color: "#10b981" },
  ];
  const funnelMax = Math.max(...funnelData.map((f) => f.value), 1);

  return (
    <>
      <h1 className="page-title">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="page-subtitle">Here's what's happening with your leads today.</p>

      <div className="stats-grid">
        <Stat icon={<FiUsers />} color="purple" value={total} label="Total leads" />
        <Stat icon={<FiCheckCircle />} color="green" value={converted} label="Qualified" />
        <Stat icon={<FiTrendingUp />} color="orange" value={hot} label="Hot leads" />
        <Stat icon={<FiMail />} color="pink" value={email.sent.toLocaleString()} label="Emails sent" />
      </div>

      <div className="stats-grid" style={{ marginTop: 16 }}>
        <Stat icon={<FiDollarSign />} color="green" value={fmtINR(leads.pipelineValue)} label="Pipeline value" />
        <Stat icon={<FiTarget />} color="purple" value={`${conversionRate}%`} label="Conversion rate" />
        <Stat icon={<FiMessageCircle />} color="orange" value={whatsapp.messages.toLocaleString()} label="WhatsApp messages" />
        <Stat icon={<FiClock />} color="pink" value={fmtINR(leads.avgDealSize)} label="Avg deal size" />
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Leads this week</div></div>
          <BarChart data={leads.leadsByDay} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Source breakdown</div></div>
          {leads.sourceBreakdown.length === 0
            ? <Empty label="No leads yet — add a few to see your source mix." />
            : <Donut data={leads.sourceBreakdown} />}
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead funnel</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>By stage</span>
          </div>
          <div className="funnel">
            {funnelData.map((f) => (
              <div className="funnel-row" key={f.label}>
                <div
                  className="funnel-bar"
                  style={{ background: f.color, width: `${(f.value / funnelMax) * 100}%`, minWidth: 180 }}
                >
                  <span style={{ fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{f.value}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {total ? ((f.value / total) * 100).toFixed(1) : "0"}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Email campaigns</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Open {openRate}% · Click {clickRate}%
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Campaign</th><th>Status</th><th>Sent</th><th>Opens</th><th>Clicks</th></tr></thead>
              <tbody>
                {email.recent.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No campaigns yet.</td></tr>
                ) : email.recent.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className={`status-dot ${c.status}`} style={{ marginRight: 6 }} />{c.status}</td>
                    <td>{c.sent.toLocaleString()}</td>
                    <td>{c.opens.toLocaleString()}</td>
                    <td>{c.clicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent leads</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Latest {leads.recent.length}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Source</th><th>Status</th><th>Value</th><th>Added</th></tr></thead>
              <tbody>
                {leads.recent.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No leads yet.</td></tr>
                ) : leads.recent.map((l) => (
                  <tr key={l.id} onClick={() => navigate(`/leads/all/${l.id}`)} style={{ cursor: "pointer" }}>
                    <td><span className="avatar-sm">{initials(l.name)}</span><span style={{ fontWeight: 600 }}>{l.name}</span></td>
                    <td>{l.source}</td>
                    <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                    <td>{fmtINR(l.value)}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Top leads by value</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Lead</th><th>Source</th><th>Status</th><th>Value</th></tr></thead>
              <tbody>
                {leads.top.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Add leads to see your top deals.</td></tr>
                ) : leads.top.map((l) => (
                  <tr key={l.id} onClick={() => navigate(`/leads/all/${l.id}`)} style={{ cursor: "pointer" }}>
                    <td><span className="avatar-sm">{initials(l.name)}</span><span style={{ fontWeight: 600 }}>{l.name}</span></td>
                    <td>{l.source}</td>
                    <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                    <td style={{ fontWeight: 700 }}>{fmtINR(l.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">WhatsApp marketing</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row icon={<FiUsers />}         color="purple" label="Contacts"              value={whatsapp.contacts.toLocaleString()} />
            <Row icon={<FiMessageCircle />} color="green"  label="Messages exchanged"    value={whatsapp.messages.toLocaleString()} />
            <Row icon={<FiTarget />}        color="orange" label="Broadcast campaigns"   value={whatsapp.campaigns.toLocaleString()} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Storage & files</div></div>
          <Row icon={<FiFolder />} color="pink" label="Files in your bucket" value={storage.files.toLocaleString()} />
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            All documents uploaded to your own S3-compatible storage. Configure a different bucket from <a href="/storage/settings">Storage → Settings</a>.
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, color, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Row({ icon, color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className={`stat-icon ${color}`} style={{ width: 36, height: 36, margin: 0, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
    </div>
  );
}

function Empty({ label }) {
  return <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{label}</div>;
}

/* Skeleton that mirrors the loaded dashboard layout — 2 stat rows,
   bar + donut pair, funnel + email table, leads tables, WhatsApp +
   storage cards. Uses the global `.skel*` shimmer toolkit. */
function OverviewSkeleton() {
  return (
    <>
      {/* Greeting */}
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        Welcome back, <span className="skel skel-line" style={{ width: 140, height: 22 }} />
      </h1>
      <p className="page-subtitle">Here's what's happening with your leads today.</p>

      {/* 4 × 2 stat cards */}
      {[0, 1].map((row) => (
        <div key={row} className="stats-grid" style={{ marginTop: row === 1 ? 16 : 0 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 90, height: 24, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
            </div>
          ))}
        </div>
      ))}

      {/* Bar chart + Donut */}
      <div className="grid-2" style={{ marginTop: 16 }}>
        <ChartCard title="Leads this week" kind="bars" />
        <ChartCard title="Source breakdown" kind="donut" />
      </div>

      {/* Funnel + Email campaigns */}
      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Lead funnel</div></div>
          <div className="funnel">
            {[92, 72, 50, 34].map((w, i) => (
              <div key={i} className="funnel-row">
                <div style={{ width: `${w}%`, height: 44, borderRadius: 10, background: "linear-gradient(90deg, #cbd5e1, #e5e7eb)" }}>
                  <span className="skel" style={{ width: "100%", height: "100%", display: "block", borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <TableCardSkeleton
          title="Email campaigns"
          head={["Campaign", "Status", "Sent", "Opens", "Clicks"]}
          rows={4}
        />
      </div>

      {/* Recent leads + Top leads */}
      <div className="grid-2" style={{ marginTop: 16 }}>
        <TableCardSkeleton
          title="Recent leads"
          head={["Name", "Source", "Status", "Value", "Added"]}
          rows={5}
          avatarCol
        />
        <TableCardSkeleton
          title="Top leads by value"
          head={["Lead", "Source", "Status", "Value"]}
          rows={4}
          avatarCol
        />
      </div>

      {/* WhatsApp marketing + Storage & files */}
      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">WhatsApp marketing</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Storage &amp; files</div></div>
          <RowSkeleton />
          <span className="skel skel-line skel-line-sm" style={{ width: "85%", display: "block", marginTop: 12 }} />
        </div>
      </div>
    </>
  );
}

function ChartCard({ title, kind }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div style={{ padding: "10px 0", display: "flex", alignItems: kind === "donut" ? "center" : "flex-end", justifyContent: "center", gap: kind === "donut" ? 24 : 6, minHeight: 180 }}>
        {kind === "bars" ? (
          [52, 78, 38, 90, 62, 84, 46].map((h, i) => (
            <span
              key={i}
              className="skel"
              style={{ width: 28, height: `${h}%`, borderRadius: "6px 6px 2px 2px" }}
            />
          ))
        ) : (
          <>
            <span className="skel" style={{ width: 140, height: 140, borderRadius: "50%" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="skel" style={{ width: 10, height: 10, borderRadius: 3 }} />
                  <span className="skel skel-line skel-line-sm" style={{ width: 90 }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TableCardSkeleton({ title, head, rows, avatarCol }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="skel-row">
                {head.map((_, j) => (
                  <td key={j}>
                    {j === 0 ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {avatarCol && <span className="skel skel-circle" />}
                        <span className="skel skel-line" style={{ width: 110 }} />
                      </div>
                    ) : j === head.length - 1 ? (
                      <span className="skel skel-line skel-line-sm" style={{ width: 70 }} />
                    ) : (
                      <span className="skel skel-line skel-line-sm" style={{ width: 60 }} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="skel skel-square" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
      <span className="skel skel-line skel-line-sm" style={{ flex: 1, maxWidth: 220 }} />
      <span className="skel skel-line" style={{ width: 70, height: 14 }} />
    </div>
  );
}

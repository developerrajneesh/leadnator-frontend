import { useEffect, useState } from "react";
import {
  FiUsers, FiTrendingUp, FiDollarSign, FiTarget,
  FiMail, FiZap, FiMessageCircle, FiFolder,
} from "react-icons/fi";
import { api } from "../../api/client";
import BarChart from "../overview/components/BarChart";
import Donut from "../overview/components/Donut";
import LineChart from "./components/LineChart";
import GroupedBar from "./components/GroupedBar";
import HBar from "./components/HBar";

const STATUS_COLORS = {
  new:       "#3b82f6",
  contacted: "#f59e0b",
  hot:       "#ef4444",
  qualified: "#10b981",
  lost:      "#9ca3af",
};

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.dashboard.overview(), api.leads.list()])
      .then(([o, l]) => {
        setOverview(o);
        setLeads(Array.isArray(l?.leads) ? l.leads : Array.isArray(l) ? l : []);
      })
      .catch((e) => setError(e.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading analytics…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!overview) return null;

  const { leads: L, email, whatsapp, storage } = overview;
  const total = L.total || 0;
  const safeTotal = total || 1;

  // 14-day trend (LineChart)
  const trend = L.leadsByDay14 || [];
  const trendTotal = trend.reduce((s, d) => s + d.value, 0);

  // Leads-by-day-of-week derived from the 14-day trend (covers 2 weeks evenly).
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowBuckets = DOW.map((d) => ({ label: d, value: 0 }));
  trend.forEach((d) => {
    const dt = new Date(d.key);
    if (!isNaN(dt)) dowBuckets[dt.getDay()].value += d.value;
  });

  // Status distribution donut from byStatus counts.
  const statusData = Object.entries(L.byStatus || {}).map(([k, v]) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: Math.round((v / safeTotal) * 100),
    count: v,
    color: STATUS_COLORS[k] || "#6b7280",
  }));

  // Pipeline value split
  const pipelineValue = L.pipelineValue || 0;
  const qualifiedValue = leads.filter((l) => l.status === "qualified").reduce((s, l) => s + (l.value || 0), 0);
  const hotValue       = leads.filter((l) => l.status === "hot").reduce((s, l) => s + (l.value || 0), 0);
  const conversionRate = total ? ((L.byStatus?.qualified || 0) / total * 100).toFixed(1) : "0";

  // Source → revenue (from full lead list, since overview only gives counts).
  const sourceAgg = leads.reduce((acc, l) => {
    const key = l.source || "Other";
    if (!acc[key]) acc[key] = { leads: 0, value: 0 };
    acc[key].leads += 1;
    acc[key].value += l.value || 0;
    return acc;
  }, {});
  const revenueBySource = Object.entries(sourceAgg)
    .map(([label, v]) => ({ label, value: v.value }))
    .sort((a, b) => b.value - a.value);

  // Top tags
  const tagCounts = {};
  leads.forEach((l) => (l.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Email campaign perf
  const campaignSeries = (email.recent || []).filter((c) => (c.sent || 0) > 0).map((c) => ({
    label: c.name,
    sent: c.sent || 0,
    opens: c.opens || 0,
    clicks: c.clicks || 0,
  }));
  const openRate  = email.sent ? ((email.opens  / email.sent) * 100).toFixed(1) : "0";
  const clickRate = email.sent ? ((email.clicks / email.sent) * 100).toFixed(1) : "0";

  return (
    <>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Deep dive into your lead and marketing performance.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FiUsers /></div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiDollarSign /></div>
          <div className="stat-value">{fmtINR(pipelineValue)}</div>
          <div className="stat-label">Pipeline value</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiTarget /></div>
          <div className="stat-value">{conversionRate}%</div>
          <div className="stat-label">Conversion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiTrendingUp /></div>
          <div className="stat-value">{fmtINR(L.avgDealSize || 0)}</div>
          <div className="stat-label">Avg deal size</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Leads trend · last 14 days</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Total {trendTotal} leads
          </span>
        </div>
        {trend.length === 0
          ? <Empty label="No leads yet — once you add some, the trend shows up here." />
          : <LineChart data={trend} color="#7c3aed" />}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Leads by day of week</div>
          </div>
          {trendTotal === 0
            ? <Empty label="No data yet." />
            : <BarChart data={dowBuckets} />}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Source breakdown</div>
          </div>
          {(L.sourceBreakdown || []).length === 0
            ? <Empty label="Add leads to see your source mix." />
            : <Donut data={L.sourceBreakdown} />}
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead status distribution</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} total</span>
          </div>
          {statusData.length === 0
            ? <Empty label="No leads yet." />
            : <Donut data={statusData} />}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by source</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtINR(pipelineValue)} pipeline</span>
          </div>
          {revenueBySource.length === 0
            ? <Empty label="No pipeline yet." />
            : <HBar data={revenueBySource} format={fmtINR} color="#10b981" />}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Email campaign performance</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Open {openRate}% · Click {clickRate}%
          </span>
        </div>
        {campaignSeries.length === 0
          ? <Empty label="No campaigns with sends yet — launch one from Email → Campaigns." />
          : <GroupedBar
              data={campaignSeries}
              series={[
                { key: "sent",   label: "Sent",   color: "#7c3aed" },
                { key: "opens",  label: "Opens",  color: "#ec4899" },
                { key: "clicks", label: "Clicks", color: "#10b981" },
              ]}
            />}
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top tags</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{topTags.length} tags</span>
          </div>
          {topTags.length === 0
            ? <Empty label="Tag leads to group them by theme or campaign." />
            : <HBar data={topTags} color="#f59e0b" />}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pipeline breakdown</div>
          </div>
          {pipelineValue === 0 ? <Empty label="No pipeline value yet." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
              {[
                { label: "Qualified", value: qualifiedValue, color: "#10b981", icon: <FiTarget /> },
                { label: "Hot",       value: hotValue,       color: "#ef4444", icon: <FiZap /> },
                { label: "Other",     value: Math.max(0, pipelineValue - qualifiedValue - hotValue), color: "#9ca3af", icon: <FiUsers /> },
              ].map((row) => {
                const pct = (row.value / pipelineValue) * 100;
                return (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{row.label}</span>
                      <span style={{ color: "var(--text-muted)" }}>{fmtINR(row.value)} · {pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ background: "#f3f4f6", height: 10, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: row.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><div className="card-title">Quick stats</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { icon: <FiMail />,          color: "purple", label: "Emails sent",        value: (email.sent || 0).toLocaleString() },
            { icon: <FiTrendingUp />,    color: "green",  label: "Total opens",        value: (email.opens || 0).toLocaleString() },
            { icon: <FiTarget />,        color: "orange", label: "Total clicks",       value: (email.clicks || 0).toLocaleString() },
            { icon: <FiZap />,           color: "pink",   label: "Active campaigns",   value: email.active || 0 },
            { icon: <FiMessageCircle />, color: "purple", label: "WhatsApp messages",  value: (whatsapp.messages || 0).toLocaleString() },
            { icon: <FiUsers />,         color: "green",  label: "WhatsApp contacts",  value: (whatsapp.contacts || 0).toLocaleString() },
            { icon: <FiFolder />,        color: "orange", label: "Storage files",      value: (storage.files || 0).toLocaleString() },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, border: "1px solid var(--border)", borderRadius: 10 }}>
              <div
                className={`stat-icon ${s.color}`}
                style={{ width: 36, height: 36, margin: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, lineHeight: 1 }}
              >
                {s.icon}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Empty({ label }) {
  return <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{label}</div>;
}

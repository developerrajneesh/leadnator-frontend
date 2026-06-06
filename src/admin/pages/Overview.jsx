import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers, FiDollarSign, FiTrendingUp, FiActivity,
  FiArrowUp, FiArrowDown, FiUserPlus, FiLifeBuoy, FiRefreshCw,
  FiMessageCircle, FiMail, FiCalendar, FiZap,
} from "react-icons/fi";

// Map an activity kind/module to an icon + color chip.
const ACTIVITY_ICON = {
  signup: [FiUserPlus, "purple"], auth: [FiUserPlus, "purple"],
  ticket_resolved: [FiLifeBuoy, "green"], ticket_open: [FiLifeBuoy, "orange"], support: [FiLifeBuoy, "orange"],
  wa: [FiMessageCircle, "green"], instagram: [FiMessageCircle, "pink"],
  email: [FiMail, "orange"], calendar: [FiCalendar, "purple"],
  autopilot: [FiZap, "pink"], leads: [FiUsers, "purple"],
};
const CHIP = {
  purple: { bg: "#ede9fe", fg: "#6d28d9" },
  green:  { bg: "#d1fae5", fg: "#047857" },
  orange: { bg: "#fef3c7", fg: "#b45309" },
  pink:   { bg: "#fce7f3", fg: "#be185d" },
};
import { api } from "../../api/client";
import BarChart from "../../dashboard/overview/components/BarChart";
import Donut from "../../dashboard/overview/components/Donut";
import LineChart from "../../dashboard/analytics/components/LineChart";

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function timeAgo(iso) {
  const d = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(d / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h} hr ago`;
  const dd = Math.floor(h / 24);
  if (dd < 7)  return `${dd} day${dd === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load({ soft = false } = {}) {
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const r = await api.admin.stats();
      setData(r);
    } catch (err) {
      setError(err.message || "Failed to load admin stats");
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading admin overview…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!data) return null;

  const { totals, signupTrend, leadsByDay, planDistribution, sourceBreakdown, activity } = data;

  const signupTotal = signupTrend.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Platform-wide stats across all customers.</p>
        </div>
        <button className="btn btn-outline" onClick={() => load({ soft: true })} disabled={refreshing}>
          <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="stats-grid">
        <Stat
          icon={<FiUsers />} color="purple"
          value={totals.users}
          label="Total users"
          trend={totals.newThisWeek > 0
            ? { up: true, text: `${totals.newThisWeek} new this week` }
            : { up: true, text: "Steady" }}
        />
        <Stat
          icon={<FiDollarSign />} color="green"
          value={fmtINR(totals.mrr)}
          label="MRR"
          trend={{ up: true, text: `${totals.activeUsers} paying users` }}
        />
        <Stat
          icon={<FiTrendingUp />} color="orange"
          value={totals.leads.toLocaleString()}
          label="Leads across platform"
          trend={{
            up: totals.leadsMoMPct >= 0,
            text: `${totals.leadsMoMPct >= 0 ? "+" : ""}${totals.leadsMoMPct}% vs last 30 days`,
          }}
        />
        <Stat
          icon={<FiActivity />} color="pink"
          value={totals.activeCampaigns}
          label="Active campaigns"
          trend={{ up: totals.totalCampaigns > 0, text: `${totals.totalCampaigns} total` }}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Signups · last 14 days</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{signupTotal} new users</span>
        </div>
        {signupTotal === 0 ? <Empty label="No signups yet in the last 14 days." />
          : <LineChart data={signupTrend} color="#10b981" />}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Platform leads this week</div>
          </div>
          {leadsByDay.reduce((s, d) => s + d.value, 0) === 0
            ? <Empty label="No leads created in the last 7 days." />
            : <BarChart data={leadsByDay} />}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan distribution</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{totals.users} users</span>
          </div>
          {planDistribution.length === 0
            ? <Empty label="No users yet." />
            : <Donut data={planDistribution} centerLabel="Users" />}
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent activity</div>
            <Link to="/admin/logs" style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-primary, #10b981)" }}>View all →</Link>
          </div>
          {activity.length === 0
            ? <Empty label="No activity yet." />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activity.map((a, i) => {
                  const [Icon, color] = ACTIVITY_ICON[a.kind] || [FiActivity, "orange"];
                  const chip = CHIP[color] || CHIP.orange;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: chip.bg, color: chip.fg }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{timeAgo(a.ts)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Health snapshot</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Row
              label="Active users"
              value={`${totals.activeUsers} / ${totals.users}`}
              pct={totals.users ? (totals.activeUsers / totals.users) * 100 : 0}
              color="#10b981"
            />
            <Row
              label="Paused users"
              value={totals.pausedUsers}
              pct={totals.users ? (totals.pausedUsers / totals.users) * 100 : 0}
              color="#f59e0b"
            />
            <Row
              label="Open tickets"
              value={`${totals.openTickets} / ${totals.totalTickets}`}
              pct={totals.totalTickets ? (totals.openTickets / totals.totalTickets) * 100 : 0}
              color="#ef4444"
            />
            <Row
              label="Active campaigns"
              value={`${totals.activeCampaigns} / ${totals.totalCampaigns}`}
              pct={totals.totalCampaigns ? (totals.activeCampaigns / totals.totalCampaigns) * 100 : 0}
              color="#7c3aed"
            />
            <Row
              label="Leads last 30 days"
              value={totals.leads30d.toLocaleString()}
              pct={totals.leads ? (totals.leads30d / totals.leads) * 100 : 0}
              color="#0ea5e9"
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Platform traffic sources</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{totals.leads.toLocaleString()} leads</span>
        </div>
        {sourceBreakdown.length === 0
          ? <Empty label="No leads yet — sources show up once users capture their first leads." />
          : <Donut data={sourceBreakdown} centerLabel="Leads" />}
      </div>
    </>
  );
}

function Stat({ icon, color, value, label, trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-change ${trend.up ? "up" : "down"}`}>
          {trend.up ? <FiArrowUp /> : <FiArrowDown />} {trend.text}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, pct, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "var(--text-muted)" }}>{value}</span>
      </div>
      <div style={{ background: "#f3f4f6", height: 8, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function Empty({ label }) {
  return <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{label}</div>;
}

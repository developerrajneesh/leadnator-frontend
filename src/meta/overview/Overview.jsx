import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTarget, FiLayers, FiTrendingUp, FiRefreshCw, FiDollarSign,
  FiClock, FiBriefcase, FiCreditCard, FiGlobe, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { SiMeta } from "react-icons/si";
import { metaApi } from "../../api/meta";

function parseDisplayFunds(s) {
  if (!s) return null;
  const m = s.match(/([\d,]+\.?\d*)\s*([A-Z]{3})?/i);
  if (!m) return null;
  const amount = parseFloat((m[1] || "0").replace(/,/g, ""));
  return isNaN(amount) ? null : { amount, currency: m[2] || "" };
}

function money(n, cur = "") {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return "—";
  return `${cur ? cur + " " : ""}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MetaOverview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  async function load() {
    setError("");
    try {
      const s = await metaApi.status();
      setStatus(s);
      if (s.connected && s.selectedAdAccountId) {
        const res = await metaApi.overview(s.selectedAdAccountId);
        setData(res);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load overview.");
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h1 className="page-title">Meta Ads Overview</h1>
            <p className="page-subtitle">Live account snapshot from the Meta Marketing API.</p>
          </div>
          <span className="skel" style={{ width: 100, height: 36, borderRadius: 8 }} />
        </div>

        {/* Account summary card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span className="skel skel-square" style={{ width: 44, height: 44, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <span className="skel skel-line" style={{ width: 220, height: 18, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 160, display: "block" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <span className="skel skel-line skel-line-sm" style={{ width: 90, display: "block", marginBottom: 6 }} />
                <span className="skel skel-line" style={{ width: 140 }} />
              </div>
            ))}
          </div>
        </div>

        {/* 4 KPI cards */}
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 100, height: 22, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
            </div>
          ))}
        </div>

        {/* Pages list */}
        <div className="card" style={{ marginTop: 16, padding: 0 }}>
          <div style={{ padding: "14px 18px" }}>
            <span className="skel skel-line" style={{ width: 160, height: 14 }} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Page</th><th>Category</th><th>Fans</th><th>Access</th></tr></thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span className="skel skel-circle" />
                        <span className="skel skel-line" style={{ width: 160 }} />
                      </div>
                    </td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 120 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 80 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <SiMeta style={{ fontSize: 42, color: "#1877f2", marginBottom: 14 }} />
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          Login with Facebook to see your ad-account overview, spend, and performance.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  const acc = data?.account || {};
  const cur = acc.currency || "";
  const funds = parseDisplayFunds(acc?.funding_source_details?.display_string);
  const availableFunds = funds
    ? `${funds.currency || cur} ${funds.amount.toFixed(2)}`
    : acc.balance != null ? `${cur} ${(Number(acc.balance) / 100).toFixed(2)}` : "—";
  const amountSpent = acc.amount_spent != null ? `${cur} ${(Number(acc.amount_spent) / 100).toFixed(2)}` : "—";
  const spendCap    = acc.spend_cap    != null ? `${cur} ${(Number(acc.spend_cap)    / 100).toFixed(2)}` : "—";

  const ins = data?.insights || {};
  const counts = data?.counts || {};

  const hasError = acc._error;

  return (
    <>
      <h1 className="page-title">Meta Ads overview</h1>
      <p className="page-subtitle">Your Meta advertising at a glance · account <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{status.selectedAdAccountId}</code></p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={refresh} disabled={refreshing}>
          <FiRefreshCw style={{ animation: refreshing ? "spin 1s linear infinite" : "" }} />
          {refreshing ? " Refreshing…" : " Refresh"}
        </button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {/* Summary card — always visible */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "#e7f0ff", color: "#1877f2",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              <SiMeta />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                {acc.name || (hasError ? "Unable to load account" : "—")}
                {acc.account_status === 1
                  ? <span className="badge qualified" style={{ marginLeft: 8 }}>Active</span>
                  : acc.account_status != null && <span className="badge contacted" style={{ marginLeft: 8 }}>Status {acc.account_status}</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                {acc.id || status.selectedAdAccountId}
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span>Currency: <strong>{cur || "—"}</strong></span>
                <span>Available funds: <strong>{availableFunds}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost"
            style={{ padding: 6 }}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {expanded && (
          <div style={{ borderTop: "1px solid var(--border)", padding: 20 }}>
            {/* Stats grid */}
            <div className="stats-grid" style={{ marginBottom: 18 }}>
              <StatTile icon={<FiTarget />}     color="purple" label="Campaigns"    value={counts.campaigns ?? 0} />
              <StatTile icon={<FiLayers />}     color="pink"   label="Ad sets"      value={counts.adsets ?? 0} />
              <StatTile icon={<FiTrendingUp />} color="green"  label="Ads"          value={counts.ads ?? 0} />
              <StatTile icon={<FiDollarSign />} color="orange" label="Amount spent" value={amountSpent} />
            </div>

            {/* Two-column details */}
            <div className="grid-2-equal">
              <div className="card" style={{ background: "#f9fafb" }}>
                <div className="card-title" style={{ marginBottom: 12 }}>Account information</div>
                <Row icon={<FiBriefcase />} label="Account ID"    value={acc.id || "—"} mono />
                <Row                      label="Account number"  value={acc.account_id || "—"} />
                <Row                      label="Business"        value={acc.business_name || "—"} />
                <Row icon={<FiClock />}   label="Timezone"        value={acc.timezone_name || "—"} />
                <Row icon={<FiGlobe />}   label="Currency"        value={cur || "—"} />
              </div>

              <div className="card" style={{ background: "#f9fafb" }}>
                <div className="card-title" style={{ marginBottom: 12 }}>Financial information</div>
                <Row icon={<FiDollarSign />} label="Available funds" value={availableFunds} />
                <Row                        label="Amount spent"    value={amountSpent} />
                <Row                        label="Spend cap"       value={spendCap} />
                <Row icon={<FiCreditCard />} label="Funding source" value={acc.funding_source || "—"} />
                <Row                        label="Min daily budget" value={acc.min_daily_budget != null ? `${cur} ${(Number(acc.min_daily_budget) / 100).toFixed(2)}` : "—"} />
              </div>
            </div>

            {/* Performance (last 30 days) */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                <div className="card-title">Performance · last 30 days</div>
                <button className="btn btn-ghost" onClick={() => navigate("/meta/analytics")}>View full analytics →</button>
              </div>
              <div className="stats-grid">
                <StatTile icon={<span>₹</span>} color="green"  label="Spend"       value={money(ins.spend, cur)} />
                <StatTile                       color="purple" label="Impressions" value={Number(ins.impressions || 0).toLocaleString()} />
                <StatTile                       color="pink"   label="Clicks"      value={Number(ins.clicks || 0).toLocaleString()} />
                <StatTile                       color="orange" label="Reach"       value={Number(ins.reach || 0).toLocaleString()} />
              </div>
              <div className="grid-2-equal" style={{ marginTop: 14 }}>
                <StatTile color="purple" label="CTR"       value={ins.ctr ? Number(ins.ctr).toFixed(2) + "%" : "—"} />
                <StatTile color="green"  label="Avg CPC"   value={money(ins.cpc, cur)} />
                <StatTile color="pink"   label="Avg CPM"   value={money(ins.cpm, cur)} />
                <StatTile color="orange" label="Frequency" value={ins.frequency ? Number(ins.frequency).toFixed(2) : "—"} />
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => navigate("/meta/create")}>
                Create new campaign →
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/meta/campaigns")}>
                Manage campaigns
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/meta/analytics")}>
                Analytics
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/leads/meta-forms")}>
                Form leads
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatTile({ icon, color = "purple", label, value }) {
  return (
    <div className="stat-card">
      {icon && <div className={`stat-icon ${color}`}>{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Row({ icon, label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 13, borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {icon}{label}
      </span>
      <span style={{ fontWeight: 600, ...(mono ? { fontFamily: "monospace", fontSize: 11 } : {}) }}>{value}</span>
    </div>
  );
}

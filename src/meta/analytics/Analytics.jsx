import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { metaApi } from "../../api/meta";

const PRESETS = [
  { value: "last_7d",  label: "Last 7 days" },
  { value: "last_30d", label: "Last 30 days" },
  { value: "last_90d", label: "Last 90 days" },
];

function fmt(n, cur = "INR") {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(num);
}

export default function Analytics() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [preset, setPreset] = useState("last_30d");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const s = await metaApi.status();
      setStatus(s);
      if (s.connected && s.selectedAdAccountId) {
        const res = await metaApi.insights(s.selectedAdAccountId, { datePreset: preset, level: "campaign" });
        setRows(res.insights?.data || []);
      } else {
        setRows([]);
      }
    } catch (err) { setError(err.message || "Failed to load insights."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, [preset]);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Meta Analytics</h1>
        <p className="page-subtitle">Live ad-account performance from the Meta Marketing API.</p>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 100, height: 24, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title"><span className="skel skel-line" style={{ width: 180, height: 14 }} /></div></div>
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", gap: 6, padding: "10px 0" }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="skel" style={{ flex: 1, height: `${30 + (i * 13) % 60}%`, borderRadius: 4 }} />
            ))}
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          {[0, 1].map((k) => (
            <div key={k} className="card">
              <div className="card-header"><div className="card-title"><span className="skel skel-line" style={{ width: 140, height: 14 }} /></div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="skel skel-line skel-line-sm" style={{ width: 120 }} />
                    <span className="skel" style={{ flex: 1, height: 8, borderRadius: 4 }} />
                    <span className="skel skel-line skel-line-sm" style={{ width: 40 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + Number(r.spend || 0),
    impressions: acc.impressions + Number(r.impressions || 0),
    clicks: acc.clicks + Number(r.clicks || 0),
    reach: acc.reach + Number(r.reach || 0),
  }), { spend: 0, impressions: 0, clicks: 0, reach: 0 });

  const avgCtr  = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc  = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCpm  = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;

  return (
    <>
      <h1 className="page-title">Meta Ads — Analytics</h1>
      <p className="page-subtitle">
        Live insights from Meta Graph API · account <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{status.selectedAdAccountId}</code>
      </p>

      <div className="toolbar" style={{ justifyContent: "flex-end" }}>
        <select value={preset} onChange={(e) => setPreset(e.target.value)}>
          {PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button className="btn btn-outline" onClick={loadAll}><FiRefreshCw /> Refresh</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{fmt(totals.spend)}</div>
          <div className="stat-label">Total spend</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totals.impressions.toLocaleString()}</div>
          <div className="stat-label">Impressions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totals.clicks.toLocaleString()}</div>
          <div className="stat-label">Clicks · CTR {avgCtr.toFixed(2)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totals.reach.toLocaleString()}</div>
          <div className="stat-label">Unique reach</div>
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="stat-card"><div className="stat-value">{fmt(avgCpc)}</div><div className="stat-label">Avg CPC</div></div>
        <div className="stat-card"><div className="stat-value">{fmt(avgCpm)}</div><div className="stat-label">Avg CPM</div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><div className="card-title">Campaign breakdown</div></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Spend</th>
                <th>Impr.</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>CPC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.campaign_id || r.ad_id}>
                  <td style={{ fontWeight: 600 }}>{r.campaign_name || r.ad_name || "—"}</td>
                  <td>{fmt(r.spend)}</td>
                  <td>{Number(r.impressions || 0).toLocaleString()}</td>
                  <td>{Number(r.clicks || 0).toLocaleString()}</td>
                  <td>{Number(r.ctr || 0).toFixed(2)}%</td>
                  <td>{fmt(r.cpc)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No insights yet for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

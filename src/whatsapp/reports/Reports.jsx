import { useEffect, useMemo, useState } from "react";
import {
  FiSend, FiCheck, FiCheckCircle, FiEye, FiMessageCircle,
  FiAlertTriangle, FiRefreshCw, FiDownload, FiFilter,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const RANGES = [
  { id: "7",   label: "Last 7 days" },
  { id: "14",  label: "Last 14 days" },
  { id: "30",  label: "Last 30 days" },
  { id: "90",  label: "Last 90 days" },
  { id: "365", label: "Last 12 months" },
  { id: "all", label: "All time" },
];

export default function Reports() {
  const [days, setDays]               = useState("30");
  const [campaignId, setCampaignId]   = useState("");  // "" = total, otherwise specific campaign id
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState("");

  async function load({ soft = false } = {}) {
    if (soft) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const q = { days };
      if (campaignId) q.campaignId = campaignId;
      const r = await waApi.reports(q);
      setData(r);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days, campaignId]);

  const totals = data?.totals || {};
  const trend  = data?.trend  || [];
  const campaigns = data?.campaigns || [];

  const trendMax = useMemo(
    () => Math.max(
      1,
      ...trend.map((d) => Math.max(d.sent || 0, d.delivered || 0, d.read || 0, d.replied || 0))
    ),
    [trend]
  );

  function exportCsv() {
    const rows = [
      ["Campaign", "Template", "Status", "Contacts", "Sent", "Delivered", "Read", "Failed", "Not delivered", "Delivery %", "Read %", "Created"],
      ...campaigns.map((c) => [
        c.name, c.templateName, c.status, c.contacts,
        c.sent, c.delivered, c.read, c.failed, c.notDelivered,
        c.deliveryRate, c.readRate,
        new Date(c.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return /[,\n"]/.test(s) ? `"${s}"` : s;
    }).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `whatsapp-reports-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify.success("CSV exported");
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">WhatsApp Reports</h1>
          <p className="page-subtitle">Delivery analytics for every message you send — total-wise and campaign-wise.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => load({ soft: true })} disabled={refreshing || loading}>
            <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-outline" onClick={exportCsv} disabled={!campaigns.length}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
          <FiFilter /> Filters
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ color: "var(--text-muted)" }}>Range:</span>
          <select value={days} onChange={(e) => setDays(e.target.value)} style={selectStyle}>
            {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ color: "var(--text-muted)" }}>View:</span>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ ...selectStyle, minWidth: 220 }}>
            <option value="">All campaigns (totals)</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
          {campaignId
            ? <>Showing <b>{campaigns.find((c) => c.id === campaignId)?.name || "—"}</b> only</>
            : <>Showing <b>totals</b> across {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}</>}
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      {/* KPI cards */}
      {loading ? <KpiSkeleton /> : (
        <div className="stats-grid">
          <Stat Icon={FiSend}        color="purple" value={totals.sent}         label="Total sent"
                hint={`${totals.outboundTotal || 0} outbound msgs`} />
          <Stat Icon={FiCheck}       color="green"  value={totals.delivered}    label="Delivered"
                hint={`${totals.deliveryRate ?? 0}% of sent`} />
          <Stat Icon={FiAlertTriangle} color="orange" value={totals.notDelivered} label="Not delivered"
                hint={`${totals.failed || 0} failed`} />
          <Stat Icon={FiEye}         color="pink"   value={totals.read}         label="Read"
                hint={`${totals.readRate ?? 0}% of sent`} />
        </div>
      )}

      {!loading && (
        <div className="stats-grid" style={{ marginTop: 14 }}>
          <Stat Icon={FiMessageCircle} color="green"  value={totals.replied} label="Replies"
                hint={`${totals.replyRate ?? 0}% reply rate`} />
          <Stat Icon={FiCheckCircle}   color="purple" value={`${totals.deliveryRate ?? 0}%`} label="Delivery rate" />
          <Stat Icon={FiEye}           color="orange" value={`${totals.readRate ?? 0}%`}     label="Read rate" />
          <Stat Icon={FiMessageCircle} color="pink"   value={`${totals.replyRate ?? 0}%`}    label="Reply rate" />
        </div>
      )}

      {/* Trend chart */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Delivery trend</div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)" }}>
            <Legend color="#7c3aed" label="Sent" />
            <Legend color="#10b981" label="Delivered" />
            <Legend color="#ec4899" label="Read" />
            <Legend color="#f59e0b" label="Replied" />
          </div>
        </div>
        {loading ? (
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", gap: 6, padding: "10px 0" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="skel" style={{ flex: 1, height: `${30 + (i * 7) % 60}%`, borderRadius: 4 }} />
            ))}
          </div>
        ) : trend.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No messages in this window.
          </div>
        ) : (
          <TrendChart trend={trend} max={trendMax} />
        )}
      </div>

      {/* Campaign-wise table */}
      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="card-title">Campaign breakdown</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Template</th>
                <th>Status</th>
                <th>Contacts</th>
                <th>Sent</th>
                <th>Delivered</th>
                <th>Not delivered</th>
                <th>Read</th>
                <th>Failed</th>
                <th>Delivery %</th>
                <th>Read %</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    {Array.from({ length: 12 }).map((__, j) => (
                      <td key={j}><span className="skel skel-line skel-line-sm" style={{ width: j === 0 ? 160 : 50 }} /></td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr><td colSpan="12" style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
                  No campaigns yet. Send a broadcast first.
                </td></tr>
              ) : campaigns.map((c) => {
                const highlight = campaignId && c.id === campaignId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setCampaignId(highlight ? "" : c.id)}
                    style={{
                      cursor: "pointer",
                      background: highlight ? "var(--primary-50)" : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.templateName || "—"}</td>
                    <td><span className={`ticket-status ${c.status}`}>{c.status}</span></td>
                    <td>{c.contacts}</td>
                    <td style={{ fontWeight: 600 }}>{c.sent.toLocaleString()}</td>
                    <td style={{ color: "#16a34a", fontWeight: 600 }}>{c.delivered.toLocaleString()}</td>
                    <td style={{ color: "#f59e0b" }}>{c.notDelivered.toLocaleString()}</td>
                    <td style={{ color: "#ec4899", fontWeight: 600 }}>{c.read.toLocaleString()}</td>
                    <td style={{ color: "#ef4444" }}>{c.failed.toLocaleString()}</td>
                    <td>
                      <RatePill value={c.deliveryRate} />
                    </td>
                    <td>
                      <RatePill value={c.readRate} />
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */
function Stat({ Icon, color, value, label, hint }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon /></div>
      <div className="stat-value">{Number(value || 0).toLocaleString?.() ?? value ?? 0}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-change up" style={{ color: "var(--text-muted)" }}>{hint}</div>}
    </div>
  );
}

/* Grouped bar chart — 4 thin bars per day, all anchored to the same
   baseline so one huge value can't push the others off-screen. Uses an
   SVG gridline background so the scale is legible. */
function TrendChart({ trend, max }) {
  const H          = 200;   // chart plot height in px
  const LABEL_H    = 22;    // space reserved below for x-axis labels
  const COLORS     = { sent: "#7c3aed", delivered: "#10b981", read: "#ec4899", replied: "#f59e0b" };
  const labelEvery = Math.max(1, Math.ceil(trend.length / 8));

  // Nice rounded Y-axis values
  const niceMax = niceCeil(max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {/* Y-axis ticks */}
      <div style={{
        width: 38, height: H + LABEL_H, position: "relative",
        fontSize: 10, color: "var(--text-muted)", flexShrink: 0,
      }}>
        {ticks.map((t, i) => (
          <span key={i} style={{
            position: "absolute",
            right: 0,
            top: H - (i / (ticks.length - 1)) * H - 6,
            textAlign: "right", whiteSpace: "nowrap",
          }}>{t.toLocaleString()}</span>
        ))}
      </div>

      {/* Chart plot */}
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        {/* Horizontal gridlines */}
        <div style={{ position: "absolute", inset: `0 0 ${LABEL_H}px 0`, pointerEvents: "none" }}>
          {ticks.map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: 0, right: 0,
              top: H - (i / (ticks.length - 1)) * H,
              borderBottom: "1px dashed #eef0f4",
            }} />
          ))}
        </div>

        {/* Bars row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: H, position: "relative" }}>
          {trend.map((d) => {
            const bars = [
              { key: "sent",      value: d.sent      || 0, color: COLORS.sent },
              { key: "delivered", value: d.delivered || 0, color: COLORS.delivered },
              { key: "read",      value: d.read      || 0, color: COLORS.read },
              { key: "replied",   value: d.replied   || 0, color: COLORS.replied },
            ];
            return (
              <div
                key={d.d}
                title={`${d.d} · Sent ${d.sent} · Delivered ${d.delivered} · Read ${d.read} · Replies ${d.replied}`}
                style={{
                  flex: 1, minWidth: 0, height: "100%",
                  display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2,
                }}
              >
                {bars.map((b) => {
                  const h = b.value > 0 ? Math.max(2, Math.round((b.value / niceMax) * H)) : 0;
                  return (
                    <span
                      key={b.key}
                      style={{
                        flex: 1, minWidth: 0,
                        height: h,
                        background: b.color,
                        borderRadius: "3px 3px 0 0",
                        maxWidth: 14,
                        transition: "height .25s ease",
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{ display: "flex", gap: 4, height: LABEL_H, alignItems: "center" }}>
          {trend.map((d, i) => (
            <div key={d.d} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
              {i % labelEvery === 0 && (
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.d.slice(5)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Round up to a visually "nice" number for axis scaling.
function niceCeil(n) {
  if (n <= 1) return 1;
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)));
  const rounded = n / pow10;
  let nice;
  if (rounded <= 1) nice = 1;
  else if (rounded <= 2) nice = 2;
  else if (rounded <= 5) nice = 5;
  else nice = 10;
  return nice * pow10;
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function RatePill({ value }) {
  const v = Number(value) || 0;
  const bg = v >= 80 ? "#dcfce7" : v >= 50 ? "#fef3c7" : "#fee2e2";
  const fg = v >= 80 ? "#166534" : v >= 50 ? "#92400e" : "#b91c1c";
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      background: bg, color: fg, fontSize: 11, fontWeight: 700,
    }}>
      {v}%
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card">
          <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
          <span className="skel skel-line" style={{ width: 100, height: 24, display: "block", marginBottom: 6 }} />
          <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
        </div>
      ))}
    </div>
  );
}

const selectStyle = {
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "white",
  fontSize: 13,
  color: "var(--text)",
  cursor: "pointer",
  minWidth: 160,
};

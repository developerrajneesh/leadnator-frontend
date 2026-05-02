import { useEffect, useMemo, useState } from "react";
import {
  FiMessageCircle, FiSend, FiInbox, FiCheckCircle, FiAlertTriangle,
  FiRefreshCw, FiUsers, FiCpu, FiClock, FiActivity,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";

const RANGES = [
  { days: 7,  label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

const STATUS_COLORS = {
  sent:      "#64748b",
  delivered: "#0ea5e9",
  read:      "#10b981",
  failed:    "#ef4444",
  received:  "#7c3aed",
  unknown:   "#cbd5e1",
};

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.analytics(days); setData(r); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  if (loading && !data) {
    return <AnalyticsSkeleton days={days} onChangeDays={setDays} />;
  }
  if (error && !data) {
    return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  }
  if (!data) return null;

  const readRate      = data.outbound ? Math.round((data.statusTotals.read || 0) / data.outbound * 100) : 0;
  const deliveredRate = data.outbound ? Math.round(((data.statusTotals.delivered || 0) + (data.statusTotals.read || 0)) / data.outbound * 100) : 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <FiActivity style={{ color: "#25d366" }} /> WhatsApp analytics
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Everything in the last {days} days — messaging volume, delivery quality, and bot performance.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, background: "white", cursor: "pointer" }}>
            {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
          </select>
          <button className="btn btn-outline" onClick={load} disabled={loading}>
            <FiRefreshCw /> {loading ? "…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="stats-grid" style={{ marginBottom: 14 }}>
        <StatCard icon={<FiMessageCircle />} color="purple" value={data.total}    label="Total messages"    sub={`in ${days} days`} />
        <StatCard icon={<FiInbox />}         color="pink"   value={data.inbound}  label="Inbound"            sub={`from contacts`} />
        <StatCard icon={<FiSend />}          color="green"  value={data.outbound} label="Outbound"           sub={`sent by you / bot`} />
        <StatCard icon={<FiCheckCircle />}   color="orange" value={`${readRate}%`} label="Read rate"         sub={`${deliveredRate}% delivered`} />
      </div>

      {/* Messages over time */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title">📈 Messages over time</div></div>
        <StackedLineChart data={data.perDay} />
        <Legend items={[
          { label: "Inbound",  color: "#ec4899" },
          { label: "Outbound", color: "#10b981" },
        ]} />
      </div>

      <div className="grid-2-equal" style={{ marginBottom: 14, gap: 14 }}>
        {/* Status distribution */}
        <div className="card">
          <div className="card-header"><div className="card-title">✓ Delivery statuses</div></div>
          {Object.keys(data.statusTotals).length === 0 ? (
            <EmptyPlot label="No messages yet" />
          ) : (
            <Donut
              data={Object.entries(data.statusTotals).map(([k, v]) => ({
                label: k, value: v, color: STATUS_COLORS[k] || "#cbd5e1",
              }))}
            />
          )}
        </div>

        {/* Peak-hour chart */}
        <div className="card">
          <div className="card-header"><div className="card-title"><FiClock /> Inbound volume by hour</div></div>
          <HourlyBars data={data.perHour} />
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginBottom: 14, gap: 14 }}>
        {/* Top contacts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiUsers /> Top conversations</div>
            <span className="badge" style={{ background: "#f3f4f6", color: "#374151" }}>{data.topContacts.length}</span>
          </div>
          {data.topContacts.length === 0 ? <EmptyPlot label="No conversations yet" /> : (
            <HBarList items={data.topContacts.map((c) => ({
              label: c.name, sublabel: c.phone,
              values: [
                { label: "in",  value: c.inbound,  color: "#ec4899" },
                { label: "out", value: c.outbound, color: "#10b981" },
              ],
            }))} />
          )}
        </div>

        {/* Chatbot performance */}
        <div className="card">
          <div className="card-header"><div className="card-title"><FiCpu /> Chatbots</div></div>
          {data.chatbots.length === 0 ? (
            <EmptyPlot label="No chatbots configured" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.chatbots.map((b) => (
                <div key={b.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{b.name}</strong>
                    <span className={`badge ${b.status === "active" ? "qualified" : b.status === "paused" ? "contacted" : "lost"}`}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Handled <strong style={{ color: "var(--text)" }}>{b.messagesHandled}</strong> message{b.messagesHandled === 1 ? "" : "s"}
                    {b.lastHandledAt && <> · last active {new Date(b.lastHandledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</>}
                  </div>
                  <BotActivityBar value={b.messagesHandled} max={Math.max(...data.chatbots.map((x) => x.messagesHandled), 1)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- Chart primitives (hand-built SVG, no external deps) ---------- */

function StatCard({ icon, color, value, label, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
      {items.map((i) => (
        <span key={i.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: i.color, display: "inline-block" }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function StackedLineChart({ data }) {
  const W = 800, H = 240;
  const pad = { top: 16, right: 20, bottom: 30, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => Math.max(d.inbound, d.outbound)), 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const pointsFor = (key) => data.map((d, i) => ({
    x: pad.left + i * step,
    y: pad.top + innerH - (d[key] / max) * innerH,
    v: d[key], label: d.d,
  }));

  const inPts  = pointsFor("inbound");
  const outPts = pointsFor("outbound");

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const toArea = (pts) => `${toPath(pts)} L ${pts[pts.length - 1].x} ${pad.top + innerH} L ${pts[0].x} ${pad.top + innerH} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }).map((_, i) => ({
    v: Math.round((max / ticks) * (ticks - i)),
    y: pad.top + (innerH / ticks) * i,
  }));

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="#f3f4f6" strokeWidth="1" />
          <text x={pad.left - 8} y={t.y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{t.v}</text>
        </g>
      ))}
      <path d={toArea(inPts)}  fill="url(#inFill)"  />
      <path d={toArea(outPts)} fill="url(#outFill)" />
      <path d={toPath(inPts)}  fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d={toPath(outPts)} fill="none" stroke="#10b981" strokeWidth="2" />
      {inPts.map((p, i) => (i % Math.max(1, Math.floor(data.length / 7)) === 0 || i === data.length - 1) && (
        <text key={i} x={p.x} y={H - pad.bottom + 16} fontSize="10" fill="#6b7280" textAnchor="middle">
          {p.label.slice(5)}
        </text>
      ))}
    </svg>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 62, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", padding: "10px 0" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f3f4f6" strokeWidth="22" />
        {data.map((d) => {
          const len = (d.value / total) * C;
          const el = (
            <circle key={d.label} cx="80" cy="80" r={R} fill="none" stroke={d.color}
              strokeWidth="22" strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset} transform="rotate(-90 80 80)" />
          );
          offset += len;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">{total}</text>
        <text x="80" y="96" textAnchor="middle" fontSize="11" fill="#6b7280">Total</text>
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
            <span style={{ textTransform: "capitalize" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: "inline-block", marginRight: 8 }} />
              {d.label}
            </span>
            <strong>{d.value} <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 11 }}>({Math.round(d.value / total * 100)}%)</span></strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function HourlyBars({ data }) {
  const W = 800, H = 180;
  const pad = { top: 10, right: 10, bottom: 22, left: 26 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.count), 1);
  const barW = innerW / data.length - 3;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d.count / max) * innerH;
        const x = pad.left + i * (innerW / data.length);
        const y = pad.top + innerH - h;
        return (
          <g key={d.hour}>
            <rect x={x} y={y} width={barW} height={h} fill="#7c3aed" opacity={0.6 + (d.count / max) * 0.4} rx="3" />
            {i % 3 === 0 && (
              <text x={x + barW / 2} y={H - 6} fontSize="10" fill="#6b7280" textAnchor="middle">
                {String(d.hour).padStart(2, "0")}h
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HBarList({ items }) {
  const maxTotal = Math.max(...items.map((i) => i.values.reduce((s, v) => s + v.value, 0)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => {
        const total = item.values.reduce((s, v) => s + v.value, 0);
        const pct = (total / maxTotal) * 100;
        return (
          <div key={idx}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span>
                <strong>{item.label}</strong>
                {item.sublabel && item.sublabel !== item.label && <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{item.sublabel}</span>}
              </span>
              <strong>{total}</strong>
            </div>
            <div style={{ display: "flex", height: 10, borderRadius: 4, overflow: "hidden", background: "#f3f4f6", width: `${Math.max(10, pct)}%` }}>
              {item.values.map((v, i) => (
                <div key={i} title={`${v.label}: ${v.value}`} style={{
                  width: total ? `${(v.value / total) * 100}%` : "0%",
                  background: v.color, transition: "width 0.3s",
                }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BotActivityBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", transition: "width 0.3s" }} />
    </div>
  );
}

function EmptyPlot({ label }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
      {label}
    </div>
  );
}

/* ---------- Skeleton while analytics payload loads ---------- */

function Shimmer({ w = "100%", h = 14, r = 6, style }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
      backgroundSize: "200% 100%",
      animation: "skeleton-shimmer 1.3s ease-in-out infinite",
      ...style,
    }} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Shimmer w={38} h={38} r={10} style={{ marginBottom: 10 }} />
      <Shimmer w="60%" h={22} style={{ marginBottom: 6 }} />
      <Shimmer w="80%" h={12} style={{ marginBottom: 4 }} />
      <Shimmer w="50%" h={10} />
    </div>
  );
}

function LineChartSkeleton({ height = 240 }) {
  // A faux area chart — horizontal grid lines + a wavy polyline drawn as a
  // shimmer path underneath so it animates just like the other skeletons.
  const W = 800, H = height;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="40" x2={W - 20} y1={20 + i * ((H - 50) / 4)} y2={20 + i * ((H - 50) / 4)} stroke="#f3f4f6" strokeWidth="1" />
      ))}
      <defs>
        <linearGradient id="skel-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#f3f4f6" />
          <stop offset="50%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#f3f4f6" />
          <animate attributeName="x1" values="-1;1" dur="1.3s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0;2"  dur="1.3s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <path
        d={`M 40 ${H * 0.65} Q ${W * 0.2} ${H * 0.3}, ${W * 0.35} ${H * 0.55} T ${W * 0.7} ${H * 0.45} T ${W - 20} ${H * 0.55} L ${W - 20} ${H - 30} L 40 ${H - 30} Z`}
        fill="url(#skel-line)"
        opacity="0.7"
      />
      <path
        d={`M 40 ${H * 0.65} Q ${W * 0.2} ${H * 0.3}, ${W * 0.35} ${H * 0.55} T ${W * 0.7} ${H * 0.45} T ${W - 20} ${H * 0.55}`}
        fill="none" stroke="url(#skel-line)" strokeWidth="3"
      />
    </svg>
  );
}

function DonutSkeleton() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", padding: "10px 0" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="62" fill="none" stroke="#f3f4f6" strokeWidth="22" />
        <circle cx="80" cy="80" r="62" fill="none" stroke="#e5e7eb" strokeWidth="22"
          strokeDasharray="140 500" transform="rotate(-90 80 80)">
          <animateTransform attributeName="transform" type="rotate" from="-90 80 80" to="270 80 80" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <Shimmer w={10} h={10} r={2} />
              <Shimmer w="50%" h={12} />
            </div>
            <Shimmer w={40} h={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HourlyBarsSkeleton({ height = 180 }) {
  const bars = Array.from({ length: 24 });
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, padding: "10px 10px 22px 26px" }}>
      {bars.map((_, i) => {
        const h = 20 + Math.abs(Math.sin(i * 0.7)) * 60 + (i % 5) * 6;
        return (
          <div
            key={i}
            style={{
              flex: 1, height: `${h}%`,
              background: "linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)",
              backgroundSize: "100% 200%",
              borderRadius: 3,
              animation: `skeleton-shimmer 1.3s ease-in-out ${i * 0.03}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

function HBarListSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <Shimmer w="40%" h={12} />
            <Shimmer w={24} h={12} />
          </div>
          <Shimmer w={`${80 - i * 10}%`} h={10} r={4} />
        </div>
      ))}
    </div>
  );
}

function BotListSkeleton({ rows = 2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Shimmer w="40%" h={14} />
            <Shimmer w={60} h={18} r={10} />
          </div>
          <Shimmer w="70%" h={11} style={{ marginBottom: 8 }} />
          <Shimmer w="100%" h={6} r={3} />
        </div>
      ))}
    </div>
  );
}

function AnalyticsSkeleton({ days, onChangeDays }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <FiActivity style={{ color: "#25d366" }} /> WhatsApp analytics
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Loading metrics…</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={days} onChange={(e) => onChangeDays(Number(e.target.value))} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, background: "white", cursor: "pointer" }}>
            {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
          </select>
          <button className="btn btn-outline" disabled><FiRefreshCw /> …</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 14 }}>
        {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><Shimmer w={200} h={16} /></div></div>
        <LineChartSkeleton />
      </div>

      <div className="grid-2-equal" style={{ marginBottom: 14, gap: 14 }}>
        <div className="card">
          <div className="card-header"><div className="card-title"><Shimmer w={160} h={16} /></div></div>
          <DonutSkeleton />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Shimmer w={200} h={16} /></div></div>
          <HourlyBarsSkeleton />
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginBottom: 14, gap: 14 }}>
        <div className="card">
          <div className="card-header"><div className="card-title"><Shimmer w={180} h={16} /></div></div>
          <HBarListSkeleton />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Shimmer w={120} h={16} /></div></div>
          <BotListSkeleton />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

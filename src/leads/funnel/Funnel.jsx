import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiStar, FiTrendingDown, FiFilter, FiTag, FiRefreshCw,
  FiChevronDown, FiChevronRight, FiArrowRight,
} from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import { PIPELINE_STAGES } from "../constants";

const RANGES = [
  { key: "all",  label: "All time" },
  { key: "7",    label: "Last 7 days" },
  { key: "30",   label: "Last 30 days" },
  { key: "90",   label: "Last 90 days" },
  { key: "365",  label: "Last 12 months" },
];

export default function Funnel() {
  const navigate = useNavigate();
  const { leads, loading, error, reload } = useLeads();
  const [range, setRange]   = useState("all");
  const [source, setSource] = useState("all");
  const [expanded, setExpanded] = useState(null); // stage key currently expanded

  const sources = useMemo(
    () => ["all", ...Array.from(new Set(leads.map((l) => l.source).filter(Boolean)))],
    [leads]
  );

  // Apply filters (range + source)
  const filtered = useMemo(() => {
    const now = Date.now();
    const maxAgeMs = range === "all" ? Infinity : Number(range) * 86400000;
    return leads.filter((l) => {
      if (source !== "all" && l.source !== source) return false;
      if (!Number.isFinite(maxAgeMs)) return true;
      const ts = new Date(l.createdAt).getTime();
      return Number.isFinite(ts) && now - ts <= maxAgeMs;
    });
  }, [leads, range, source]);

  // Build stage data (exclude Lost from the funnel bars)
  const stages = useMemo(() => {
    return PIPELINE_STAGES.filter((s) => s.key !== "lost").map((s) => {
      const bucket = filtered.filter((l) => l.status === s.key);
      return { ...s, leads: bucket, count: bucket.length, value: bucket.reduce((sum, l) => sum + (l.value || 0), 0) };
    });
  }, [filtered]);

  const lost           = filtered.filter((l) => l.status === "lost");
  const totalLeads     = filtered.length;
  const totalValue     = filtered.reduce((s, l) => s + (l.value || 0), 0);
  const totalInFunnel  = stages[0]?.count || 0;
  const qualified      = stages.find((s) => s.key === "qualified");
  const conversionRate = totalInFunnel ? Math.round(((qualified?.count || 0) / totalInFunnel) * 100) : 0;
  const maxStageCount  = Math.max(...stages.map((s) => s.count), 1);
  const avgDeal        = totalLeads ? Math.round(totalValue / totalLeads) : 0;

  if (loading && leads.length === 0) {
    return <FunnelSkeleton />;
  }

  return (
    <>
      <h1 className="page-title">Sales funnel</h1>
      <p className="page-subtitle">Live funnel based on your lead data. Click a stage to see which leads are in it.</p>

      {/* Filters / actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <select value={range} onChange={(e) => setRange(e.target.value)} style={selectStyle}>
          {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={selectStyle}>
          {sources.map((s) => <option key={s} value={s}>{s === "all" ? "All sources" : s}</option>)}
        </select>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Showing <strong>{totalLeads}</strong> of {leads.length} leads
        </div>
        <button className="btn btn-outline" style={{ marginLeft: "auto" }} onClick={reload} disabled={loading}>
          <FiRefreshCw /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error} <button onClick={reload} style={{ marginLeft: 10, color: "#b91c1c", background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple"><FiStar /></div><div className="stat-value">{totalLeads}</div><div className="stat-label">Total in funnel</div></div>
        <div className="stat-card"><div className="stat-icon green"><FiTrendingDown /></div><div className="stat-value">{conversionRate}%</div><div className="stat-label">New → Qualified</div></div>
        <div className="stat-card"><div className="stat-icon orange"><FiFilter /></div><div className="stat-value">₹{totalValue.toLocaleString()}</div><div className="stat-label">Pipeline value</div></div>
        <div className="stat-card"><div className="stat-icon pink"><FiTag /></div><div className="stat-value">₹{avgDeal.toLocaleString()}</div><div className="stat-label">Avg deal size</div></div>
      </div>

      {/* Funnel chart */}
      <div className="card">
        <div className="card-header"><div className="card-title">Stages</div></div>

        {totalLeads === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No leads match these filters.
          </div>
        ) : (
          <div className="funnel">
            {stages.map((s, i) => {
              const width = 30 + (s.count / maxStageCount) * 70;
              const prev = stages[i - 1]?.count;
              const dropRate = prev ? Math.round(((prev - s.count) / prev) * 100) : 0;
              const convRate = prev ? Math.round((s.count / prev) * 100) : null;
              const isOpen = expanded === s.key;
              return (
                <div key={s.key} className="funnel-row">
                  <div
                    className="funnel-bar"
                    style={{ width: `${width}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`, cursor: "pointer" }}
                    onClick={() => setExpanded(isOpen ? null : s.key)}
                    title={`${s.leads.length} leads — click to ${isOpen ? "hide" : "show"}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                      <div>
                        <strong style={{ fontSize: 14 }}>{s.label}</strong>
                        <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                          {s.count} lead{s.count === 1 ? "" : "s"} · ₹{s.value.toLocaleString()}
                          {convRate != null && <> · {convRate}% from {stages[i - 1].label}</>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{s.count}</div>
                  </div>
                  {i > 0 && dropRate > 0 && (
                    <div className="funnel-drop"><FiTrendingDown /> {dropRate}% drop-off</div>
                  )}

                  {isOpen && (
                    <div style={{
                      marginTop: 10, marginLeft: 12, padding: 12,
                      background: "#f9fafb", border: "1px solid var(--border)", borderRadius: 10,
                      maxHeight: 280, overflowY: "auto",
                    }}>
                      {s.leads.length === 0 ? (
                        <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 6 }}>No leads in this stage.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {s.leads.slice(0, 20).map((l) => (
                            <div
                              key={l.id}
                              onClick={() => navigate(`/leads/all/${l.id}`)}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "8px 10px", background: "white",
                                border: "1px solid var(--border)", borderRadius: 8,
                                cursor: "pointer", transition: "0.12s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#eef2ff"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                            >
                              <span className="avatar-sm" style={{ margin: 0, background: s.color }}>{(l.name || "?")[0]}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {l.email || l.phone || "—"} · {l.source}
                                </div>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>₹{(l.value || 0).toLocaleString()}</div>
                              <FiArrowRight style={{ color: "var(--text-muted)" }} />
                            </div>
                          ))}
                          {s.leads.length > 20 && (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", paddingTop: 4 }}>
                              + {s.leads.length - 20} more — open <a onClick={() => navigate("/leads/all")} style={{ color: "var(--primary)", cursor: "pointer" }}>All leads</a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lost leads */}
      {lost.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header">
            <div className="card-title"><FiTag style={{ color: "#9ca3af" }} /> Lost leads</div>
            <span className="badge" style={{ background: "#f3f4f6", color: "#374151" }}>{lost.length}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
            ₹{lost.reduce((s, l) => s + (l.value || 0), 0).toLocaleString()} in lost deals
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lost.slice(0, 10).map((l) => (
              <span
                key={l.id}
                onClick={() => navigate(`/leads/all/${l.id}`)}
                className="badge"
                style={{ background: "#f3f4f6", color: "#374151", cursor: "pointer" }}
                title={`${l.email || ""} · ${l.source}`}
              >
                {l.name}
              </span>
            ))}
            {lost.length > 10 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+ {lost.length - 10} more</span>}
          </div>
        </div>
      )}
    </>
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
};

/* Skeleton that matches the loaded layout: filters row + 4 stat cards +
   funnel card with bars of tapering widths so the transition doesn't
   cause any visual jump. Uses the global `.skel*` shimmer toolkit. */
function FunnelSkeleton() {
  // Tapering widths mirror the real funnel shape.
  const BAR_WIDTHS = [92, 76, 58, 42];
  const STAGE_COLORS = PIPELINE_STAGES.filter((s) => s.key !== "lost").map((s) => s.color);
  return (
    <>
      <h1 className="page-title">Sales funnel</h1>
      <p className="page-subtitle">Live funnel based on your lead data. Click a stage to see which leads are in it.</p>

      {/* Filters skeleton */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span className="skel" style={{ width: 150, height: 36, borderRadius: 8 }} />
        <span className="skel" style={{ width: 140, height: 36, borderRadius: 8 }} />
        <span className="skel skel-line skel-line-sm" style={{ width: 180 }} />
        <span className="skel" style={{ marginLeft: "auto", width: 110, height: 36, borderRadius: 8 }} />
      </div>

      {/* Stats skeleton */}
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
            <span className="skel skel-line" style={{ width: 80, height: 22, display: "block", marginBottom: 6 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 140, display: "block" }} />
          </div>
        ))}
      </div>

      {/* Funnel chart skeleton */}
      <div className="card">
        <div className="card-header"><div className="card-title">Stages</div></div>
        <div className="funnel">
          {BAR_WIDTHS.map((w, i) => (
            <div key={i} className="funnel-row">
              <div
                style={{
                  width: `${w}%`,
                  minHeight: 64,
                  borderRadius: 12,
                  background: `linear-gradient(90deg, ${STAGE_COLORS[i] || "#cbd5e1"}55, ${STAGE_COLORS[i] || "#cbd5e1"}22)`,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="skel skel-line" style={{ width: 90, height: 14, display: "block", marginBottom: 6 }} />
                  <span className="skel skel-line skel-line-sm" style={{ width: 160, display: "block" }} />
                </div>
                <span className="skel skel-line" style={{ width: 40, height: 22 }} />
              </div>
              {i > 0 && (
                <span className="skel skel-line skel-line-sm" style={{ width: 110, marginTop: 6, marginLeft: 12, display: "block" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

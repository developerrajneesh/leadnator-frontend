import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiRefreshCw, FiClock } from "react-icons/fi";
import { api } from "../../api/client";

const STATUS_COLORS = {
  new:       "#3b82f6",
  contacted: "#f59e0b",
  hot:       "#ef4444",
  qualified: "#10b981",
  lost:      "#9ca3af",
};

const initials = (name) =>
  String(name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1)   return "just now";
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7)   return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Activity() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard.activity()
      .then((d) => setEvents(d.events || []))
      .catch((e) => setError(e.message || "Failed to load activity"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading activity…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;

  return (
    <>
      <h1 className="page-title">Recent activity</h1>
      <p className="page-subtitle">The latest lead events across your workspace.</p>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Activity feed</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{events.length} events</span>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <FiClock style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 14 }}>No activity yet — add leads to get started.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {events.map((e, idx) => {
              const color = STATUS_COLORS[e.status] || "#6b7280";
              const Icon = e.kind === "lead_created" ? FiUserPlus : FiRefreshCw;
              return (
                <div
                  key={idx}
                  onClick={() => e.leadId && navigate(`/leads/all/${e.leadId}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 4px", borderBottom: "1px solid var(--border)",
                    cursor: e.leadId ? "pointer" : "default",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 18, background: `${color}22`,
                    color, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 16,
                  }}>
                    <Icon />
                  </div>
                  <span className="avatar-sm">{initials(e.leadName)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.text}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {e.kind === "lead_created" ? "Lead created" : "Status changed"}
                    </div>
                  </div>
                  {e.status && (
                    <span className={`badge ${e.status}`} style={{ flexShrink: 0 }}>{e.status}</span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                    {timeAgo(e.ts)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

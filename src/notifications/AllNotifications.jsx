import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiSend, FiCreditCard, FiBell, FiRefreshCw, FiCheckCircle, FiCheck } from "react-icons/fi";
import { api } from "../api/client";
import { onSocket } from "../api/socket";

const META = {
  lead:     { Icon: FiUserPlus,   color: "#7c3aed", bg: "#f5f3ff" },
  campaign: { Icon: FiSend,       color: "#0ea5e9", bg: "#e0f2fe" },
  billing:  { Icon: FiCreditCard, color: "#f59e0b", bg: "#fef3c7" },
  default:  { Icon: FiBell,       color: "#64748b", bg: "#f1f5f9" },
};

export default function AllNotifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await api.notifications.list({ limit: 50 });
      setNotifs(res.notifications || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // Real-time: prepend pushed notifications.
  useEffect(() => onSocket("notification:new", (n) => {
    if (n) setNotifs((list) => [{ ...n, read: false }, ...list]);
  }), []);

  const hasUnread = notifs.some((n) => !n.read);

  function markAllRead() {
    setNotifs((list) => list.map((n) => ({ ...n, read: true })));
    api.notifications.markAllRead().catch(() => {});
  }

  function openNotif(n) {
    if (!n.read && n.key) {
      setNotifs((list) => list.map((x) => (x.key === n.key ? { ...x, read: true } : x)));
      api.notifications.markRead(n.key).catch(() => {});
    }
    if (n.link) navigate(n.link);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Notifications</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Recent activity across your workspace — leads, campaigns and billing.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hasUnread && (
            <button className="btn btn-outline" onClick={markAllRead}>
              <FiCheck style={{ marginRight: 6 }} /> Mark all read
            </button>
          )}
          <button className="btn btn-outline" onClick={load} disabled={loading}>
            <FiRefreshCw style={{ animation: loading ? "spin 1s linear infinite" : "", marginRight: 6 }} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : notifs.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0fdf4", color: "#10b981", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <FiCheckCircle size={26} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>You're all caught up</div>
          <div style={{ color: "var(--text-muted)", maxWidth: 420, margin: "0 auto" }}>
            No new notifications right now. New leads, finished campaigns and renewals will show up here.
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {notifs.map((n, i) => {
            const m = META[n.type] || META.default;
            const unread = !n.read;
            return (
              <div
                key={i}
                onClick={() => openNotif(n)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px",
                  borderBottom: i < notifs.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: n.link ? "pointer" : "default",
                  background: unread ? "#faf9ff" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = unread ? "#faf9ff" : "transparent")}
              >
                <span style={{ width: 40, height: 40, borderRadius: 10, background: m.bg, color: m.color, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
                  <m.Icon />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{n.sub}</div>
                </div>
                {/* Unread dot */}
                {unread && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 6 }} />}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

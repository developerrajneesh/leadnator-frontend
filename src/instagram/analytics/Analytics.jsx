import { useEffect, useState } from "react";
import { FiBarChart2, FiInbox, FiMessageCircle, FiZap } from "react-icons/fi";
import { igApi } from "../../api/instagram";

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    igApi.analytics().then(setStats).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "DMs received", value: stats.dmsReceived, icon: FiInbox, color: "#e1306c" },
    { label: "DMs sent", value: stats.dmsSent, icon: FiInbox, color: "#bc1888" },
    { label: "Unread DMs", value: stats.unreadDms, icon: FiInbox, color: "#f59e0b" },
    { label: "Comments", value: stats.commentsTotal, icon: FiMessageCircle, color: "#7c3aed" },
    { label: "Active flows", value: stats.activeFlows, icon: FiZap, color: "#10b981" },
  ] : [];

  return (
    <>
      <h1 className="page-title">Instagram — Analytics</h1>
      <p className="page-subtitle">
        {stats?.username ? `@${stats.username} — ` : ""}Performance across DMs, comments, and automations.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginTop: 20 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ textAlign: "center", padding: 24 }}>
            <c.icon size={28} style={{ color: c.color, marginBottom: 10 }} />
            <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value ?? "—"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {!stats && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <FiBarChart2 size={32} style={{ marginBottom: 12 }} />
          Loading analytics…
        </div>
      )}
    </>
  );
}

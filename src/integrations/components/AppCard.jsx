export default function AppCard({ app, onToggle }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, background: app.color, color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 18, flexShrink: 0,
        }}>{app.initial}</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 14 }}>{app.name}</h4>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{app.category}</div>
        </div>
        {app.connected && <span className="badge qualified" style={{ fontSize: 10 }}>Connected</span>}
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, minHeight: 36, marginBottom: 12 }}>{app.desc}</p>
      <button
        className={`btn ${app.connected ? "btn-outline" : "btn-primary"}`}
        style={{ width: "100%" }}
        onClick={() => onToggle(app.id)}
      >
        {app.connected ? "Manage" : "Connect"}
      </button>
    </div>
  );
}

export default function HBar({ data, color = "#7c3aed", format }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = format || ((v) => v.toLocaleString());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "6px 0" }}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{d.label}</span>
              <span style={{ color: "var(--text-muted)" }}>{fmt(d.value)}</span>
            </div>
            <div style={{ background: "#f3f4f6", height: 10, borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`,
                height: "100%",
                background: d.color || color,
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

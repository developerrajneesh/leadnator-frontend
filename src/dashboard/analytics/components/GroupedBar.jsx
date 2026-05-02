export default function GroupedBar({ data, series, height = 240 }) {
  const max = Math.max(
    ...data.flatMap((d) => series.map((s) => d[s.key] || 0)),
    1
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        {series.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: "inline-block" }} />
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height, paddingBottom: 28, borderBottom: "1px solid #f3f4f6", position: "relative" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", position: "relative" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, width: "100%", justifyContent: "center" }}>
              {series.map((s) => {
                const val = d[s.key] || 0;
                const h = (val / max) * 100;
                return (
                  <div
                    key={s.key}
                    title={`${s.label}: ${val.toLocaleString()}`}
                    style={{
                      width: `${Math.max(18, 80 / series.length)}px`,
                      height: `${h}%`,
                      background: s.color,
                      borderRadius: "6px 6px 0 0",
                      minHeight: 2,
                      transition: "height 0.3s",
                    }}
                  />
                );
              })}
            </div>
            <span style={{
              position: "absolute",
              bottom: -22,
              fontSize: 11,
              color: "var(--text-muted)",
              textAlign: "center",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              padding: "0 4px",
            }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

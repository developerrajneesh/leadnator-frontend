export default function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={R} fill="none" stroke="#f3f4f6" strokeWidth="20" />
        {data.map((d) => {
          const len = (d.value / total) * C;
          const el = (
            <circle key={d.label} cx="75" cy="75" r={R} fill="none" stroke={d.color}
              strokeWidth="20" strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset} transform="rotate(-90 75 75)" />
          );
          offset += len;
          return el;
        })}
        <text x="75" y="72" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total}</text>
        <text x="75" y="90" textAnchor="middle" fontSize="11" fill="#6b7280">Total %</text>
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span><span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, display: "inline-block", marginRight: 8 }} />{d.label}</span>
            <strong>{d.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

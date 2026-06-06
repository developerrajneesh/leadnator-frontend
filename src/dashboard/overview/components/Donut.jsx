export default function Donut({ data, centerLabel = "Total" }) {
  // Size arcs by real counts when available (falls back to the % value), so the
  // ring fills the full circle exactly and the center shows the true total.
  const metric = (d) => (d.count != null ? d.count : d.value);
  const centerValue = data.reduce((s, d) => s + metric(d), 0);
  const total = centerValue || 1;
  const R = 60, C = 2 * Math.PI * R;
  // Arc length + start offset per segment, computed without mutation.
  const lens = data.map((d) => (metric(d) / total) * C);
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((s, x) => s + x, 0));
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={R} fill="none" stroke="#f3f4f6" strokeWidth="20" />
        {data.map((d, i) => (
          <circle key={d.label} cx="75" cy="75" r={R} fill="none" stroke={d.color}
            strokeWidth="20" strokeDasharray={`${lens[i]} ${C - lens[i]}`}
            strokeDashoffset={-offsets[i]} transform="rotate(-90 75 75)" />
        ))}
        <text x="75" y="72" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{centerValue.toLocaleString()}</text>
        <text x="75" y="90" textAnchor="middle" fontSize="11" fill="#6b7280">{centerLabel}</text>
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

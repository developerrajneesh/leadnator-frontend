export default function LineChart({ data, color = "#7c3aed", height = 220 }) {
  const W = 800;
  const H = height;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: pad.left + i * step,
    y: pad.top + innerH - (d.value / max) * innerH,
    value: d.value,
    label: d.label,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }).map((_, i) => {
    const v = Math.round((max / gridLines) * (gridLines - i));
    const y = pad.top + (innerH / gridLines) * i;
    return { v, y };
  });

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={pad.left - 8} y={t.y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{t.v}</text>
          </g>
        ))}

        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
            {(i % 2 === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={H - pad.bottom + 18}
                fontSize="10"
                fill="#6b7280"
                textAnchor="middle"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

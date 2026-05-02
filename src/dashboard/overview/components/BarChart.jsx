export default function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <div className="bar" style={{ height: `${(d.value / max) * 100}%` }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

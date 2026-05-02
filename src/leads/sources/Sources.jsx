import { FiFilter } from "react-icons/fi";
import { useLeads } from "../../api/hooks";

export default function Sources() {
  const { leads, loading } = useLeads();
  if (loading && leads.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading sources…</div>;
  }
  const counts = leads.reduce((acc, l) => ({ ...acc, [l.source]: (acc[l.source] || 0) + 1 }), {});
  return (
    <>
      <h1 className="page-title">Sources</h1>
      <p className="page-subtitle">Where your leads are coming from.</p>
      <div className="card">
        <div className="card-header"><div className="card-title"><FiFilter /> Lead sources</div></div>
        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
          <div key={src} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 13 }}>{src}</strong>
            <span className="badge growth">{count} leads</span>
          </div>
        ))}
      </div>
    </>
  );
}

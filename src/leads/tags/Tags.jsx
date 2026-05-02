import { FiTag, FiPlus } from "react-icons/fi";
import { useLeads } from "../../api/hooks";

export default function Tags() {
  const { leads, loading } = useLeads();
  if (loading && leads.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading tags…</div>;
  }
  const tagCounts = {};
  leads.forEach((l) => (l.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  return (
    <>
      <h1 className="page-title">Tags & lists</h1>
      <p className="page-subtitle">Organize leads with tags and custom lists.</p>
      <div className="card">
        <div className="card-header">
          <div className="card-title"><FiTag /> Tags & lists</div>
          <button className="btn btn-primary"><FiPlus /> New tag</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {Object.entries(tagCounts).map(([t, c]) => (
            <span key={t} className="pill" style={{ cursor: "default" }}>{t} · {c}</span>
          ))}
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiExternalLink, FiFileText } from "react-icons/fi";
import { api } from "../../api/client";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.support.docs()
      .then((r) => setDocs(r.docs || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    return docs.reduce((acc, d) => ((acc[d.category] = acc[d.category] || []).push(d), acc), {});
  }, [docs]);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading docs…</div>;

  return (
    <>
      <h1 className="page-title">Support — Documentation</h1>
      <p className="page-subtitle">Step-by-step guides and API reference.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      {docs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No documentation published yet.
        </div>
      ) : (
        <div className="grid-3">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="card">
              <div className="card-header"><div className="card-title"><FiBookOpen /> {cat}</div></div>
              {list.map((d) => {
                const external = !!d.url && !d.body;
                return (
                  <div
                    key={d.id}
                    onClick={() => external ? window.open(d.url, "_blank", "noopener") : setSelected(d)}
                    style={{
                      padding: "10px 0", borderBottom: "1px solid var(--border)",
                      fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{d.title}</span>
                    {external ? <FiExternalLink style={{ color: "var(--text-muted)" }} /> : <FiFileText style={{ color: "var(--text-muted)" }} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 720, maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="card-header">
              <div className="card-title">{selected.title}</div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
              {selected.category}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.body}</div>
            {selected.url && (
              <div style={{ marginTop: 14 }}>
                <a className="btn btn-outline" href={selected.url} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink /> Open external link
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

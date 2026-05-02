import { useEffect, useMemo, useState } from "react";
import { FiHelpCircle, FiSearch } from "react-icons/fi";
import { api } from "../../api/client";

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.support.faqs()
      .then((r) => setFaqs(r.faqs || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = ql
      ? faqs.filter((f) => f.question.toLowerCase().includes(ql) || f.answer.toLowerCase().includes(ql))
      : faqs;
    return filtered.reduce((acc, f) => ((acc[f.category] = acc[f.category] || []).push(f), acc), {});
  }, [faqs, q]);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading FAQs…</div>;

  return (
    <>
      <h1 className="page-title">Support — FAQs</h1>
      <p className="page-subtitle">Quick answers to the most common questions.</p>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <FiSearch style={{ position: "absolute", left: 12, top: 11, color: "var(--text-muted)" }} />
        <input
          placeholder="Search FAQs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid var(--border)", borderRadius: 8 }}
        />
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      {faqs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No FAQs published yet.
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No FAQs match "{q}".
        </div>
      ) : (
        Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><div className="card-title"><FiHelpCircle /> {cat}</div></div>
            {list.map((f) => (
              <div
                key={f.id}
                onClick={() => setOpen(open === f.id ? null : f.id)}
                style={{ borderBottom: "1px solid var(--border)", padding: "12px 0", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 13 }}>{f.question}</strong>
                  <span style={{ color: "var(--primary)", fontSize: 18 }}>{open === f.id ? "−" : "+"}</span>
                </div>
                {open === f.id && (
                  <p style={{ fontSize: 13, color: "#374151", marginTop: 8, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {f.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}

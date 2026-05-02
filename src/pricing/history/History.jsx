import { useEffect, useState } from "react";
import { FiClock, FiRefreshCw } from "react-icons/fi";
import { pricingApi } from "../../api/pricing";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await pricingApi.history();
      setHistory(res.history || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1 className="page-title">Billing history</h1>
      <p className="page-subtitle">Every charge and subscription change on your account.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card">
        <div className="card-header"><div className="card-title"><FiClock /> Billing history</div></div>
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>No billing events yet.</div>
        ) : history.map((h, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <strong style={{ fontSize: 13 }}>{h.event}</strong>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <strong>{h.amount > 0 ? `₹${h.amount.toLocaleString()}` : "—"}</strong>
          </div>
        ))}
      </div>
    </>
  );
}

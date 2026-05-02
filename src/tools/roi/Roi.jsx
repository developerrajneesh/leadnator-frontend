import { useState } from "react";
import { FiBarChart2 } from "react-icons/fi";

export default function Roi() {
  const [f, setF] = useState({ spend: 50000, revenue: 175000, customers: 42 });
  const profit = f.revenue - f.spend;
  const roi = f.spend ? (profit / f.spend) * 100 : 0;
  const roas = f.spend ? f.revenue / f.spend : 0;
  const cac = f.customers ? f.spend / f.customers : 0;
  const rpc = f.customers ? f.revenue / f.customers : 0;

  return (
    <>
      <h1 className="page-title">ROI calculator</h1>
      <p className="page-subtitle">Measure return on your ad spend and campaigns.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiBarChart2 /> ROI calculator</div></div>
          <div className="form-group"><label>Total ad spend (₹)</label><input type="number" value={f.spend} onChange={(e) => setF({ ...f, spend: +e.target.value || 0 })} /></div>
          <div className="form-group"><label>Revenue generated (₹)</label><input type="number" value={f.revenue} onChange={(e) => setF({ ...f, revenue: +e.target.value || 0 })} /></div>
          <div className="form-group"><label>Customers acquired</label><input type="number" value={f.customers} onChange={(e) => setF({ ...f, customers: +e.target.value || 0 })} /></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Results</div></div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 14, background: roi >= 0 ? "#d1fae5" : "#fee2e2", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>ROI</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: roi >= 0 ? "#065f46" : "#991b1b" }}>{roi.toFixed(1)}%</div>
            </div>
            <div style={{ padding: 14, background: "var(--primary-50)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>ROAS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{roas.toFixed(2)}x</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: 12, background: "#f9fafb", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#6b7280" }}>CAC</div>
                <strong style={{ fontSize: 18 }}>₹{Math.round(cac).toLocaleString()}</strong>
              </div>
              <div style={{ padding: 12, background: "#f9fafb", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Revenue / customer</div>
                <strong style={{ fontSize: 18 }}>₹{Math.round(rpc).toLocaleString()}</strong>
              </div>
            </div>
            <div style={{ padding: 12, background: "#f9fafb", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Net profit</div>
              <strong style={{ fontSize: 20, color: profit >= 0 ? "var(--accent)" : "var(--danger)" }}>
                ₹{profit.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useMemo, useState } from "react";

export default function AbTest() {
  const [a, setA] = useState({ visitors: 1500, conversions: 90 });
  const [b, setB] = useState({ visitors: 1500, conversions: 120 });

  const result = useMemo(() => {
    const pA = a.conversions / a.visitors || 0;
    const pB = b.conversions / b.visitors || 0;
    const lift = pA ? ((pB - pA) / pA) * 100 : 0;
    const pPool = (a.conversions + b.conversions) / (a.visitors + b.visitors);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / a.visitors + 1 / b.visitors));
    const z = se ? (pB - pA) / se : 0;
    const erf = (x) => {
      const t = 1 / (1 + 0.3275911 * Math.abs(x));
      const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
      return x >= 0 ? y : -y;
    };
    const p = 2 * (1 - 0.5 * (1 + erf(Math.abs(z) / Math.sqrt(2))));
    return { pA: pA * 100, pB: pB * 100, lift, z, p, confidence: (1 - p) * 100, significant: p < 0.05 };
  }, [a, b]);

  return (
    <>
      <h1 className="page-title">A/B test calculator</h1>
      <p className="page-subtitle">Check statistical significance of your split tests.</p>
      <div className="grid-2-equal" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Variant A (control)</div></div>
          <div className="form-group"><label>Visitors</label><input type="number" value={a.visitors} onChange={(e) => setA({ ...a, visitors: +e.target.value || 0 })} /></div>
          <div className="form-group"><label>Conversions</label><input type="number" value={a.conversions} onChange={(e) => setA({ ...a, conversions: +e.target.value || 0 })} /></div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-muted)" }}>{result.pA.toFixed(2)}%</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Conversion rate</div>
        </div>
        <div className="card" style={{ borderColor: "var(--primary)" }}>
          <div className="card-header"><div className="card-title">Variant B (test)</div></div>
          <div className="form-group"><label>Visitors</label><input type="number" value={b.visitors} onChange={(e) => setB({ ...b, visitors: +e.target.value || 0 })} /></div>
          <div className="form-group"><label>Conversions</label><input type="number" value={b.conversions} onChange={(e) => setB({ ...b, conversions: +e.target.value || 0 })} /></div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{result.pB.toFixed(2)}%</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Conversion rate</div>
        </div>
      </div>
      <div className="card" style={{ textAlign: "center", background: result.significant ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" : "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
        <div style={{ fontSize: 13, color: "#374151", textTransform: "uppercase", letterSpacing: 0.1 }}>
          {result.significant ? "Statistically significant" : "Not significant yet"}
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, margin: "8px 0", color: result.lift >= 0 ? "#065f46" : "#991b1b" }}>
          {result.lift >= 0 ? "+" : ""}{result.lift.toFixed(2)}%
        </div>
        <div style={{ fontSize: 13, color: "#374151" }}>
          Lift · Confidence: <strong>{result.confidence.toFixed(1)}%</strong> · p-value: <strong>{result.p.toFixed(4)}</strong>
        </div>
      </div>
    </>
  );
}

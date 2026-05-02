import { FiTrendingUp } from "react-icons/fi";

// Meta returns budgets as integer minor-units. We assume the account currency
// is INR (₹) — adjust if multi-currency support lands.
export function money(n) {
  if (n == null || n === "") return "—";
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  return "₹" + (v / 100).toLocaleString("en-IN");
}

export function FieldGrid({ fields }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px 16px" }}>
      {fields.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([label, value, mono], i) => (
        <div key={i} style={{ borderBottom: "1px dashed var(--border)", paddingBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
          <div style={{
            fontSize: mono ? 11 : 13,
            color: "var(--text)", wordBreak: "break-word",
            fontFamily: mono ? "monospace" : "inherit",
          }}>{String(value)}</div>
        </div>
      ))}
    </div>
  );
}

export function prettyJson(value) {
  return (
    <pre style={{
      background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 8,
      fontSize: 11, lineHeight: 1.5, overflow: "auto", marginTop: 6,
      maxHeight: 280,
    }}>{JSON.stringify(value, null, 2)}</pre>
  );
}

export function InsightsCard({ insights, title }) {
  if (!insights) return null;
  const cards = [
    { label: "Spend",       value: insights.spend ? `₹${Number(insights.spend).toLocaleString("en-IN")}` : "—" },
    { label: "Impressions", value: Number(insights.impressions || 0).toLocaleString("en-IN") },
    { label: "Reach",       value: Number(insights.reach || 0).toLocaleString("en-IN") },
    { label: "Clicks",      value: Number(insights.clicks || 0).toLocaleString("en-IN") },
    { label: "CTR",         value: insights.ctr ? `${Number(insights.ctr).toFixed(2)}%` : "—" },
    { label: "CPC",         value: insights.cpc ? `₹${Number(insights.cpc).toFixed(2)}` : "—" },
    { label: "CPM",         value: insights.cpm ? `₹${Number(insights.cpm).toFixed(2)}` : "—" },
    { label: "Frequency",   value: insights.frequency ? Number(insights.frequency).toFixed(2) : "—" },
  ];
  return (
    <div className="card" style={{ marginBottom: 14, background: "linear-gradient(135deg, #faf5ff, #ffffff)" }}>
      <div className="card-header"><div className="card-title"><FiTrendingUp /> {title}</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, color: "var(--text-muted)", textTransform: "uppercase" }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

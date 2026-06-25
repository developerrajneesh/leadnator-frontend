import { useEffect, useState } from "react";
import { FiDollarSign, FiTrendingUp, FiArrowUp, FiArrowDown, FiCreditCard, FiDownload } from "react-icons/fi";
import { api } from "../../api/client";
import LineChart from "../../dashboard/analytics/components/LineChart";
import BarChart from "../../dashboard/overview/components/BarChart";

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.revenue()
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load revenue."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading revenue…</div>;
  }
  if (error) {
    return <div className="card" style={{ padding: 16, color: "#b91c1c", background: "#fee2e2" }}>{error}</div>;
  }

  const { mrr, arr, arpu, churnRate, daily = [], monthly = [], summary = {}, transactions = [] } = data || {};
  const dailyTotal = daily.reduce((s, d) => s + d.value, 0);

  function exportCsv() {
    const rows = [["Txn ID", "User", "Plan", "Amount", "Date", "Status"]];
    for (const t of transactions) {
      rows.push([t.id, t.user, t.plan, t.amount, new Date(t.date).toISOString().slice(0, 10), t.status]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <h1 className="page-title">Revenue</h1>
      <p className="page-subtitle">Subscription income and billing health.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><FiDollarSign /></div>
          <div className="stat-value">{fmtINR(mrr)}</div>
          <div className="stat-label">MRR</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiTrendingUp /></div>
          <div className="stat-value">{fmtINR(arr)}</div>
          <div className="stat-label">ARR</div>
          <div className="stat-change up"><FiArrowUp /> Projected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiCreditCard /></div>
          <div className="stat-value">{fmtINR(arpu)}</div>
          <div className="stat-label">ARPU</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiDollarSign /></div>
          <div className="stat-value">{churnRate}%</div>
          <div className="stat-label">Churn rate (30d)</div>
          <div className={`stat-change ${churnRate > 0 ? "down" : "up"}`}>
            {churnRate > 0 ? <FiArrowDown /> : <FiArrowUp />} {churnRate > 0 ? "Active" : "Healthy"}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Daily revenue · last 14 days</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtINR(dailyTotal)} total</span>
        </div>
        {daily.length ? <LineChart data={daily} color="#10b981" />
          : <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No revenue in this period.</div>}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Revenue — last 6 months</div></div>
          {monthly.some((m) => m.value > 0) ? <BarChart data={monthly} />
            : <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No paid invoices yet.</div>}
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Quick summary</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Active subscriptions", value: summary.active ?? 0 },
              { label: "Cancelled subscriptions", value: summary.paused ?? 0 },
              { label: "Failed payments (30d)", value: summary.failed30 ?? 0 },
              { label: "Refunds issued (30d)", value: summary.refunds30 ?? 0 },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{r.label}</span>
                <span style={{ fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Recent transactions</div>
          <button className="admin-action" onClick={exportCsv} disabled={!transactions.length}><FiDownload /> Export CSV</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Txn ID</th><th>User</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 26, color: "var(--text-muted)" }}>No transactions yet.</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.user}</td>
                  <td><span className={`badge ${String(t.plan).toLowerCase()}`}>{t.plan}</span></td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(t.amount)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td><span className={`txn-status ${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

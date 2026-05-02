import { FiDollarSign, FiTrendingUp, FiArrowUp, FiArrowDown, FiCreditCard, FiDownload } from "react-icons/fi";
import { PLANS, ADMIN_USERS } from "../../data/dummy";
import LineChart from "../../dashboard/analytics/components/LineChart";
import BarChart from "../../dashboard/overview/components/BarChart";

const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

export default function AdminRevenue() {
  const planPriceById = PLANS.reduce((acc, p) => ({ ...acc, [p.name]: p.price }), {});
  const mrr = ADMIN_USERS
    .filter((u) => u.status === "active")
    .reduce((s, u) => s + (planPriceById[u.plan] || 0), 0);
  const arr = mrr * 12;
  const arpu = Math.round(mrr / ADMIN_USERS.filter((u) => u.status === "active").length);

  const monthly = [
    { label: "Nov",  value: 18200 },
    { label: "Dec",  value: 21400 },
    { label: "Jan",  value: 24800 },
    { label: "Feb",  value: 26300 },
    { label: "Mar",  value: 29100 },
    { label: "Apr",  value: mrr  },
  ];

  const daily = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: 800 + Math.floor(Math.random() * 1800),
    };
  });

  const transactions = [
    { id: "tx_901", user: "Mohit Khanna",    plan: "Pro",     amount: 999,   date: "2026-04-17", status: "paid" },
    { id: "tx_902", user: "Anita Desai",     plan: "Pro",     amount: 999,   date: "2026-04-16", status: "paid" },
    { id: "tx_903", user: "Deepak Sharma",   plan: "Growth",  amount: 499,   date: "2026-04-15", status: "paid" },
    { id: "tx_904", user: "Priya Kapoor",    plan: "Growth",  amount: 499,   date: "2026-04-14", status: "failed" },
    { id: "tx_905", user: "Rakesh Jain",     plan: "Starter", amount: 299,   date: "2026-04-12", status: "paid" },
    { id: "tx_906", user: "Acme Retail",     plan: "Growth",  amount: 499,   date: "2026-04-10", status: "refunded" },
  ];

  return (
    <>
      <h1 className="page-title">Revenue</h1>
      <p className="page-subtitle">Subscription income and billing health.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><FiDollarSign /></div>
          <div className="stat-value">{fmtINR(mrr)}</div>
          <div className="stat-label">MRR</div>
          <div className="stat-change up"><FiArrowUp /> 14% MoM</div>
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
          <div className="stat-change up"><FiArrowUp /> 4% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiDollarSign /></div>
          <div className="stat-value">2.4%</div>
          <div className="stat-label">Churn rate</div>
          <div className="stat-change down"><FiArrowDown /> 0.3%</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">Daily revenue · last 14 days</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {fmtINR(daily.reduce((s, d) => s + d.value, 0))} total
          </span>
        </div>
        <LineChart data={daily} color="#10b981" />
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">MRR — last 6 months</div>
          </div>
          <BarChart data={monthly} />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick summary</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Active subscriptions", value: ADMIN_USERS.filter((u) => u.status === "active").length },
              { label: "Paused subscriptions", value: ADMIN_USERS.filter((u) => u.status === "paused").length },
              { label: "Failed payments (30d)", value: 3 },
              { label: "Refunds issued (30d)",  value: 1 },
              { label: "Avg payment time",       value: "1.2s" },
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
          <button className="admin-action"><FiDownload /> Export CSV</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.user}</td>
                  <td><span className={`badge ${t.plan.toLowerCase()}`}>{t.plan}</span></td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(t.amount)}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td>
                    <span className={`txn-status ${t.status}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

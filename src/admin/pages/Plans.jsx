import { FiCheck, FiX, FiUsers, FiStar, FiEdit } from "react-icons/fi";
import { PLANS, ADMIN_USERS } from "../../data/dummy";
import Donut from "../../dashboard/overview/components/Donut";

const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

export default function AdminPlans() {
  const planStats = PLANS.map((p) => {
    const users = ADMIN_USERS.filter((u) => u.plan === p.name);
    return {
      ...p,
      userCount: users.length,
      active: users.filter((u) => u.status === "active").length,
      revenue: users.filter((u) => u.status === "active").length * p.price,
    };
  });

  const totalRevenue = planStats.reduce((s, p) => s + p.revenue, 0);

  const planDist = planStats.map((p) => ({
    label: p.name,
    value: Math.round((p.userCount / ADMIN_USERS.length) * 100),
    color: p.name === "Pro" ? "#ec4899" : p.name === "Growth" ? "#7c3aed" : "#6366f1",
  }));

  return (
    <>
      <h1 className="page-title">Plans</h1>
      <p className="page-subtitle">Subscription tiers and their performance.</p>

      <div className="stats-grid">
        {planStats.map((p) => (
          <div key={p.id} className="stat-card">
            <div className={`stat-icon ${p.name === "Pro" ? "pink" : p.name === "Growth" ? "purple" : "orange"}`}>
              <FiStar />
            </div>
            <div className="stat-value">{p.userCount}</div>
            <div className="stat-label">{p.name} users</div>
            <div className="stat-change up">{fmtINR(p.revenue)} MRR</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-icon green"><FiUsers /></div>
          <div className="stat-value">{fmtINR(totalRevenue)}</div>
          <div className="stat-label">Total MRR</div>
          <div className="stat-change up">Across {ADMIN_USERS.length} users</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan tiers</div>
            <button className="admin-action" title="Edit plans"><FiEdit /> Edit</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Lead limit</th>
                  <th>Users</th>
                  <th>Active</th>
                  <th>MRR</th>
                </tr>
              </thead>
              <tbody>
                {planStats.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={`badge ${p.name.toLowerCase()}`}>{p.name}</span>
                      {p.popular && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--primary)" }}>Popular</span>}
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmtINR(p.price)}/mo</td>
                    <td>{p.leadLimit === Infinity ? "Unlimited" : p.leadLimit.toLocaleString()}</td>
                    <td>{p.userCount}</td>
                    <td>{p.active}</td>
                    <td style={{ fontWeight: 700 }}>{fmtINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">User distribution</div>
          </div>
          <Donut data={planDist} />
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        {planStats.map((p) => (
          <div key={p.id} className="card">
            <div className="card-header">
              <div className="card-title">{p.name}</div>
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>{fmtINR(p.price)}/mo</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{p.tagline}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <FiCheck style={{ color: "#10b981", flexShrink: 0 }} /> {f}
                </div>
              ))}
              {p.disabled.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9ca3af" }}>
                  <FiX style={{ flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

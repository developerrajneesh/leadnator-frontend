import { FiDollarSign, FiDownload, FiTag, FiLink2 } from "react-icons/fi";

export default function MetaOverview({ accounts }) {
  const totalSpend = accounts.filter(a => a.connected).reduce((s, a) => s + a.spend, 0);
  const totalLeads = accounts.filter(a => a.connected).reduce((s, a) => s + a.leads, 0);
  return (
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon purple"><FiDollarSign /></div><div className="stat-value">₹{totalSpend.toLocaleString()}</div><div className="stat-label">Total spend (30d)</div></div>
      <div className="stat-card"><div className="stat-icon green"><FiDownload /></div><div className="stat-value">{totalLeads}</div><div className="stat-label">Leads from Meta</div></div>
      <div className="stat-card"><div className="stat-icon orange"><FiTag /></div><div className="stat-value">₹{totalLeads ? Math.round(totalSpend/totalLeads) : 0}</div><div className="stat-label">Avg. cost / lead</div></div>
      <div className="stat-card"><div className="stat-icon pink"><FiLink2 /></div><div className="stat-value">{accounts.filter(a=>a.connected).length}</div><div className="stat-label">Connected accounts</div></div>
    </div>
  );
}

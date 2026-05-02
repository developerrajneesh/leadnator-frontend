import { FiSend, FiEye, FiMousePointer, FiCalendar } from "react-icons/fi";
import { CAMPAIGNS } from "../../data/dummy";

export default function EmailStats() {
  const totals = CAMPAIGNS.reduce((a, c) => ({
    sent: a.sent + c.sent, opens: a.opens + c.opens, clicks: a.clicks + c.clicks,
  }), { sent: 0, opens: 0, clicks: 0 });

  return (
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon purple"><FiSend /></div><div className="stat-value">{totals.sent.toLocaleString()}</div><div className="stat-label">Total sent</div></div>
      <div className="stat-card"><div className="stat-icon green"><FiEye /></div><div className="stat-value">{Math.round((totals.opens / Math.max(totals.sent,1)) * 100)}%</div><div className="stat-label">Open rate</div></div>
      <div className="stat-card"><div className="stat-icon orange"><FiMousePointer /></div><div className="stat-value">{Math.round((totals.clicks / Math.max(totals.sent,1)) * 100)}%</div><div className="stat-label">Click rate</div></div>
      <div className="stat-card"><div className="stat-icon pink"><FiCalendar /></div><div className="stat-value">{CAMPAIGNS.filter((c) => c.status === "active").length}</div><div className="stat-label">Active</div></div>
    </div>
  );
}

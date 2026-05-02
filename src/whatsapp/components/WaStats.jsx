import { FiSend, FiCheckCircle, FiEye, FiMessageSquare } from "react-icons/fi";

export default function WaStats() {
  return (
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon purple"><FiSend /></div><div className="stat-value">1,860</div><div className="stat-label">Messages sent</div></div>
      <div className="stat-card"><div className="stat-icon green"><FiCheckCircle /></div><div className="stat-value">96%</div><div className="stat-label">Delivery rate</div></div>
      <div className="stat-card"><div className="stat-icon orange"><FiEye /></div><div className="stat-value">62%</div><div className="stat-label">Read rate</div></div>
      <div className="stat-card"><div className="stat-icon pink"><FiMessageSquare /></div><div className="stat-value">228</div><div className="stat-label">Replies</div></div>
    </div>
  );
}

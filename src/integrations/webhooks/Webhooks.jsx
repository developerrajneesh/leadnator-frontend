import { useState } from "react";
import { FiLink, FiPlus, FiCopy, FiPlay, FiPause, FiTrash2 } from "react-icons/fi";

const WEBHOOKS = [
  { id: "w1", url: "https://api.example.com/leadnator/webhook", events: ["lead.created", "lead.updated"], status: "active",  lastDelivery: "2m ago" },
  { id: "w2", url: "https://hooks.zapier.com/hooks/catch/...",   events: ["campaign.sent"],               status: "active",  lastDelivery: "1h ago" },
  { id: "w3", url: "https://notify.slack.com/services/T0...",    events: ["lead.created"],                status: "paused",  lastDelivery: "3d ago" },
];

export default function Webhooks() {
  const [hooks, setHooks] = useState(WEBHOOKS);
  function toggle(id) {
    setHooks(hooks.map((h) => h.id === id ? { ...h, status: h.status === "active" ? "paused" : "active" } : h));
  }
  function remove(id) { setHooks(hooks.filter((h) => h.id !== id)); }

  return (
    <>
      <h1 className="page-title">Webhooks</h1>
      <p className="page-subtitle">Receive real-time event notifications via HTTP.</p>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="card-title"><FiLink /> Webhooks</div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Fire HTTP requests to your servers when events happen.</p>
          </div>
          <button className="btn btn-primary"><FiPlus /> Add webhook</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Endpoint URL</th><th>Events</th><th>Status</th><th>Last delivery</th><th>Actions</th></tr></thead>
            <tbody>
              {hooks.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{h.url}</td>
                  <td>{h.events.map((e) => <span key={e} className="badge growth" style={{ marginRight: 4 }}>{e}</span>)}</td>
                  <td>
                    <span className={`badge ${h.status === "active" ? "qualified" : "contacted"}`}>
                      <span className={`status-dot ${h.status}`} style={{ marginRight: 4 }} />
                      {h.status}
                    </span>
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>{h.lastDelivery}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline" onClick={() => toggle(h.id)}>{h.status === "active" ? <FiPause /> : <FiPlay />}</button>
                    <button className="btn btn-outline"><FiCopy /></button>
                    <button className="btn btn-danger" onClick={() => remove(h.id)}><FiTrash2 /></button>
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

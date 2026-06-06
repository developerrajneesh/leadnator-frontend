import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiCopy, FiExternalLink } from "react-icons/fi";
import { api } from "../api/client";

export default function AutopilotWebhooks() {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.autopilot.list()
      .then((res) => setHooks(res.autopilots || res || []))
      .catch(() => setHooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="content-pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Autopilot Webhooks</h1>
          <div className="page-subtitle">View existing webhook triggers and copy the URL to use in Postman or on your website.</div>
        </div>
        <Link to="/autopilot/overview" className="btn btn-primary">
          Create webhook
        </Link>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Name</th>
              <th style={{ textAlign: "left", padding: 12 }}>Webhook URL</th>
              <th style={{ textAlign: "left", padding: 12 }}>Status</th>
              <th style={{ textAlign: "left", padding: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 16 }}>Loading…</td></tr>
            ) : hooks.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 16 }}>No webhooks yet. Create one on the Overview page.</td></tr>
            ) : (
              hooks.map((hook) => (
                <tr key={hook._id || hook.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: 12 }}>{hook.name || "Autopilot hook"}</td>
                  <td style={{ padding: 12, maxWidth: 440, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <a href={hook.webhookUrl} target="_blank" rel="noreferrer">{hook.webhookUrl}</a>
                  </td>
                  <td style={{ padding: 12 }}>{hook.status || "active"}</td>
                  <td style={{ padding: 12 }}>
                    <button className="btn btn-outline" type="button" onClick={() => navigator.clipboard.writeText(hook.webhookUrl)}>
                      <FiCopy /> Copy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

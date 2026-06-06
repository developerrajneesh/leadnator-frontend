import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function AutopilotOverview() {
  const [creating, setCreating] = useState(false);
  const [hook, setHook] = useState(null);

  async function createHook() {
    setCreating(true);
    try {
      const res = await api.autopilot.create({ name: "My Autopilot" });
      setHook(res);
    } catch (err) {
      alert(err.message || "Failed to create");
    } finally { setCreating(false); }
  }

  return (
    <div className="content-pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Autopilot</h1>
          <div className="page-subtitle">Create webhook-driven automations you can call from Postman or embed on your site.</div>
        </div>
        <div>
          <button className="btn btn-primary" onClick={createHook} disabled={creating}>{creating ? "Creating…" : "Create webhook"}</button>
        </div>
      </div>

      {hook ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Webhook created</h3>
          <p style={{ marginBottom: 8 }}>Copy this URL and call it from Postman or your site. Use the JSON payload to trigger steps.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input readOnly value={hook.webhookUrl} style={{ flex: 1, minWidth: 220, padding: 8, borderRadius: 8, border: "1px solid var(--border)" }} />
            <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(hook.webhookUrl)}>Copy</button>
            <Link to="/autopilot/flows" className="btn btn-primary">Build workflow</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>Create an Autopilot webhook to receive payloads and run automations (create contact, send SMS, WhatsApp, email, call external webhook, or run JS runner).</p>
        </div>
      )}
    </div>
  );
}

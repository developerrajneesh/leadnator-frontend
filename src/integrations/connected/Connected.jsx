import { useState } from "react";
import { FiCheckCircle, FiLink, FiZap } from "react-icons/fi";
import { APPS } from "../constants";
import AppCard from "../components/AppCard";

export default function Connected() {
  const [apps, setApps] = useState(APPS);
  function toggle(id) {
    setApps(apps.map((a) => a.id === id ? { ...a, connected: !a.connected } : a));
  }
  const connected = apps.filter((a) => a.connected);

  return (
    <>
      <h1 className="page-title">Connected apps</h1>
      <p className="page-subtitle">Everything currently syncing with Leadnator.</p>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple"><FiCheckCircle /></div><div className="stat-value">{connected.length}</div><div className="stat-label">Active integrations</div></div>
        <div className="stat-card"><div className="stat-icon green"><FiLink /></div><div className="stat-value">42k</div><div className="stat-label">Events synced (30d)</div></div>
        <div className="stat-card"><div className="stat-icon orange"><FiZap /></div><div className="stat-value">18</div><div className="stat-label">Automations running</div></div>
        <div className="stat-card"><div className="stat-icon pink"><FiCheckCircle /></div><div className="stat-value">99.8%</div><div className="stat-label">Sync uptime</div></div>
      </div>
      {connected.length === 0 ? (
        <div className="empty">You haven't connected any integrations yet.</div>
      ) : (
        <div className="grid-3">
          {connected.map((app) => <AppCard key={app.id} app={app} onToggle={toggle} />)}
        </div>
      )}
    </>
  );
}

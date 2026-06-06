import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiPlus,
  FiZap,
  FiCopy,
  FiTrash2,
  FiActivity,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import { notify } from "../globalComponents/Toast/Toast";
import { api } from "../api/client";

/* List of all autopilots in the workspace. Each one is a real backend record
 * with its own inbound webhook URL. From here you create new ones and open the
 * GHL-style builder at /autopilot/flows/:id. */
export default function AutopilotList() {
  const navigate = useNavigate();
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let alive = true;
    api.autopilot.list()
      .then((res) => alive && setHooks(res.autopilots || res || []))
      .catch(() => alive && setHooks([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  async function createAutopilot() {
    setCreating(true);
    try {
      const res = await api.autopilot.create({ name: "Untitled workflow" });
      navigate(`/autopilot/flows/${res.id}`);
    } catch (err) {
      notify.error(err.message || "Failed to create autopilot");
    } finally { setCreating(false); }
  }

  async function removeAutopilot(id, name) {
    if (!confirm(`Delete "${name || "this autopilot"}"? This can't be undone.`)) return;
    try {
      await api.autopilot.remove(id);
      setHooks((list) => list.filter((h) => h.id !== id));
      notify.success("Autopilot deleted");
    } catch (err) { notify.error(err.message || "Failed to delete"); }
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    notify.success("Webhook URL copied");
  }

  return (
    <div className="content-pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Autopilot workflows</h1>
          <div className="page-subtitle">Build webhook-triggered automations. Each workflow has its own inbound URL.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/autopilot/webhooks" className="btn btn-outline">All webhooks</Link>
          <button className="btn btn-primary" type="button" onClick={createAutopilot} disabled={creating}>
            <FiPlus style={{ marginRight: 6 }} /> {creating ? "Creating…" : "New autopilot"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : hooks.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f5f3ff", color: "#7c3aed", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <FiZap size={26} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No autopilots yet</div>
          <div style={{ color: "var(--text-muted)", maxWidth: 420, margin: "0 auto 18px" }}>
            Create your first workflow — pick a trigger, add actions, and get a webhook URL to call from anywhere.
          </div>
          <button className="btn btn-primary" type="button" onClick={createAutopilot} disabled={creating}>
            <FiPlus style={{ marginRight: 6 }} /> New autopilot
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {hooks.map((h) => (
            <div key={h.id} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f5f3ff", color: "#7c3aed", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <FiZap size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name || "Untitled workflow"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, padding: "2px 8px", borderRadius: 6,
                      color: h.status === "active" ? "#047857" : "#64748b",
                      background: h.status === "active" ? "#dcfce7" : "#f1f5f9",
                    }}>
                      {h.status === "active" ? "Published" : "Draft"}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FiActivity size={12} /> {h.callCount || 0} call{(h.callCount || 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Webhook URL */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px" }}>
                <FiGlobe style={{ color: "#94a3b8", flexShrink: 0 }} size={15} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontFamily: "monospace", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {h.webhookUrl}
                </span>
                <button className="icon-btn" type="button" title="Copy webhook URL" onClick={() => copyUrl(h.webhookUrl)} style={{ color: "#7c3aed", flexShrink: 0 }}>
                  <FiCopy size={15} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <Link to={`/autopilot/flows/${h.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Open builder <FiArrowRight style={{ marginLeft: 6 }} />
                </Link>
                <button className="btn btn-outline" type="button" onClick={() => removeAutopilot(h.id, h.name)} style={{ color: "#ef4444", borderColor: "#fecaca" }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

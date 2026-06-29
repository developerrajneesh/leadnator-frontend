import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiMail, FiFolder, FiRefreshCw, FiArrowRight, FiLink } from "react-icons/fi";
import { SiMeta, SiInstagram, SiWhatsapp } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { metaApi } from "../../api/meta";
import { igApi } from "../../api/instagram";
import { waApi } from "../../api/whatsapp";
import { emailApi } from "../../api/email";
import { storageApi } from "../../api/storage";
import { calApi } from "../../api/calendar";

// Each integration knows how to read its OWN connection status. We only render
// the ones that actually come back connected.
const INTEGRATIONS = [
  {
    id: "meta", name: "Meta Ads", color: "#1877f2", icon: <SiMeta />, manage: "/meta/overview",
    check: async () => { const s = await metaApi.status(); return { connected: !!s?.connected, detail: s?.fbUser?.name || "Facebook account" }; },
  },
  {
    id: "instagram", name: "Instagram", color: "#e1306c", icon: <SiInstagram />, manage: "/instagram/settings",
    check: async () => { const s = await igApi.status(); return { connected: !!s?.connected, detail: s?.connection?.username ? `@${s.connection.username}` : "Instagram Business" }; },
  },
  {
    id: "whatsapp", name: "WhatsApp Business", color: "#25d366", icon: <SiWhatsapp />, manage: "/whatsapp/settings",
    check: async () => { const s = await waApi.status(); const c = s?.connection; return { connected: !!s?.connected, detail: c?.phoneNumber || c?.displayName || c?.phoneNumberId || "WhatsApp number" }; },
  },
  {
    id: "email", name: "Email — Custom domain", color: "#ea4335", icon: <FiMail />, manage: "/email/config",
    check: async () => { const r = await emailApi.config(); const c = r?.config || r || {}; return { connected: !!c?.sesVerified, detail: c?.sesDomain || "Verified domain" }; },
  },
  {
    id: "storage", name: "Cloud Storage (S3)", color: "#f59e0b", icon: <FiFolder />, manage: "/storage/settings",
    check: async () => { const s = await storageApi.config(); return { connected: !!s?.configured, detail: s?.bucket || s?.endpointUrl || "Bucket connected" }; },
  },
  {
    id: "google", name: "Google Calendar & Meet", color: "#4285f4", icon: <FcGoogle />, manage: "/calendar/month",
    check: async () => { const s = await calApi.googleStatus(); return { connected: !!s?.connected, detail: s?.email || "Google account" }; },
  },
];

export default function Connected() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);       // [{ ...integration, connected, detail }]
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(soft = false) {
    soft ? setRefreshing(true) : setLoading(true);
    const results = await Promise.allSettled(
      INTEGRATIONS.map(async (it) => ({ ...it, ...(await it.check()) }))
    );
    setRows(results.map((r, i) =>
      r.status === "fulfilled" ? r.value : { ...INTEGRATIONS[i], connected: false, detail: "" }
    ));
    setLoading(false); setRefreshing(false);
  }
  useEffect(() => { load(); }, []);

  const connected = rows.filter((r) => r.connected);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Connected apps</h1>
          <p className="page-subtitle">Everything you've actually connected to Leadnator.</p>
        </div>
        <button className="btn btn-outline" onClick={() => load(true)} disabled={refreshing || loading}>
          <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Checking…" : "Refresh"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><FiCheckCircle /></div>
          <div className="stat-value">{loading ? "—" : connected.length}</div>
          <div className="stat-label">Active integrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><FiLink /></div>
          <div className="stat-value">{loading ? "—" : INTEGRATIONS.length - connected.length}</div>
          <div className="stat-label">Available to connect</div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <FiRefreshCw className="spin" style={{ marginRight: 8 }} /> Checking your connections…
        </div>
      ) : connected.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.5 }}><FiLink /></div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No integrations connected yet</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Connect Meta, Instagram, WhatsApp, Email, Storage or Google to see them here.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/integrations/browse")}>Browse integrations</button>
        </div>
      ) : (
        <div className="grid-3">
          {connected.map((app) => (
            <div key={app.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22, color: "#fff", background: app.color, flexShrink: 0 }}>
                  {app.icon}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{app.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.detail}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 10px" }}>
                  <FiCheckCircle size={13} /> Connected
                </span>
                <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate(app.manage)}>
                  Manage <FiArrowRight style={{ marginLeft: 4 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

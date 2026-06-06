import { useEffect, useState } from "react";
import {
  FiLink, FiCopy, FiRefreshCw, FiShield, FiAlertCircle, FiCheckCircle,
  FiExternalLink, FiKey, FiSave, FiEye, FiEyeOff,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const DEFAULT_WEBHOOK_FIELDS = [
  "messages",
  "message_template_status_update",
  "account_update",
];

export default function Webhook() {
  const [data, setData] = useState(null);       // { url, verifyToken, phoneNumberId, recommendedFields }
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [revealing, setReveal] = useState(false);
  const [customToken, setCustomToken] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.webhook(); setData(r); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); notify.success(`${label} copied`); }
    catch { notify.error("Copy failed"); }
  }

  async function rotate() {
    if (!confirm("Generate a new verify token? You'll need to update it in Meta's dashboard.")) return;
    try {
      const r = await waApi.rotateVerifyToken();
      setData((d) => ({ ...d, verifyToken: r.verifyToken }));
      notify.success("New verify token generated");
    } catch (err) { notify.error(err.message); }
  }

  async function saveCustom() {
    if (customToken.trim().length < 8) { notify.warn("Token must be at least 8 characters."); return; }
    try {
      await waApi.setVerifyToken(customToken.trim());
      setData((d) => ({ ...d, verifyToken: customToken.trim() }));
      setCustomToken("");
      notify.success("Verify token updated");
    } catch (err) { notify.error(err.message); }
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiLink style={{ color: "#25d366" }} /> WhatsApp Webhook
        </h1>
        <p className="page-subtitle">Paste this URL + verify token into Meta's Webhook configuration.</p>
        {[1, 2].map((i) => (
          <div key={i} className="card" style={{ marginBottom: 14 }}>
            <span className="skel skel-line" style={{ width: 160, height: 16, display: "block", marginBottom: 14 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8, display: "block", marginBottom: 14 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8, display: "block" }} />
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiLink style={{ color: "#25d366" }} /> WhatsApp Webhook
        </h1>
        <div className="card" style={{ padding: 20, background: "#fef2f2", color: "#b91c1c" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <FiAlertCircle /> <strong>{error}</strong>
          </div>
          <div style={{ fontSize: 13, color: "#7f1d1d" }}>
            Connect your WhatsApp Cloud account first in <a href="/whatsapp/settings">Settings</a>, then return here to get your webhook URL.
          </div>
        </div>
      </>
    );
  }

  const fields = data.metaAppWebhookFields || data.recommendedFields || DEFAULT_WEBHOOK_FIELDS;
  const maskedToken = String(data.verifyToken || "").replace(/.(?=.{4})/g, "•");

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiLink style={{ color: "#25d366" }} /> WhatsApp Webhook
      </h1>
      <p className="page-subtitle">
        Paste these two values into <strong>Meta Business Manager → WhatsApp → Configuration → Webhook</strong> so Meta forwards incoming messages and delivery receipts to your CRM.
      </p>

      {/* Step 1 — Callback URL */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiLink /> Step 1 — Callback URL</div>
          <span className="badge" style={{ background: "#dcfce7", color: "#166534" }}>Copy into Meta</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          This is your unique webhook endpoint. Meta will send a GET handshake here first, then POST every incoming message / status update.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={monoBox}>{data.url}</code>
          <button className="btn btn-primary" onClick={() => copy(data.url, "Webhook URL")}><FiCopy /> Copy URL</button>
        </div>
        {data.url.startsWith("http://localhost") && (
          <div style={{ marginTop: 10, padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, display: "flex", gap: 8 }}>
            <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              Meta cannot reach <code>localhost</code>. Expose your backend with <strong>ngrok</strong> / <strong>Cloudflare Tunnel</strong> during development, then set <code>PUBLIC_WEBHOOK_BASE</code> in <code>backend/.env</code> to that public URL.
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Verify Token */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiShield /> Step 2 — Verify Token</div>
          <span className="badge" style={{ background: "#dcfce7", color: "#166534" }}>Copy into Meta</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          Meta sends this token in the verification handshake. If it matches, we respond with the challenge and the webhook goes live.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ ...monoBox, fontFamily: "monospace", letterSpacing: revealing ? 0 : 2 }}>
            {revealing ? data.verifyToken : maskedToken}
          </code>
          <button className="btn btn-outline" onClick={() => setReveal((r) => !r)}>
            {revealing ? <><FiEyeOff /> Hide</> : <><FiEye /> Reveal</>}
          </button>
          <button className="btn btn-primary" onClick={() => copy(data.verifyToken, "Verify token")}><FiCopy /> Copy token</button>
          <button className="btn btn-outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={rotate}>
            <FiRefreshCw /> Rotate
          </button>
        </div>

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}>
            <FiKey style={{ verticalAlign: "middle" }} /> Or set a custom verify token
          </summary>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              placeholder="Min 8 characters, no spaces"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={saveCustom} disabled={!customToken.trim()}>
              <FiSave /> Save
            </button>
          </div>
        </details>
      </div>

      {/* Step 3 — Subscribe to fields */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><FiCheckCircle /> Step 3 — Subscribe to fields</div></div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          After Meta verifies the callback, click <strong>Manage</strong> in the webhook config and enable these fields so messages and statuses reach your CRM:
        </div>
        <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
          {fields.map((f) => (
            <li key={f}><code>{f}</code></li>
          ))}
        </ul>
        {data.setupNote && (
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>{data.setupNote}</p>
        )}
        <a
          href="https://business.facebook.com/wa/manage/phone-numbers/"
          target="_blank" rel="noreferrer"
          className="btn btn-outline"
          style={{ marginTop: 8 }}
        ><FiExternalLink /> Open Meta Business Manager</a>
      </div>

      {/* Info */}
      <div className="card" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
        <div className="card-title" style={{ color: "#075985" }}><FiAlertCircle /> What happens once this is live</div>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: "#0c4a6e", lineHeight: 1.7, marginTop: 6 }}>
          <li>Every inbound message is saved and shown in your <a href="/whatsapp/inbox">Inbox</a>.</li>
          <li>If you have an <strong>active</strong> chatbot in <a href="/whatsapp/chatbot">Chatbot</a>, it replies automatically with matching CTAs.</li>
          <li>Delivery/read ticks on the messages you send update in real time.</li>
          <li>Contacts are upserted on first message — no manual import needed.</li>
        </ul>
      </div>
    </>
  );
}

const monoBox = {
  flex: 1,
  minWidth: 200,
  padding: "10px 14px",
  background: "#f3f4f6",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
  overflow: "auto",
  whiteSpace: "nowrap",
};

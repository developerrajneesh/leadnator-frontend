import { FaInstagram } from "react-icons/fa";
import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { getInstagramOAuthUrl } from "../constants";

/**
 * Shared connect card — Instagram OAuth button + feature list.
 * Used on gated pages (InstagramGate) and Settings when not connected.
 */
export default function ConnectInstagram({ compact = false }) {
  function connect() {
    // Built at click time so the redirect_uri matches the current origin.
    window.location.href = getInstagramOAuthUrl();
  }

  return (
    <div style={{ maxWidth: compact ? "100%" : 560, margin: compact ? 0 : "40px auto", textAlign: "center" }}>
      <div className="card" style={{ padding: compact ? 28 : 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 30, marginBottom: 14,
          boxShadow: "0 10px 26px rgba(225, 48, 108, 0.35)",
        }}>
          <FaInstagram />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Connect Instagram</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          Manage DMs, comment replies, and automations for your Instagram Business account.
          Authorize Leadnator with one click — you&apos;ll return here after Instagram approves access.
        </p>

        <button
          type="button"
          onClick={connect}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", maxWidth: 320,
            background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            color: "white", border: "none", borderRadius: 10,
            padding: "14px 24px", fontWeight: 700, fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(225, 48, 108, 0.35)",
          }}
        >
          <FaInstagram size={20} />
          Connect with Instagram
          <FiExternalLink size={16} style={{ opacity: 0.9 }} />
        </button>

        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 14, lineHeight: 1.5 }}>
          Uses Instagram Business permissions: messages, comments, content &amp; insights.
        </p>

        <ul style={{ marginTop: 22, textAlign: "left", fontSize: 13, color: "var(--text-muted)", listStyle: "none", padding: 0 }}>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />DM inbox &amp; quick replies</li>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Comment automation</li>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Keyword &amp; welcome flows</li>
        </ul>
      </div>
    </div>
  );
}

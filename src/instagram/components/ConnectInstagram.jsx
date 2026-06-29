import { FaInstagram } from "react-icons/fa";
import { FiCheckCircle, FiExternalLink, FiMail, FiMessageCircle, FiZap, FiBarChart2, FiImage, FiShield, FiCheck, FiMonitor } from "react-icons/fi";
import { getInstagramOAuthUrl } from "../constants";

const IG_GRADIENT = "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";

const FEATURES = [
  { icon: <FiMail />,        label: "DM inbox" },
  { icon: <FiMessageCircle />, label: "Comment replies" },
  { icon: <FiZap />,         label: "Automations" },
  { icon: <FiImage />,       label: "Content" },
  { icon: <FiBarChart2 />,   label: "Insights" },
  { icon: <FiCheckCircle />, label: "Welcome flows" },
];

/**
 * Shared connect card — Instagram OAuth button + feature list.
 * - compact: simple inline card (used in Settings when not connected).
 * - full (default): modern split-hero gate, mirrors WhatsAppGate.
 */
export default function ConnectInstagram({ compact = false }) {
  function connect() {
    // Built at click time so the redirect_uri matches the current origin.
    window.location.href = getInstagramOAuthUrl();
  }

  if (compact) {
    return (
      <div style={{ textAlign: "center" }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: IG_GRADIENT,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 30, marginBottom: 14,
            boxShadow: "0 10px 26px rgba(225, 48, 108, 0.35)",
          }}>
            <FaInstagram />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Connect Instagram</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Manage DMs, comment replies, and automations for your Instagram Business account.
          </p>
          <button type="button" onClick={connect} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", maxWidth: 320, background: IG_GRADIENT,
            color: "white", border: "none", borderRadius: 10,
            padding: "14px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(225, 48, 108, 0.35)",
          }}>
            <FaInstagram size={20} /> Connect with Instagram <FiExternalLink size={16} style={{ opacity: 0.9 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ig-gate">
      <div className="ig-gate-card">
        {/* Left — value proposition */}
        <div className="ig-gate-hero">
          <div className="ig-gate-badge">
            <FaInstagram /> Instagram Business
          </div>

          <h1 className="ig-gate-title">
            Run your DMs &amp;<br />
            <span>comments on autopilot</span>
          </h1>

          <p className="ig-gate-sub">
            Authorize Leadnator with one click to unlock the full module — you'll return
            here as soon as Instagram approves access.
          </p>

          <div className="ig-gate-features">
            {FEATURES.map((f) => (
              <div key={f.label} className="ig-gate-feature">
                <span className="ig-gate-feature-ic">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div className="ig-gate-trust">
            <span><FiShield /> Official Instagram Business login</span>
            <span><FiCheck /> Messages · comments · insights</span>
          </div>
        </div>

        {/* Right — connect panel */}
        <div className="ig-gate-panel">
          <div className="ig-gate-logo">
            <FaInstagram />
          </div>
          <h2 className="ig-gate-panel-title">Connect Instagram</h2>
          <p className="ig-gate-panel-sub">
            One-click OAuth — no passwords. We only request the permissions needed to
            manage DMs, comments, content &amp; insights.
          </p>

          <button type="button" className="ig-gate-btn" onClick={connect}>
            <FaInstagram size={20} /> Connect with Instagram <FiExternalLink size={15} style={{ opacity: 0.9 }} />
          </button>

          <div className="ig-gate-note">
            <FiMonitor className="ig-gate-note-ic" />
            <span>Requires an <strong>Instagram Business or Creator</strong> account linked to a Facebook Page.</span>
          </div>
        </div>
      </div>

      <style>{`
        .ig-gate {
          min-height: calc(100vh - 140px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
        }
        .ig-gate-card {
          width: 100%; max-width: 980px;
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border);
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.25);
        }
        /* hero */
        .ig-gate-hero {
          position: relative; padding: 44px 40px; color: #fff;
          background:
            radial-gradient(1200px 400px at -10% -20%, rgba(255,255,255,.18), transparent 60%),
            radial-gradient(800px 500px at 120% 120%, rgba(0,0,0,.22), transparent 55%),
            ${IG_GRADIENT};
          overflow: hidden;
        }
        .ig-gate-hero::after {
          content: ""; position: absolute; right: -60px; bottom: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(255, 220, 160, .28); filter: blur(12px);
        }
        .ig-gate-badge {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.3); border-radius: 999px;
          font-size: 12px; font-weight: 600; backdrop-filter: blur(6px);
          margin-bottom: 22px;
        }
        .ig-gate-title {
          position: relative; margin: 0 0 14px;
          font-size: 34px; line-height: 1.12; font-weight: 800;
          letter-spacing: -0.5px; color: #fff;
        }
        .ig-gate-title span {
          background: linear-gradient(90deg, #fff6e0, #ffd9ef);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ig-gate-sub {
          position: relative; margin: 0 0 26px;
          font-size: 14px; line-height: 1.6;
          color: rgba(255,255,255,.9); max-width: 380px;
        }
        .ig-gate-features {
          position: relative; display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 28px;
        }
        .ig-gate-feature {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.2); border-radius: 12px;
          font-size: 13px; font-weight: 500;
        }
        .ig-gate-feature-ic {
          display: inline-flex; width: 26px; height: 26px;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,.22); border-radius: 8px; font-size: 14px;
        }
        .ig-gate-trust {
          position: relative; display: flex; flex-wrap: wrap; gap: 16px;
          font-size: 12px; color: rgba(255,255,255,.85);
        }
        .ig-gate-trust span { display: inline-flex; align-items: center; gap: 6px; }
        /* panel */
        .ig-gate-panel {
          padding: 44px 36px; display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .ig-gate-logo {
          width: 68px; height: 68px; border-radius: 20px;
          display: inline-flex; align-items: center; justify-content: center;
          background: ${IG_GRADIENT}; color: #fff; font-size: 32px;
          box-shadow: 0 14px 30px rgba(225, 48, 108, 0.35); margin-bottom: 18px;
        }
        .ig-gate-panel-title { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: var(--text); }
        .ig-gate-panel-sub {
          margin: 0 0 22px; font-size: 13px; line-height: 1.6;
          color: var(--text-muted); max-width: 320px;
        }
        .ig-gate-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; max-width: 320px; background: ${IG_GRADIENT};
          color: #fff; border: none; border-radius: 12px;
          padding: 14px 24px; font-weight: 700; font-size: 15.5px; cursor: pointer;
          box-shadow: 0 10px 26px rgba(225, 48, 108, 0.35);
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .ig-gate-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(225, 48, 108, 0.42); }
        .ig-gate-note {
          margin-top: 18px; display: flex; align-items: flex-start; gap: 7px;
          font-size: 11.5px; color: var(--text-muted); line-height: 1.5;
          text-align: left; max-width: 340px;
        }
        .ig-gate-note-ic { flex: 0 0 auto; margin-top: 1px; font-size: 14px; }
        @media (max-width: 860px) {
          .ig-gate-card { grid-template-columns: 1fr; max-width: 460px; }
          .ig-gate-hero { padding: 34px 28px; }
          .ig-gate-title { font-size: 28px; }
          .ig-gate-panel { padding: 34px 26px; }
        }
        @media (max-width: 420px) {
          .ig-gate-features { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

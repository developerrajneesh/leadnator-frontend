import { FaWhatsapp } from "react-icons/fa";
import { FiInbox, FiSend, FiCpu, FiFileText, FiZap, FiBarChart2, FiShield, FiCheck, FiMonitor } from "react-icons/fi";
import EmbeddedSignup from "../settings/EmbeddedSignup";
import { useWhatsAppStatus } from "../useWhatsAppStatus";

const FEATURES = [
  { icon: <FiInbox />,     label: "Shared inbox" },
  { icon: <FiSend />,      label: "Broadcasts" },
  { icon: <FiCpu />,       label: "AI chatbot" },
  { icon: <FiFileText />,  label: "Templates" },
  { icon: <FiZap />,       label: "Automations" },
  { icon: <FiBarChart2 />, label: "Analytics" },
];

// Gate around every WhatsApp child route. When the user hasn't connected a
// WhatsApp Cloud API number yet, we render a single "Connect WhatsApp" screen
// with the Meta Embedded Signup button — NOT the feature page. Manual API-key
// input was intentionally removed to avoid credential-leak bugs and to push
// users down the Meta-managed signup path.
export default function WhatsAppGate({ children }) {
  const { status, loading, refresh } = useWhatsAppStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span className="wa-gate-spinner" />
        Checking your WhatsApp connection…
      </div>
    );
  }

  if (status?.connected) return children;

  return (
    <div className="wa-gate">
      <div className="wa-gate-card">
        {/* Left — value proposition */}
        <div className="wa-gate-hero">
          <div className="wa-gate-badge">
            <FaWhatsapp /> WhatsApp Business Platform
          </div>

          <h1 className="wa-gate-title">
            Turn WhatsApp into your<br />
            <span>growth engine</span>
          </h1>

          <p className="wa-gate-sub">
            Link a WhatsApp Business number to unlock the full module — one secure
            connection, no credentials to type.
          </p>

          <div className="wa-gate-features">
            {FEATURES.map((f) => (
              <div key={f.label} className="wa-gate-feature">
                <span className="wa-gate-feature-ic">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div className="wa-gate-trust">
            <span><FiShield /> Meta-verified Embedded Signup</span>
            <span><FiCheck /> Permanent access token</span>
          </div>
        </div>

        {/* Right — connect panel */}
        <div className="wa-gate-panel">
          <div className="wa-gate-logo">
            <FaWhatsapp />
          </div>
          <h2 className="wa-gate-panel-title">Connect WhatsApp</h2>
          <p className="wa-gate-panel-sub">
            Meta's secure popup creates the account, verifies your number, and issues a
            permanent token in one step.
          </p>

          <EmbeddedSignup onConnected={refresh} />

          <div className="wa-gate-note">
            <FiMonitor className="wa-gate-note-ic" />
            <span>Use a <strong>desktop browser</strong> — Meta's signup popup isn't supported on phones.</span>
          </div>
        </div>
      </div>

      <style>{`
        .wa-gate {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }
        .wa-gate-card {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.25);
        }
        /* hero */
        .wa-gate-hero {
          position: relative;
          padding: 44px 40px;
          color: #ecfdf5;
          background:
            radial-gradient(1200px 400px at -10% -20%, rgba(255,255,255,.14), transparent 60%),
            radial-gradient(800px 500px at 120% 120%, rgba(0,0,0,.25), transparent 55%),
            linear-gradient(150deg, #0f8a5f 0%, #128c7e 45%, #075e54 100%);
          overflow: hidden;
        }
        .wa-gate-hero::after {
          content: "";
          position: absolute;
          right: -60px; bottom: -60px;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: rgba(37, 211, 102, .25);
          filter: blur(10px);
        }
        .wa-gate-badge {
          position: relative;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 999px;
          font-size: 12px; font-weight: 600;
          backdrop-filter: blur(6px);
          margin-bottom: 22px;
        }
        .wa-gate-title {
          position: relative;
          margin: 0 0 14px;
          font-size: 34px; line-height: 1.12; font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
        }
        .wa-gate-title span {
          background: linear-gradient(90deg, #d9f99d, #6ee7b7);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .wa-gate-sub {
          position: relative;
          margin: 0 0 26px;
          font-size: 14px; line-height: 1.6;
          color: rgba(236, 253, 245, .85);
          max-width: 380px;
        }
        .wa-gate-features {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 28px;
        }
        .wa-gate-feature {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 12px;
          font-size: 13px; font-weight: 500;
        }
        .wa-gate-feature-ic {
          display: inline-flex;
          width: 26px; height: 26px;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,.18);
          border-radius: 8px;
          font-size: 14px;
        }
        .wa-gate-trust {
          position: relative;
          display: flex; flex-wrap: wrap; gap: 16px;
          font-size: 12px;
          color: rgba(236, 253, 245, .8);
        }
        .wa-gate-trust span { display: inline-flex; align-items: center; gap: 6px; }
        /* panel */
        .wa-gate-panel {
          padding: 44px 36px;
          display: flex; flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .wa-gate-logo {
          width: 68px; height: 68px; border-radius: 20px;
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          color: #fff; font-size: 32px;
          box-shadow: 0 14px 30px rgba(37, 211, 102, 0.35);
          margin-bottom: 18px;
        }
        .wa-gate-panel-title { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: var(--text); }
        .wa-gate-panel-sub {
          margin: 0 0 6px;
          font-size: 13px; line-height: 1.6;
          color: var(--text-muted);
          max-width: 320px;
        }
        .wa-gate-note {
          margin-top: 18px;
          display: flex; align-items: flex-start; gap: 7px;
          font-size: 11.5px; color: var(--text-muted);
          line-height: 1.5;
          text-align: left;
          max-width: 340px;
        }
        .wa-gate-note-ic { flex: 0 0 auto; margin-top: 1px; font-size: 14px; }
        .wa-gate-spinner {
          width: 26px; height: 26px; border-radius: 50%;
          border: 3px solid var(--border);
          border-top-color: #25d366;
          animation: wa-gate-spin .7s linear infinite;
        }
        @keyframes wa-gate-spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .wa-gate-card { grid-template-columns: 1fr; max-width: 460px; }
          .wa-gate-hero { padding: 34px 28px; }
          .wa-gate-title { font-size: 28px; }
          .wa-gate-features { grid-template-columns: 1fr 1fr; }
          .wa-gate-panel { padding: 34px 26px; }
        }
        @media (max-width: 420px) {
          .wa-gate-features { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

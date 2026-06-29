import { useEffect, useState } from "react";
import { SiMeta } from "react-icons/si";
import { FiTarget, FiPieChart, FiFileText, FiLink, FiCreditCard, FiUsers, FiShield, FiCheck, FiMonitor } from "react-icons/fi";
import { loginWithFacebook, loadFbSdk, metaApi } from "../../api/meta";
import { refreshMetaStatus } from "../useMetaStatus";

const FB_GRADIENT = "linear-gradient(150deg, #1877f2 0%, #2563eb 45%, #0a3d91 100%)";

const FEATURES = [
  { icon: <FiTarget />,     label: "Campaigns" },
  { icon: <FiPieChart />,   label: "Ad insights" },
  { icon: <FiFileText />,   label: "Lead forms" },
  { icon: <FiLink />,       label: "Lead webhook" },
  { icon: <FiCreditCard />, label: "Ad accounts" },
  { icon: <FiUsers />,      label: "Audiences" },
];

/**
 * Modern split-hero connect screen for Meta Ads — mirrors the Instagram /
 * WhatsApp gates. The Facebook OAuth flow (SDK + login + connect) lives here.
 */
export default function ConnectMeta() {
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadFbSdk().then(() => setSdkReady(true)).catch((e) => setError(e.message)); }, []);

  async function connect() {
    setConnecting(true); setError("");
    try {
      const auth = await loginWithFacebook();
      await metaApi.connect(auth.accessToken);
      await refreshMetaStatus();
    } catch (err) {
      setError(err.message || "Connection failed.");
    } finally { setConnecting(false); }
  }

  return (
    <div className="meta-gate">
      <div className="meta-gate-card">
        {/* Left — value proposition */}
        <div className="meta-gate-hero">
          <div className="meta-gate-badge">
            <SiMeta /> Meta Ads Platform
          </div>

          <h1 className="meta-gate-title">
            Launch &amp; scale ads<br />
            <span>without leaving Leadnator</span>
          </h1>

          <p className="meta-gate-sub">
            Link your Facebook account to unlock the full Meta Ads module — one secure
            login, no manual credentials.
          </p>

          <div className="meta-gate-features">
            {FEATURES.map((f) => (
              <div key={f.label} className="meta-gate-feature">
                <span className="meta-gate-feature-ic">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div className="meta-gate-trust">
            <span><FiShield /> Official Facebook Login</span>
            <span><FiCheck /> Campaigns · leads · insights</span>
          </div>
        </div>

        {/* Right — connect panel */}
        <div className="meta-gate-panel">
          <div className="meta-gate-logo">
            <SiMeta />
          </div>
          <h2 className="meta-gate-panel-title">Connect Meta Ads</h2>
          <p className="meta-gate-panel-sub">
            Log in with Facebook and pick the ad account you want to advertise from —
            campaigns, lead forms &amp; analytics unlock instantly.
          </p>

          {error && <div className="meta-gate-error">{error}</div>}

          <button
            type="button"
            className="meta-gate-btn"
            disabled={!sdkReady || connecting}
            onClick={connect}
          >
            <span className="meta-gate-f">f</span>
            {connecting ? "Connecting…" : sdkReady ? "Login with Facebook" : "Loading Facebook SDK…"}
          </button>

          <div className="meta-gate-note">
            <FiMonitor className="meta-gate-note-ic" />
            <span>Use a <strong>desktop browser</strong> — you'll choose an ad account after login.</span>
          </div>
        </div>
      </div>

      <style>{`
        .meta-gate {
          min-height: calc(100vh - 140px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
        }
        .meta-gate-card {
          width: 100%; max-width: 980px;
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border);
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.25);
        }
        /* hero */
        .meta-gate-hero {
          position: relative; padding: 44px 40px; color: #eaf2ff;
          background:
            radial-gradient(1200px 400px at -10% -20%, rgba(255,255,255,.16), transparent 60%),
            radial-gradient(800px 500px at 120% 120%, rgba(0,0,0,.28), transparent 55%),
            ${FB_GRADIENT};
          overflow: hidden;
        }
        .meta-gate-hero::after {
          content: ""; position: absolute; right: -60px; bottom: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(120, 170, 255, .3); filter: blur(12px);
        }
        .meta-gate-badge {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.28); border-radius: 999px;
          font-size: 12px; font-weight: 600; backdrop-filter: blur(6px);
          margin-bottom: 22px;
        }
        .meta-gate-title {
          position: relative; margin: 0 0 14px;
          font-size: 34px; line-height: 1.12; font-weight: 800;
          letter-spacing: -0.5px; color: #fff;
        }
        .meta-gate-title span {
          background: linear-gradient(90deg, #cfe0ff, #a5f3fc);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .meta-gate-sub {
          position: relative; margin: 0 0 26px;
          font-size: 14px; line-height: 1.6;
          color: rgba(234, 242, 255, .88); max-width: 380px;
        }
        .meta-gate-features {
          position: relative; display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 28px;
        }
        .meta-gate-feature {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18); border-radius: 12px;
          font-size: 13px; font-weight: 500;
        }
        .meta-gate-feature-ic {
          display: inline-flex; width: 26px; height: 26px;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,.2); border-radius: 8px; font-size: 14px;
        }
        .meta-gate-trust {
          position: relative; display: flex; flex-wrap: wrap; gap: 16px;
          font-size: 12px; color: rgba(234, 242, 255, .85);
        }
        .meta-gate-trust span { display: inline-flex; align-items: center; gap: 6px; }
        /* panel */
        .meta-gate-panel {
          padding: 44px 36px; display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .meta-gate-logo {
          width: 68px; height: 68px; border-radius: 20px;
          display: inline-flex; align-items: center; justify-content: center;
          background: ${FB_GRADIENT}; color: #fff; font-size: 32px;
          box-shadow: 0 14px 30px rgba(24, 119, 242, 0.35); margin-bottom: 18px;
        }
        .meta-gate-panel-title { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: var(--text); }
        .meta-gate-panel-sub {
          margin: 0 0 18px; font-size: 13px; line-height: 1.6;
          color: var(--text-muted); max-width: 320px;
        }
        .meta-gate-error {
          width: 100%; max-width: 320px;
          padding: 10px; background: #fee2e2; color: #b91c1c;
          border-radius: 8px; font-size: 13px; margin-bottom: 14px;
        }
        .meta-gate-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; max-width: 320px; background: #1877f2;
          color: #fff; border: none; border-radius: 12px;
          padding: 14px 24px; font-weight: 700; font-size: 15.5px; cursor: pointer;
          box-shadow: 0 10px 26px rgba(24, 119, 242, 0.35);
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
        }
        .meta-gate-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(24, 119, 242, 0.42); }
        .meta-gate-btn:disabled { background: #9ca3af; cursor: not-allowed; box-shadow: none; }
        .meta-gate-f { font-size: 18px; font-weight: 800; line-height: 1; }
        .meta-gate-note {
          margin-top: 18px; display: flex; align-items: flex-start; gap: 7px;
          font-size: 11.5px; color: var(--text-muted); line-height: 1.5;
          text-align: left; max-width: 340px;
        }
        .meta-gate-note-ic { flex: 0 0 auto; margin-top: 1px; font-size: 14px; }
        @media (max-width: 860px) {
          .meta-gate-card { grid-template-columns: 1fr; max-width: 460px; }
          .meta-gate-hero { padding: 34px 28px; }
          .meta-gate-title { font-size: 28px; }
          .meta-gate-panel { padding: 34px 26px; }
        }
        @media (max-width: 420px) {
          .meta-gate-features { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

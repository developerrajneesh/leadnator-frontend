import { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { loginWithFacebook, loadFbSdk, metaApi } from "../../api/meta";
import { useMetaStatus, refreshMetaStatus } from "../useMetaStatus";

// Gate around every Meta Ads child route. If the user hasn't connected a
// Facebook account yet, we render a single "Login with Facebook" screen.
// Manual input is intentionally absent — only the FB OAuth flow is offered.
export default function MetaGate({ children }) {
  const { status, loading } = useMetaStatus();
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

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your Meta connection…
      </div>
    );
  }

  if (status?.connected) return children;

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <div className="card" style={{ padding: 40 }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "#1877f2",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 36, fontWeight: 800, marginBottom: 18,
          boxShadow: "0 12px 30px rgba(24, 119, 242, 0.3)",
        }}>f</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Connect Meta Ads first</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
          The Meta Ads module (campaigns, ad sets, creatives, analytics, lead forms, lead webhook) is
          unlocked once you link your Facebook account. Login below — no manual credentials needed.
        </p>

        {error && (
          <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!sdkReady || connecting}
          onClick={connect}
          style={{
            background: sdkReady ? "#1877f2" : "#9ca3af",
            color: "white", border: "none", borderRadius: 8,
            padding: "12px 22px", fontWeight: 600, fontSize: 15,
            cursor: sdkReady ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800 }}>f</span>
          {connecting ? "Connecting…" : sdkReady ? "Login with Facebook" : "Loading Facebook SDK…"}
        </button>

        <ul style={{ marginTop: 22, textAlign: "left", fontSize: 13, color: "var(--text-muted)", listStyle: "none", padding: 0 }}>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Create & manage campaigns</li>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Real-time ad insights</li>
          <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Pull leads from Meta Lead Forms</li>
        </ul>
      </div>
    </div>
  );
}

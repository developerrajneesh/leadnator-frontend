import { FaWhatsapp } from "react-icons/fa";
import EmbeddedSignup from "../settings/EmbeddedSignup";
import { useWhatsAppStatus } from "../useWhatsAppStatus";

// Gate around every WhatsApp child route. When the user hasn't connected a
// WhatsApp Cloud API number yet, we render a single "Connect WhatsApp" screen
// with the Meta Embedded Signup button — NOT the feature page. Manual API-key
// input was intentionally removed to avoid credential-leak bugs and to push
// users down the Meta-managed signup path.
export default function WhatsAppGate({ children }) {
  const { status, loading, refresh } = useWhatsAppStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your WhatsApp connection…
      </div>
    );
  }

  if (status?.connected) return children;

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <div className="card" style={{ padding: 40 }}>
        <img
          src="/Chatting-bro-flat.png"
          alt=""
          style={{ width: 180, height: "auto", marginBottom: 8, filter: "drop-shadow(0 8px 18px rgba(15, 23, 42, .08))" }}
        />
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 30, marginBottom: 14,
          boxShadow: "0 10px 26px rgba(37, 211, 102, 0.3)",
        }}>
          <FaWhatsapp />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Connect WhatsApp first</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
          The WhatsApp module (inbox, broadcasts, chatbot, templates, automations, forms, analytics)
          is unlocked once you link a WhatsApp Business phone number.
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 18 }}>
          Meta's secure Embedded Signup creates the account, verifies your number, and issues a
          permanent access token in one popup — no credentials to type.
        </p>

        <EmbeddedSignup onConnected={refresh} />

        <div style={{ marginTop: 18, fontSize: 11, color: "var(--text-muted)" }}>
          Run this on a <strong>desktop browser</strong>. Meta's signup popup isn't supported on phones.
        </div>
      </div>
    </div>
  );
}

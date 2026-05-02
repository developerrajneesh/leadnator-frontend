import { FiZap, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Automation() {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="page-title">Email — Automation</h1>
      <p className="page-subtitle">Drip flows triggered by lead actions.</p>

      <div className="card" style={{ maxWidth: 720, padding: 30, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ede9fe", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>
          <FiZap />
        </div>
        <h3 style={{ marginBottom: 6 }}>Use the WhatsApp flow builder</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
          Email automation drips are part of the unified flow builder over in WhatsApp Automation.
          Add an "Action: Send template" node and pick an email template to fire emails from any flow.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => navigate("/whatsapp/automation")}><FiZap /> Open flow builder</button>
          <button className="btn btn-outline" onClick={() => navigate("/email/templates")}>Manage templates</button>
        </div>

        <div style={{ marginTop: 24, padding: 14, background: "#f9fafb", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", textAlign: "left", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text)", display: "block", marginBottom: 6 }}><FiInfo /> Quick recipes:</strong>
          • <strong>Welcome series:</strong> Trigger "New lead" → Wait 5 min → Send template "Welcome" → Wait 2 days → Send template "Tips"<br />
          • <strong>Re-engagement:</strong> Trigger "No reply for 7 days" → Send template "Win-back offer"<br />
          • <strong>Lead-form follow-up:</strong> Trigger "New lead" → Wait 1 hour → Send template "Demo invite"
        </div>
      </div>
    </>
  );
}

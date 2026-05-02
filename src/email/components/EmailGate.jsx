import { FiMail, FiAlertCircle } from "react-icons/fi";
import { useEmailStatus } from "../useEmailStatus";
import Config from "../config/Config";

// Gate around every Email child route. Until the user has saved AND verified
// SMTP creds, all feature pages (campaigns, templates, analytics, etc.)
// render the SMTP config form directly — there's nothing they can do with
// the other pages until the server can actually send mail on their behalf.
export default function EmailGate({ children }) {
  const { status, loading } = useEmailStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your email configuration…
      </div>
    );
  }

  if (status?.configured) return children;

  return (
    <>
      <div style={{
        padding: 14, marginBottom: 16, background: "#eff6ff", color: "#1e3a8a",
        border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 13, lineHeight: 1.6,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <FiAlertCircle style={{ marginTop: 2, flexShrink: 0, fontSize: 16 }} />
        <div>
          <strong><FiMail style={{ verticalAlign: "middle", marginRight: 4 }} /> Connect your SMTP to unlock Email Marketing.</strong>
          <div style={{ marginTop: 4, color: "#1e3a8a", opacity: 0.9 }}>
            Campaigns, templates, automation, subscribers, signatures, and analytics unlock once we
            can send mail on your behalf. Save your SMTP host / port / username / app password below,
            then click <strong>Verify connection</strong>.
          </div>
        </div>
      </div>
      <Config />
    </>
  );
}

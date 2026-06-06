import { FiAlertCircle, FiDatabase } from "react-icons/fi";
import Settings from "../settings/Settings";
import { useStorageStatus } from "../useStorageStatus";

// Gate around every Storage feature route. Until the user has saved + verified
// S3-compatible credentials, render the Settings form so they can connect
// their own bucket. Mirrors the pattern used for WhatsApp / Meta / Email.
export default function StorageGate({ children }) {
  const { status, loading } = useStorageStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your storage configuration…
      </div>
    );
  }

  if (status?.configured) return children;

  return (
    <>
      <div style={{
        padding: 14, marginBottom: 16, background: "#fef3c7", color: "#92400e",
        border: "1px solid #fde68a", borderRadius: 10, fontSize: 13, lineHeight: 1.6,
        display: "flex", gap: 14, alignItems: "center",
      }}>
        <img
          src="/Coworking-amico-flat.png"
          alt=""
          style={{ width: 110, height: "auto", flexShrink: 0 }}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <FiAlertCircle style={{ marginTop: 2, flexShrink: 0, fontSize: 16 }} />
          <div>
            <strong><FiDatabase style={{ verticalAlign: "middle", marginRight: 4 }} /> Connect your S3 bucket to unlock Storage.</strong>
            <div style={{ marginTop: 4, opacity: 0.9 }}>
              Uploads, folders, sharing, trash — everything sits on your own bucket (Supabase / AWS / Cloudflare R2 / Wasabi).
              Paste the 5 fields below, then Save + Verify.
            </div>
          </div>
        </div>
      </div>
      <Settings embedded />
    </>
  );
}

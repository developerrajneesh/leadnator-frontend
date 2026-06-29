import { Navigate } from "react-router-dom";
import ConnectEmail from "./ConnectEmail";
import { useEmailStatus } from "../useEmailStatus";

// Dedicated /email/connect route. Shows the domain-verify connect screen until
// a sending domain is verified; once configured, bounces back to the overview.
export default function EmailConnectPage() {
  const { status, loading } = useEmailStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your email configuration…
      </div>
    );
  }

  if (status?.configured) return <Navigate to="/email/overview" replace />;

  return <ConnectEmail />;
}

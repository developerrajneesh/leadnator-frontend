import { Navigate } from "react-router-dom";
import ConnectMeta from "./ConnectMeta";
import { useMetaStatus } from "../useMetaStatus";

// Dedicated /meta/connect route. Shows the full connect screen when no Facebook
// account is linked; once connected, bounces back to the overview.
export default function MetaConnectPage() {
  const { status, loading } = useMetaStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your Meta connection…
      </div>
    );
  }

  if (status?.connected) return <Navigate to="/meta/overview" replace />;

  return <ConnectMeta />;
}

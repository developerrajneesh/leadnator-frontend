import { Navigate } from "react-router-dom";
import ConnectInstagram from "./ConnectInstagram";
import { useInstagramStatus } from "../useInstagramStatus";

// Dedicated /instagram/connect route. Shows the full connect screen when the
// account isn't linked; once connected, bounces back to the overview.
export default function InstagramConnectPage() {
  const { status, loading } = useInstagramStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your Instagram connection…
      </div>
    );
  }

  if (status?.connected) return <Navigate to="/instagram/overview" replace />;

  return <ConnectInstagram />;
}

import { Navigate } from "react-router-dom";
import { useInstagramStatus } from "../useInstagramStatus";

export default function InstagramGate({ children }) {
  const { status, loading } = useInstagramStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your Instagram connection…
      </div>
    );
  }

  // Not linked yet → send to the dedicated connect screen rather than rendering
  // the connect UI inside a feature/settings page.
  if (!status?.connected) return <Navigate to="/instagram/connect" replace />;

  return children;
}

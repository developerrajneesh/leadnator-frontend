import { Navigate } from "react-router-dom";
import { useMetaStatus } from "../useMetaStatus";

// Gate around every Meta Ads child route. If the user hasn't linked a Facebook
// account yet, redirect to the dedicated /meta/connect screen rather than
// rendering the connect UI inside a feature page.
export default function MetaGate({ children }) {
  const { status, loading } = useMetaStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your Meta connection…
      </div>
    );
  }

  if (!status?.connected) return <Navigate to="/meta/connect" replace />;

  return children;
}

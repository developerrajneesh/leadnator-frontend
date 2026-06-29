import { Navigate } from "react-router-dom";
import { useEmailStatus } from "../useEmailStatus";

// Gate around every Email child route. Until the user has attached AND verified
// their sending domain, redirect to the dedicated /email/connect
// screen — there's nothing they can do with the feature pages until we can
// actually send mail for them.
export default function EmailGate({ children }) {
  const { status, loading } = useEmailStatus();

  if (loading) {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Checking your email configuration…
      </div>
    );
  }

  if (!status?.configured) return <Navigate to="/email/connect" replace />;

  return children;
}

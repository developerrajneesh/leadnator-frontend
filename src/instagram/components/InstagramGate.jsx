import ConnectInstagram from "./ConnectInstagram";
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

  if (status?.connected) return children;

  return <ConnectInstagram />;
}

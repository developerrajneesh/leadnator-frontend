import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { pricingApi } from "../../api/pricing";
import { useCurrentUser } from "../../api/hooks";

const DURATION_LABELS = { monthly: "Monthly", quarter: "3 months", half: "6 months", yearly: "Yearly" };

export default function Current() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await pricingApi.current();
      setSub(res.subscription);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function cancel() {
    if (!confirm("Cancel your subscription? You'll keep access until the period ends.")) return;
    setCancelling(true);
    try {
      await pricingApi.cancel();
      await load();
    } catch (err) { alert(err.message); }
    finally { setCancelling(false); }
  }

  if (loading) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading subscription…</div>;
  }

  if (!sub) {
    return (
      <>
        <h1 className="page-title">Current subscription</h1>
        <p className="page-subtitle">Manage your active plan.</p>
        <div className="card" style={{ maxWidth: 640, textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>You don't have an active subscription.</p>
          <button className="btn btn-primary" onClick={() => navigate("/pricing/plans")}>Browse plans →</button>
        </div>
      </>
    );
  }

  const renews = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const perMonth = sub.months > 0 ? Math.round(sub.amount / sub.months) : sub.amount;

  return (
    <>
      <h1 className="page-title">Current subscription</h1>
      <p className="page-subtitle">Manage your active plan.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header">
          <div className="card-title"><FiCheckCircle style={{ color: "var(--accent)", marginRight: 6, verticalAlign: "middle" }} />Active subscription</div>
        </div>
        <div style={{ padding: 20, background: "var(--primary-50)", borderRadius: 10, marginBottom: 16 }}>
          <span className={`badge ${sub.planName.toLowerCase()}`} style={{ fontSize: 13 }}>{sub.planName}</span>
          <h2 style={{ marginTop: 10 }}>₹{perMonth.toLocaleString()}<small style={{ fontSize: 14, color: "#6b7280" }}>/month</small></h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Renews on <strong>{renews}</strong> · {DURATION_LABELS[sub.duration] || sub.duration} billing · Total ₹{sub.amount.toLocaleString()}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16, fontSize: 13 }}>
          <div><div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Started</div><strong>{new Date(sub.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div>
          <div><div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Status</div><span className="badge qualified">{sub.status}</span></div>
          <div><div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Account</div><strong>{user.name}</strong></div>
          <div><div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Email</div><strong>{user.email}</strong></div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => navigate("/pricing/plans")}>Upgrade plan</button>
          <button className="btn btn-outline" onClick={() => navigate("/pricing/invoices")}>View invoices</button>
          <button className="btn btn-ghost" onClick={cancel} disabled={cancelling} style={{ color: "#b91c1c" }}>
            {cancelling ? "Cancelling…" : "Cancel subscription"}
          </button>
        </div>
      </div>
    </>
  );
}

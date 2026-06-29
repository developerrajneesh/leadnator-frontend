import { useNavigate } from "react-router-dom";
import { FiLock, FiArrowRight, FiCheck } from "react-icons/fi";
import { useCurrentUser } from "../api/hooks";
import { hasFeature, planKeyOf, PLAN_LABEL, FEATURE_MIN_PLAN } from "./planAccess";

// Gate a page behind a plan feature. If the user's plan includes it → render the
// page. Otherwise → a polished "Upgrade required" screen (the page stays in the
// nav; opening it shows this instead of the content).
export default function PlanGate({ feature, title, perks = [], children }) {
  const user = useCurrentUser();
  if (hasFeature(user, feature)) return children;

  return <UpgradeRequired feature={feature} title={title} perks={perks} currentPlan={planKeyOf(user)} />;
}

function UpgradeRequired({ feature, title, perks, currentPlan }) {
  const navigate = useNavigate();
  const needKey = FEATURE_MIN_PLAN[feature] || "pro";
  const needLabel = PLAN_LABEL[needKey] || "Pro";

  return (
    <div style={{ minHeight: "calc(100vh - 160px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{
        width: "100%", maxWidth: 520, textAlign: "center",
        background: "var(--card-bg, #fff)", border: "1px solid var(--border)",
        borderRadius: 22, padding: "44px 36px",
        boxShadow: "0 30px 80px -30px rgba(15,23,42,0.25)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 18px",
          display: "grid", placeItems: "center", color: "#fff", fontSize: 30,
          background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 45%, #ec4899 100%)",
          boxShadow: "0 14px 30px rgba(124,58,237,0.35)",
        }}>
          <FiLock />
        </div>

        <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".4px", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", padding: "5px 12px", borderRadius: 999, marginBottom: 14 }}>
          {needLabel.toUpperCase()} PLAN FEATURE
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>
          {title} is on the {needLabel} plan
        </h1>
        <p style={{ margin: "0 0 20px", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
          Your <strong>{PLAN_LABEL[currentPlan] || "current"}</strong> plan doesn&apos;t include {title}.
          Upgrade to {needLabel} to unlock it.
        </p>

        {perks.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 22px", maxWidth: 320, textAlign: "left", display: "grid", gap: 8 }}>
            {perks.map((p) => (
              <li key={p} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "#ecfdf5", color: "#16a34a", display: "grid", placeItems: "center", flexShrink: 0 }}><FiCheck size={13} /></span>
                {p}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/pricing/plans")}
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", border: "none", padding: "12px 22px", fontWeight: 700 }}
          >
            Upgrade to {needLabel} <FiArrowRight style={{ marginLeft: 6, verticalAlign: "middle" }} />
          </button>
          <button className="btn btn-outline" onClick={() => navigate("/pricing/plans")} style={{ padding: "12px 18px" }}>
            Compare plans
          </button>
        </div>
      </div>
    </div>
  );
}

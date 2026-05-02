import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { metaApi } from "../../api/meta";
import { AD_TYPES } from "./config";
import WizardShell from "./components/WizardShell";
import CampaignStep from "./steps/CampaignStep";
import FormStep     from "./steps/FormStep";
import AdSetStep    from "./steps/AdSetStep";
import CreativeStep from "./steps/CreativeStep";
import LaunchStep   from "./steps/LaunchStep";

export default function Wizard() {
  const { type, step } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi.status()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  const cfg = AD_TYPES[type];
  if (!cfg) return <Navigate to="/meta/create" replace />;
  if (!cfg.steps.includes(step)) return <Navigate to={`/meta/create/${type}/${cfg.steps[0]}`} replace />;

  if (loading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <span className="skel skel-line" style={{ width: 220, height: 20, display: "block", marginBottom: 8 }} />
        <span className="skel skel-line skel-line-sm" style={{ width: 360, display: "block", marginBottom: 22 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="skel" style={{ flex: 1, height: 6, borderRadius: 3 }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <span className="skel" style={{ width: 100, height: 36, borderRadius: 8 }} />
          <span className="skel" style={{ width: 110, height: 36, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  return (
    <WizardShell type={type} step={step}>
      {step === "campaign" && <CampaignStep type={type} status={status} />}
      {step === "form"     && <FormStep    type={type} />}
      {step === "adset"    && <AdSetStep   type={type} />}
      {step === "creative" && <CreativeStep type={type} />}
      {step === "launch"   && <LaunchStep  type={type} />}
    </WizardShell>
  );
}

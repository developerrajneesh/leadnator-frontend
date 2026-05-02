import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { metaApi } from "../../../api/meta";
import { AD_TYPES } from "../config";
import { loadState, saveState } from "../state";

const OBJECTIVES = [
  "OUTCOME_AWARENESS","OUTCOME_TRAFFIC","OUTCOME_ENGAGEMENT","OUTCOME_LEADS","OUTCOME_SALES","OUTCOME_APP_PROMOTION",
];

export default function CampaignStep({ type, status }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  const saved = loadState(type);
  const [name, setName] = useState(saved.campaignName || "");
  const [objective, setObjective] = useState(saved.objective || cfg.objective);
  const [accountId, setAccountId] = useState(saved.adAccountId || status.selectedAdAccountId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nextStep = cfg.steps[1]; // "form" for lead-form, else "adset"

  async function handleNext(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await metaApi.createCampaign({
        adAccountId: accountId,
        name,
        objective,
        status: "PAUSED",
        special_ad_categories: [],
      });
      saveState(type, {
        adAccountId: accountId,
        campaignName: name,
        objective,
        campaignId: res.campaign?.id,
      });
      navigate(`/meta/create/${type}/${nextStep}`);
    } catch (err) {
      setError(err.message || "Failed to create campaign.");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleNext} style={{ padding: 8 }}>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Step 1 — Campaign</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Give your campaign a name and pick the ad account.</p>

      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div className="form-group">
        <label>Campaign name *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={`${cfg.title} — ${new Date().toLocaleDateString("en-IN")}`} />
      </div>

      <div className="grid-2-equal">
        <div className="form-group">
          <label>Objective</label>
          <select value={objective} onChange={(e) => setObjective(e.target.value)}>
            {OBJECTIVES.map((o) => <option key={o} value={o}>{o.replace("OUTCOME_", "")}</option>)}
          </select>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Default for {cfg.title}: {cfg.objective.replace("OUTCOME_", "")}</div>
        </div>
        <div className="form-group">
          <label>Ad account</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {(status.accounts || []).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: cfg.color, borderColor: cfg.color }}>
          {submitting ? "Creating…" : "Next →"}
        </button>
      </div>
    </form>
  );
}

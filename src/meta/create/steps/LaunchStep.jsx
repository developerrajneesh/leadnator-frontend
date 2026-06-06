import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { metaApi } from "../../../api/meta";
import { AD_TYPES } from "../config";
import { clearState, loadState } from "../state";

export default function LaunchStep({ type }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  const saved = loadState(type);
  const [goLive, setGoLive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  async function launch() {
    setSubmitting(true); setError("");
    try {
      const creative = {
        object_story_spec: {
          page_id: saved.creative.pageId,
          // Attach the connected Instagram account when one is picked — required
          // for IG-DM ads, optional for cross-platform placements.
          ...(saved.creative.instagramAccountId
            ? { instagram_actor_id: saved.creative.instagramAccountId }
            : {}),
          link_data: {
            link: saved.creative.linkUrl || "https://leadnator.com",
            message: saved.creative.primaryText,
            name: saved.creative.headline,
            description: saved.creative.description || undefined,
            call_to_action: { type: saved.creative.cta },
            // Prefer the Meta-uploaded image hash; fall back to URL only if the
            // user pasted one (legacy path).
            ...(saved.creative.imageHash
              ? { image_hash: saved.creative.imageHash }
              : saved.creative.imageUrl
                ? { picture: saved.creative.imageUrl }
                : {}),
          },
        },
      };

      const res = await metaApi.createAd({
        adAccountId: saved.adAccountId,
        adsetId: saved.adsetId,
        name: `${saved.campaignName} — Ad`,
        creative,
        status: goLive ? "ACTIVE" : "PAUSED",
      });
      setSuccess({ id: res.ad?.id });
      clearState(type);
    } catch (err) {
      setError(err.message || "Failed to create ad.");
    } finally { setSubmitting(false); }
  }

  if (success) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#d1fae5", color: "#065f46",
          margin: "0 auto 16px", display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}><FiCheckCircle /></div>
        <h2 style={{ marginBottom: 8 }}>🎉 Campaign launched!</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>Campaign · <code>{saved.campaignId}</code></p>
        <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>Ad set · <code>{saved.adsetId}</code></p>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>Ad · <code>{success.id}</code></p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => navigate("/meta/create")}>Create another</button>
          <button className="btn btn-primary" onClick={() => navigate("/meta/campaigns")}>View campaigns →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Review & launch</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Double-check everything before going live on Meta.</p>

      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <Section title="Campaign">
        <Row label="Name"      value={saved.campaignName} />
        <Row label="Objective" value={saved.objective} />
        <Row label="Account"   value={saved.adAccountId} mono />
        <Row label="Campaign ID" value={saved.campaignId} mono />
      </Section>

      {saved.leadForm && (
        <Section title="Lead form">
          <Row label="Name"      value={saved.leadForm.name} />
          <Row label="Questions" value={`${saved.leadForm.questions?.length || 0} fields`} />
        </Section>
      )}

      <Section title="Ad set">
        <Row label="Name"        value={saved.adSet?.name} />
        <Row label="Daily budget" value={`₹${saved.adSet?.dailyBudget}/day`} />
        <Row label="Optimization" value={saved.adSet?.optimizationGoal} />
        <Row label="Age"         value={`${saved.adSet?.ageMin}–${saved.adSet?.ageMax}`} />
        <Row label="Countries"   value={(saved.adSet?.countries || []).join(", ")} />
        <Row label="Placements"  value={(saved.adSet?.publisherPlatforms || []).join(", ")} />
        {type === "whatsapp" && <Row label="WhatsApp" value={saved.whatsappNumber} />}
        {type === "call"     && <Row label="Phone"    value={saved.phoneNumber} />}
        <Row label="Ad set ID"   value={saved.adsetId} mono />
      </Section>

      <Section title="Creative">
        <Row label="Page ID"   value={saved.creative?.pageId} mono />
        {saved.creative?.instagramAccountId && <Row label="Instagram" value={saved.creative.instagramAccountId} mono />}
        <Row label="Headline"  value={saved.creative?.headline} />
        <Row label="CTA"       value={saved.creative?.cta} />
        {saved.creative?.imageHash && <Row label="Image" value={`✓ uploaded (${saved.creative.imageFilename || "image"})`} />}
        {type === "link" && <Row label="URL" value={saved.creative?.linkUrl} mono />}
        <div style={{ padding: "8px 0", fontSize: 13 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Primary text</div>
          <div style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 10, borderRadius: 6 }}>{saved.creative?.primaryText}</div>
        </div>
      </Section>

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: 12, background: cfg.bg, borderRadius: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={goLive} onChange={(e) => setGoLive(e.target.checked)} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: cfg.color }}>Go live immediately</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>If unchecked, the ad will be created in PAUSED status for review.</div>
        </div>
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button type="button" className="btn btn-outline" onClick={() => navigate(`/meta/create/${type}/creative`)}>← Back</button>
        <button onClick={launch} className="btn btn-primary" disabled={submitting}
          style={{ background: cfg.color, borderColor: cfg.color }}>
          {submitting ? "Launching…" : goLive ? "🚀 Launch live" : "Save as paused"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16, border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.4, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, gap: 10 }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right", ...(mono ? { fontFamily: "monospace", fontSize: 11 } : {}) }}>{value || "—"}</span>
    </div>
  );
}

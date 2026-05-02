import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { metaApi } from "../../../api/meta";
import { AD_TYPES } from "../config";
import { loadState, saveState } from "../state";

const OPTIMIZATION_GOALS = [
  "LINK_CLICKS","REACH","IMPRESSIONS","POST_ENGAGEMENT","PAGE_LIKES","LANDING_PAGE_VIEWS",
  "OFFSITE_CONVERSIONS","LEAD_GENERATION","QUALITY_CALL","CONVERSATIONS","VIDEO_VIEWS",
];

const COUNTRIES = [
  { code: "IN", name: "India" }, { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "UAE" },   { code: "CA", name: "Canada" },        { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },{ code: "DE", name: "Germany" },    { code: "FR", name: "France" },
];

export default function AdSetStep({ type }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  const saved = loadState(type);
  const prevStep = cfg.steps[cfg.steps.indexOf("adset") - 1];

  const [form, setForm] = useState(saved.adSet || {
    name: `${saved.campaignName || cfg.title} — AdSet`,
    dailyBudget: 500,
    optimizationGoal: cfg.optimizationGoal,
    billingEvent: "IMPRESSIONS",
    countries: ["IN"],
    ageMin: 18,
    ageMax: 65,
    genders: [1, 2],
    publisherPlatforms: ["facebook", "instagram"],
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    endTime: "",
    advantageAudience: false, // off → use manual targeting only
  });

  const [whatsappNumber, setWhatsappNumber] = useState(saved.whatsappNumber || "");
  const [phoneNumber, setPhoneNumber] = useState(saved.phoneNumber || "");
  const [pageId, setPageId] = useState(saved.pageId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function togglePlatform(p) {
    setForm((f) => ({
      ...f,
      publisherPlatforms: f.publisherPlatforms.includes(p)
        ? f.publisherPlatforms.filter((x) => x !== p)
        : [...f.publisherPlatforms, p],
    }));
  }
  function toggleGender(g) {
    setForm((f) => ({
      ...f,
      genders: f.genders.includes(g) ? f.genders.filter((x) => x !== g) : [...f.genders, g],
    }));
  }
  function toggleCountry(c) {
    setForm((f) => ({
      ...f,
      countries: f.countries.includes(c) ? f.countries.filter((x) => x !== c) : [...f.countries, c],
    }));
  }

  async function handleNext(e) {
    e.preventDefault();
    if (type === "whatsapp" && (!whatsappNumber || !pageId)) {
      setError("WhatsApp number and Page ID are required for WhatsApp ads.");
      return;
    }
    if (type === "call" && !phoneNumber) {
      setError("Phone number is required for Click-to-Call ads.");
      return;
    }

    setSubmitting(true); setError("");
    try {
      const targeting = {
        geo_locations: { countries: form.countries },
        age_min: Number(form.ageMin),
        age_max: Number(form.ageMax),
        genders: form.genders,
        publisher_platforms: form.publisherPlatforms,
        facebook_positions: form.publisherPlatforms.includes("facebook") ? ["feed"] : undefined,
        instagram_positions: form.publisherPlatforms.includes("instagram") ? ["stream"] : undefined,
        // Meta now requires explicit opt-in/out for Advantage Audience.
        // 0 = use the manual targeting above as-is (no AI expansion).
        // 1 = let Meta's AI broaden targeting beyond your selections.
        targeting_automation: { advantage_audience: form.advantageAudience ? 1 : 0 },
      };

      const promotedObject = type === "whatsapp" ? { page_id: pageId, whatsapp_number: whatsappNumber } : undefined;

      const res = await metaApi.createAdSet({
        adAccountId: saved.adAccountId,
        campaignId: saved.campaignId,
        name: form.name,
        dailyBudget: Number(form.dailyBudget),
        optimizationGoal: form.optimizationGoal,
        billingEvent: form.billingEvent,
        destinationType: cfg.destinationType,
        promotedObject,
        targeting,
        status: "PAUSED",
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      });

      saveState(type, {
        adSet: form,
        adsetId: res.adset?.id,
        whatsappNumber, phoneNumber, pageId,
      });
      navigate(`/meta/create/${type}/creative`);
    } catch (err) {
      setError(err.message || "Failed to create ad set.");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleNext} style={{ padding: 8 }}>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Ad set</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Budget, targeting, and destination.</p>

      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div className="form-group">
        <label>Ad set name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>

      <div className="grid-2-equal">
        <div className="form-group">
          <label>Daily budget (₹) *</label>
          <input type="number" min="100" required value={form.dailyBudget}
            onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Min ₹100/day</div>
        </div>
        <div className="form-group">
          <label>Optimization goal</label>
          <select value={form.optimizationGoal} onChange={(e) => setForm({ ...form, optimizationGoal: e.target.value })}>
            {OPTIMIZATION_GOALS.map((g) => <option key={g} value={g}>{g.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </div>

      {/* Destination */}
      {type === "whatsapp" && (
        <div className="grid-2-equal">
          <div className="form-group">
            <label>WhatsApp number (E.164) *</label>
            <input required value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+919876543210" />
          </div>
          <div className="form-group">
            <label>Facebook Page ID *</label>
            <input required value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="e.g. 123456789012345" />
          </div>
        </div>
      )}

      {type === "call" && (
        <div className="form-group">
          <label>Phone number *</label>
          <input required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+919876543210" />
        </div>
      )}

      <div style={{ margin: "20px 0 10px", fontSize: 13, fontWeight: 700 }}>Targeting</div>

      <div className="grid-2-equal">
        <div className="form-group">
          <label>Age range</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" min="13" max="65" value={form.ageMin} onChange={(e) => setForm({ ...form, ageMin: e.target.value })} style={{ width: 80 }} />
            <span>to</span>
            <input type="number" min="13" max="65" value={form.ageMax} onChange={(e) => setForm({ ...form, ageMax: e.target.value })} style={{ width: 80 }} />
          </div>
        </div>
        <div className="form-group">
          <label>Genders</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ v: 1, l: "Male" }, { v: 2, l: "Female" }].map((g) => (
              <button key={g.v} type="button" onClick={() => toggleGender(g.v)}
                style={{
                  padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${form.genders.includes(g.v) ? cfg.color : "var(--border)"}`,
                  background: form.genders.includes(g.v) ? cfg.bg : "white",
                  color: form.genders.includes(g.v) ? cfg.color : "var(--text)",
                }}>{g.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Countries</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {COUNTRIES.map((c) => (
            <button key={c.code} type="button" onClick={() => toggleCountry(c.code)}
              style={{
                padding: "6px 12px", borderRadius: 16, fontSize: 12, cursor: "pointer",
                border: `1px solid ${form.countries.includes(c.code) ? cfg.color : "var(--border)"}`,
                background: form.countries.includes(c.code) ? cfg.bg : "white",
                color: form.countries.includes(c.code) ? cfg.color : "var(--text)",
              }}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Advantage Audience (Meta AI audience expansion)</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: false, l: "Off — use my targeting only" },
            { v: true,  l: "On — let Meta expand it" },
          ].map((o) => (
            <button key={String(o.v)} type="button" onClick={() => setForm({ ...form, advantageAudience: o.v })}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: `1px solid ${form.advantageAudience === o.v ? cfg.color : "var(--border)"}`,
                background: form.advantageAudience === o.v ? cfg.bg : "white",
                color: form.advantageAudience === o.v ? cfg.color : "var(--text)",
              }}>{o.l}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Required by Meta for new ad sets. ON lets Meta's AI broaden your audience for better results; OFF keeps it strictly to what you set.
        </div>
      </div>

      <div className="form-group">
        <label>Placements</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["facebook", "instagram", "messenger", "audience_network"].map((p) => (
            <button key={p} type="button" onClick={() => togglePlatform(p)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                border: `1px solid ${form.publisherPlatforms.includes(p) ? cfg.color : "var(--border)"}`,
                background: form.publisherPlatforms.includes(p) ? cfg.bg : "white",
                color: form.publisherPlatforms.includes(p) ? cfg.color : "var(--text)",
                textTransform: "capitalize",
              }}>{p.replace("_", " ")}</button>
          ))}
        </div>
      </div>

      <div className="grid-2-equal">
        <div className="form-group">
          <label>Start time</label>
          <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div className="form-group">
          <label>End time (optional)</label>
          <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={() => navigate(`/meta/create/${type}/${prevStep}`)}>← Back</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}
          style={{ background: cfg.color, borderColor: cfg.color }}>
          {submitting ? "Creating ad set…" : "Next →"}
        </button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSave, FiCode, FiAlertTriangle } from "react-icons/fi";
import { notify } from "../../globalComponents/Toast/Toast";

// Field schemas — keep this in one place so all three detail pages stay in sync
// with the backend whitelists in meta-routes.js (CAMPAIGN/ADSET/AD_EDITABLE).
//
// Field shape: { key, label, type, options?, hint?, isJson?, isMoney? }
//   type:    "text" | "select" | "money" | "datetime" | "number" | "json"
//   isMoney: backend stores currency in MINOR units (paise/cents); we expose
//            rupees in the input and convert on save.
const SCHEMAS = {
  campaign: [
    { key: "name",            label: "Name",                 type: "text" },
    { key: "status",          label: "Status",               type: "select", options: ["ACTIVE","PAUSED","ARCHIVED","DELETED"] },
    { key: "daily_budget",    label: "Daily budget (₹)",     type: "money" },
    { key: "lifetime_budget", label: "Lifetime budget (₹)",  type: "money" },
    { key: "spend_cap",       label: "Spend cap (₹)",        type: "money" },
    { key: "bid_strategy",    label: "Bid strategy",         type: "select", options: ["", "LOWEST_COST_WITHOUT_CAP","LOWEST_COST_WITH_BID_CAP","COST_CAP","LOWEST_COST_WITH_MIN_ROAS"] },
    { key: "start_time",      label: "Start time",           type: "datetime" },
    { key: "stop_time",       label: "Stop time",            type: "datetime" },
  ],
  adset: [
    { key: "name",              label: "Name",                 type: "text" },
    { key: "status",            label: "Status",               type: "select", options: ["ACTIVE","PAUSED","ARCHIVED","DELETED"] },
    { key: "daily_budget",      label: "Daily budget (₹)",     type: "money" },
    { key: "lifetime_budget",   label: "Lifetime budget (₹)",  type: "money" },
    { key: "bid_amount",        label: "Bid amount (₹)",       type: "money" },
    { key: "bid_strategy",      label: "Bid strategy",         type: "select", options: ["", "LOWEST_COST_WITHOUT_CAP","LOWEST_COST_WITH_BID_CAP","COST_CAP","LOWEST_COST_WITH_MIN_ROAS"] },
    { key: "optimization_goal", label: "Optimization goal",    type: "select", options: ["", "REACH","IMPRESSIONS","LINK_CLICKS","LANDING_PAGE_VIEWS","POST_ENGAGEMENT","PAGE_LIKES","CONVERSIONS","LEAD_GENERATION","VALUE","THRUPLAY","APP_INSTALLS","OFFSITE_CONVERSIONS","QUALITY_LEAD"] },
    { key: "billing_event",     label: "Billing event",        type: "select", options: ["", "IMPRESSIONS","LINK_CLICKS","THRUPLAY","APP_INSTALLS","PAGE_LIKES","POST_ENGAGEMENT"] },
    { key: "destination_type",  label: "Destination type",     type: "select", options: ["", "WEBSITE","APP","MESSENGER","INSTAGRAM_DIRECT","WHATSAPP","UNDEFINED","ON_AD","ON_PAGE"] },
    { key: "start_time",        label: "Start time",           type: "datetime" },
    { key: "end_time",          label: "End time",             type: "datetime" },
    { key: "targeting",                label: "Targeting",                type: "json", hint: "Edit raw Meta targeting spec — geo_locations, age, interests, etc." },
    { key: "promoted_object",          label: "Promoted object",          type: "json" },
    { key: "frequency_control_specs",  label: "Frequency control specs",  type: "json" },
    { key: "attribution_spec",         label: "Attribution spec",         type: "json" },
  ],
  ad: [
    { key: "name",             label: "Name",   type: "text" },
    { key: "status",           label: "Status", type: "select", options: ["ACTIVE","PAUSED","ARCHIVED","DELETED"] },
    { key: "creative",         label: "Creative",        type: "json", hint: "e.g. { \"creative_id\": \"123…\" } to swap the ad's creative." },
    { key: "tracking_specs",   label: "Tracking specs",  type: "json" },
    { key: "conversion_specs", label: "Conversion specs", type: "json" },
  ],
};

function rupeeFromMinor(v)  { return v == null || v === "" ? "" : (Number(v) / 100).toString(); }
function rupeeToMinor(v)    { return v === "" || v == null ? "" : Math.round(Number(v) * 100); }
function isoToLocal(v)      { if (!v) return ""; try { const d = new Date(v); const off = d.getTimezoneOffset() * 60000; return new Date(d - off).toISOString().slice(0, 16); } catch { return ""; } }
function localToIso(v)      { return v ? new Date(v).toISOString() : ""; }

// Meta's immutability rules — we surface these as locked fields so users get
// a clear explanation upfront instead of an "Invalid parameter" 400 from FB.
// Returns a reason string when a field is locked, or null when editable.
function lockedReason(kind, entity, key) {
  if (!entity) return null;
  const hasDaily    = entity.daily_budget != null    && entity.daily_budget !== "";
  const hasLifetime = entity.lifetime_budget != null && entity.lifetime_budget !== "";

  // Budget type swap is forbidden once set on a campaign or adset.
  if ((kind === "campaign" || kind === "adset") && key === "daily_budget"    && hasLifetime) {
    return "Locked — this uses a lifetime budget. Meta doesn't allow switching to a daily budget after creation.";
  }
  if ((kind === "campaign" || kind === "adset") && key === "lifetime_budget" && hasDaily) {
    return "Locked — this uses a daily budget. Meta doesn't allow switching to a lifetime budget after creation.";
  }
  // Bid amount only applies under bid_strategy=LOWEST_COST_WITH_BID_CAP / COST_CAP.
  if (kind === "adset" && key === "bid_amount") {
    const bs = entity.bid_strategy;
    if (bs && bs !== "LOWEST_COST_WITH_BID_CAP" && bs !== "COST_CAP") {
      return `Bid amount is only used with LOWEST_COST_WITH_BID_CAP or COST_CAP — current strategy is ${bs}.`;
    }
  }
  // Special ad categories are typically locked after creation.
  if (kind === "campaign" && key === "special_ad_categories" && (entity.special_ad_categories || []).length) {
    return "Locked — special ad categories can't be changed after the campaign is created.";
  }
  return null;
}

export default function EditMetaModal({ kind, entity, onClose, onSave }) {
  const schema = SCHEMAS[kind] || [];

  // Build initial form values from the entity, normalizing money & datetime.
  const initial = {};
  for (const f of schema) {
    let v = entity?.[f.key];
    if (f.type === "money")    v = rupeeFromMinor(v);
    if (f.type === "datetime") v = isoToLocal(v);
    if (f.type === "json")     v = v == null ? "" : JSON.stringify(v, null, 2);
    initial[f.key] = v ?? "";
  }
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  function patch(key, value) { setForm((cur) => ({ ...cur, [key]: value })); }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    // Build only the diff so we don't waste an API call rewriting unchanged
    // fields. Meta is fine with partial POSTs. Skip locked fields entirely so
    // they can never accidentally be sent.
    const out = {};
    for (const f of schema) {
      if (lockedReason(kind, entity, f.key)) continue;
      const before = initial[f.key];
      const after  = form[f.key];
      if (after === before) continue;

      if (f.type === "money") {
        out[f.key] = after === "" ? "" : rupeeToMinor(after);
      } else if (f.type === "datetime") {
        out[f.key] = after ? localToIso(after) : "";
      } else if (f.type === "json") {
        if (!after.trim()) { out[f.key] = ""; continue; }
        try { out[f.key] = JSON.parse(after); }
        catch (e) { setErr(`Invalid JSON in "${f.label}": ${e.message}`); return; }
      } else {
        out[f.key] = after;
      }
    }

    if (!Object.keys(out).length) { notify.info("Nothing changed"); onClose(); return; }

    setSaving(true);
    try {
      await onSave(out);
      notify.success("Saved");
      onClose();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally { setSaving(false); }
  }

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 720, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title">Edit {kind}</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ padding: 8, background: "#eff6ff", color: "#1e3a8a", borderRadius: 8, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
          Only fields you change will be sent to Meta. Money inputs are in <strong>₹</strong> and converted to paise on save.
        </div>

        {err && (
          <div style={{ padding: 10, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, marginBottom: 10, fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <FiAlertTriangle style={{ flexShrink: 0, marginTop: 2 }} /> {err}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {schema.filter((f) => f.type !== "json").map((f) => {
            const locked = lockedReason(kind, entity, f.key);
            return (
              <FieldInput
                key={f.key} field={f}
                value={form[f.key]} onChange={(v) => patch(f.key, v)}
                locked={locked}
              />
            );
          })}
        </div>

        {/* JSON fields are full-width and collapsed by default */}
        {schema.filter((f) => f.type === "json").map((f) => {
          const locked = lockedReason(kind, entity, f.key);
          return (
            <details key={f.key} style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 8, opacity: locked ? 0.6 : 1 }}>
              <summary style={{ cursor: "pointer", padding: "8px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <FiCode /> {f.label}
                {locked && <span style={{ fontSize: 10, color: "#92400e", marginLeft: "auto" }}>🔒 locked</span>}
                {!locked && form[f.key] && <span style={{ fontSize: 10, color: "#10b981", marginLeft: "auto" }}>has data</span>}
              </summary>
              <div style={{ padding: 10 }}>
                {locked ? (
                  <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 11, display: "flex", gap: 8 }}>
                    <FiAlertTriangle style={{ flexShrink: 0, marginTop: 2 }} /> {locked}
                  </div>
                ) : (
                  <>
                    {f.hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{f.hint}</div>}
                    <textarea
                      value={form[f.key]}
                      onChange={(e) => patch(f.key, e.target.value)}
                      rows={8}
                      placeholder="{ }"
                      style={{
                        width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8,
                        fontFamily: '"Fira Code", Menlo, Consolas, monospace', fontSize: 12, lineHeight: 1.5,
                        background: "#fafafa", resize: "vertical",
                      }}
                      spellCheck={false}
                    />
                  </>
                )}
              </div>
            </details>
          );
        })}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function FieldInput({ field, value, onChange, locked }) {
  const disabledStyle = locked ? { background: "#f3f4f6", cursor: "not-allowed", color: "#9ca3af" } : null;
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label style={{
        fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3,
        color: locked ? "#9ca3af" : "var(--text-muted)", fontWeight: 700,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {field.label}
        {locked && <span style={{ fontSize: 10, color: "#92400e", textTransform: "none", letterSpacing: 0 }}>🔒 locked</span>}
      </label>
      {field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={!!locked} style={disabledStyle || undefined}>
          {field.options.map((o) => <option key={o} value={o}>{o || "— not set —"}</option>)}
        </select>
      ) : field.type === "datetime" ? (
        <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} disabled={!!locked} style={disabledStyle || undefined} />
      ) : field.type === "money" ? (
        <input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" disabled={!!locked} style={disabledStyle || undefined} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={!!locked} style={disabledStyle || undefined} />
      )}
      {locked && (
        <div style={{ fontSize: 11, color: "#92400e", marginTop: 4, lineHeight: 1.4, display: "flex", gap: 6, alignItems: "flex-start" }}>
          <FiAlertTriangle style={{ flexShrink: 0, marginTop: 2 }} /> {locked}
        </div>
      )}
    </div>
  );
}

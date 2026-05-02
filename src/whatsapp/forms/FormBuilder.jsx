import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiSave, FiCheckCircle, FiCode, FiAlertTriangle,
  FiExternalLink, FiCopy, FiRefreshCw, FiPlay,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const STARTERS = {
  "Lead capture (name + email)": {
    version: "5.0",
    screens: [
      {
        id: "LEAD",
        title: "Quick info",
        terminal: true,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            { type: "TextHeading", text: "Tell us about yourself" },
            { type: "TextSubheading", text: "We'll get back to you shortly." },
            { type: "TextInput", name: "full_name", label: "Full name", required: true },
            { type: "TextInput", name: "email", label: "Email", "input-type": "email", required: true },
            { type: "TextInput", name: "phone", label: "Phone", "input-type": "phone" },
            { type: "TextArea", name: "message", label: "Message (optional)" },
            {
              type: "Footer",
              label: "Submit",
              "on-click-action": {
                name: "complete",
                payload: {
                  full_name: "${form.full_name}",
                  email: "${form.email}",
                  phone: "${form.phone}",
                  message: "${form.message}",
                },
              },
            },
          ],
        },
      },
    ],
  },
  "Appointment booking": {
    version: "5.0",
    screens: [
      {
        id: "BOOK",
        title: "Book an appointment",
        terminal: true,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            { type: "TextHeading", text: "Pick a time that works" },
            { type: "DatePicker", name: "date", label: "Preferred date", required: true },
            {
              type: "Dropdown",
              name: "slot", label: "Preferred slot", required: true,
              "data-source": [
                { id: "morning",   title: "Morning (9–12)" },
                { id: "afternoon", title: "Afternoon (12–5)" },
                { id: "evening",   title: "Evening (5–8)" },
              ],
            },
            { type: "TextInput", name: "notes", label: "Anything we should know?" },
            {
              type: "Footer", label: "Confirm",
              "on-click-action": {
                name: "complete",
                payload: { date: "${form.date}", slot: "${form.slot}", notes: "${form.notes}" },
              },
            },
          ],
        },
      },
    ],
  },
  "Customer feedback (rating)": {
    version: "5.0",
    screens: [
      {
        id: "FEEDBACK",
        title: "How did we do?",
        terminal: true,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            { type: "TextHeading", text: "Rate your experience" },
            {
              type: "RadioButtonsGroup",
              name: "rating", label: "Overall rating", required: true,
              "data-source": [
                { id: "5", title: "⭐️⭐️⭐️⭐️⭐️ Excellent" },
                { id: "4", title: "⭐️⭐️⭐️⭐️ Good" },
                { id: "3", title: "⭐️⭐️⭐️ Okay" },
                { id: "2", title: "⭐️⭐️ Poor" },
                { id: "1", title: "⭐️ Terrible" },
              ],
            },
            { type: "TextArea", name: "comments", label: "Any comments?" },
            {
              type: "Footer", label: "Submit feedback",
              "on-click-action": {
                name: "complete",
                payload: { rating: "${form.rating}", comments: "${form.comments}" },
              },
            },
          ],
        },
      },
    ],
  },
};

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flow, setFlow] = useState(null);
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validation, setValidation] = useState([]);
  const [publishError, setPublishError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await waApi.metaFlow(id);
      setFlow(r.flow);
      setValidation(r.flow?.validation_errors || []);
      setJson(r.flowJson ? JSON.stringify(r.flowJson, null, 2) : "");
    } catch (err) { notify.error(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  function loadStarter(key) {
    if (json.trim() && !confirm("Replace current JSON with the starter template?")) return;
    setJson(JSON.stringify(STARTERS[key], null, 2));
  }

  function pretty() {
    try { setJson(JSON.stringify(JSON.parse(json), null, 2)); notify.success("Formatted"); }
    catch (err) { notify.error("Invalid JSON: " + err.message); }
  }

  async function save() {
    let parsed;
    try { parsed = JSON.parse(json); }
    catch (err) { notify.error("Invalid JSON: " + err.message); return; }
    setSaving(true);
    try {
      const r = await waApi.saveMetaFlowJson(id, parsed);
      setValidation(r.validation_errors || []);
      if (r.validation_errors?.length) {
        notify.warn(`Saved with ${r.validation_errors.length} validation issue${r.validation_errors.length === 1 ? "" : "s"}`);
      } else {
        notify.success("Flow JSON saved");
      }
      load();
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  async function publish() {
    if (!confirm("Publish this flow? Once published, categories and name can't be changed.")) return;
    setPublishing(true); setPublishError("");
    try {
      await waApi.publishMetaFlow(id);
      notify.success("Flow published ✓ now you can send it from the inbox");
      load();
    } catch (err) {
      const msg = err.message || "";
      // Meta's "Integrity requirements not met" means the WABA isn't business-
      // verified yet. Surface a richer in-page banner so the user knows where
      // to go fix it, instead of just a cryptic toast.
      if (/integrity/i.test(msg) || /business.{0,12}verif/i.test(msg)) {
        setPublishError("INTEGRITY");
        notify.error("Publish blocked — your WhatsApp Business Account isn't verified yet. See the banner above for steps.");
      } else {
        setPublishError(msg);
        notify.error(msg);
      }
    } finally { setPublishing(false); }
  }

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading flow…</div>;
  if (!flow)   return <div className="card" style={{ padding: 40 }}>Flow not found.</div>;

  const isDraft = flow.status === "DRAFT";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/whatsapp/forms")}><FiArrowLeft /> Back</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{flow.name}</h2>
          <span className={`badge ${flow.status === "PUBLISHED" ? "qualified" : flow.status === "DRAFT" ? "contacted" : "lost"}`}>
            {flow.status?.toLowerCase()}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{flow.id}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={load} title="Reload from Meta"><FiRefreshCw /></button>
          {flow.preview?.preview_url && (
            <a className="btn btn-outline" href={flow.preview.preview_url} target="_blank" rel="noreferrer">
              <FiExternalLink /> Preview
            </a>
          )}
          {isDraft && (
            <button className="btn btn-outline" onClick={publish} disabled={publishing || validation.length > 0}>
              <FiPlay /> {publishing ? "Publishing…" : "Publish"}
            </button>
          )}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save JSON"}
          </button>
        </div>
      </div>

      {/* Publish error — most commonly Meta's integrity (verification) gate */}
      {publishError === "INTEGRITY" && (
        <div style={{
          padding: 14, background: "#fef2f2", color: "#7f1d1d",
          border: "1px solid #fecaca", borderRadius: 10, marginBottom: 10, fontSize: 13, lineHeight: 1.6,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontWeight: 700 }}>
            <FiAlertTriangle /> Publish blocked — Meta integrity check failed
          </div>
          Your WhatsApp Business Account isn't ready to host published flows yet. Meta requires <strong>business verification</strong> + a verified phone number with good <strong>quality rating</strong> before flows can go live.

          <div style={{ marginTop: 10, fontWeight: 700, marginBottom: 4 }}>How to fix this:</div>
          <ol style={{ paddingLeft: 22, margin: 0 }}>
            <li>Open <a href="https://business.facebook.com/settings/security" target="_blank" rel="noreferrer">Meta Business Settings → Security Center</a> and complete <strong>Business Verification</strong> (upload a utility bill / company doc).</li>
            <li>In <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noreferrer">WhatsApp Manager → Phone numbers</a>, make sure your number's <strong>display name is approved</strong>.</li>
            <li>Make sure your <strong>quality rating</strong> is GREEN (no recent policy strikes).</li>
            <li>Wait a few minutes after each step — Meta caches the integrity check.</li>
          </ol>

          <div style={{ marginTop: 10, fontSize: 12, color: "#991b1b" }}>
            💡 You can still <strong>preview</strong> the flow now (uses draft mode). To send it to a real customer for testing, send it via the inbox <strong>📋 Send Form</strong> button with <strong>Mode = Draft</strong> — that bypasses the publish gate.
          </div>

          <button
            type="button"
            onClick={() => setPublishError("")}
            style={{ marginTop: 10, padding: "4px 10px", background: "transparent", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
          >Dismiss</button>
        </div>
      )}

      {publishError && publishError !== "INTEGRITY" && (
        <div style={{ padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 10, marginBottom: 10, fontSize: 13, border: "1px solid #fecaca" }}>
          <FiAlertTriangle style={{ verticalAlign: "middle", marginRight: 6 }} />
          <strong>Publish failed:</strong> {publishError}
        </div>
      )}

      {/* Validation warnings */}
      {validation.length > 0 && (
        <div style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8, marginBottom: 10, fontSize: 12, border: "1px solid #fde68a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontWeight: 700 }}>
            <FiAlertTriangle /> {validation.length} validation issue{validation.length === 1 ? "" : "s"} — must fix before publishing
          </div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.5 }}>
            {validation.map((v, i) => <li key={i}>{v.message || JSON.stringify(v)}</li>)}
          </ul>
        </div>
      )}

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", gap: 12, minHeight: 0 }}>

        {/* LEFT — Starter templates + help */}
        <div className="card" style={{ overflowY: "auto", padding: 12 }}>
          <div className="card-title" style={{ fontSize: 13, marginBottom: 10 }}><FiCode /> Starter templates</div>
          {Object.keys(STARTERS).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => loadStarter(k)}
              style={{
                width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6,
                borderRadius: 8, border: "1px solid var(--border)", background: "white",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                transition: "0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#f5f3ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "white"; }}
            >{k}</button>
          ))}

          <div style={{
            marginTop: 14, padding: 10, background: "#f8fafc",
            border: "1px solid var(--border)", borderRadius: 8,
            fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: 4 }}>💡 Tips</strong>
            • Each <code>screen</code> needs a unique <code>id</code> and a <code>layout</code>.<br/>
            • The final screen must set <code>terminal: true</code> with a <code>Footer</code> whose action is <code>complete</code>.<br/>
            • Supported inputs: <code>TextInput</code>, <code>TextArea</code>, <code>DatePicker</code>, <code>Dropdown</code>, <code>RadioButtonsGroup</code>, <code>CheckboxGroup</code>, <code>OptIn</code>.<br/>
            • See <a href="https://developers.facebook.com/docs/whatsapp/flows/reference/flowjson" target="_blank" rel="noreferrer">Meta's Flow JSON reference</a>.
          </div>
        </div>

        {/* CENTER — JSON editor */}
        <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-title" style={{ fontSize: 13 }}><FiCode /> Flow JSON</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-outline" onClick={pretty} style={{ padding: "4px 10px", fontSize: 12 }}>Format</button>
              <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(json); notify.info("Copied"); }} style={{ padding: "4px 10px", fontSize: 12 }}>
                <FiCopy /> Copy
              </button>
            </div>
          </div>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={`{\n  "version": "5.0",\n  "screens": [ ... ]\n}`}
            style={{
              flex: 1, minHeight: 0, border: "none", resize: "none", outline: "none",
              padding: 16, fontFamily: '"Fira Code", Menlo, Consolas, monospace',
              fontSize: 13, lineHeight: 1.6, color: "#111827",
              background: "#fafafa",
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

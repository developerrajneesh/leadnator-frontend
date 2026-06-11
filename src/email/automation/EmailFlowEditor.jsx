import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiTrash2, FiClock, FiMail, FiZap, FiPlay, FiSave, FiChevronDown,
} from "react-icons/fi";
import { leadFlowApi } from "../../api/leadFlows";
import { emailApi } from "../../api/email";
import { compile, decompile, blankForm, blankStep, TRIGGERS, WAIT_UNITS } from "./emailFlowModel";

export default function EmailFlowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [form, setForm] = useState(blankForm());
  const [templates, setTemplates] = useState([]);
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const [t, c] = await Promise.all([emailApi.templates(), emailApi.config()]);
      setTemplates(t.templates || []);
      setSenders(c.config?.senders || []);
      if (!isNew) {
        const res = await leadFlowApi.get(id);
        setForm(decompile(res.flow));
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  // ---- form mutators ----
  const setTrigger = (patch) => setForm((f) => ({ ...f, trigger: { ...f.trigger, ...patch } }));
  const setStep = (i, patch) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, blankStep()] }));
  const removeStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  function applyTemplate(i, templateId) {
    const t = templates.find((x) => x.id === templateId);
    if (t) setStep(i, { templateId, subject: t.subject, body: t.body });
    else setStep(i, { templateId: "" });
  }

  function validate() {
    if (!form.name.trim()) return "Give your flow a name.";
    if (form.trigger.type === "trigger.status_changed" && !form.trigger.status.trim())
      return "Enter the status that should trigger this flow (or pick a different trigger).";
    if (form.trigger.type === "trigger.tag_added" && !form.trigger.tag.trim())
      return "Enter the tag that should trigger this flow.";
    if (!form.steps.length) return "Add at least one email step.";
    for (let i = 0; i < form.steps.length; i++) {
      const s = form.steps[i];
      if (!s.templateId && (!s.subject.trim() || !s.body.trim()))
        return `Step ${i + 1}: pick a template, or fill in both subject and body.`;
    }
    return "";
  }

  async function save(status) {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const next = { ...form, status };
      const compiled = compile(next);
      let savedId = id;
      if (isNew) {
        const res = await leadFlowApi.create({ ...compiled, status });
        savedId = res.flow.id;
        navigate(`/email/automation/${savedId}`, { replace: true });
      } else {
        await leadFlowApi.update(id, { ...compiled, status });
      }
      setForm(next);
      setSuccess(status === "active" ? "Flow activated ✅" : "Saved.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function testRun() {
    if (isNew) { setError("Save the flow first, then test."); return; }
    setTesting(true); setError(""); setTestResult(null);
    try {
      const res = await leadFlowApi.test(id);
      setTestResult(res);
    } catch (err) { setError(err.message); }
    finally { setTesting(false); }
  }

  if (loading) {
    return (
      <>
        <button className="btn btn-outline" onClick={() => navigate("/email/automation")} style={{ marginBottom: 14 }}>
          <FiArrowLeft /> Back
        </button>
        <div className="card" style={{ padding: 24, maxWidth: 760 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
              <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <button className="btn btn-outline" onClick={() => navigate("/email/automation")}>
          <FiArrowLeft /> Back to automations
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!isNew && (
            <button className="btn btn-outline" onClick={testRun} disabled={testing}>
              <FiPlay /> {testing ? "Testing…" : "Test run"}
            </button>
          )}
          <button className="btn btn-outline" onClick={() => save("draft")} disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save draft"}
          </button>
          <button className="btn btn-primary" onClick={() => save("active")} disabled={saving}>
            <FiZap /> {form.status === "active" ? "Save & keep active" : "Activate"}
          </button>
        </div>
      </div>

      <h1 className="page-title" style={{ marginBottom: 2 }}>{isNew ? "New email flow" : (form.name || "Edit email flow")}</h1>
      <p className="page-subtitle" style={{ marginBottom: 0 }}>
        Pick a trigger, then add wait + send-email steps. Emails go out from your verified domain.
      </p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 10, marginTop: 14, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 10, marginTop: 14, fontSize: 13 }}>{success}</div>}

      <div style={{ maxWidth: 760, marginTop: 16 }}>
        {/* Name */}
        <div className="card">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Flow name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Welcome series" />
          </div>
        </div>

        {/* Trigger */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header"><div className="card-title"><FiZap /> When this happens (trigger)</div></div>
          <div className="form-group">
            <label>Trigger</label>
            <select value={form.trigger.type} onChange={(e) => setTrigger({ type: e.target.value })}>
              {TRIGGERS.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
          </div>
          {form.trigger.type === "trigger.status_changed" && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status equals</label>
              <input value={form.trigger.status} onChange={(e) => setTrigger({ status: e.target.value })} placeholder="e.g. Qualified" />
            </div>
          )}
          {form.trigger.type === "trigger.tag_added" && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tag</label>
              <input value={form.trigger.tag} onChange={(e) => setTrigger({ tag: e.target.value })} placeholder="e.g. cold" />
            </div>
          )}
        </div>

        {/* Steps */}
        {form.steps.map((s, i) => (
          <div key={i} className="card" style={{ marginTop: 14 }}>
            <div className="card-header">
              <div className="card-title"><FiMail /> Step {i + 1} — send email</div>
              {form.steps.length > 1 && (
                <button className="btn btn-ghost" style={{ color: "#b91c1c" }} onClick={() => removeStep(i)}><FiTrash2 /></button>
              )}
            </div>

            {/* Wait */}
            <div className="form-group">
              <label><FiClock style={{ verticalAlign: "middle", marginRight: 4 }} /> Wait before sending</label>
              <div style={{ display: "flex", gap: 8 }}>
                {s.waitUnit && (
                  <input
                    type="number" min="0" style={{ width: 120 }}
                    value={s.waitValue}
                    onChange={(e) => setStep(i, { waitValue: e.target.value })}
                  />
                )}
                <select
                  style={{ flex: 1 }}
                  value={s.waitUnit}
                  onChange={(e) => setStep(i, { waitUnit: e.target.value, waitValue: e.target.value ? (s.waitValue || 1) : 0 })}
                >
                  {WAIT_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Sender */}
            <div className="form-group">
              <label>Send from</label>
              {senders.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  No sender profiles — add one under <a href="/email/config" style={{ color: "var(--primary)" }}>Email → Config</a>. (Will use your default domain sender.)
                </div>
              ) : (
                <select value={s.senderId} onChange={(e) => setStep(i, { senderId: e.target.value })}>
                  <option value="">Default sender</option>
                  {senders.map((sd) => (
                    <option key={sd._id} value={sd._id}>{sd.name ? `${sd.name} <${sd.email}>` : sd.email}{sd.isDefault ? " — default" : ""}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Template prefill */}
            {templates.length > 0 && (
              <div className="form-group">
                <label>Pre-fill from template</label>
                <select value={s.templateId} onChange={(e) => applyTemplate(i, e.target.value)}>
                  <option value="">— None (write below) —</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Subject *</label>
              <input value={s.subject} onChange={(e) => setStep(i, { subject: e.target.value })} placeholder="Hi {{firstName}}, welcome!" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Body * (HTML allowed, {"{{firstName}}"} {"{{name}}"} {"{{email}}"} merge tags)</label>
              <textarea
                rows="6" value={s.body} onChange={(e) => setStep(i, { body: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
                placeholder="Hi {{firstName}}, thanks for joining…"
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <button className="btn btn-outline" onClick={addStep}><FiPlus /> Add another email</button>
        </div>

        {/* Test result */}
        {testResult && (
          <div className="card">
            <div className="card-header"><div className="card-title"><FiPlay /> Test run on {testResult.lead?.name || testResult.lead?.email || "a lead"}</div></div>
            {(testResult.steps || []).length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No steps ran.</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {testResult.steps.map((st, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, fontSize: 12, padding: "8px 10px", borderRadius: 8, background: st.ok ? "#f0fdf4" : "#fef2f2" }}>
                    <span style={{ color: st.ok ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{st.ok ? "✓" : "✗"}</span>
                    <span style={{ fontWeight: 600 }}>{st.nodeTitle || st.nodeType}</span>
                    <span style={{ color: "var(--text-muted)" }}>{st.message}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
              <FiChevronDown style={{ verticalAlign: "middle" }} /> Test runs fire real emails to the test lead. Wait steps are simulated.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

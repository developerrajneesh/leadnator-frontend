import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { AD_TYPES } from "../config";
import { loadState, saveState } from "../state";

export default function FormStep({ type }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  const saved = loadState(type);

  const [form, setForm] = useState(saved.leadForm || {
    name: "",
    intro: "Help us understand you better",
    questions: [
      { key: "FULL_NAME", label: "Full name" },
      { key: "EMAIL",     label: "Email" },
      { key: "PHONE",     label: "Phone number" },
    ],
    privacyPolicyUrl: "https://leadnator.app/privacy",
    thankYouMessage: "Thanks! We'll be in touch shortly.",
  });

  function addQuestion() {
    setForm((f) => ({ ...f, questions: [...f.questions, { key: "CUSTOM", label: "" }] }));
  }
  function removeQuestion(i) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  }
  function updateQuestion(i, patch) {
    setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => idx === i ? { ...q, ...patch } : q) }));
  }

  function handleNext(e) {
    e.preventDefault();
    saveState(type, { leadForm: form });
    navigate(`/meta/create/${type}/adset`);
  }

  return (
    <form onSubmit={handleNext} style={{ padding: 8 }}>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Step 2 — Lead form</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Design the form that opens when someone clicks your ad.</p>

      <div className="form-group">
        <label>Form name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Lead Form" />
      </div>
      <div className="form-group">
        <label>Intro headline</label>
        <input value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
      </div>

      <div style={{ marginTop: 18, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Questions</div>
        <button type="button" className="btn btn-outline" onClick={addQuestion}><FiPlus /> Add question</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {form.questions.map((q, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 40px", gap: 8, alignItems: "center" }}>
            <select value={q.key} onChange={(e) => updateQuestion(i, { key: e.target.value })}
              style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}>
              {["FULL_NAME","EMAIL","PHONE","COMPANY_NAME","JOB_TITLE","CITY","STATE","CUSTOM"].map((k) => (
                <option key={k} value={k}>{k.replace("_", " ")}</option>
              ))}
            </select>
            <input
              value={q.label}
              onChange={(e) => updateQuestion(i, { label: e.target.value })}
              placeholder="Question label"
              style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}
            />
            <button type="button" onClick={() => removeQuestion(i)} disabled={form.questions.length === 1}
              style={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "#b91c1c", padding: 8 }}>
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="grid-2-equal" style={{ marginTop: 18 }}>
        <div className="form-group">
          <label>Privacy policy URL *</label>
          <input required type="url" value={form.privacyPolicyUrl} onChange={(e) => setForm({ ...form, privacyPolicyUrl: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Thank-you message</label>
          <input value={form.thankYouMessage} onChange={(e) => setForm({ ...form, thankYouMessage: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={() => navigate(`/meta/create/${type}/campaign`)}>← Back</button>
        <button type="submit" className="btn btn-primary" style={{ background: cfg.color, borderColor: cfg.color }}>Next →</button>
      </div>
    </form>
  );
}

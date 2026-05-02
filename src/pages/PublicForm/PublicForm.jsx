import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

function FieldPreview({ f, value, onChange }) {
  const common = {
    placeholder: f.placeholder, required: f.required,
    value: value || "", onChange: (e) => onChange(e.target.value),
  };
  if (f.type === "textarea") return <textarea rows="4" {...common} />;
  if (f.type === "select") return (
    <select {...common}>
      <option value="">— Select —</option>
      {(f.options || []).map((o, i) => <option key={i}>{o}</option>)}
    </select>
  );
  if (f.type === "radio") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(f.options || []).map((o, i) => (
        <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input type="radio" name={f.id} value={o} checked={value === o} onChange={(e) => onChange(e.target.value)} required={f.required && i === 0} /> {o}
        </label>
      ))}
    </div>
  );
  if (f.type === "checkbox") return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} required={f.required} /> {f.label}
    </label>
  );
  const htmlType = f.type === "phone" ? "tel" : f.type === "email" ? "email" : f.type === "number" ? "number" : f.type === "date" ? "date" : "text";
  return <input type={htmlType} {...common} />;
}

export default function PublicForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`leadnator_form_${formId}`);
      if (!raw) { setNotFound(true); return; }
      setForm(JSON.parse(raw));
    } catch { setNotFound(true); }
  }, [formId]);

  function handleSubmit(e) {
    e.preventDefault();
    const subs = JSON.parse(localStorage.getItem(`leadnator_subs_${formId}`) || "[]");
    subs.push({ values, at: new Date().toISOString() });
    localStorage.setItem(`leadnator_subs_${formId}`, JSON.stringify(subs));
    setSubmitted(true);
  }

  if (notFound) return (
    <div className="public-form-wrap">
      <div className="public-form-card">
        <FiAlertCircle style={{ fontSize: 40, color: "var(--danger)", marginBottom: 14 }} />
        <h2>Form not found</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>This link is broken or the form was deleted.</p>
      </div>
    </div>
  );
  if (!form) return <div className="public-form-wrap"><div className="public-form-card">Loading…</div></div>;

  if (submitted) return (
    <div className="public-form-wrap">
      <div className="public-form-card" style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", background: "#d1fae5", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <FiCheck style={{ fontSize: 32, color: "#059669" }} />
        </div>
        <h2>Thanks — we got your response!</h2>
        <p style={{ color: "#6b7280", marginTop: 8 }}>We'll get back to you shortly.</p>
      </div>
    </div>
  );

  return (
    <div className="public-form-wrap">
      <div className="public-form-card">
        <h2 style={{ fontSize: 24 }}>{form.title}</h2>
        {form.description && <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6, marginBottom: 22 }}>{form.description}</p>}
        <form onSubmit={handleSubmit}>
          {(form.fields || []).map((f) => (
            <div className="form-group" key={f.id}>
              {f.type !== "checkbox" && <label>{f.label}{f.required && <span style={{ color: "var(--danger)" }}> *</span>}</label>}
              <FieldPreview f={f} value={values[f.id]} onChange={(v) => setValues({ ...values, [f.id]: v })} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8, padding: 12 }}>
            {form.submitLabel || "Submit"}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
          Powered by <strong style={{ color: "var(--primary)" }}>Leadnator</strong>
        </div>
      </div>
    </div>
  );
}

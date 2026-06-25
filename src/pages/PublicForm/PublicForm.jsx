import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import { api } from "../../api/client";
import { buildFormCss, normalizeStyle } from "../../tools/form/formStyle";

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
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    api.forms.getPublic(formId)
      .then((r) => { if (alive) setForm(r.form); })
      .catch(() => { if (alive) setNotFound(true); });
    return () => { alive = false; };
  }, [formId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.forms.submit(formId, values);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

  const st = normalizeStyle(form.style);

  return (
    <div className="public-form-wrap">
      <style>{buildFormCss("lnf-public", form.style)}</style>
      <div className="public-form-card lnf-public" style={{ background: st.background }}>
        <h2 style={{ fontSize: 24 }}>{form.title}</h2>
        {form.description && <p style={{ fontSize: 14, marginTop: 6, marginBottom: 22, opacity: 0.7 }}>{form.description}</p>}
        <form onSubmit={handleSubmit}>
          {(form.fields || []).map((f) => (
            <div className="form-group" key={f.id}>
              {f.type !== "checkbox" && <label>{f.label}{f.required && <span style={{ color: st.accent }}> *</span>}</label>}
              <FieldPreview f={f} value={values[f.id]} onChange={(v) => setValues({ ...values, [f.id]: v })} />
            </div>
          ))}
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : (form.submitLabel || "Submit")}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, opacity: 0.5 }}>
          Powered by <strong>Leadnator</strong>
        </div>
      </div>
    </div>
  );
}

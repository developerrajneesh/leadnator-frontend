import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FiArrowLeft, FiRefreshCw, FiEdit2, FiSave, FiArchive, FiEye,
  FiCheckCircle, FiAlertTriangle, FiExternalLink, FiPlay, FiX, FiSend,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { notify } from "../../globalComponents/Toast/Toast";
import { invalidateLeads } from "../../api/hooks";

const QUESTION_LABELS = {
  EMAIL: "Email", FIRST_NAME: "First name", LAST_NAME: "Last name", FULL_NAME: "Full name",
  PHONE: "Phone", CITY: "City", STATE: "State", COUNTRY: "Country", POST_CODE: "Postcode",
  STREET_ADDRESS: "Street address", DOB: "Date of birth", GENDER: "Gender",
  COMPANY_NAME: "Company name", JOB_TITLE: "Job title", WORK_EMAIL: "Work email",
  WORK_PHONE_NUMBER: "Work phone", CUSTOM: "Custom question",
};

export default function FormViewer() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const pageId = params.get("pageId") || "";
  const startInEdit = params.get("edit") === "1";
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(startInEdit);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await metaApi.leadForm(id, pageId || undefined);
      setForm(r.form);
      setName(r.form?.name || "");
      setStatus(r.form?.status || "");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    setSaving(true);
    try {
      await metaApi.updateLeadForm(id, { pageId, name, status });
      notify.success("Saved");
      setEditing(false);
      load();
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span className="skel skel-square" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
            <span className="skel skel-line" style={{ width: 280, height: 18, display: "block" }} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 14 }}>
          <span className="skel skel-line" style={{ width: 160, height: 14, display: "block", marginBottom: 12 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <span className="skel skel-line skel-line-sm" style={{ width: 90, display: "block", marginBottom: 6 }} />
                <span className="skel skel-line" style={{ width: 140 }} />
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px" }}><span className="skel skel-line" style={{ width: 140, height: 14 }} /></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Field</th><th>Label</th><th>Type</th><th>Required</th></tr></thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td><span className="skel skel-line" style={{ width: 170 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 55 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!form)   return null;

  const questions = form.questions || [];
  const tyPage = form.thank_you_page || {};
  // Meta exposes the privacy policy at either form.privacy_policy (older API
  // versions) or nested inside form.legal_content.privacy_policy (newer ones).
  const privacy = form.privacy_policy || form.legal_content?.privacy_policy || null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/meta/forms")}><FiArrowLeft /> Back</button>
        {editing ? (
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: 18, fontWeight: 700, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, minWidth: 280 }} />
        ) : (
          <h1 className="page-title" style={{ margin: 0, fontSize: 22 }}>{form.name}</h1>
        )}
        <span className={`badge ${form.status === "ACTIVE" ? "qualified" : form.status === "ARCHIVED" ? "contacted" : "lost"}`}>{form.status?.toLowerCase()}</span>

        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setTesting(true)} style={{ color: "#10b981", borderColor: "#bbf7d0" }}>
            <FiPlay /> Test form
          </button>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}><FiEdit2 /> Edit</button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => { setEditing(false); setName(form.name); setStatus(form.status); }}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}><FiSave /> {saving ? "Saving…" : "Save"}</button>
            </>
          )}
        </span>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: 14, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: 12, fontSize: 13, lineHeight: 1.5 }}>
          <FiAlertTriangle style={{ verticalAlign: "middle" }} /> Meta only allows editing <strong>name</strong> and <strong>status</strong> after creation. Questions, privacy policy, and thank-you page are locked once the form is saved.
        </div>
      )}

      {editing && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-header"><div className="card-title">Editable fields</div></div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2-equal" style={{ gap: 14 }}>
        {/* LEFT: form details */}
        <div className="card">
          <div className="card-header"><div className="card-title">Form details</div></div>
          <Detail label="ID" mono>{form.id}</Detail>
          <Detail label="Locale">{form.locale || "—"}</Detail>
          <Detail label="Total leads">{form.leads_count ?? 0}</Detail>
          <Detail label="Expired leads">{form.expired_leads_count ?? 0}</Detail>
          <Detail label="Created">{form.created_time ? new Date(form.created_time).toLocaleString("en-IN") : "—"}</Detail>
          <Detail label="Follow-up URL">
            {form.follow_up_action_url
              ? <a href={form.follow_up_action_url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>{form.follow_up_action_url} <FiExternalLink /></a>
              : "—"}
          </Detail>
          <Detail label="Privacy policy">
            {privacy?.url
              ? <a href={privacy.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{privacy.link_text || privacy.url}</a>
              : "—"}
          </Detail>
        </div>

        {/* RIGHT: phone-like preview */}
        <div className="card" style={{ background: "#f3f4f6" }}>
          <div className="card-header"><div className="card-title"><FiEye /> Preview</div></div>
          <div style={{
            background: "white", borderRadius: 16, padding: 18, maxWidth: 360, margin: "0 auto",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
          }}>
            <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginBottom: 6 }}>Sponsored by Meta Page</div>
            {form.context_card?.title && (
              <h3 style={{ margin: "8px 0 6px", fontSize: 16 }}>{form.context_card.title}</h3>
            )}
            {form.context_card?.content?.length > 0 && (
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>
                {form.context_card.content.join("\n\n")}
              </div>
            )}
            {form.question_page_custom_headline && (
              <h3 style={{ margin: "10px 0 8px", fontSize: 15 }}>{form.question_page_custom_headline}</h3>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {questions.length === 0
                ? <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No questions defined</div>
                : questions.map((q, i) => (
                    <div key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                        {QUESTION_LABELS[q.type] || q.type}
                      </div>
                      <div style={{
                        padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13,
                        color: "#9ca3af", background: "#fafafa",
                      }}>
                        {q.label || q.key || `Your ${(QUESTION_LABELS[q.type] || q.type).toLowerCase()}`}
                      </div>
                      {q.options?.length > 0 && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                          Options: {q.options.map((o) => o.value || o.key).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
            </div>

            {privacy?.url && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 12, padding: 8, background: "#f9fafb", borderRadius: 6 }}>
                By continuing, you agree to our <a href={privacy.url} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>{privacy.link_text || "Privacy Policy"}</a>.
              </div>
            )}

            <button style={{
              width: "100%", marginTop: 12, padding: "10px 14px",
              background: "#1877f2", color: "white", border: "none", borderRadius: 6,
              fontWeight: 700, fontSize: 14, cursor: "default",
            }}>Submit</button>

            {tyPage.title && (
              <div style={{ marginTop: 14, padding: 10, border: "1px dashed #d1d5db", borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>
                  <FiCheckCircle /> THANK-YOU SCREEN
                </div>
                <strong style={{ fontSize: 14 }}>{tyPage.title}</strong>
                {tyPage.body && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{tyPage.body}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw questions JSON (read-only since Meta locks it) */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}>
          Raw questions JSON ({questions.length})
        </summary>
        <pre style={{
          background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 8,
          fontSize: 11, lineHeight: 1.5, overflow: "auto", marginTop: 6,
        }}>{JSON.stringify(questions, null, 2)}</pre>
      </details>

      {testing && (
        <TestFormModal
          form={form}
          questions={questions}
          pageId={pageId}
          onClose={() => { setTesting(false); load(); }}
        />
      )}
    </>
  );
}

/* ---------- Test-form modal ---------- */

// Map Meta's question TYPE → the lowercase field name `test_leads` expects.
// Anything not listed falls through with the type lowercased.
const TYPE_TO_FIELD = {
  EMAIL: "email",
  FULL_NAME: "full_name",
  FIRST_NAME: "first_name",
  LAST_NAME: "last_name",
  PHONE: "phone_number",
  WORK_PHONE_NUMBER: "phone_number",
  WORK_EMAIL: "work_email",
  CITY: "city",
  STATE: "state",
  COUNTRY: "country",
  POST_CODE: "zip_code",
  STREET_ADDRESS: "street_address",
  DOB: "date_of_birth",
  GENDER: "gender",
  COMPANY_NAME: "company_name",
  JOB_TITLE: "job_title",
};

function metaFieldName(q) {
  if (q.type === "CUSTOM") return q.key || q.label || "custom";
  return TYPE_TO_FIELD[q.type] || (q.type || "").toLowerCase();
}

function TestFormModal({ form, questions, pageId, onClose }) {
  const archived = form.status === "ARCHIVED";

  const initial = {};
  for (const q of questions) {
    initial[metaFieldName(q)] = sample(q.type);
  }
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (archived) {
      setResult({ ok: false, message: "This form is ARCHIVED — Meta refuses test leads on archived forms. Reactivate the form (or create a new one) to test it." });
      return;
    }
    setBusy(true); setResult(null);
    try {
      const fieldData = Object.entries(values)
        .filter(([, v]) => v !== "" && v != null)
        .map(([name, v]) => ({ name, values: [String(v)] }));
      if (!fieldData.length) { notify.warn("Fill in at least one field."); setBusy(false); return; }
      const r = await metaApi.testLeadForm(form.id, { pageId, fieldData });
      setResult({ ok: true, id: r.testLead?.id, localLeadId: r.localLeadId });
      if (r.localLeadId) invalidateLeads(); // next visit to /leads/all refetches
      notify.success("Test lead submitted to Meta ✓ and added to your CRM");
    } catch (err) {
      const m = err.message || "";
      // Meta's "Failed to create test lead for the specified lead gen form" is
      // almost always one of these — surface a clearer hint.
      let hint = m;
      if (/lead gen form/i.test(m)) {
        hint = `${m}\n\nCommon causes:\n• The form is ARCHIVED (only ACTIVE forms accept test leads)\n• A required question is missing a value\n• Field name mismatch — check the field key shown next to each label\n• Your access token lacks 'pages_manage_ads' permission`;
      }
      setResult({ ok: false, message: hint });
      notify.error(m || "Test failed");
    } finally { setBusy(false); }
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
        style={{ width: 540, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title"><FiPlay style={{ color: "#10b981" }} /> Test "{form.name}"</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        {archived ? (
          <div style={{ padding: 12, background: "#fee2e2", color: "#7f1d1d", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
            <strong>⚠ This form is ARCHIVED.</strong> Meta refuses test submissions on archived forms — even with valid data. To test, either reactivate the form (Edit → Status → ACTIVE) or create a fresh form.
          </div>
        ) : (
          <div style={{ padding: 10, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
            Submitting here creates a real test lead on Meta — it shows up in your Leads list tagged as test data. Use it to verify your fields, follow-up URL, and CRM webhook before going live.
          </div>
        )}

        {questions.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>This form has no questions configured.</div>
        ) : questions.map((q, i) => {
          const fieldName = metaFieldName(q);
          const labelText = q.label || q.key || prettyType(q.type);
          return (
            <div className="form-group" key={i}>
              <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {labelText} <span style={{ fontFamily: "monospace", fontSize: 10, color: "#9ca3af", marginLeft: 6 }}>({fieldName})</span>
              </label>
              <input
                value={values[fieldName] ?? ""}
                onChange={(e) => setValues((cur) => ({ ...cur, [fieldName]: e.target.value }))}
                placeholder={sample(q.type)}
              />
            </div>
          );
        })}

        {result && (
          <div style={{
            padding: 10, marginBottom: 12, borderRadius: 8, fontSize: 12,
            background: result.ok ? "#f0fdf4" : "#fef2f2",
            color:      result.ok ? "#166534" : "#b91c1c",
            border: `1px solid ${result.ok ? "#bbf7d0" : "#fecaca"}`,
            whiteSpace: "pre-wrap", lineHeight: 1.5,
          }}>
            {result.ok ? (
              <>
                ✓ Test lead created on Meta. ID: <code style={{ fontFamily: "monospace" }}>{result.id}</code>
                {result.localLeadId && (
                  <div style={{ marginTop: 4 }}>
                    ✓ Also added to your CRM — view it in <a href="/leads/all" style={{ color: "#166534", fontWeight: 700 }}>All leads</a>.
                  </div>
                )}
              </>
            ) : result.message}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 4 }}>
          <a
            href={`https://developers.facebook.com/tools/lead-ads-testing?id=${form.id}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <FiExternalLink /> Open Meta's official tester
          </a>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
            <button
              type="submit" className="btn btn-primary"
              disabled={busy || archived}
              style={{ background: archived ? "#9ca3af" : "#10b981", borderColor: archived ? "#9ca3af" : "#10b981" }}
              title={archived ? "Form is archived — Meta won't accept test leads" : ""}
            >
              <FiSend /> {busy ? "Submitting…" : archived ? "Disabled (archived)" : "Submit test lead"}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}

function sample(type) {
  return {
    EMAIL: "test@leadnator.com",
    WORK_EMAIL: "test@leadnator.com",
    FULL_NAME: "Test Lead",
    FIRST_NAME: "Test",
    LAST_NAME: "Lead",
    PHONE: "+919812345678",
    WORK_PHONE_NUMBER: "+919812345678",
    CITY: "Mumbai",
    STATE: "MH",
    COUNTRY: "IN",
    POST_CODE: "400001",
    STREET_ADDRESS: "123 Business Park",
    DOB: "1990-01-15",
    GENDER: "male",
    COMPANY_NAME: "Leadnator",
    JOB_TITLE: "Founder",
  }[type] || "test value";
}
function prettyType(t) {
  return (t || "").toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function Detail({ label, mono, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: "1px dashed var(--border)", fontSize: 13, gap: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: "var(--text-muted)", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
      <span style={{ textAlign: "right", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word", minWidth: 0 }}>{children}</span>
    </div>
  );
}

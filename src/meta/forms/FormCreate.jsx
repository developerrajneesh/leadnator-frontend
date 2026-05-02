import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiSave, FiPlus, FiX, FiInfo, FiEye, FiAlertTriangle,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { notify } from "../../globalComponents/Toast/Toast";

const QUESTION_TYPES = [
  { type: "EMAIL",         label: "Email" },
  { type: "FULL_NAME",     label: "Full name" },
  { type: "FIRST_NAME",    label: "First name" },
  { type: "LAST_NAME",     label: "Last name" },
  { type: "PHONE",         label: "Phone" },
  { type: "CITY",          label: "City" },
  { type: "STATE",         label: "State" },
  { type: "COUNTRY",       label: "Country" },
  { type: "POST_CODE",     label: "Postcode" },
  { type: "STREET_ADDRESS",label: "Street address" },
  { type: "DOB",           label: "Date of birth" },
  { type: "GENDER",        label: "Gender" },
  { type: "COMPANY_NAME",  label: "Company name" },
  { type: "JOB_TITLE",     label: "Job title" },
  { type: "WORK_EMAIL",    label: "Work email" },
  { type: "WORK_PHONE_NUMBER", label: "Work phone" },
  { type: "CUSTOM",        label: "Custom question" },
];

const LOCALES = ["en_US","en_GB","hi_IN","es_LA","pt_BR","ar_AR","id_ID","fr_FR"];

export default function FormCreate() {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [pageId, setPageId]   = useState("");
  const [name, setName]       = useState("");
  const [locale, setLocale]   = useState("en_US");
  const [intro, setIntro]     = useState("");
  const [headline, setHeadline] = useState("");
  const [contextTitle, setContextTitle]   = useState("");
  const [contextBody, setContextBody]     = useState("");
  const [privacyUrl, setPrivacyUrl]       = useState("");
  const [privacyText, setPrivacyText]     = useState("Privacy Policy");
  const [followUrl, setFollowUrl]         = useState("");
  const [tyTitle, setTyTitle]   = useState("Thanks!");
  const [tyBody, setTyBody]     = useState("We've received your details and will be in touch shortly.");
  const [tyButton, setTyButton] = useState("View website");
  const [questions, setQuestions] = useState([
    { type: "EMAIL" },
    { type: "FULL_NAME" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await metaApi.pages();
        const list = r?.pages?.data || r?.data || [];
        setPages(list);
        if (list.length === 1) setPageId(list[0].id);
      } catch (err) { notify.error(err.message); }
      finally { setPagesLoading(false); }
    })();
  }, []);

  function addQuestion(type) {
    if (questions.length >= 15) { notify.warn("Meta allows up to 15 questions per form."); return; }
    if (type === "CUSTOM") {
      setQuestions([...questions, { type: "CUSTOM", key: `custom_${questions.length + 1}`, label: "Your question" }]);
    } else {
      if (questions.some((q) => q.type === type)) { notify.warn(`${type} already added.`); return; }
      setQuestions([...questions, { type }]);
    }
  }
  function patchQuestion(i, patch) { setQuestions(questions.map((q, j) => j === i ? { ...q, ...patch } : q)); }
  function removeQuestion(i) { setQuestions(questions.filter((_, j) => j !== i)); }

  async function submit(e) {
    e.preventDefault();
    if (!pageId) { notify.warn("Pick a Facebook Page."); return; }
    if (!name.trim()) { notify.warn("Form name is required."); return; }
    if (!privacyUrl.trim() || !/^https?:\/\//i.test(privacyUrl)) { notify.warn("A public Privacy Policy URL is required."); return; }
    if (questions.length === 0) { notify.warn("Add at least one question."); return; }

    setSaving(true);
    try {
      const body = {
        pageId,
        name: name.trim(),
        locale,
        questions: questions.map((q) => {
          if (q.type === "CUSTOM") return { type: "CUSTOM", key: q.key || `custom_${Math.random().toString(36).slice(2, 6)}`, label: q.label || "Question" };
          return { type: q.type };
        }),
        privacy_policy: { url: privacyUrl.trim(), link_text: privacyText.trim() || "Privacy Policy" },
        ...(followUrl ? { follow_up_action_url: followUrl.trim() } : {}),
        ...(headline ? { question_page_custom_headline: headline.trim() } : {}),
        ...(contextTitle || contextBody ? {
          context_card: {
            ...(contextTitle ? { title: contextTitle } : {}),
            ...(contextBody  ? { content: contextBody.split("\n").filter(Boolean) } : {}),
          },
        } : {}),
        thank_you_page: {
          title: tyTitle || "Thanks!",
          body:  tyBody  || "",
          button_text: tyButton || "Done",
          button_type: followUrl ? "VIEW_WEBSITE" : "VIEW_WEBSITE",
          ...(followUrl ? { website_url: followUrl } : {}),
        },
      };
      const r = await metaApi.createLeadForm(body);
      notify.success(`Form "${name}" created`);
      navigate(`/meta/forms/${r.form.id}?pageId=${pageId}`);
    } catch (err) { notify.error(err.message || "Create failed"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/meta/forms")}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0, fontSize: 22 }}>New lead form</h1>
        <span style={{ marginLeft: "auto" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave /> {saving ? "Creating…" : "Create form"}
          </button>
        </span>
      </div>

      <div style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, marginBottom: 14, lineHeight: 1.5, display: "flex", gap: 8 }}>
        <FiAlertTriangle style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Once created, only the name & status can be edited.</strong> Meta locks questions, privacy policy, and thank-you page after the form is saved — be sure they're right before clicking Create.
        </div>
      </div>

      <div className="grid-2-equal" style={{ gap: 14 }}>
        {/* LEFT — config */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title"><FiInfo /> Basics</div></div>

            <div className="form-group">
              <label>Facebook Page *</label>
              {pagesLoading ? (
                <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
              ) : (
                <select value={pageId} onChange={(e) => setPageId(e.target.value)} required>
                  <option value="">— Select page —</option>
                  {pages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              )}
            </div>

            <div className="grid-2-equal">
              <div className="form-group">
                <label>Form name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Q4 lead capture" />
              </div>
              <div className="form-group">
                <label>Locale</label>
                <select value={locale} onChange={(e) => setLocale(e.target.value)}>
                  {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title">Intro screen (context card)</div></div>
            <div className="form-group">
              <label>Title (optional)</label>
              <input value={contextTitle} onChange={(e) => setContextTitle(e.target.value)} placeholder="Get a free quote" />
            </div>
            <div className="form-group">
              <label>Body (one paragraph per line)</label>
              <textarea rows={3} value={contextBody} onChange={(e) => setContextBody(e.target.value)} placeholder="Tell us about your needs.\nWe'll send you a custom plan." style={{ fontFamily: "inherit", fontSize: 13 }} />
            </div>
            <div className="form-group">
              <label>Question-page headline (optional)</label>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Tell us about you" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div className="card-title">Questions ({questions.length} / 15)</div>
              <select onChange={(e) => { if (e.target.value) { addQuestion(e.target.value); e.target.value = ""; } }} style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                <option value="">+ Add question…</option>
                {QUESTION_TYPES.map((q) => <option key={q.type} value={q.type}>{q.label}</option>)}
              </select>
            </div>
            {questions.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>No questions yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, border: "1px solid var(--border)", borderRadius: 8, background: "#fafbfc" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#7c3aed", color: "white", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "#eef2ff", color: "#4338ca", fontWeight: 700, textTransform: "uppercase" }}>
                      {QUESTION_TYPES.find((t) => t.type === q.type)?.label || q.type}
                    </span>
                    {q.type === "CUSTOM" ? (
                      <input
                        value={q.label || ""}
                        onChange={(e) => patchQuestion(i, { label: e.target.value })}
                        placeholder="Your question"
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>(prefilled from user's profile)</span>
                    )}
                    <button type="button" className="admin-action danger" onClick={() => removeQuestion(i)}><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title">Privacy policy *</div></div>
            <div className="form-group">
              <label>URL *</label>
              <input type="url" value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} required placeholder="https://your-site.com/privacy" />
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Meta requires a public privacy policy URL.</div>
            </div>
            <div className="form-group">
              <label>Link text</label>
              <input value={privacyText} onChange={(e) => setPrivacyText(e.target.value)} placeholder="Privacy Policy" />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Thank-you screen</div></div>
            <div className="form-group">
              <label>Title</label>
              <input value={tyTitle} onChange={(e) => setTyTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Body</label>
              <textarea rows={2} value={tyBody} onChange={(e) => setTyBody(e.target.value)} style={{ fontFamily: "inherit", fontSize: 13 }} />
            </div>
            <div className="grid-2-equal">
              <div className="form-group">
                <label>Button label</label>
                <input value={tyButton} onChange={(e) => setTyButton(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Follow-up URL</label>
                <input type="url" value={followUrl} onChange={(e) => setFollowUrl(e.target.value)} placeholder="https://your-site.com/thanks" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — live preview */}
        <div>
          <div className="card" style={{ background: "#f3f4f6", position: "sticky", top: 12 }}>
            <div className="card-header"><div className="card-title"><FiEye /> Live preview</div></div>
            <div style={{
              background: "white", borderRadius: 16, padding: 18, maxWidth: 360, margin: "0 auto",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
            }}>
              <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginBottom: 6 }}>
                Sponsored by {pages.find((p) => p.id === pageId)?.name || "Your Page"}
              </div>
              {contextTitle && <h3 style={{ margin: "8px 0 6px", fontSize: 16 }}>{contextTitle}</h3>}
              {contextBody && (
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 8, whiteSpace: "pre-wrap" }}>
                  {contextBody}
                </div>
              )}
              {headline && <h3 style={{ margin: "10px 0 8px", fontSize: 15 }}>{headline}</h3>}

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                      {QUESTION_TYPES.find((t) => t.type === q.type)?.label || q.type}
                    </div>
                    <div style={{
                      padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13,
                      color: "#9ca3af", background: "#fafafa",
                    }}>
                      {q.label || `Your ${(QUESTION_TYPES.find((t) => t.type === q.type)?.label || q.type).toLowerCase()}`}
                    </div>
                  </div>
                ))}
              </div>

              {privacyUrl && (
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 12, padding: 8, background: "#f9fafb", borderRadius: 6 }}>
                  By continuing, you agree to our <span style={{ color: "#7c3aed" }}>{privacyText || "Privacy Policy"}</span>.
                </div>
              )}

              <button type="button" disabled style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "#1877f2", color: "white", border: "none", borderRadius: 6,
                fontWeight: 700, fontSize: 14, cursor: "default", opacity: 0.95,
              }}>Submit</button>

              <div style={{ marginTop: 14, padding: 10, border: "1px dashed #d1d5db", borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>THANK-YOU SCREEN</div>
                <strong style={{ fontSize: 14 }}>{tyTitle}</strong>
                {tyBody && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{tyBody}</div>}
                <button type="button" disabled style={{
                  width: "100%", marginTop: 10, padding: "8px 12px",
                  background: "white", color: "#1877f2", border: "1px solid #1877f2",
                  borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "default",
                }}>{tyButton || "Done"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

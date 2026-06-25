import { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiEye, FiCode,
  FiCopy, FiShare2, FiSend, FiArrowLeft, FiEdit2, FiExternalLink, FiFileText, FiInbox,
} from "react-icons/fi";
import { copyText } from "../utils";
import { api } from "../../api/client";
import FieldPreview from "./components/FieldPreview";
import ShareModal from "./components/ShareModal";
import { DEFAULT_STYLE, FONTS, buildFormCss } from "./formStyle";

const FIELD_TYPES = [
  { type: "text",     label: "Short text", icon: "Aa" },
  { type: "email",    label: "Email",      icon: "@" },
  { type: "phone",    label: "Phone",      icon: "☎" },
  { type: "number",   label: "Number",     icon: "123" },
  { type: "textarea", label: "Long text",  icon: "¶" },
  { type: "select",   label: "Dropdown",   icon: "▾" },
  { type: "radio",    label: "Radio",      icon: "◉" },
  { type: "checkbox", label: "Checkbox",   icon: "☑" },
  { type: "date",     label: "Date",       icon: "📅" },
];

const STYLE_PRESETS = [
  { name: "Purple",  style: { accent: "#7c3aed", buttonText: "#ffffff", background: "#ffffff", text: "#111827" } },
  { name: "Ocean",   style: { accent: "#0ea5e9", buttonText: "#ffffff", background: "#f0f9ff", text: "#0f172a" } },
  { name: "Emerald", style: { accent: "#059669", buttonText: "#ffffff", background: "#ffffff", text: "#111827" } },
  { name: "Sunset",  style: { accent: "#f97316", buttonText: "#ffffff", background: "#fff7ed", text: "#1f2937" } },
  { name: "Dark",    style: { accent: "#a78bfa", buttonText: "#0f172a", background: "#1e293b", text: "#e2e8f0" } },
];

function ColorRow({ label, value, onChange }) {
  return (
    <div className="form-group" style={{ margin: 0 }}>
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: 40, height: 34, padding: 2, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }} />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, fontFamily: "monospace", fontSize: 12 }} />
      </div>
    </div>
  );
}

function defaultField(type) {
  const base = {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: { text: "Full name", email: "Email address", phone: "Phone number",
      number: "Number", textarea: "Message", select: "Choose an option",
      radio: "Pick one", checkbox: "I agree", date: "Date" }[type] || "Field",
    placeholder: { text: "Jane Doe", email: "jane@example.com", phone: "+91 98xxxxxxxx",
      number: "0", textarea: "Tell us more…" }[type] || "",
    required: type !== "checkbox",
  };
  if (type === "select" || type === "radio") base.options = ["Option 1", "Option 2", "Option 3"];
  return base;
}

function buildHtml(title, description, fields, submitLabel, style) {
  const parts = [];
  parts.push(`<style>\n${buildFormCss("leadnator-form", style)}\n</style>`);
  parts.push(`<form class="leadnator-form">`);
  parts.push(`  <h2>${title}</h2>`);
  if (description) parts.push(`  <p>${description}</p>`);
  fields.forEach((f) => {
    parts.push(`  <div class="field">`);
    if (f.type !== "checkbox") parts.push(`    <label for="${f.id}">${f.label}${f.required ? ' <span style="color:#ef4444">*</span>' : ""}</label>`);
    if (f.type === "textarea") parts.push(`    <textarea id="${f.id}" name="${f.id}" placeholder="${f.placeholder}"${f.required ? " required" : ""}></textarea>`);
    else if (f.type === "select") {
      parts.push(`    <select id="${f.id}" name="${f.id}"${f.required ? " required" : ""}>`);
      parts.push(`      <option value="">— Select —</option>`);
      (f.options || []).forEach((o) => parts.push(`      <option>${o}</option>`));
      parts.push(`    </select>`);
    } else if (f.type === "radio") {
      (f.options || []).forEach((o, i) => parts.push(`    <label><input type="radio" name="${f.id}" value="${o}"${f.required && i === 0 ? " required" : ""}/> ${o}</label>`));
    } else if (f.type === "checkbox") parts.push(`    <label><input type="checkbox" name="${f.id}"${f.required ? " required" : ""}/> ${f.label}</label>`);
    else {
      const t = f.type === "phone" ? "tel" : f.type;
      parts.push(`    <input type="${t}" id="${f.id}" name="${f.id}" placeholder="${f.placeholder}"${f.required ? " required" : ""}/>`);
    }
    parts.push(`  </div>`);
  });
  parts.push(`  <button type="submit">${submitLabel}</button>`);
  parts.push(`</form>`);
  return parts.join("\n");
}

function FormBuilder({ initialForm, onBack }) {
  const editing = !!initialForm;
  const [formId] = useState(() => initialForm?.formId || `f${Math.random().toString(36).slice(2, 10)}`);
  const [title, setTitle] = useState(initialForm?.title ?? "Get in touch");
  const [description, setDescription] = useState(initialForm?.description ?? "Fill in the form below and we'll reply within 24 hours.");
  const [submitLabel, setSubmitLabel] = useState(initialForm?.submitLabel ?? "Submit");
  const [fields, setFields] = useState(() =>
    initialForm?.fields?.length ? initialForm.fields : [defaultField("text"), defaultField("email"), defaultField("textarea")]
  );
  const [style, setStyle] = useState(() => ({ ...DEFAULT_STYLE, ...(initialForm?.style || {}) }));
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState("preview");
  const [sharing, setSharing] = useState(false);
  const [published, setPublished] = useState(editing);
  const [publishing, setPublishing] = useState(false);

  const selected = fields.find((f) => f.id === selectedId);
  const setStyleField = (patch) => setStyle((s) => ({ ...s, ...patch }));

  function addField(type) {
    const f = defaultField(type);
    setFields([...fields, f]);
    setSelectedId(f.id);
  }
  function updateField(id, patch) { setFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f))); }
  function removeField(id) { setFields(fields.filter((f) => f.id !== id)); if (selectedId === id) setSelectedId(null); }
  function move(id, dir) {
    const idx = fields.findIndex((f) => f.id === id);
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const copy = [...fields];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setFields(copy);
  }
  async function publish() {
    setPublishing(true);
    try {
      await api.forms.publish({ formId, title, description, submitLabel, fields, style });
      setPublished(true);
      setSharing(true);
    } catch (err) {
      alert(err.message || "Failed to publish form");
    } finally {
      setPublishing(false);
    }
  }

  const html = buildHtml(title, description, fields, submitLabel, style);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <button className="btn btn-ghost" onClick={onBack}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0 }}>{editing ? "Edit form" : "Create form"}</h1>
      </div>
      <p className="page-subtitle">Build a custom form, style it, then publish to get a shareable link & embed.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {published ? <>Form ID: <code style={{ background: "#eef2ff", color: "#4338ca", padding: "2px 6px", borderRadius: 4 }}>{formId}</code> · published</>
            : <>Design your form, then click <strong>Publish & share</strong> to get a link.</>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {published && <button className="btn btn-outline" onClick={() => setSharing(true)}><FiShare2 /> Share link</button>}
          <button className="btn btn-primary" onClick={publish} disabled={fields.length === 0 || publishing}>
            <FiSend /> {publishing ? "Publishing…" : published ? "Re-publish" : "Publish & share"}
          </button>
        </div>
      </div>

      <div className="form-gen">
        <div className="form-gen-left">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title"><FiPlus /> Add a field</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {FIELD_TYPES.map((ft) => (
                <button key={ft.type} className="field-chip" onClick={() => addField(ft.type)}>
                  <span className="field-chip-icon">{ft.icon}</span>
                  <span>{ft.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>
              Fields ({fields.length})
            </div>
            {fields.length === 0 && <div className="empty" style={{ padding: 24 }}>No fields yet.</div>}
            {fields.map((f, i) => (
              <div key={f.id} className={`field-row ${selectedId === f.id ? "active" : ""}`} onClick={() => setSelectedId(f.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{FIELD_TYPES.find((t) => t.type === f.type)?.label}{f.required && " · required"}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <button className="mini-btn" onClick={() => move(f.id, -1)} disabled={i === 0}><FiArrowUp /></button>
                  <button className="mini-btn" onClick={() => move(f.id, 1)} disabled={i === fields.length - 1}><FiArrowDown /></button>
                  <button className="mini-btn danger" onClick={() => removeField(f.id)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="card-header"><div className="card-title">Edit field</div></div>
              <div className="form-group">
                <label>Label</label>
                <input value={selected.label} onChange={(e) => updateField(selected.id, { label: e.target.value })} />
              </div>
              {!["checkbox", "radio", "select", "date"].includes(selected.type) && (
                <div className="form-group">
                  <label>Placeholder</label>
                  <input value={selected.placeholder || ""} onChange={(e) => updateField(selected.id, { placeholder: e.target.value })} />
                </div>
              )}
              {(selected.type === "select" || selected.type === "radio") && (
                <div className="form-group">
                  <label>Options (one per line)</label>
                  <textarea rows="4"
                    value={(selected.options || []).join("\n")}
                    onChange={(e) => updateField(selected.id, { options: e.target.value.split("\n").filter((o) => o.trim()) })}
                  />
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={!!selected.required} onChange={(e) => updateField(selected.id, { required: e.target.checked })} />
                Required field
              </label>
            </div>
          )}
        </div>

        <div className="form-gen-right">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title">Form details</div></div>
            <div className="form-group"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="form-group"><label>Description</label><textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Submit button label</label>
              <input value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title">🎨 Design & style</div></div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {STYLE_PRESETS.map((p) => (
                <button key={p.name} type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={() => setStyle((s) => ({ ...s, ...p.style }))}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: p.style.accent, marginRight: 6 }} />
                  {p.name}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ColorRow label="Accent / button" value={style.accent} onChange={(v) => setStyleField({ accent: v })} />
              <ColorRow label="Button text" value={style.buttonText} onChange={(v) => setStyleField({ buttonText: v })} />
              <ColorRow label="Background" value={style.background} onChange={(v) => setStyleField({ background: v })} />
              <ColorRow label="Text" value={style.text} onChange={(v) => setStyleField({ text: v })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Font</label>
                <select value={style.font} onChange={(e) => setStyleField({ font: e.target.value })}>
                  {Object.entries(FONTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Corner radius — {style.radius}px</label>
                <input type="range" min={0} max={24} value={style.radius}
                  onChange={(e) => setStyleField({ radius: Number(e.target.value) })} style={{ width: "100%" }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Field style</label>
                <select value={style.fieldStyle} onChange={(e) => setStyleField({ fieldStyle: e.target.value })}>
                  <option value="outline">Outlined</option>
                  <option value="filled">Filled</option>
                  <option value="underline">Underline</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Button style</label>
                <select value={style.buttonStyle} onChange={(e) => setStyleField({ buttonStyle: e.target.value })}>
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Alignment</label>
                <select value={style.align} onChange={(e) => setStyleField({ align: e.target.value })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setStyle(DEFAULT_STYLE)}>
                  Reset to default
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 4, background: "#f3f4f6", padding: 3, borderRadius: 8 }}>
                <button className={`tab-btn ${viewMode === "preview" ? "active" : ""}`} onClick={() => setViewMode("preview")}><FiEye /> Preview</button>
                <button className={`tab-btn ${viewMode === "code" ? "active" : ""}`} onClick={() => setViewMode("code")}><FiCode /> HTML code</button>
              </div>
              {viewMode === "code" && <button className="btn btn-primary" onClick={() => copyText(html)}><FiCopy /> Copy HTML</button>}
            </div>
            <div style={{ padding: 20 }}>
              {viewMode === "preview" ? (
                <>
                  <style>{buildFormCss("lnf-preview", style)}</style>
                  <form className="lnf-preview" onSubmit={(e) => { e.preventDefault(); alert("Form submitted (demo)"); }}>
                    <h2 style={{ marginBottom: 6 }}>{title}</h2>
                    {description && <p style={{ fontSize: 13, marginBottom: 18, opacity: 0.7 }}>{description}</p>}
                    {fields.map((f) => (
                      <div className="form-group" key={f.id}>
                        {f.type !== "checkbox" && <label>{f.label}{f.required && <span style={{ color: style.accent }}> *</span>}</label>}
                        <FieldPreview f={f} />
                      </div>
                    ))}
                    <button type="submit">{submitLabel}</button>
                  </form>
                </>
              ) : (
                <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: 16, borderRadius: 10, fontSize: 12, lineHeight: 1.6, overflow: "auto", margin: 0, fontFamily: "monospace" }}>{html}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {sharing && <ShareModal formId={formId} title={title} onClose={() => setSharing(false)} />}
    </>
  );
}

/* --------------------------- Forms list --------------------------- */
function timeAgo(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

function FormsList({ onNew, onEdit }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.forms.list().then((r) => setForms(r.forms || [])).catch(() => setForms([])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(formId) {
    if (!confirm("Delete this form? Its share link will stop working.")) return;
    try { await api.forms.remove(formId); load(); }
    catch (err) { alert(err.message || "Failed to delete"); }
  }
  function copyLink(formId) {
    copyText(`${window.location.origin}/form/${formId}`);
    alert("Share link copied!");
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Forms</h1>
          <p className="page-subtitle">Create shareable, embeddable forms. Submissions can trigger Autopilot flows.</p>
        </div>
        <button className="btn btn-primary" onClick={onNew}><FiPlus /> Create form</button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 28, color: "var(--text-muted)" }}>Loading your forms…</div>
      ) : forms.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <FiFileText style={{ fontSize: 34, color: "var(--border)", marginBottom: 12 }} />
          <h3 style={{ margin: "0 0 6px" }}>No forms yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 18 }}>Build your first form — add fields, style it, and share the link or embed it.</p>
          <button className="btn btn-primary" onClick={onNew}><FiPlus /> Create form</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {forms.map((f) => (
            <div key={f.formId} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.title || "Untitled form"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Updated {timeAgo(f.updatedAt)}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4338ca", background: "#eef2ff", padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  <FiInbox size={12} /> {f.submissions}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{f.fields} field{f.fields === 1 ? "" : "s"}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => onEdit(f.formId)}><FiEdit2 /> Edit</button>
                <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => copyLink(f.formId)}><FiCopy /> Link</button>
                <a className="btn btn-outline" style={{ fontSize: 12 }} href={`/form/${f.formId}`} target="_blank" rel="noreferrer"><FiExternalLink /> Open</a>
                <button className="btn btn-ghost" style={{ fontSize: 12, color: "#dc2626", marginLeft: "auto" }} onClick={() => remove(f.formId)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function Form() {
  const [view, setView] = useState("list");   // "list" | "builder"
  const [editing, setEditing] = useState(null); // form object when editing, null when new
  const [loadingForm, setLoadingForm] = useState(false);

  function openNew() { setEditing(null); setView("builder"); }
  async function openEdit(formId) {
    setLoadingForm(true);
    try {
      const r = await api.forms.get(formId);
      setEditing(r.form);
      setView("builder");
    } catch (err) {
      alert(err.message || "Could not open form");
    } finally { setLoadingForm(false); }
  }
  function back() { setEditing(null); setView("list"); }

  if (loadingForm) return <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading form…</p>;
  if (view === "builder") return <FormBuilder initialForm={editing} onBack={back} />;
  return <FormsList onNew={openNew} onEdit={openEdit} />;
}

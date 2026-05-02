import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiRefreshCw, FiZap, FiBookOpen, FiTrash2 } from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { aiApi } from "../../api/meta";
import { notify } from "../../globalComponents/Toast/Toast";
import TemplateLibrary from "./TemplateLibrary";
import TemplateView from "./TemplateView";

const CATEGORIES = ["MARKETING", "UTILITY", "AUTHENTICATION"];

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ name: "", language: "en_US", category: "MARKETING", header: "", body: "", footer: "", buttons: [] });
  const [aiBusy, setAiBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function handleDelete(t, e) {
    e.stopPropagation();
    if (!confirm(`Delete template "${t.name}"? This removes it from Meta — cannot be undone.`)) return;
    setDeletingId(t.id || t.name);
    try {
      await waApi.deleteTemplate(t.name, t.id);
      setTemplates((list) => list.filter((x) => (x.id || x.name) !== (t.id || t.name)));
      notify.success(`Template "${t.name}" deleted`);
    } catch (err) {
      notify.error(err.message || "Delete failed");
    } finally { setDeletingId(""); }
  }

  function importExample(ex) {
    setForm({
      name: ex.name,
      language: ex.language || "en_US",
      category: ex.category || "MARKETING",
      header: "",
      body: ex.body,
      footer: "",
      buttons: Array.isArray(ex.buttons) ? ex.buttons.map((b) => ({ ...b })) : [],
    });
    setShowLibrary(false);
    setShowAdd(true);
  }

  function addButton(type) {
    if ((form.buttons || []).length >= 3) return;
    const next = { type, text: "" };
    if (type === "URL") next.url = "";
    if (type === "PHONE_NUMBER") next.phone_number = "";
    if (type === "COPY_CODE") next.example = [""];
    setForm({ ...form, buttons: [...(form.buttons || []), next] });
  }
  function updateButton(i, patch) {
    setForm({ ...form, buttons: form.buttons.map((b, idx) => idx === i ? { ...b, ...patch } : b) });
  }
  function removeButton(i) {
    setForm({ ...form, buttons: form.buttons.filter((_, idx) => idx !== i) });
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await waApi.templates();
      setTemplates(res.templates || []);
    } catch (err) {
      setError(err.message || "Failed to load templates. Make sure WABA ID is set in WhatsApp Settings.");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true); setCreateError("");
    try {
      await waApi.createTemplate(form);
      setShowAdd(false);
      setForm({ name: "", language: "en_US", category: "MARKETING", header: "", body: "", footer: "", buttons: [] });
      await load();
    } catch (err) {
      setCreateError(err.message || "Template creation failed.");
    } finally { setCreating(false); }
  }

  async function aiBody() {
    setAiBusy(true);
    try {
      const res = await aiApi.generate({
        type: "ad",
        brief: { product: "Leadnator", goal: "promote a campaign", cta: "Reply YES to learn more" },
      });
      setForm((f) => ({ ...f, body: res.content || f.body }));
    } catch (err) { alert(err.message); }
    finally { setAiBusy(false); }
  }

  return (
    <>
      <h1 className="page-title">WhatsApp Templates</h1>
      <p className="page-subtitle">Pre-approved message templates from your WhatsApp Business Account.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-outline" onClick={() => setShowLibrary(true)}><FiBookOpen /> Browse library</button>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiPlus /> New template</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
          <button onClick={() => navigate("/whatsapp/settings")} className="btn btn-ghost" style={{ marginLeft: 8 }}>Go to settings</button>
        </div>
      )}

      {loading ? (
        <TemplatesSkeleton />
      ) : templates.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No templates yet. Create one to get started.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Name</th><th>Category</th><th>Language</th><th>Status</th>
                <th>Body preview</th><th style={{ width: 100, textAlign: "right" }}>Actions</th>
              </tr></thead>
              <tbody>
                {templates.map((t) => {
                  const body = (t.components || []).find((c) => c.type === "BODY");
                  const key = t.id || t.name;
                  return (
                    <tr
                      key={key}
                      onClick={() => setViewing(t)}
                      style={{ cursor: "pointer" }}
                      title="Click to view template"
                    >
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.category}</td>
                      <td>{t.language}</td>
                      <td>
                        <span className={`badge ${t.status === "APPROVED" ? "qualified" : t.status === "REJECTED" ? "lost" : "contacted"}`}>
                          {t.status?.toLowerCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {body?.text || "—"}
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                        <button
                          className="admin-action danger"
                          onClick={(e) => handleDelete(t, e)}
                          disabled={deletingId === key}
                          title={`Delete "${t.name}"`}
                        >
                          <FiTrash2 /> {deletingId === key ? "…" : ""}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewing && (
        <TemplateView template={viewing} onClose={() => setViewing(null)} />
      )}

      {showLibrary && (
        <TemplateLibrary onClose={() => setShowLibrary(false)} onPick={importExample} />
      )}

      {/* placeholder for modals below */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleCreate} className="card" style={{ width: 560, maxWidth: "92vw", maxHeight: "90vh", overflow: "auto" }}>
            <div className="card-header">
              <div className="card-title">New WhatsApp template</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setShowLibrary(true); }}>
                  <FiBookOpen /> Library
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setCreateError(""); }}>×</button>
              </div>
            </div>

            {createError && (
              <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                <strong>Meta rejected this template:</strong><br />{createError}
              </div>
            )}

            <div className="form-group">
              <label>Template name * (lowercase, snake_case)</label>
              <input required pattern="[a-z0-9_]+" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="welcome_offer" />
            </div>

            <div className="grid-2-equal">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  {["en_US","en_GB","hi","es","ar","pt_BR","id","fr"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Header (optional)</label>
              <input value={form.header} onChange={(e) => setForm({ ...form, header: e.target.value })} maxLength="60" placeholder="Hello from Leadnator" />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Body * (use {"{{1}}"}, {"{{2}}"} for variables)</label>
                <button type="button" className="btn btn-ghost" onClick={aiBody} disabled={aiBusy}><FiZap /> {aiBusy ? "…" : "AI"}</button>
              </div>
              <textarea required rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength="1024"
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>

            <div className="form-group">
              <label>Footer (optional)</label>
              <input value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} maxLength="60" />
            </div>

            {/* Buttons / CTAs */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ margin: 0 }}>Buttons (optional, max 3)</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-ghost" disabled={(form.buttons || []).length >= 3} onClick={() => addButton("URL")} title="Visit website">🔗 URL</button>
                  <button type="button" className="btn btn-ghost" disabled={(form.buttons || []).length >= 3} onClick={() => addButton("PHONE_NUMBER")} title="Call phone">📞 Call</button>
                  <button type="button" className="btn btn-ghost" disabled={(form.buttons || []).length >= 3} onClick={() => addButton("COPY_CODE")} title="Copy code">📋 Code</button>
                  <button type="button" className="btn btn-ghost" disabled={(form.buttons || []).length >= 3} onClick={() => addButton("QUICK_REPLY")} title="Quick reply">↩ Reply</button>
                </div>
              </div>

              {(form.buttons || []).length === 0 && (
                <div style={{ padding: 12, fontSize: 12, color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center" }}>
                  No buttons. Click a button type above to add a CTA.
                </div>
              )}
              {(form.buttons || []).length > 0 && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  ⚠️ Meta rules: button text can't contain emoji, variables, newlines, or markdown — they're auto-stripped before submitting.
                </div>
              )}

              {(form.buttons || []).map((b, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 6, background: "#e0f2fe", color: "#0369a1", textTransform: "uppercase", textAlign: "center" }}>
                    {b.type === "URL" ? "🔗 URL" : b.type === "PHONE_NUMBER" ? "📞 Call" : b.type === "COPY_CODE" ? "📋 Code" : "↩ Reply"}
                  </span>
                  <input
                    placeholder="Button text"
                    value={b.text || ""}
                    onChange={(e) => updateButton(i, { text: e.target.value })}
                    maxLength="25"
                    style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}
                  />
                  {b.type === "URL" && (
                    <input
                      placeholder="https://example.com"
                      value={b.url || ""}
                      onChange={(e) => updateButton(i, { url: e.target.value })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}
                    />
                  )}
                  {b.type === "PHONE_NUMBER" && (
                    <input
                      placeholder="+919876543210"
                      value={b.phone_number || ""}
                      onChange={(e) => updateButton(i, { phone_number: e.target.value })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "monospace" }}
                    />
                  )}
                  {b.type === "COPY_CODE" && (
                    <input
                      placeholder="WELCOME50"
                      value={(b.example?.[0]) || ""}
                      onChange={(e) => updateButton(i, { example: [e.target.value] })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "monospace" }}
                    />
                  )}
                  {b.type === "QUICK_REPLY" && <div />}
                  <button type="button" onClick={() => removeButton(i)} title="Remove" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "#b91c1c", padding: 8 }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? "Submitting…" : "Submit for review"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* ---------- Skeleton shown while the API call is in flight ---------- */
function TemplatesSkeleton() {
  const rows = 6;
  const cols = [
    { width: "30%" },   // Name
    { width: "12%" },   // Category
    { width: "10%" },   // Language
    { width: "14%" },   // Status badge
    { width: "24%" },   // Body preview
    { width: "10%", align: "right" }, // Actions
  ];
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Name</th><th>Category</th><th>Language</th><th>Status</th>
            <th>Body preview</th><th style={{ width: 100, textAlign: "right" }}>Actions</th>
          </tr></thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {cols.map((c, i) => (
                  <td key={i} style={{ textAlign: c.align || "left" }}>
                    <div style={{
                      display: "inline-block",
                      width: c.width,
                      height: 14,
                      background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                      backgroundSize: "200% 100%",
                      borderRadius: 6,
                      animation: "skeleton-shimmer 1.3s ease-in-out infinite",
                    }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FiMail, FiSave, FiRotateCcw, FiSend, FiEye, FiCode, FiCheckCircle } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

// Sample context so the preview renders {{variables}} with realistic values.
const SAMPLE = {
  user: { name: "Aman Sharma", email: "aman@example.com", phone: "+91 90000 00000" },
  trialDays: 2,
  resetLink: "https://app.leadnator.com/reset-password/sample",
  appUrl: "https://app.leadnator.com",
  plan: { name: "Pro" }, amount: 1999, months: 1, expiresAt: "1 July 2026",
  booking: { title: "Demo call", when: "Mon, 1 Jul 2026, 3:00 PM", host: "Your Team", meetLink: "https://meet.google.com/sample" },
};

function render(str) {
  return String(str || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, p) => {
    const v = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), SAMPLE);
    return v == null ? "" : String(v);
  });
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [draft, setDraft] = useState(null); // { subject, html, enabled }
  const [tab, setTab] = useState("preview"); // preview | code
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await api.admin.emailTemplates();
      setTemplates(r.templates || []);
      if (r.templates?.length) selectTemplate(r.templates[0]);
    } catch (e) { notify.error(e.message || "Failed to load templates"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function selectTemplate(t) {
    setActiveKey(t.key);
    setDraft({ subject: t.subject, html: t.html, enabled: t.enabled !== false });
  }

  const active = templates.find((t) => t.key === activeKey);

  async function save() {
    if (!active) return;
    setSaving(true);
    try {
      const r = await api.admin.updateEmailTemplate(active.key, draft);
      setTemplates((list) => list.map((t) => t.key === active.key ? { ...t, ...r.template } : t));
      notify.success("Template saved");
    } catch (e) { notify.error(e.message || "Save failed"); }
    finally { setSaving(false); }
  }

  async function reset() {
    if (!active || !confirm("Reset this template to the default content?")) return;
    setSaving(true);
    try {
      const r = await api.admin.resetEmailTemplate(active.key);
      setTemplates((list) => list.map((t) => t.key === active.key ? { ...t, ...r.template } : t));
      setDraft({ subject: r.template.subject, html: r.template.html, enabled: r.template.enabled !== false });
      notify.success("Reset to default");
    } catch (e) { notify.error(e.message || "Reset failed"); }
    finally { setSaving(false); }
  }

  async function sendTest() {
    if (!active) return;
    const to = prompt("Send a test of this email to:", "");
    if (!to) return;
    try {
      const r = await api.admin.testEmailTemplate(active.key, to.trim());
      if (r.ok) notify.success(`Test sent to ${to} (${r.provider || "?"})`);
      else notify.warn(r.reason || r.error || "Test not sent (check RESEND_API_KEY)");
    } catch (e) { notify.error(e.message || "Test failed"); }
  }

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading templates…</div>;

  return (
    <>
      <h1 className="page-title">System email templates</h1>
      <p className="page-subtitle">Edit the emails Leadnator sends to users. Use variables like <code>{"{{user.name}}"}</code>, <code>{"{{user.email}}"}</code>, <code>{"{{user.phone}}"}</code>.</p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
        {/* Template list */}
        <div className="card" style={{ padding: 8, margin: 0 }}>
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTemplate(t)}
              style={{
                width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                background: t.key === activeKey ? "#f5f3ff" : "transparent",
                color: "inherit", borderRadius: 10, padding: "10px 12px", marginBottom: 2,
                display: "flex", alignItems: "center", gap: 9,
              }}
            >
              <FiMail style={{ color: t.enabled === false ? "#9ca3af" : "#7c3aed", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.key}</span>
              </span>
              {t.enabled === false && <span style={{ fontSize: 10, color: "#b45309", background: "#fef3c7", borderRadius: 6, padding: "1px 6px" }}>off</span>}
            </button>
          ))}
        </div>

        {/* Editor */}
        {active && draft && (
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header" style={{ flexWrap: "wrap", gap: 8 }}>
              <div className="card-title"><FiMail /> {active.name}</div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
                Enabled
              </label>
            </div>

            {active.description && <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -4 }}>{active.description}</p>}

            <div className="form-group">
              <label>Subject</label>
              <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
            </div>

            {/* Available variables */}
            {!!(active.vars || []).length && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Variables:&nbsp;
                {active.vars.map((v) => (
                  <code key={v} style={{ background: "#f1f5f9", borderRadius: 6, padding: "1px 6px", marginRight: 6, fontSize: 11 }}>{`{{${v}}}`}</code>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button className={`btn ${tab === "preview" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("preview")} style={{ fontSize: 13 }}><FiEye /> Preview</button>
              <button className={`btn ${tab === "code" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("code")} style={{ fontSize: 13 }}><FiCode /> HTML</button>
            </div>

            {tab === "code" ? (
              <textarea
                value={draft.html}
                onChange={(e) => setDraft({ ...draft, html: e.target.value })}
                spellCheck={false}
                style={{ width: "100%", minHeight: 340, fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.5, border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}
              />
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)", padding: "8px 12px", fontSize: 13 }}>
                  <strong>Subject:</strong> {render(draft.subject)}
                </div>
                <iframe
                  title="preview"
                  style={{ width: "100%", height: 420, border: "none", background: "#f6f7fb" }}
                  srcDoc={render(draft.html)}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={sendTest} disabled={saving}><FiSend /> Send test</button>
              <button className="btn btn-outline" onClick={reset} disabled={saving}><FiRotateCcw /> Reset to default</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : <><FiSave /> Save changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

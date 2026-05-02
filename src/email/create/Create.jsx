import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiSend, FiZap, FiSave } from "react-icons/fi";
import { emailApi } from "../../api/email";
import { aiApi } from "../../api/meta";

export default function Create() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "", body: "", templateId: "", recipientIds: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");

  // Signature state — saved server-side, controls per-campaign override
  const [sigSaved, setSigSaved] = useState(false);     // true if a non-empty signature exists
  const [sigDefault, setSigDefault] = useState(true);  // user's saved default toggle
  const [appendSignature, setAppendSignature] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [t, s, c] = await Promise.all([
        emailApi.templates(), emailApi.subscribers(), emailApi.config(),
      ]);
      setTemplates(t.templates || []);
      setSubs(s.subscribers || []);
      const sig = c.config?.signature || {};
      const saved = !!sig.html?.trim();
      setSigSaved(saved);
      setSigDefault(saved && sig.enabled !== false);
      // Pre-check the per-campaign toggle to mirror the saved default; user can flip it.
      setAppendSignature(saved && sig.enabled !== false);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function pickTemplate(id) {
    const t = templates.find((x) => x.id === id);
    if (t) setForm((f) => ({ ...f, templateId: id, subject: t.subject, body: t.body }));
    else setForm((f) => ({ ...f, templateId: "" }));
  }

  function toggleRecipient(id) {
    setForm((f) => ({
      ...f,
      recipientIds: f.recipientIds.includes(id) ? f.recipientIds.filter((x) => x !== id) : [...f.recipientIds, id],
    }));
  }

  function selectAll() {
    setForm((f) => ({ ...f, recipientIds: f.recipientIds.length === subs.length ? [] : subs.map((s) => s.id) }));
  }

  async function aiBody() {
    setAiBusy(true);
    try {
      const res = await aiApi.generate({
        type: "email",
        brief: { product: "Leadnator", subject: form.subject, signature: "The Leadnator team" },
      });
      const lines = (res.content || "").split("\n");
      let subj = form.subject;
      let body = res.content;
      if (lines[0]?.toLowerCase().startsWith("subject:")) {
        subj = lines[0].replace(/^subject:\s*/i, "").trim();
        body = lines.slice(1).join("\n").trim();
      }
      setForm({ ...form, subject: subj, body });
    } catch (err) { alert(err.message); }
    finally { setAiBusy(false); }
  }

  async function saveDraft(send = false) {
    setSaving(true); setError("");
    try {
      const res = await emailApi.createCampaign(form);
      if (send) {
        try {
          const sendRes = await emailApi.sendCampaign(res.campaign.id, { useSignature: appendSignature });
          alert(`Sent to ${sendRes.sent} · ${sendRes.failed} failed.`);
        } catch (err) {
          alert(`Saved as draft, but send failed: ${err.message}`);
        }
      }
      navigate("/email/campaigns");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Create campaign</h1>
        <p className="page-subtitle">Compose, pick recipients, and send via your SMTP config.</p>
        <div className="card" style={{ padding: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
              <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 160, borderRadius: 8, display: "block" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <span className="skel" style={{ width: 100, height: 36, borderRadius: 8 }} />
            <span className="skel" style={{ width: 120, height: 36, borderRadius: 8 }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Create campaign</h1>
      <p className="page-subtitle">Compose, pick recipients, and send via your SMTP config.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiEdit /> Compose</div>
            <button type="button" className="btn btn-outline" onClick={aiBody} disabled={aiBusy}><FiZap /> {aiBusy ? "Writing…" : "AI"}</button>
          </div>
          <div className="form-group"><label>Campaign name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="April newsletter" />
          </div>
          {templates.length > 0 && (
            <div className="form-group"><label>Pre-fill from template</label>
              <select value={form.templateId} onChange={(e) => pickTemplate(e.target.value)}>
                <option value="">— None —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group"><label>Subject *</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Hi {{firstName}}, check this out" />
          </div>
          <div className="form-group"><label>Body * (HTML allowed, {"{{name}}"} {"{{firstName}}"} {"{{email}}"} merge tags)</label>
            <textarea required rows="12" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recipients ({form.recipientIds.length} of {subs.length})</div>
            <button type="button" className="btn btn-ghost" onClick={selectAll}>
              {form.recipientIds.length === subs.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <div style={{ maxHeight: 460, overflow: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: 6 }}>
            {subs.length === 0 ? (
              <div style={{ padding: 18, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No subscribers. Add some under Email → Subscribers.
              </div>
            ) : subs.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={form.recipientIds.includes(s.id)} onChange={() => toggleRecipient(s.id)} disabled={s.status !== "active"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.name || s.email}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.email}</div>
                </div>
                {s.status !== "active" && <span className="badge lost">{s.status}</span>}
              </label>
            ))}
          </div>

          {/* Signature toggle — disabled if no signature is saved */}
          <label
            title={sigSaved ? "" : "Set up your signature first under Email → Signature"}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginTop: 14,
              background: sigSaved && appendSignature ? "var(--primary-50)" : "#f9fafb",
              border: `1px solid ${sigSaved && appendSignature ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 8, fontSize: 13,
              opacity: sigSaved ? 1 : 0.55,
              cursor: sigSaved ? "pointer" : "not-allowed",
              transition: ".12s",
            }}
          >
            <input
              type="checkbox"
              disabled={!sigSaved}
              checked={sigSaved && appendSignature}
              onChange={(e) => sigSaved && setAppendSignature(e.target.checked)}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Append my signature</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {sigSaved
                  ? `Default: ${sigDefault ? "ON" : "OFF"}. Uncheck to skip the signature for this campaign only.`
                  : <>No signature set yet — <a href="/email/signature" style={{ color: "var(--primary)" }}>set one up</a> to enable.</>}
              </div>
            </div>
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-outline" onClick={() => saveDraft(false)} disabled={saving || !form.name || !form.subject || !form.body}>
              <FiSave /> Save draft
            </button>
            <button className="btn btn-primary" onClick={() => saveDraft(true)} disabled={saving || form.recipientIds.length === 0 || !form.name || !form.subject || !form.body}>
              <FiSend /> {saving ? "Sending…" : `Send to ${form.recipientIds.length}`}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            Sending uses your SMTP config under <a href="/email/config" style={{ color: "var(--primary)" }}>Email → SMTP config</a>.
          </div>
        </div>
      </div>
    </>
  );
}

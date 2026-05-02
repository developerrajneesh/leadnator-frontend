import { useEffect, useState } from "react";
import { FiPlus, FiRefreshCw, FiSend } from "react-icons/fi";
import { waApi } from "../../api/whatsapp";

export default function Broadcasts() {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ templateName: "", language: "en_US", contactIds: [] });

  async function load() {
    setLoading(true); setError("");
    try {
      const [c, t, ct] = await Promise.all([waApi.campaigns(), waApi.templates().catch(() => ({ templates: [] })), waApi.contacts()]);
      setCampaigns(c.campaigns || []);
      setTemplates((t.templates || []).filter((x) => x.status === "APPROVED"));
      setContacts(ct.contacts || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function toggleContact(id) {
    setForm((f) => ({
      ...f,
      contactIds: f.contactIds.includes(id) ? f.contactIds.filter((x) => x !== id) : [...f.contactIds, id],
    }));
  }
  function selectAll() {
    setForm((f) => ({ ...f, contactIds: f.contactIds.length === contacts.length ? [] : contacts.map((c) => c.id) }));
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!form.templateName) { alert("Pick a template"); return; }
    if (!form.contactIds.length) { alert("Pick at least one contact"); return; }
    setSubmitting(true);
    try {
      const res = await waApi.bulkMessages(form);
      alert(`Sent ${res.sent} messages · ${res.failed} failed.`);
      setShowNew(false);
      setForm({ templateName: "", language: "en_US", contactIds: [] });
      load();
    } catch (err) { alert(err.message || "Bulk send failed."); }
    finally { setSubmitting(false); }
  }

  const totalSent = campaigns.reduce((s, c) => s + (c.sent || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed || 0), 0);

  return (
    <>
      <h1 className="page-title">WhatsApp — Broadcasts</h1>
      <p className="page-subtitle">Send approved templates to your contacts in bulk.</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{campaigns.length}</div><div className="stat-label">Campaigns</div></div>
        <div className="stat-card"><div className="stat-value">{totalSent.toLocaleString()}</div><div className="stat-label">Messages sent</div></div>
        <div className="stat-card"><div className="stat-value">{totalFailed.toLocaleString()}</div><div className="stat-label">Failures</div></div>
        <div className="stat-card"><div className="stat-value">{contacts.length}</div><div className="stat-label">Contacts</div></div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, margin: "14px 0" }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><FiPlus /> New broadcast</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Campaign</th><th>Template</th><th>Status</th><th>Contacts</th><th>Sent</th><th>Failed</th><th>Created</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 170 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 130 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No broadcasts yet.</td></tr>
              ) : campaigns.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.templateName}</td>
                  <td><span className={`badge ${b.status === "completed" ? "qualified" : b.status === "failed" ? "lost" : "contacted"}`}>{b.status}</span></td>
                  <td>{b.contacts?.length || 0}</td>
                  <td>{b.sent}</td>
                  <td>{b.failed}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSend} className="card" style={{ width: 600, maxWidth: "92vw", maxHeight: "90vh", overflow: "auto" }}>
            <div className="card-header">
              <div className="card-title"><FiSend /> New WhatsApp broadcast</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>

            <div className="form-group">
              <label>Approved template *</label>
              <select required value={form.templateName} onChange={(e) => {
                const t = templates.find((x) => x.name === e.target.value);
                setForm({ ...form, templateName: e.target.value, language: t?.language || form.language });
              }}>
                <option value="">— Select a template —</option>
                {templates.map((t) => <option key={t.name + t.language} value={t.name}>{t.name} ({t.language})</option>)}
              </select>
              {templates.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  No approved templates. Create and get one approved first under WhatsApp → Templates.
                </div>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Recipients ({form.contactIds.length} of {contacts.length})</label>
                <button type="button" className="btn btn-ghost" onClick={selectAll}>
                  {form.contactIds.length === contacts.length ? "Clear" : "Select all"}
                </button>
              </div>
              <div style={{ maxHeight: 240, overflow: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: 6 }}>
                {contacts.length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No contacts. Add some under WhatsApp → Contacts.</div>
                ) : contacts.map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" checked={form.contactIds.includes(c.id)} onChange={() => toggleContact(c.id)} />
                    <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 11 }}>{c.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <FiSend /> {submitting ? "Sending…" : `Send to ${form.contactIds.length}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

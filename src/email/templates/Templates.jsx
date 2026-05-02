import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiX, FiZap, FiRefreshCw } from "react-icons/fi";
import { emailApi } from "../../api/email";
import { aiApi } from "../../api/meta";

export default function Templates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // template object or empty
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.templates();
      setList(res.templates || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openNew()  { setEditing({ id: "", name: "", subject: "", body: "", category: "general" }); }
  function openEdit(t){ setEditing({ ...t }); }

  async function save(e) {
    e.preventDefault();
    try {
      if (editing.id) await emailApi.updateTemplate(editing.id, editing);
      else            await emailApi.createTemplate(editing);
      setEditing(null);
      load();
    } catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this template?")) return;
    try { await emailApi.deleteTemplate(id); load(); } catch (err) { alert(err.message); }
  }

  async function aiBody() {
    setAiBusy(true);
    try {
      const res = await aiApi.generate({
        type: "email",
        brief: { product: editing.name, subject: editing.subject, signature: "The Leadnator team" },
      });
      // Split first line as subject if present
      const lines = (res.content || "").split("\n");
      let subj = editing.subject;
      let body = res.content;
      if (lines[0]?.toLowerCase().startsWith("subject:")) {
        subj = lines[0].replace(/^subject:\s*/i, "").trim();
        body = lines.slice(1).join("\n").trim();
      }
      setEditing({ ...editing, subject: subj, body });
    } catch (err) { alert(err.message); }
    finally { setAiBusy(false); }
  }

  return (
    <>
      <h1 className="page-title">Email — Templates</h1>
      <p className="page-subtitle">Reusable subject + body with {"{{name}}"}, {"{{firstName}}"}, {"{{email}}"} placeholders.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={openNew}><FiPlus /> New template</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Subject</th><th>Category</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 170 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 260 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 80 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 100 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <span className="skel skel-square" />
                        <span className="skel skel-square" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No templates yet.</td></tr>
              ) : list.map((t) => (
                <tr key={t.id} onClick={() => openEdit(t)} style={{ cursor: "pointer" }}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</td>
                  <td><span className="badge starter">{t.category}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(t.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" onClick={() => openEdit(t)}><FiEdit /></button>
                      <button className="admin-action danger" onClick={() => remove(t.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: 660, maxWidth: "96vw", maxHeight: "92vh", overflow: "auto" }}>
            <div className="card-header">
              <div className="card-title">{editing.id ? "Edit template" : "New email template"}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={aiBody} disabled={aiBusy}><FiZap /> {aiBusy ? "…" : "AI"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}><FiX /></button>
              </div>
            </div>
            <div className="grid-2-equal">
              <div className="form-group"><label>Template name *</label>
                <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Welcome email" />
              </div>
              <div className="form-group"><label>Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  <option value="general">General</option>
                  <option value="welcome">Welcome</option>
                  <option value="promo">Promo</option>
                  <option value="transactional">Transactional</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Subject *</label>
              <input required value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="Hi {{firstName}}, welcome to Leadnator!" />
            </div>
            <div className="form-group"><label>Body * (HTML or plain text)</label>
              <textarea required rows="10" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
                placeholder="<p>Hi {{firstName}},</p><p>Thanks for joining…</p>" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing.id ? "Save changes" : "Create template"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

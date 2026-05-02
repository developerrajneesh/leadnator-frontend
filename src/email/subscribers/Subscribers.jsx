import { useEffect, useState } from "react";
import { FiPlus, FiUpload, FiTrash2, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { emailApi } from "../../api/email";

export default function Subscribers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", tags: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.subscribers(q ? { q } : undefined);
      setList(res.subscribers || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await emailApi.createSubscriber({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      setShowAdd(false);
      setForm({ name: "", email: "", tags: "" });
      load();
    } catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm("Remove this subscriber?")) return;
    try { await emailApi.deleteSubscriber(id); load(); } catch (err) { alert(err.message); }
  }

  async function importCsv(file) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idxName = headers.indexOf("name");
    const idxEmail = headers.indexOf("email");
    if (idxEmail === -1) return alert("CSV must include an 'email' column.");
    const rows = lines.slice(1).map((row) => {
      const cells = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return { name: idxName >= 0 ? cells[idxName] : "", email: cells[idxEmail] };
    });
    try {
      const res = await emailApi.bulkSubscribers(rows);
      alert(`${res.inserted} added · ${res.skipped} skipped (duplicates).`);
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Email — Subscribers</h1>
      <p className="page-subtitle">{list.length} subscriber{list.length === 1 ? "" : "s"} on your list.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FiSearch style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "#9ca3af", pointerEvents: "none", fontSize: 16,
          }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name or email…"
            style={{
              width: "100%",
              height: 40,
              padding: "0 14px 0 40px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 14,
              background: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <label className="btn btn-outline" style={{ cursor: "pointer" }}>
          <FiUpload /> Import CSV
          <input type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
        </label>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiPlus /> Add subscriber</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Tags</th><th>Status</th><th>Added</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 130 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 200 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 90 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 80 }} /></td>
                    <td><span className="skel skel-square" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No subscribers yet.</td></tr>
              ) : list.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name || "—"}</td>
                  <td>{s.email}</td>
                  <td style={{ fontSize: 12 }}>{(s.tags || []).join(", ") || "—"}</td>
                  <td><span className={`badge ${s.status === "active" ? "qualified" : "lost"}`}>{s.status}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td><button className="admin-action danger" onClick={() => remove(s.id)}><FiTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={add} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title">Add subscriber</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}><FiX /></button>
            </div>
            <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, customer" /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

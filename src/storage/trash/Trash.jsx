import { useEffect, useState } from "react";
import { FiTrash, FiRotateCcw, FiX, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { storageApi, fileGlyph, fmtSize, fmtDate } from "../../api/storage";

export default function Trash() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await storageApi.trash(); setItems(r.items || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function restore(id) {
    try { await storageApi.restore(id); load(); } catch (err) { alert(err.message); }
  }
  async function purge(id) {
    if (!confirm("Permanently delete this file? This cannot be undone.")) return;
    try { await storageApi.purge(id); load(); } catch (err) { alert(err.message); }
  }
  async function emptyAll() {
    if (!items.length) return;
    if (!confirm(`Permanently delete all ${items.length} item(s)? This cannot be undone.`)) return;
    try { await storageApi.emptyTrash(); load(); } catch (err) { alert(err.message); }
  }

  const totalSize = items.reduce((s, i) => s + (i.size || 0), 0);

  return (
    <>
      <h1 className="page-title">Trash</h1>
      <p className="page-subtitle">Files are kept here until you delete them permanently.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {items.length} item{items.length === 1 ? "" : "s"} · {fmtSize(totalSize)} reclaimable
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
          <button className="btn btn-danger" onClick={emptyAll} disabled={!items.length}>
            <FiX /> Empty trash
          </button>
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <FiTrash style={{ fontSize: 48, marginBottom: 14, color: "#d1d5db" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Trash is empty</div>
          <p style={{ fontSize: 12, marginTop: 6 }}>Nothing here. Deleted files appear in this folder.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "10px 16px", background: "#fef3c7", color: "#92400e", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <FiAlertCircle /> Files stay in trash until you purge them — they don't count against your active storage.
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Original location</th><th>Deleted</th><th>Size</th><th style={{ width: 160 }}>Actions</th></tr></thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, opacity: 0.55 }}>{f.type === "folder" ? "📁" : fileGlyph(f.ext)}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>{f.name}</span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{f.parentPath}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtDate(f.deletedAt)}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{f.type === "file" ? fmtSize(f.size) : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-action" onClick={() => restore(f.id)}><FiRotateCcw /> Restore</button>
                        <button className="admin-action danger" onClick={() => purge(f.id)}><FiX /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

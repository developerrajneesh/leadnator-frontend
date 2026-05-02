import { useEffect, useState } from "react";
import { FiClock, FiDownload, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { storageApi, fileGlyph, fmtSize, fmtDate } from "../../api/storage";

export default function Recent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await storageApi.recent(); setItems(r.items || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function download(id) {
    try { const r = await storageApi.signedUrl(id); window.open(r.url, "_blank"); }
    catch (err) { alert(err.message); }
  }
  async function softDelete(id) {
    if (!confirm("Move this file to trash?")) return;
    try { await storageApi.softDelete(id); load(); } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Recent</h1>
      <p className="page-subtitle">Your 30 most recently modified files.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiClock /> Recently used
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Folder</th><th>Modified</th><th>Size</th><th style={{ width: 100 }}></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No files yet — upload some under My files.</td></tr>
              ) : items.map((f) => (
                <tr key={f.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{fileGlyph(f.ext)}</span>
                    <span style={{ fontWeight: 600 }}>{f.name}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "monospace" }}>{f.parentPath}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtDate(f.updatedAt)}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtSize(f.size)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="admin-action" onClick={() => download(f.id)} title="Download"><FiDownload /></button>
                      <button className="admin-action danger" onClick={() => softDelete(f.id)} title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

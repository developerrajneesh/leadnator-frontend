import { useEffect, useState } from "react";
import { FiUsers, FiDownload, FiRefreshCw } from "react-icons/fi";
import { storageApi, fileGlyph, fmtSize, fmtDate } from "../../api/storage";

export default function Shared() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await storageApi.shared(); setItems(r.items || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function download(id) {
    try { const r = await storageApi.signedUrl(id); window.open(r.url, "_blank"); }
    catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Shared with me</h1>
      <p className="page-subtitle">Files other Leadnator users have shared with your email.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiUsers /> {items.length} shared file{items.length === 1 ? "" : "s"}
        </div>
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
            Nothing shared with you yet. Files appear here when a teammate adds your email to a file's share list.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Owner</th><th>Modified</th><th>Size</th><th style={{ width: 60 }}></th></tr></thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{f.type === "folder" ? "📁" : fileGlyph(f.ext)}</span>
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </td>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="avatar-sm">{(f.user?.name?.[0] || "?").toUpperCase()}</span>
                      {f.user?.name || f.user?.email || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtDate(f.updatedAt)}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{f.type === "file" ? fmtSize(f.size) : "—"}</td>
                    <td>
                      {f.type === "file" && <button className="admin-action" onClick={() => download(f.id)}><FiDownload /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

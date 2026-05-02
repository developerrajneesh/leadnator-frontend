import { useEffect, useRef, useState } from "react";
import {
  FiFolder, FiChevronRight, FiHome, FiList, FiGrid,
  FiUpload, FiPlus, FiArrowUp, FiSearch, FiDownload, FiTrash2, FiRefreshCw, FiX,
  FiExternalLink, FiAlertCircle,
} from "react-icons/fi";
import { storageApi, fileGlyph, fmtSize, fmtDate } from "../../api/storage";

// File-type sniffer used by the in-app viewer.
function viewerKind(item) {
  const ext = (item.ext || "").toLowerCase();
  const mt = (item.mimeType || "").toLowerCase();
  if (mt.startsWith("image/") || ["jpg","jpeg","png","gif","webp","svg","bmp","ico"].includes(ext)) return "image";
  if (mt === "application/pdf" || ext === "pdf") return "pdf";
  if (mt.startsWith("video/") || ["mp4","webm","mov","ogg"].includes(ext)) return "video";
  if (mt.startsWith("audio/") || ["mp3","wav","ogg","m4a"].includes(ext)) return "audio";
  if (mt.startsWith("text/")  || ["txt","md","csv","log","json","yaml","yml","xml","html","css","js","jsx","ts","tsx"].includes(ext)) return "text";
  return "other";
}

export default function Browse() {
  const [path, setPath] = useState("/");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploading, setUploading] = useState(0);
  const [viewing, setViewing] = useState(null);   // { item, url, kind, textBody? }
  const [viewerLoading, setViewerLoading] = useState(false);
  const fileInput = useRef(null);

  async function load(p = path) {
    setLoading(true); setError(""); setSelectedIds(new Set());
    try {
      const res = await storageApi.items(p);
      setItems(res.items || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [path]);

  const segments = path === "/" ? [] : path.split("/").filter(Boolean);

  function toggleSelect(id) {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearSelection() { setSelectedIds(new Set()); }

  function openFolder(item) {
    const next = path === "/" ? `/${item.name}` : `${path}/${item.name}`;
    setPath(next);
    setSelectedIds(new Set());
  }

  function goUp() {
    if (segments.length === 0) return;
    const next = segments.length === 1 ? "/" : "/" + segments.slice(0, -1).join("/");
    setPath(next);
  }

  async function viewFile(item) {
    setViewerLoading(true);
    try {
      const r = await storageApi.signedUrl(item.id);
      const kind = viewerKind(item);
      let textBody = null;
      if (kind === "text") {
        try {
          const t = await fetch(r.url).then((res) => res.text());
          textBody = t.slice(0, 200_000);  // cap at ~200 KB to keep DOM snappy
        } catch (e) { textBody = `Failed to load preview: ${e.message}`; }
      }
      setViewing({ item, url: r.url, kind, textBody });
    } catch (err) { alert(err.message); }
    finally { setViewerLoading(false); }
  }

  function onDoubleClick(item) {
    if (item.type === "folder") openFolder(item);
    else viewFile(item);
  }

  async function downloadOne(id) {
    try { const r = await storageApi.signedUrl(id); window.open(r.url, "_blank"); }
    catch (err) { alert(err.message); }
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Move ${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"} to trash?`)) return;
    const ids = [...selectedIds];
    try {
      for (const id of ids) await storageApi.softDelete(id);
      load();
    } catch (err) { alert(err.message); load(); }
  }

  async function createFolder(e) {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      await storageApi.createFolder({ name: folderName.trim(), parentPath: path });
      setShowNewFolder(false); setFolderName("");
      load();
    } catch (err) { alert(err.message); }
  }

  async function handleFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const fd = new FormData();
    fd.append("parentPath", path);
    Array.from(fileList).forEach((f) => fd.append("files", f));
    setUploading(0);
    try {
      await storageApi.upload(fd, (p) => setUploading(p));
      setUploading(0);
      load();
    } catch (err) {
      setUploading(0);
      alert(err.message);
    }
  }

  const filtered = q.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()))
    : items;

  const folderCount = items.filter((i) => i.type === "folder").length;
  const fileCount = items.filter((i) => i.type === "file").length;
  const totalSize = items.reduce((s, i) => s + (i.size || 0), 0);
  const hasSelection = selectedIds.size > 0;

  return (
    <>
      <h1 className="page-title">File Storage</h1>
      <p className="page-subtitle">Browse, upload and manage your files — backed by Supabase Storage.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={goUp} disabled={segments.length === 0} style={{ padding: "8px 12px" }} title="Up one level"><FiArrowUp /></button>

          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, minHeight: 36 }}>
            <button onClick={() => setPath("/")} style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <FiHome /> Leadnator drive
            </button>
            {segments.map((seg, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <FiChevronRight style={{ color: "#9ca3af" }} />
                <button onClick={() => setPath("/" + segments.slice(0, i + 1).join("/"))}
                  style={{ background: "transparent", border: "none", color: i === segments.length - 1 ? "var(--text)" : "var(--primary)", cursor: "pointer", fontWeight: i === segments.length - 1 ? 700 : 500, padding: 0 }}>
                  {seg}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this folder…"
              style={{ paddingLeft: 36, height: 38, border: "1px solid var(--border)", borderRadius: 8, width: 220, boxSizing: "border-box" }} />
          </div>

          {/* Contextual delete — only when something is selected */}
          {hasSelection && (
            <button
              className="btn btn-danger"
              onClick={deleteSelected}
              title={`Delete ${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiTrash2 /> Delete ({selectedIds.size})
            </button>
          )}
          {hasSelection && (
            <button className="btn btn-ghost" onClick={clearSelection} title="Clear selection">
              <FiX />
            </button>
          )}

          <button className="btn btn-outline" onClick={() => load()} title="Refresh"><FiRefreshCw /></button>
          <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "white" }}>
            <button onClick={() => setView("grid")} style={{ padding: "8px 12px", border: "none", cursor: "pointer", background: view === "grid" ? "var(--primary-50)" : "white", color: view === "grid" ? "var(--primary)" : "var(--text-muted)" }}><FiGrid /></button>
            <button onClick={() => setView("list")} style={{ padding: "8px 12px", border: "none", cursor: "pointer", background: view === "list" ? "var(--primary-50)" : "white", color: view === "list" ? "var(--primary)" : "var(--text-muted)" }}><FiList /></button>
          </div>
          <button className="btn btn-outline" onClick={() => setShowNewFolder(true)}><FiPlus /> New folder</button>
          <button className="btn btn-primary" onClick={() => fileInput.current?.click()}>
            <FiUpload /> {uploading > 0 ? `${uploading}%` : "Upload"}
          </button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
        </div>
      </div>

      <div style={{ padding: "8px 14px", background: "#f9fafb", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", marginBottom: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <span><strong style={{ color: "var(--text)" }}>{folderCount}</strong> folder{folderCount === 1 ? "" : "s"}</span>
        <span><strong style={{ color: "var(--text)" }}>{fileCount}</strong> file{fileCount === 1 ? "" : "s"}</span>
        <span><strong style={{ color: "var(--text)" }}>{fmtSize(totalSize)}</strong> total</span>
        {hasSelection && <span style={{ color: "var(--primary)", fontWeight: 600 }}>{selectedIds.size} selected</span>}
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <FiFolder style={{ fontSize: 48, marginBottom: 14, color: "#d1d5db" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {q ? `No files match "${q}"` : "This folder is empty"}
          </div>
          <p style={{ fontSize: 12, marginTop: 6 }}>{q ? "Try a different search term." : "Drop files here or click Upload."}</p>
        </div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {filtered.map((item) => {
            const glyph = item.type === "folder" ? "📁" : fileGlyph(item.ext);
            const sel = selectedIds.has(item.id);
            return (
              <div key={item.id} onClick={() => toggleSelect(item.id)} onDoubleClick={() => onDoubleClick(item)}
                style={{
                  padding: "18px 12px", textAlign: "center",
                  background: sel ? "var(--primary-50)" : "white",
                  border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 10, cursor: "pointer", userSelect: "none", transition: "0.12s",
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = "#9ca3af"; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = "var(--border)"; }}>
                <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>{glyph}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                  {item.type === "file" ? fmtSize(item.size) : "Folder"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th style={{ width: 40 }}></th><th>Name</th><th>Modified</th><th>Size</th><th style={{ width: 110 }}></th></tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const glyph = item.type === "folder" ? "📁" : fileGlyph(item.ext);
                  const sel = selectedIds.has(item.id);
                  return (
                    <tr key={item.id} onClick={() => toggleSelect(item.id)} onDoubleClick={() => onDoubleClick(item)}
                      style={{ cursor: "pointer", background: sel ? "var(--primary-50)" : "" }}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={sel} onChange={() => toggleSelect(item.id)} />
                      </td>
                      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{glyph}</span>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtDate(item.updatedAt)}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.type === "file" ? fmtSize(item.size) : "—"}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {item.type === "file" && <button className="admin-action" onClick={() => downloadOne(item.id)} title="Download"><FiDownload /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New folder modal */}
      {showNewFolder && (
        <div onClick={() => setShowNewFolder(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={createFolder} className="card" style={{ width: 420, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiFolder /> New folder</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewFolder(false)}><FiX /></button>
            </div>
            <div className="form-group"><label>Folder name *</label>
              <input required autoFocus value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="My docs" />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
              Will be created under <code>{path}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNewFolder(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* In-app file viewer */}
      {(viewing || viewerLoading) && (
        <div onClick={() => setViewing(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 110, display: "flex", flexDirection: "column", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: 12, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
            {/* Viewer header */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{fileGlyph(viewing?.item?.ext)}</span>
                  <strong style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {viewing?.item?.name || "Loading…"}
                  </strong>
                </div>
                {viewing?.item && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {fmtSize(viewing.item.size)} · {viewing.item.mimeType || viewing.item.ext} · {fmtDate(viewing.item.updatedAt)}
                  </div>
                )}
              </div>
              {viewing?.url && (
                <a className="btn btn-outline" href={viewing.url} target="_blank" rel="noreferrer" download={viewing.item.name}>
                  <FiDownload /> Download
                </a>
              )}
              <button className="btn btn-ghost" onClick={() => setViewing(null)} title="Close (Esc)"><FiX /></button>
            </div>

            {/* Viewer body */}
            <div style={{ flex: 1, overflow: "auto", background: "#0f172a" }}>
              {viewerLoading && (
                <div style={{ padding: 60, textAlign: "center", color: "white" }}>Loading preview…</div>
              )}
              {viewing && (
                <FileViewer kind={viewing.kind} url={viewing.url} item={viewing.item} textBody={viewing.textBody} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FileViewer({ kind, url, item, textBody }) {
  if (kind === "image") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30, minHeight: "100%" }}>
        <img src={url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 6, boxShadow: "0 6px 30px rgba(0,0,0,0.3)" }} />
      </div>
    );
  }
  if (kind === "pdf") {
    return <iframe title={item.name} src={url} style={{ width: "100%", height: "78vh", border: 0, background: "white" }} />;
  }
  if (kind === "video") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30, minHeight: "100%" }}>
        <video src={url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 6, background: "black" }} />
      </div>
    );
  }
  if (kind === "audio") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, minHeight: "100%" }}>
        <audio src={url} controls autoPlay style={{ width: "min(560px, 90%)" }} />
      </div>
    );
  }
  if (kind === "text") {
    return (
      <pre style={{
        margin: 0, padding: 24, color: "#e2e8f0", fontFamily: "monospace", fontSize: 13,
        whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: "100%",
      }}>{textBody || "(empty file)"}</pre>
    );
  }
  return (
    <div style={{ padding: 60, textAlign: "center", color: "white" }}>
      <FiAlertCircle style={{ fontSize: 40, marginBottom: 14, color: "#94a3b8" }} />
      <div style={{ fontWeight: 600, marginBottom: 4 }}>No inline preview available</div>
      <p style={{ color: "#94a3b8", fontSize: 13 }}>This file type can't be displayed in the browser.</p>
      <a className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex", gap: 6 }} href={url} target="_blank" rel="noreferrer" download={item.name}>
        <FiExternalLink /> Open in new tab
      </a>
    </div>
  );
}

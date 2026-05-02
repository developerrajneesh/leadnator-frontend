import { useEffect, useRef, useState } from "react";
import { FiUpload, FiCheckCircle, FiX, FiFolder, FiAlertCircle } from "react-icons/fi";
import { storageApi, fileGlyph, fmtSize } from "../../api/storage";

export default function Upload() {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [folders, setFolders] = useState(["/"]);   // available destinations
  const [folder, setFolder] = useState("/");
  const [queue, setQueue] = useState([]);          // { id, name, ext, size, progress, status, error }
  const [configured, setConfigured] = useState(true);

  async function loadFolders() {
    try {
      const cfg = await storageApi.config();
      setConfigured(!!cfg.configured);
    } catch { setConfigured(false); }

    // Build a flat folder list by walking root + one level deep
    try {
      const root = await storageApi.items("/");
      const list = ["/"];
      const subs = (root.items || []).filter((i) => i.type === "folder");
      subs.forEach((s) => list.push(`/${s.name}`));
      // Walk one level deeper
      for (const s of subs) {
        try {
          const sub = await storageApi.items(`/${s.name}`);
          (sub.items || []).filter((i) => i.type === "folder").forEach((c) => list.push(`/${s.name}/${c.name}`));
        } catch { /* skip */ }
      }
      setFolders(list);
    } catch { /* keep root only */ }
  }
  useEffect(() => { loadFolders(); }, []);

  function add(fileList) {
    const incoming = Array.from(fileList).map((f) => ({
      id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      ext: (f.name.split(".").pop() || "").toLowerCase(),
      size: f.size,
      progress: 0,
      status: "pending",
      file: f,
    }));
    setQueue((cur) => [...incoming, ...cur]);
    incoming.forEach((q) => sendOne(q));
  }

  async function sendOne(q) {
    setQueue((cur) => cur.map((x) => x.id === q.id ? { ...x, status: "uploading" } : x));
    const fd = new FormData();
    fd.append("parentPath", folder);
    fd.append("files", q.file);
    try {
      await storageApi.upload(fd, (p) => {
        setQueue((cur) => cur.map((x) => x.id === q.id ? { ...x, progress: p } : x));
      });
      setQueue((cur) => cur.map((x) => x.id === q.id ? { ...x, progress: 100, status: "done" } : x));
    } catch (err) {
      setQueue((cur) => cur.map((x) => x.id === q.id ? { ...x, status: "failed", error: err.message } : x));
    }
  }

  function remove(id) {
    setQueue(queue.filter((q) => q.id !== id));
  }

  return (
    <>
      <h1 className="page-title">Upload files</h1>
      <p className="page-subtitle">Drag & drop or pick files — they upload directly to Supabase Storage.</p>

      {!configured && (
        <div style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8, marginBottom: 12, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
          <FiAlertCircle /> Storage not configured server-side. Add <code>ENDPOINT_URL</code>, <code>ACCESS_KEY_ID</code>, <code>SECRET_ACCESS_KEY</code>, <code>BUCKET_NAME</code> in <code>backend/.env</code> and restart.
        </div>
      )}

      <div className="grid-2-equal">
        <div>
          <div className="form-group">
            <label>Destination folder</label>
            <select value={folder} onChange={(e) => setFolder(e.target.value)}>
              {folders.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false);
              if (e.dataTransfer.files?.length) add(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "60px 20px",
              border: `2px dashed ${drag ? "var(--primary)" : "#cbd5e1"}`,
              borderRadius: 14, textAlign: "center",
              background: drag ? "var(--primary-50)" : "#f9fafb",
              cursor: "pointer", transition: "0.15s",
            }}
          >
            <FiUpload style={{ fontSize: 48, color: drag ? "var(--primary)" : "#9ca3af", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 6, color: drag ? "var(--primary)" : "var(--text)" }}>
              {drag ? "Drop to upload" : "Drag files here"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              or <span style={{ color: "var(--primary)", fontWeight: 600 }}>click to browse</span>
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
              Any file type · max 100 MB per file
            </p>
            <input ref={inputRef} type="file" multiple hidden onChange={(e) => { e.target.files?.length && add(e.target.files); e.target.value = ""; }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiFolder /> Upload queue ({queue.length})</div>
            {queue.length > 0 && <button className="btn btn-ghost" onClick={() => setQueue([])}>Clear</button>}
          </div>

          {queue.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No files in queue yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 480, overflowY: "auto" }}>
              {queue.map((q) => {
                const done = q.status === "done";
                const failed = q.status === "failed";
                return (
                  <div key={q.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: failed ? "#fef2f2" : done ? "#f0fdf4" : "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{fileGlyph(q.ext)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtSize(q.size)} · → {folder}</div>
                      </div>
                      {done
                        ? <FiCheckCircle style={{ color: "#10b981" }} />
                        : failed
                          ? <FiAlertCircle style={{ color: "#b91c1c" }} title={q.error} />
                          : <button onClick={() => remove(q.id)} className="admin-action" style={{ padding: 4 }}><FiX /></button>}
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${q.progress}%`,
                        background: done ? "#10b981" : failed ? "#b91c1c" : "var(--primary)",
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: failed ? "#b91c1c" : "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
                      {failed ? q.error : `${Math.round(q.progress)}%${done ? " · done" : ""}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

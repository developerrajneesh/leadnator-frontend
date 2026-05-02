import { useEffect, useState } from "react";
import { FiKey, FiPlus, FiCopy, FiTrash2, FiRefreshCw, FiX, FiAlertCircle } from "react-icons/fi";
import { profileApi } from "../../api/profile";

export default function Api() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [env, setEnv] = useState("test");
  const [revealedKey, setRevealedKey] = useState(null); // shown once after create
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await profileApi.apiKeys();
      setKeys(res.keys || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await profileApi.createApiKey({ name, env });
      setRevealedKey(res.key);  // contains .secret
      setShowCreate(false);
      setName(""); setEnv("test");
      await load();
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  }

  async function remove(id) {
    if (!confirm("Revoke this API key? Anything using it will break.")) return;
    try {
      await profileApi.deleteApiKey(id);
      await load();
    } catch (err) { alert(err.message); }
  }

  function copyKey(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <h1 className="page-title">API keys</h1>
      <p className="page-subtitle">Generate and manage keys for server access.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {/* Reveal-once modal */}
      {revealedKey && (
        <div onClick={() => setRevealedKey(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 540, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title">🔑 Your new API key</div>
              <button className="btn btn-ghost" onClick={() => setRevealedKey(null)}><FiX /></button>
            </div>
            <div style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 13, marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Copy this key now.</strong> You won't be able to see it again — only the prefix is stored.
              </div>
            </div>
            <div style={{ padding: 14, background: "#111827", color: "#a7f3d0", fontFamily: "monospace", fontSize: 13, borderRadius: 8, wordBreak: "break-all", marginBottom: 12 }}>
              {revealedKey.secret}
            </div>
            <button className="btn btn-primary" onClick={() => copyKey(revealedKey.secret)} style={{ width: "100%" }}>
              <FiCopy /> {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
        </div>
      )}

      {/* Create form modal */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); create(); }} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title">New API key</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}><FiX /></button>
            </div>
            <div className="form-group"><label>Key name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" />
            </div>
            <div className="form-group"><label>Environment</label>
              <select value={env} onChange={(e) => setEnv(e.target.value)}>
                <option value="test">Test (sandbox data)</option>
                <option value="live">Live (production)</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
                {creating ? "Creating…" : "Generate key"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="card-title"><FiKey /> API keys</div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Use these for server-to-server calls.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Generate new key</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Key prefix</th><th>Created</th><th>Last used</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : keys.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>No API keys yet.</td></tr>
              ) : keys.map((k) => (
                <tr key={k.id}>
                  <td><strong>{k.name}</strong></td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{k.prefix}</td>
                  <td style={{ color: "var(--text-muted)" }}>{new Date(k.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td style={{ color: "#6b7280" }}>
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("en-IN") : "Never"}
                  </td>
                  <td>
                    <button className="admin-action danger" onClick={() => remove(k.id)} title="Revoke"><FiTrash2 /></button>
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

import { useCallback, useEffect, useState } from "react";
import { FiSearch, FiRefreshCw, FiActivity } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const METHOD_COLOR = { POST: "#10b981", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };
const initials = (s) => (s || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—");

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [moduleF, setModuleF] = useState("all");
  const [methodF, setMethodF] = useState("all");

  const LIMIT = 50;

  const load = useCallback(async (opts = {}) => {
    const pg = opts.page || 1;
    setLoading(true);
    try {
      const r = await api.admin.logs({ q, module: moduleF, method: methodF, page: pg, limit: LIMIT });
      setLogs((prev) => (pg > 1 ? [...prev, ...r.logs] : r.logs));
      setTotal(r.total || 0);
      setPage(r.page || pg);
      if (r.modules) setModules(r.modules);
    } catch (err) {
      notify.error(err.message || "Failed to load logs");
    } finally { setLoading(false); }
  }, [q, moduleF, methodF]);

  // Reload from page 1 whenever filters change (debounced for the search box).
  useEffect(() => {
    const t = setTimeout(() => { load({ page: 1 }); }, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Activity logs</h1>
          <p className="page-subtitle">Every action across the platform — sign-ups, logins, and every create/update/delete by any user.</p>
        </div>
        <button className="btn btn-outline" onClick={() => load({ page: 1 })} disabled={loading}>
          <FiRefreshCw style={{ opacity: loading ? 0.5 : 1 }} /> Refresh
        </button>
      </div>

      <div className="toolbar">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FiSearch style={{ position: "absolute", left: 12, top: 12, color: "#9ca3af" }} />
          <input placeholder="Search user, action, path, IP…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 36, width: "100%" }} />
        </div>
        <select value={moduleF} onChange={(e) => setModuleF(e.target.value)}>
          <option value="all">All modules</option>
          {modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={methodF} onChange={(e) => setMethodF(e.target.value)}>
          <option value="all">All methods</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><FiActivity style={{ marginRight: 6, verticalAlign: "middle" }} />{total.toLocaleString()} events</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing {logs.length} of {total}</span>
        </div>

        {loading && logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading logs…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>When</th><th>User</th><th>Action</th><th>Module</th><th>Method</th><th>Path</th><th>Status</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)" }}>{fmt(l.ts)}</td>
                    <td>
                      <span className="avatar-sm">{initials(l.userName || l.userEmail)}</span>
                      <span>
                        <span style={{ fontWeight: 600 }}>{l.userName || l.userEmail || "Anonymous"}</span>
                        {l.userName && l.userEmail && <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>{l.userEmail}</span>}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.action}</td>
                    <td style={{ textTransform: "capitalize" }}>{l.module || "—"}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 800, color: METHOD_COLOR[l.method] || "#64748b", background: (METHOD_COLOR[l.method] || "#64748b") + "1a", borderRadius: 6, padding: "2px 7px" }}>{l.method}</span>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.path}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: l.statusCode >= 400 ? "#ef4444" : "#10b981" }}>{l.statusCode || "—"}</span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.ip || "—"}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>No activity yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {logs.length < total && (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button className="btn btn-outline" onClick={() => load({ page: page + 1 })} disabled={loading}>
              {loading ? "Loading…" : `Load more (${total - logs.length} left)`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

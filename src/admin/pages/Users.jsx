import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiPause, FiPlay, FiTrash2, FiMail, FiEdit2, FiX, FiRefreshCw,
} from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const PLANS = ["Starter", "Growth", "Pro"];
const STATUSES = ["active", "paused"];
const ROLES = ["user", "admin"];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load({ soft = false } = {}) {
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const r = await api.admin.users();
      setUsers(r.users || []);
    } catch (err) {
      notify.error(err.message || "Failed to load users");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const ql = q.trim().toLowerCase();
    const matchQ = !ql
      || (u.name || "").toLowerCase().includes(ql)
      || (u.email || "").toLowerCase().includes(ql);
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchQ && matchPlan && matchStatus;
  });

  async function togglePause(u) {
    const next = u.status === "active" ? "paused" : "active";
    const verb = next === "paused" ? "Pause" : "Activate";
    if (!confirm(`${verb} ${u.name || u.email}?`)) return;
    setBusyId(u.id);
    try {
      const r = await api.admin.updateUser(u.id, { status: next });
      setUsers((list) => list.map((x) => x.id === u.id ? { ...x, ...r.user } : x));
      notify.success(`${u.name || u.email} ${next === "paused" ? "paused" : "activated"}`);
    } catch (err) {
      notify.error(err.message || `Failed to ${verb.toLowerCase()} user`);
    } finally { setBusyId(null); }
  }

  async function deleteUser(u) {
    if (!confirm(`Permanently delete ${u.name || u.email}? This cannot be undone.`)) return;
    setBusyId(u.id);
    try {
      await api.admin.deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      notify.success(`${u.name || u.email} deleted`);
    } catch (err) {
      notify.error(err.message || "Failed to delete user");
    } finally { setBusyId(null); }
  }

  function emailUser(u) {
    if (!u.email) return notify.warn("This user has no email on file.");
    window.location.href = `mailto:${u.email}`;
  }

  async function saveEdit(form) {
    setBusyId(editing.id);
    try {
      const r = await api.admin.updateUser(editing.id, {
        name:   form.name.trim(),
        email:  form.email.trim(),
        plan:   form.plan,
        role:   form.role,
        status: form.status,
      });
      setUsers((list) => list.map((x) => x.id === editing.id ? { ...x, ...r.user } : x));
      notify.success("User updated");
      setEditing(null);
    } catch (err) {
      notify.error(err.message || "Failed to update user");
    } finally { setBusyId(null); }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all platform customers.</p>
        </div>
        <button className="btn btn-outline" onClick={() => load({ soft: true })} disabled={refreshing}>
          <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="toolbar">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FiSearch style={{ position: "absolute", left: 12, top: 12, color: "#9ca3af" }} />
          <input
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 36, width: "100%" }}
          />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="all">All plans</option>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">{filtered.length} users</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Showing {filtered.length} of {users.length}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading users…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Role</th>
                  <th>Leads</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    style={{ opacity: busyId === u.id ? 0.55 : 1, cursor: "pointer" }}
                  >
                    <td>
                      <span className="avatar-sm">{(u.name || u.email || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                      <span style={{ fontWeight: 600 }}>{u.name || "—"}</span>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${(u.plan || "").toLowerCase()}`}>{u.plan}</span></td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>{(u.leads || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-dot ${u.status === "active" ? "active" : "paused"}`} style={{ marginRight: 6 }} />
                      {u.status}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-action" title="Email user" onClick={() => emailUser(u)} disabled={busyId === u.id}>
                          <FiMail />
                        </button>
                        {u.status === "active" ? (
                          <button className="admin-action" title="Pause" onClick={() => togglePause(u)} disabled={busyId === u.id}>
                            <FiPause />
                          </button>
                        ) : (
                          <button className="admin-action" title="Activate" onClick={() => togglePause(u)} disabled={busyId === u.id}>
                            <FiPlay />
                          </button>
                        )}
                        <button className="admin-action" title="Edit" onClick={() => setEditing(u)} disabled={busyId === u.id}>
                          <FiEdit2 />
                        </button>
                        <button className="admin-action danger" title="Delete" onClick={() => deleteUser(u)} disabled={busyId === u.id}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
                    {users.length === 0 ? "No users yet." : "No users match your filters."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSave={saveEdit} saving={busyId === editing.id} />}
    </>
  );
}

function EditUserModal({ user, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name:   user.name   || "",
    email:  user.email  || "",
    plan:   user.plan   || "Starter",
    role:   user.role   || "user",
    status: user.status || "active",
  });

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
        className="card"
        style={{ width: 520, maxWidth: "95vw" }}
      >
        <div className="card-header">
          <div className="card-title">Edit user</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div className="form-group">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Plan</label>
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

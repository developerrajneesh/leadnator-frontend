import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiArrowRight, FiX,
} from "react-icons/fi";
import { profileApi } from "../../api/profile";
import { notify } from "../../globalComponents/Toast/Toast";

/* ==========================================================
   /settings/team — list of Teams owned by the current user.
   Members live INSIDE a team, so you create a team first and
   then open it to add members. Matches the UX spec:
       "phle user team ka naam set karna hoga fir us team me
        member assign ho skte hai"
   ========================================================== */

const TEAM_COLORS = [
  "#7c3aed", "#22c55e", "#1877f2", "#ec4899", "#f59e0b",
  "#06b6d4", "#ef4444", "#14b8a6", "#a855f7", "#0ea5e9",
];

export default function Team() {
  const nav = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);  // null | team obj
  const [busyId, setBusyId] = useState(null);

  async function load({ soft = false } = {}) {
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const r = await profileApi.teams();
      setTeams(r.teams || []);
    } catch (err) {
      notify.error(err.message || "Failed to load teams");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function removeTeam(t) {
    if (!confirm(`Delete team "${t.name}"?`)) return;
    setBusyId(t.id);
    try {
      await profileApi.deleteTeam(t.id);
      setTeams((list) => list.filter((x) => x.id !== t.id));
      notify.success(`Team "${t.name}" deleted`);
    } catch (err) {
      notify.error(err.message || "Could not delete team");
    } finally { setBusyId(null); }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">
            Organise teammates into teams (e.g. Sales, Support, Marketing). Add members inside each team with their own permissions.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => load({ soft: true })} disabled={refreshing}>
            <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <FiPlus /> New team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading teams…</div>
      ) : teams.length === 0 ? (
        <div className="card" style={{ padding: 50, textAlign: "center" }}>
          <FiUsers style={{ fontSize: 32, color: "var(--text-muted)", opacity: 0.4, marginBottom: 12 }} />
          <h3 style={{ margin: 0, fontSize: 16 }}>No teams yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "6px 0 18px" }}>
            Create your first team to start adding members with scoped permissions.
          </p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <FiPlus /> Create your first team
          </button>
        </div>
      ) : (
        <div className="team-grid">
          {teams.map((t) => (
            <div key={t.id} className="team-card" style={{ opacity: busyId === t.id ? 0.55 : 1 }}>
              <div className="team-card-top" style={{ background: `linear-gradient(135deg, ${t.color}22, ${t.color}08)` }}>
                <div className="team-card-ic" style={{ background: t.color }}>
                  <FiUsers />
                </div>
                <div className="team-card-actions">
                  <button className="admin-action" title="Edit" onClick={() => setEditing(t)} disabled={busyId === t.id}>
                    <FiEdit2 />
                  </button>
                  <button className="admin-action danger" title="Delete" onClick={() => removeTeam(t)} disabled={busyId === t.id}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="team-card-body">
                <h3>{t.name}</h3>
                {t.description && <p>{t.description}</p>}
                <div className="team-card-meta">
                  <span className="team-card-count">
                    <FiUsers /> {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Created {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <button className="btn btn-primary team-card-open" onClick={() => nav(`/settings/team/${t.id}`)}>
                  Open team <FiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showNew || editing) && (
        <TeamEditor
          initial={editing}
          onClose={() => { setShowNew(false); setEditing(null); }}
          onSaved={(t) => {
            if (editing) {
              setTeams((list) => list.map((x) => x.id === t.id ? { ...x, ...t } : x));
            } else {
              setTeams((list) => [...list, { ...t, memberCount: 0 }]);
            }
            setShowNew(false); setEditing(null);
          }}
        />
      )}
    </>
  );
}

function TeamEditor({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    color: initial?.color || TEAM_COLORS[0],
  });
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const r = isEdit
        ? await profileApi.updateTeam(initial.id, form)
        : await profileApi.createTeam(form);
      notify.success(isEdit ? "Team updated" : `Team "${r.team.name}" created`);
      onSaved(r.team);
    } catch (err) {
      notify.error(err.message || "Failed to save team");
    } finally { setSaving(false); }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: 480, maxWidth: "95vw" }}>
        <div className="card-header">
          <div className="card-title">{isEdit ? "Edit team" : "Create team"}</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div className="form-group">
          <label>Team name *</label>
          <input
            required autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sales, Support, Marketing"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What this team does (optional)"
          />
        </div>

        <div className="form-group">
          <label>Color tag</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEAM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`team-color ${form.color === c ? "active" : ""}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create team"}
          </button>
        </div>
      </form>
    </div>
  );
}

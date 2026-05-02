import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiRefreshCw, FiUsers, FiMail, FiPhone,
  FiShield, FiTrash2, FiSend, FiPause, FiPlay, FiEdit2,
} from "react-icons/fi";
import { profileApi } from "../../api/profile";
import { notify } from "../../globalComponents/Toast/Toast";

const STATUS_BADGE = {
  active:    { cls: "qualified",  label: "Active"    },
  pending:   { cls: "contacted",  label: "Pending"   },
  suspended: { cls: "lost",       label: "Suspended" },
};

function avatarColor(seed = "?") {
  const palettes = [
    "linear-gradient(135deg, #7c3aed, #ec4899)",
    "linear-gradient(135deg, #10b981, #06b6d4)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #3b82f6, #6366f1)",
    "linear-gradient(135deg, #ec4899, #f97316)",
  ];
  const code = seed.charCodeAt(0) || 0;
  return palettes[code % palettes.length];
}
const initials = (n) => String(n || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export default function TeamDetail() {
  // Router uses `:teamId` — rename here to match.
  const { teamId } = useParams();
  const nav = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load({ soft = false } = {}) {
    if (!teamId) return;
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const r = await profileApi.team(teamId);
      setTeam(r.team);
      setMembers(r.members || []);
    } catch (err) {
      notify.error(err.message || "Failed to load team");
      nav("/settings/team");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [teamId]);

  async function remove(m) {
    if (!confirm(`Remove ${m.name || m.email} from ${team.name}?`)) return;
    setBusyId(m.id);
    try {
      await profileApi.removeMember(m.id);
      setMembers((list) => list.filter((x) => x.id !== m.id));
      notify.success(`${m.name || m.email} removed`);
    } catch (err) {
      notify.error(err.message || "Failed to remove member");
    } finally { setBusyId(null); }
  }

  async function setStatus(m, status) {
    const verb = status === "active" ? "Activate" : "Suspend";
    if (!confirm(`${verb} ${m.name || m.email}?`)) return;
    setBusyId(m.id);
    try {
      const r = await profileApi.updateMember(m.id, { status });
      setMembers((list) => list.map((x) => x.id === m.id ? { ...x, ...(r.member || {}) } : x));
      notify.success(`${m.name || m.email} ${status === "active" ? "activated" : "suspended"}`);
    } catch (err) {
      notify.error(err.message || "Failed to update");
    } finally { setBusyId(null); }
  }

  async function changeRole(m, role) {
    setBusyId(m.id);
    try {
      const r = await profileApi.updateMember(m.id, { role });
      setMembers((list) => list.map((x) => x.id === m.id ? { ...x, ...(r.member || {}) } : x));
      notify.success(`Role updated to ${role}`);
    } catch (err) {
      notify.error(err.message || "Failed to update role");
    } finally { setBusyId(null); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading team…</div>;
  if (!team) return null;

  // Count enabled permissions for a member to show in the row summary.
  function permSummary(perms) {
    if (!perms) return "0 routes";
    let count = 0;
    for (const mod of Object.values(perms)) {
      if (!mod) continue;
      for (const on of Object.values(mod)) if (on) count++;
    }
    return `${count} route${count === 1 ? "" : "s"}`;
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <button className="tm-back" onClick={() => nav("/settings/team")} title="Back to teams">
          <FiArrowLeft />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="team-detail-ic" style={{ background: team.color }}>
              <FiUsers />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>{team.name}</h1>
              <p className="page-subtitle" style={{ margin: 0 }}>
                {team.description || "No description"} · {members.length} member{members.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => load({ soft: true })} disabled={refreshing}>
            <FiRefreshCw style={{ opacity: refreshing ? 0.5 : 1 }} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary" onClick={() => nav(`/settings/team/${team.id}/add`)}>
            <FiPlus /> Add member
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {members.length === 0 ? (
          <div style={{ padding: 50, textAlign: "center" }}>
            <FiUsers style={{ fontSize: 28, opacity: 0.4, marginBottom: 10 }} />
            <div style={{ fontSize: 14, marginBottom: 14 }}>This team has no members yet.</div>
            <button className="btn btn-primary" onClick={() => nav(`/settings/team/${team.id}/add`)}>
              <FiPlus /> Add your first member
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Joined</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const s = STATUS_BADGE[m.status] || { cls: "new", label: m.status };
                  return (
                    <tr key={m.id} style={{ opacity: busyId === m.id ? 0.55 : 1 }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            className="avatar-sm"
                            style={{ background: avatarColor(m.email || m.name), color: "#fff" }}
                          >
                            {initials(m.name || m.email)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{m.name}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              <FiMail style={{ verticalAlign: "middle", marginRight: 4 }} />{m.email}
                              {m.phone && <>  ·  <FiPhone style={{ verticalAlign: "middle", marginRight: 4 }} />{m.phone}</>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m, e.target.value)}
                          disabled={busyId === m.id}
                          style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, background: "white" }}
                        >
                          <option>Admin</option>
                          <option>Member</option>
                          <option>Viewer</option>
                        </select>
                      </td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <FiShield /> {permSummary(m.permissions)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {m.status === "pending" && (
                            <button className="admin-action" title="Resend invite" onClick={() => setStatus(m, "pending")} disabled={busyId === m.id}>
                              <FiSend />
                            </button>
                          )}
                          {m.status === "suspended" ? (
                            <button className="admin-action" title="Activate" onClick={() => setStatus(m, "active")} disabled={busyId === m.id}>
                              <FiPlay />
                            </button>
                          ) : m.status === "active" ? (
                            <button className="admin-action" title="Suspend" onClick={() => setStatus(m, "suspended")} disabled={busyId === m.id}>
                              <FiPause />
                            </button>
                          ) : null}
                          <button className="admin-action danger" title="Remove" onClick={() => remove(m)} disabled={busyId === m.id}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

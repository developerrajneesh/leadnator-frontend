import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiShield,
  FiEye, FiEyeOff, FiChevronDown, FiRefreshCw, FiSave,
  FiSearch, FiStar, FiEdit2, FiEye as FiViewOn, FiUsers,
} from "react-icons/fi";
import { profileApi } from "../../api/profile";
import { notify } from "../../globalComponents/Toast/Toast";
import {
  MODULE_PERMISSIONS, makeAllPermissions, presetForRole, countEnabled,
} from "./permissions";

const ROLES = [
  { value: "Admin",  Icon: FiStar,     label: "Admin",  desc: "Full access except billing" },
  { value: "Member", Icon: FiEdit2,    label: "Member", desc: "Manage leads + campaigns" },
  { value: "Viewer", Icon: FiViewOn,   label: "Viewer", desc: "Read-only access" },
];

function genPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let out = "";
  const arr = new Uint32Array(len);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export default function AddMember() {
  const nav = useNavigate();
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: "Member",
  });

  // Load the team so we can display its name in the heading + verify it
  // exists before the user fills out the whole form.
  useEffect(() => {
    if (!teamId) return;
    profileApi.team(teamId)
      .then((r) => setTeam(r.team))
      .catch((err) => {
        notify.error(err.message || "Team not found");
        nav("/settings/team");
      });
  }, [teamId, nav]);
  const [permissions, setPermissions] = useState(() => presetForRole("Member"));
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [search, setSearch] = useState("");

  function toggleExpand(k) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  function onRoleChange(role) {
    setForm({ ...form, role });
    setPermissions(presetForRole(role));
  }

  function togglePerm(modKey, routeKey) {
    setPermissions((p) => ({
      ...p,
      [modKey]: { ...(p[modKey] || {}), [routeKey]: !p?.[modKey]?.[routeKey] },
    }));
  }

  function toggleModule(modKey) {
    const mod = MODULE_PERMISSIONS.find((m) => m.key === modKey);
    if (!mod) return;
    const { on, total } = countEnabled(permissions, modKey);
    const newValue = on < total;
    setPermissions((p) => {
      const next = { ...(p[modKey] || {}) };
      mod.routes.forEach((r) => { next[r.key] = newValue; });
      return { ...p, [modKey]: next };
    });
  }

  function selectAll(val) { setPermissions(makeAllPermissions(val)); }

  const totals = useMemo(() => {
    let on = 0, total = 0;
    MODULE_PERMISSIONS.forEach((m) => {
      const c = countEnabled(permissions, m.key);
      on += c.on; total += c.total;
    });
    return { on, total };
  }, [permissions]);

  const visibleModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MODULE_PERMISSIONS;
    return MODULE_PERMISSIONS
      .map((m) => ({
        ...m,
        routes: m.routes.filter(
          (r) => r.label.toLowerCase().includes(q) || r.key.includes(q)
        ),
      }))
      .filter((m) => m.label.toLowerCase().includes(q) || m.routes.length > 0);
  }, [search]);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      notify.error("Name and email are required");
      return;
    }
    if (form.password && form.password.length < 6) {
      notify.error("Password must be at least 6 characters");
      return;
    }
    if (!teamId) {
      notify.error("No team selected");
      return;
    }
    setSubmitting(true);
    try {
      await profileApi.inviteMember({
        teamId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        permissions,
      });
      notify.success(`${form.name} added to ${team?.name || "the team"}`);
      nav(`/settings/team/${teamId}`);
    } catch (err) {
      notify.error(err.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tm-add">
      {/* Header */}
      <div className="tm-add-head">
        <button className="tm-back" onClick={() => nav(teamId ? `/settings/team/${teamId}` : "/settings/team")} title="Back">
          <FiArrowLeft />
        </button>
        <div style={{ flex: 1 }}>
          {team && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 2 }}>
              <FiUsers style={{ verticalAlign: "middle", marginRight: 4 }} />
              Adding to <span style={{ color: team.color || "var(--primary)" }}>{team.name}</span>
            </div>
          )}
          <h1 className="page-title" style={{ margin: 0 }}>Add team member</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Create an account and decide which modules &amp; routes they can access.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="tm-add-grid">
        {/* ========== LEFT: Profile + Role ========== */}
        <div className="tm-col">
          <div className="card tm-profile-card">
            <div className="tm-card-title"><FiUser /> Profile details</div>

            <div className="tm-field">
              <label>Full name <span className="tm-req">*</span></label>
              <div className="tm-input">
                <FiUser />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alice Singh"
                />
              </div>
            </div>

            <div className="tm-field">
              <label>Email <span className="tm-req">*</span></label>
              <div className="tm-input">
                <FiMail />
                <input
                  required type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alice@acme.com"
                />
              </div>
            </div>

            <div className="tm-field">
              <label>Phone</label>
              <div className="tm-input">
                <FiPhone />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98 7654 3210"
                />
              </div>
            </div>

            <div className="tm-field">
              <label>Password <span className="tm-req">*</span></label>
              <div className="tm-input">
                <FiLock />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button" className="tm-input-btn"
                  onClick={() => setForm({ ...form, password: genPassword() })}
                  title="Generate strong password"
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button" className="tm-input-btn"
                  onClick={() => setShowPw((v) => !v)}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="tm-hint">
                Share this via your preferred channel — the member can change it after first login.
              </div>
            </div>
          </div>

          <div className="card tm-role-card">
            <div className="tm-card-title"><FiShield /> Role preset</div>
            <div className="tm-role-grid">
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    className={`tm-role ${active ? "active" : ""}`}
                    onClick={() => onRoleChange(r.value)}
                  >
                    <div className="tm-role-ic"><r.Icon /></div>
                    <div>
                      <b>{r.label}</b>
                      <span>{r.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="tm-hint">
              Picking a role pre-fills permissions below — you can still tweak individual routes.
            </div>
          </div>
        </div>

        {/* ========== RIGHT: Permissions ========== */}
        <div className="card tm-perms-card">
          <div className="tm-perms-head">
            <div>
              <div className="tm-card-title"><FiShield /> Permissions</div>
              <div className="tm-perms-sum">
                <span className="tm-count-pill">{totals.on}/{totals.total} enabled</span>
                <span className="tm-hint-inline">Module + sub-route level</span>
              </div>
            </div>
            <div className="tm-perms-actions">
              <button type="button" className="tm-mini-btn" onClick={() => selectAll(true)}>Select all</button>
              <button type="button" className="tm-mini-btn" onClick={() => selectAll(false)}>Clear</button>
            </div>
          </div>

          <div className="tm-input tm-search">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules or routes…"
            />
          </div>

          <div className="tm-perms-list">
            {visibleModules.map((m) => {
              const { on, total } = countEnabled(permissions, m.key);
              const allOn  = total > 0 && on === total;
              const someOn = on > 0 && on < total;
              const isOpen = expanded.has(m.key) || !!search.trim();

              return (
                <div key={m.key} className={`tm-mod ${allOn ? "all" : someOn ? "some" : ""}`}>
                  <div className="tm-mod-head">
                    <Checkbox
                      checked={allOn}
                      indeterminate={someOn}
                      onChange={() => toggleModule(m.key)}
                    />
                    <div className="tm-mod-ic" style={{ background: `${m.color}15`, color: m.color }}>
                      <m.Icon />
                    </div>
                    <div className="tm-mod-label">
                      <b>{m.label}</b>
                      <span>{total} route{total === 1 ? "" : "s"}</span>
                    </div>
                    <span className={`tm-count-pill ${allOn ? "all" : someOn ? "some" : "none"}`}>
                      {on}/{total}
                    </span>
                    <button
                      type="button"
                      className="tm-chev"
                      onClick={() => toggleExpand(m.key)}
                      style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <FiChevronDown />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="tm-routes">
                      {m.routes.map((r) => {
                        const checked = !!permissions?.[m.key]?.[r.key];
                        return (
                          <label key={r.key} className="tm-route">
                            <Checkbox
                              checked={checked}
                              onChange={() => togglePerm(m.key, r.key)}
                              size="sm"
                            />
                            <span className="tm-route-label">{r.label}</span>
                            <code className="tm-route-path">/{m.key}/{r.key}</code>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {visibleModules.length === 0 && (
              <div className="tm-empty">No modules match "{search}".</div>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="tm-add-actions">
          <button type="button" className="btn btn-outline" onClick={() => nav("/settings/team")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <FiSave /> {submitting ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* --------- Reusable custom checkbox --------- */
function Checkbox({ checked, indeterminate, onChange, size }) {
  return (
    <span className={`tm-cb ${size === "sm" ? "sm" : ""}`} onClick={(e) => { e.stopPropagation(); onChange?.(); }}>
      <input
        type="checkbox"
        checked={!!checked}
        readOnly
        ref={(el) => { if (el) el.indeterminate = !!indeterminate && !checked; }}
      />
      <span className={`tm-cb-box ${checked ? "on" : ""} ${indeterminate && !checked ? "indet" : ""}`} />
    </span>
  );
}

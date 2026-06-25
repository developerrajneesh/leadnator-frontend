import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid, FiUsers, FiAward, FiDollarSign, FiTarget,
  FiLifeBuoy, FiSettings, FiLogOut, FiBell,
  FiChevronDown, FiMenu, FiActivity, FiUserPlus, FiCreditCard,
} from "react-icons/fi";
import { api, getStoredUser } from "../api/client";
import { onSocket } from "../api/socket";

const NOTIF_META = {
  user:    { Icon: FiUserPlus,   color: "#10b981", bg: "#dcfce7" },
  ticket:  { Icon: FiLifeBuoy,   color: "#7c3aed", bg: "#f5f3ff" },
  payment: { Icon: FiCreditCard, color: "#f59e0b", bg: "#fef3c7" },
  default: { Icon: FiBell,       color: "#64748b", bg: "#f1f5f9" },
};

const ADMIN_NAV = [
  { to: "/admin/overview",  Icon: FiGrid,       label: "Overview",   section: "Dashboard" },
  { to: "/admin/users",     Icon: FiUsers,      label: "Users",      section: "Manage" },
  { to: "/admin/plans",     Icon: FiAward,      label: "Plans",      section: "Manage" },
  { to: "/admin/revenue",   Icon: FiDollarSign, label: "Revenue",    section: "Manage" },
  { to: "/admin/support",   Icon: FiLifeBuoy,   label: "Support",       section: "Operations" },
  { to: "/admin/logs",      Icon: FiActivity,   label: "Activity logs", section: "Operations" },
  { to: "/admin/settings",  Icon: FiSettings,   label: "Settings",      section: "Operations" },
];

// Group nav items by section so the sidebar can show category headings
// without us maintaining two parallel data structures.
const NAV_BY_SECTION = ADMIN_NAV.reduce((acc, item) => {
  (acc[item.section] = acc[item.section] || []).push(item);
  return acc;
}, {});

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);
  const user = getStoredUser() || { name: "Admin", email: "admin@example.com" };

  useEffect(() => {
    let alive = true;
    api.admin.notifications()
      .then((res) => alive && setNotifs(res.notifications || []))
      .catch(() => alive && setNotifs([]));
    return () => { alive = false; };
  }, []);

  // Real-time: a new signup pushes over the socket to admins too.
  useEffect(() => onSocket("notification:new", (n) => {
    if (n) setNotifs((list) => [{ ...n, read: false }, ...list].slice(0, 8));
  }), []);

  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const hasUnread = notifs.some((n) => !n.read);

  function markAllRead() {
    setNotifs((list) => list.map((n) => ({ ...n, read: true })));
    api.notifications.markAllRead().catch(() => {});
  }

  function openNotif(n) {
    if (!n.read && n.key) {
      setNotifs((list) => list.map((x) => (x.key === n.key ? { ...x, read: true } : x)));
      api.notifications.markRead(n.key).catch(() => {});
    }
    if (n.link) { navigate(n.link); setNotifOpen(false); }
  }

  const initials = String(user.name || "A").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="adm">
      <aside className={`adm-side ${mobileOpen ? "open" : ""}`}>
        <div className="adm-side-brand" onClick={() => navigate("/admin/overview")}>
          <img src="/leadnator_logo.png" alt="Leadnator" className="adm-side-logo-img" />
          <div>
            {/* Same gradient text colors as the user-side wordmark */}
            <div className="adm-side-brand-name">
              <span className="brand-name-lead">Lead</span><span className="brand-name-nator">nator</span>
            </div>
            <div className="adm-side-brand-tag">Admin Console</div>
          </div>
        </div>

        <nav className="adm-nav">
          {Object.entries(NAV_BY_SECTION).map(([section, items]) => (
            <div key={section} className="adm-nav-group">
              <div className="adm-nav-heading">{section}</div>
              {/* eslint-disable-next-line no-unused-vars -- Icon is used as a JSX component below */}
              {items.map(({ to, Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `adm-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-side-foot" onClick={() => setUserMenuOpen((o) => !o)}>
          <div className="adm-side-user">
            <div className="adm-side-avatar">{initials}</div>
            <div className="adm-side-user-meta">
              <div className="adm-side-user-name">{user.name || "Admin"}</div>
              <div className="adm-side-user-email">{user.email}</div>
            </div>
            <FiChevronDown style={{ color: "#94a3b8", flexShrink: 0, transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
          </div>
          {userMenuOpen && (
            <div className="adm-side-user-menu">
              <button className="adm-side-user-action danger" onClick={onLogout}>
                <FiLogOut /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && <div className="adm-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <FiMenu />
          </button>

          <div className="adm-topbar-actions">
            <div ref={notifRef} style={{ position: "relative" }}>
              <button className="adm-icon-btn" title="Notifications" onClick={() => setNotifOpen((o) => !o)}>
                <FiBell />
                {hasUnread && <span className="adm-dot" />}
              </button>
              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, maxHeight: 460, overflowY: "auto",
                  background: "#fff", border: "1px solid var(--adm-line)", borderRadius: 12,
                  boxShadow: "0 12px 32px -10px rgba(15,23,42,0.2)", zIndex: 50,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--adm-line)" }}>
                    <strong style={{ fontSize: 14 }}>Notifications</strong>
                    {hasUnread && <a onClick={markAllRead} style={{ cursor: "pointer", color: "var(--adm-primary-600)", fontSize: 12, fontWeight: 600 }}>Mark all read</a>}
                  </div>
                  {notifs.length === 0 ? (
                    <div style={{ padding: "20px 16px", color: "var(--adm-muted)", fontSize: 13, textAlign: "center" }}>No new activity.</div>
                  ) : (
                    notifs.map((n, i) => {
                      const m = NOTIF_META[n.type] || NOTIF_META.default;
                      return (
                        <div
                          key={i}
                          onClick={() => openNotif(n)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", cursor: "pointer",
                            borderBottom: "1px solid var(--adm-line)", background: n.read ? "transparent" : "#faf9ff",
                          }}
                        >
                          <span style={{ width: 34, height: 34, borderRadius: 9, background: m.bg, color: m.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <m.Icon size={16} />
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-ink)" }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: 2 }}>{n.sub}</div>
                          </div>
                          {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--adm-primary)", flexShrink: 0, marginTop: 5 }} />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <button className="adm-signout-btn" onClick={onLogout}>
              <FiLogOut /> Sign out
            </button>
          </div>
        </header>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

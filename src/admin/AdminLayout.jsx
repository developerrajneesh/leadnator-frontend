import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid, FiUsers, FiAward, FiDollarSign, FiTarget,
  FiLifeBuoy, FiSettings, FiLogOut, FiBell,
  FiChevronDown, FiMenu,
} from "react-icons/fi";
import { getStoredUser } from "../api/client";

const ADMIN_NAV = [
  { to: "/admin/overview",  Icon: FiGrid,       label: "Overview",   section: "Dashboard" },
  { to: "/admin/users",     Icon: FiUsers,      label: "Users",      section: "Manage" },
  { to: "/admin/plans",     Icon: FiAward,      label: "Plans",      section: "Manage" },
  { to: "/admin/revenue",   Icon: FiDollarSign, label: "Revenue",    section: "Manage" },
  { to: "/admin/campaigns", Icon: FiTarget,     label: "Campaigns",  section: "Manage" },
  { to: "/admin/support",   Icon: FiLifeBuoy,   label: "Support",    section: "Operations" },
  { to: "/admin/settings",  Icon: FiSettings,   label: "Settings",   section: "Operations" },
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
  const user = getStoredUser() || { name: "Admin", email: "admin@example.com" };

  const initials = String(user.name || "A").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="adm">
      <aside className={`adm-side ${mobileOpen ? "open" : ""}`}>
        <div className="adm-side-brand" onClick={() => navigate("/admin/overview")}>
          <img src="/leadnator_logo.png" alt="Leadnator" className="adm-side-logo-img" />
          <div>
            <div className="adm-side-brand-name">Leadnator</div>
            <div className="adm-side-brand-tag">Admin Console</div>
          </div>
        </div>

        <nav className="adm-nav">
          {Object.entries(NAV_BY_SECTION).map(([section, items]) => (
            <div key={section} className="adm-nav-group">
              <div className="adm-nav-heading">{section}</div>
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
            <button className="adm-icon-btn" title="Notifications">
              <FiBell />
              <span className="adm-dot" />
            </button>
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

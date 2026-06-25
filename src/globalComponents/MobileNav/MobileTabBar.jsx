import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome, FiUsers, FiCpu, FiGrid, FiX, FiMail, FiTool,
  FiCalendar, FiStar, FiLifeBuoy, FiFolder, FiSettings,
} from "react-icons/fi";
import { SiMeta, SiWhatsapp, SiInstagram } from "react-icons/si";
import { useCurrentUser } from "../../api/hooks";
import { isOrganizationLogin } from "../../api/client";
import { canAccessModule } from "../../profile/team/permissions";

// Full module list (mirrors the desktop mini-sidebar).
const ALL = [
  { to: "/dashboard",    moduleKey: "dashboard",    Icon: FiHome,      label: "Home",         brand: "#a78bfa" },
  { to: "/leads",        moduleKey: "leads",        Icon: FiUsers,     label: "Leads",        brand: "#6366f1" },
  { to: "/meta",         moduleKey: "meta",         Icon: SiMeta,      label: "Meta Ads",     brand: "#1877f2" },
  { to: "/instagram",    moduleKey: "instagram",    Icon: SiInstagram, label: "Instagram",    brand: "#e1306c" },
  { to: "/whatsapp",     moduleKey: "whatsapp",     Icon: SiWhatsapp,  label: "WhatsApp",     brand: "#25d366" },
  { to: "/email",        moduleKey: "email",        Icon: FiMail,      label: "Email",        brand: "#ea4335" },
  { to: "/integrations", moduleKey: "integrations", Icon: FiGrid,      label: "Integrations", brand: "#06b6d4" },
  { to: "/storage",      moduleKey: "storage",      Icon: FiFolder,    label: "Storage",      brand: "#facc15" },
  { to: "/autopilot",    moduleKey: "autopilot",    Icon: FiCpu,       label: "Autopilot",    brand: "#7c3aed" },
  { to: "/tools",        moduleKey: "tools",        Icon: FiTool,      label: "Tools",        brand: "#f97316" },
  { to: "/calendar",     moduleKey: "calendar",     Icon: FiCalendar,  label: "Calendar",     brand: "#4285f4" },
  { to: "/pricing",      moduleKey: "pricing",      Icon: FiStar,      label: "Pricing",      brand: "#fbbf24" },
  { to: "/support",      moduleKey: "support",      Icon: FiLifeBuoy,  label: "Support",      brand: "#ef4444" },
  { to: "/settings",     moduleKey: "settings",     Icon: FiSettings,  label: "Settings",     brand: "#64748b" },
];

// The four primary tabs shown in the bottom bar (rest live under "More").
const PRIMARY_KEYS = ["dashboard", "leads", "whatsapp", "autopilot"];

export default function MobileTabBar() {
  const user = useCurrentUser();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const allowed = ALL.filter((it) => {
    if (isOrganizationLogin() && it.moduleKey === "pricing") return false;
    return canAccessModule(user, it.moduleKey);
  });

  // Close the "More" sheet whenever the route changes.
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  const primary = PRIMARY_KEYS
    .map((k) => allowed.find((it) => it.moduleKey === k))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="mobile-tabbar">
        {primary.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `mtab ${isActive ? "active" : ""}`}>
            <Icon className="mtab-icon" />
            <span className="mtab-label">{label}</span>
          </NavLink>
        ))}
        <button type="button" className={`mtab ${moreOpen ? "active" : ""}`} onClick={() => setMoreOpen((o) => !o)}>
          <FiGrid className="mtab-icon" />
          <span className="mtab-label">More</span>
        </button>
      </nav>

      {/* "More" sheet — full module grid */}
      {moreOpen && (
        <div className="mobile-more-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="mobile-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-more-head">
              <span>All sections</span>
              <button type="button" className="icon-btn" onClick={() => setMoreOpen(false)}><FiX /></button>
            </div>
            <div className="mobile-more-grid">
              {allowed.map(({ to, Icon, label, brand }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `mmore-item ${isActive ? "active" : ""}`}>
                  <span className="mmore-icon" style={{ color: brand }}><Icon /></span>
                  <span className="mmore-label">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

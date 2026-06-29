import { NavLink } from "react-router-dom";
import {
  FiHome, FiUsers, FiMail, FiGrid, FiTool, FiCalendar,
  FiStar, FiLifeBuoy, FiFolder, FiSettings, FiCpu,
} from "react-icons/fi";
import { SiMeta, SiWhatsapp, SiInstagram } from "react-icons/si";
import { useCurrentUser } from "../../api/hooks";
import { isOrganizationLogin } from "../../api/client";
import { canAccessModule } from "../../profile/team/permissions";

const ITEMS = [
  { to: "/dashboard",    moduleKey: "dashboard",    Icon: FiHome,       label: "Home",         brand: "#a78bfa" },  // violet
  { to: "/leads",        moduleKey: "leads",        Icon: FiUsers,      label: "Leads",        brand: "#6366f1" },  // indigo
  { to: "/meta",         moduleKey: "meta",         Icon: SiMeta,       label: "Meta Ads",     brand: "#1877f2" },  // Facebook blue
  { to: "/instagram",    moduleKey: "instagram",    Icon: SiInstagram,  label: "Instagram",    brand: "#e1306c" },
  { to: "/whatsapp",     moduleKey: "whatsapp",     Icon: SiWhatsapp,   label: "WhatsApp",     brand: "#25d366" },  // WhatsApp green
  { to: "/email",        moduleKey: "email",        Icon: FiMail,       label: "Email",        brand: "#ea4335" },  // Gmail red
  { to: "/calendar",     moduleKey: "calendar",     Icon: FiCalendar,   label: "Calendar",     brand: "#4285f4" },  // Google blue
  { to: "/storage",      moduleKey: "storage",      Icon: FiFolder,     label: "Storage",      brand: "#facc15" },  // amber/folder yellow
  { to: "/autopilot",    moduleKey: "autopilot",    Icon: FiCpu,        label: "Autopilot",    brand: "#7c3aed" },  // violet
  { to: "/tools",        moduleKey: "tools",        Icon: FiTool,       label: "Tools",        brand: "#f97316" },  // orange
  { to: "/pricing",      moduleKey: "pricing",      Icon: FiStar,       label: "Pricing",      brand: "#fbbf24" },  // gold
  { to: "/support",      moduleKey: "support",      Icon: FiLifeBuoy,   label: "Support",      brand: "#ef4444" },  // red
  { to: "/settings",     moduleKey: "settings",     Icon: FiSettings,   label: "Settings",     brand: "#64748b" },  // slate
  { to: "/integrations", moduleKey: "integrations", Icon: FiGrid,       label: "Integrations", brand: "#06b6d4" },  // cyan
];

export default function MiniSidebar() {
  const user = useCurrentUser();
  const items = ITEMS.filter((it) => {
    if (isOrganizationLogin() && it.moduleKey === "pricing") return false;
    return canAccessModule(user, it.moduleKey);
  });
  return (
    <div className="mini-sidebar">
      {items.map(({ to, Icon, label, brand }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `mini-item ${isActive ? "active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <Icon
                className="mi-icon"
                style={{ color: isActive ? "white" : brand }}
              />
              <span className="mi-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

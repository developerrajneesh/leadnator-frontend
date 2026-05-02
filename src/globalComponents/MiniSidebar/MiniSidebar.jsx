import { NavLink } from "react-router-dom";
import {
  FiHome, FiUsers, FiMail, FiGrid, FiTool, FiCalendar,
  FiStar, FiLifeBuoy, FiFolder, FiSettings,
} from "react-icons/fi";
import { SiMeta, SiWhatsapp } from "react-icons/si";

const ITEMS = [
  { to: "/dashboard",    Icon: FiHome,       label: "Home",         brand: "#a78bfa" },  // violet
  { to: "/leads",        Icon: FiUsers,      label: "Leads",        brand: "#6366f1" },  // indigo
  { to: "/meta",         Icon: SiMeta,       label: "Meta Ads",     brand: "#1877f2" },  // Facebook blue
  { to: "/whatsapp",     Icon: SiWhatsapp,   label: "WhatsApp",     brand: "#25d366" },  // WhatsApp green
  { to: "/email",        Icon: FiMail,       label: "Email",        brand: "#ea4335" },  // Gmail red
  { to: "/integrations", Icon: FiGrid,       label: "Integrations", brand: "#06b6d4" },  // cyan
  { to: "/storage",      Icon: FiFolder,     label: "Storage",      brand: "#facc15" },  // amber/folder yellow
  { to: "/tools",        Icon: FiTool,       label: "Tools",        brand: "#f97316" },  // orange
  { to: "/calendar",     Icon: FiCalendar,   label: "Calendar",     brand: "#4285f4" },  // Google blue
  { to: "/pricing",      Icon: FiStar,       label: "Pricing",      brand: "#fbbf24" },  // gold
  { to: "/support",      Icon: FiLifeBuoy,   label: "Support",      brand: "#ef4444" },  // red
  { to: "/settings",     Icon: FiSettings,   label: "Settings",     brand: "#64748b" },  // slate
];

export default function MiniSidebar() {
  return (
    <div className="mini-sidebar">
      {ITEMS.map(({ to, Icon, label, brand }) => (
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

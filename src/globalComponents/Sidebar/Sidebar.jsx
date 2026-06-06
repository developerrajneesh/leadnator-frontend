import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useWhatsAppStatus } from "../../whatsapp/useWhatsAppStatus";
import { useMetaStatus }     from "../../meta/useMetaStatus";
import { useEmailStatus }    from "../../email/useEmailStatus";
import { useStorageStatus }  from "../../storage/useStorageStatus";
import { useCurrentUser }    from "../../api/hooks";
import { isOrganizationLogin } from "../../api/client";
import { canAccess }         from "../../profile/team/permissions";
import {
  FiHome, FiActivity, FiBarChart2, FiFileText,
  FiUsers, FiUpload, FiTag, FiStar, FiFilter,
  FiTarget, FiPlus, FiPieChart, FiCreditCard,
  FiMessageCircle, FiSend, FiInbox, FiZap, FiLayers, FiSettings,
  FiLifeBuoy, FiHelpCircle, FiBookOpen, FiMessageSquare,
  FiAward, FiClock,
  FiMail, FiEdit, FiUserCheck,
  FiUser, FiLock, FiBell, FiKey, FiShield,
  FiGrid, FiCheckCircle, FiLink, FiTool,
  FiCalendar,
  FiChevronsLeft,
  FiFile,
  FiHash, FiGlobe, FiTrendingUp,
  FiFolder, FiTrash,
  FiCpu,
  FiImage,
} from "react-icons/fi";

export const SECTIONS = {
  dashboard: {
    base: "/dashboard",
    title: "Dashboard",
    items: [
      { to: "overview",  Icon: FiHome,      label: "Overview" },
      { to: "activity",  Icon: FiActivity,  label: "Recent activity" },
      { to: "analytics", Icon: FiPieChart,  label: "Analytics" },
      { to: "reports",   Icon: FiBarChart2, label: "Reports" },
      { to: "exports",   Icon: FiFileText,  label: "Exports" },
    ],
  },
  leads: {
    base: "/leads",
    title: "Leads",
    items: [
      { to: "overview",    Icon: FiHome,      label: "Overview" },
      { to: "all",         Icon: FiUsers,     label: "All leads" },
      { to: "pipeline",    Icon: FiLayers,    label: "Pipeline (Kanban)" },
      { to: "funnel",      Icon: FiPieChart,  label: "Funnel" },
      { to: "hot",         Icon: FiStar,      label: "Hot leads" },
      { to: "meta-forms",  Icon: FiTarget,    label: "Meta Form leads" },
      { to: "automation",  Icon: FiZap,       label: "Automation" },
      { to: "import",      Icon: FiUpload,    label: "Import CSV" },
      { to: "sources",     Icon: FiFilter,    label: "Sources" },
      { to: "tags",        Icon: FiTag,       label: "Tags & lists" },
      { to: "settings",    Icon: FiSettings,  label: "Settings" },
    ],
  },
  meta: {
    base: "/meta",
    title: "Meta Ads",
    items: [
      { to: "overview",  Icon: FiHome,      label: "Overview" },
      { to: "campaigns", Icon: FiTarget,    label: "Campaigns" },
      { to: "create",    Icon: FiPlus,      label: "Create campaign" },
      { to: "analytics", Icon: FiPieChart,  label: "Analytics" },
      { to: "forms",     Icon: FiFileText,  label: "Lead forms" },
      { to: "webhook",   Icon: FiLink,      label: "Lead webhook" },
      { to: "accounts",  Icon: FiCreditCard,label: "Ad accounts" },
      { to: "audiences", Icon: FiUsers,     label: "Audiences" },
    ],
  },
  instagram: {
    base: "/instagram",
    title: "Instagram",
    items: [
      { to: "overview",   Icon: FiHome,          label: "Overview" },
      { to: "inbox",      Icon: FiInbox,         label: "DM Inbox" },
      { to: "comments",   Icon: FiMessageCircle, label: "Comments" },
      { to: "automation", Icon: FiZap,           label: "Automation" },
      { to: "content",    Icon: FiImage,         label: "Content" },
      { to: "analytics",  Icon: FiBarChart2,     label: "Analytics" },
      { to: "webhook",    Icon: FiLink,          label: "Webhook" },
      { to: "settings",   Icon: FiSettings,      label: "Settings" },
    ],
  },
  whatsapp: {
    base: "/whatsapp",
    title: "WhatsApp Marketing",
    items: [
      { to: "overview",   Icon: FiHome,          label: "Overview" },
      { to: "broadcasts", Icon: FiSend,          label: "Broadcasts" },
      { to: "templates",  Icon: FiLayers,        label: "Templates" },
      { to: "inbox",      Icon: FiInbox,         label: "Inbox" },
      { to: "automation", Icon: FiZap,           label: "Automation" },
      { to: "contacts",   Icon: FiMessageCircle, label: "Contacts" },
      { to: "chatbot",    Icon: FiCpu,           label: "Chatbot" },
      { to: "webhook",    Icon: FiLink,          label: "Webhook" },
      { to: "analytics",  Icon: FiBarChart2,     label: "Analytics" },
      { to: "reports",    Icon: FiPieChart,      label: "Reports" },
      { to: "forms",      Icon: FiFileText,      label: "Forms" },
      { to: "settings",   Icon: FiSettings,      label: "Settings" },
    ],
  },
  email: {
    base: "/email",
    title: "Email Marketing",
    items: [
      { to: "overview",    Icon: FiHome,       label: "Overview" },
      { to: "campaigns",   Icon: FiMail,       label: "Campaigns" },
      { to: "create",      Icon: FiEdit,       label: "Create campaign" },
      { to: "templates",   Icon: FiLayers,     label: "Templates" },
      { to: "automation",  Icon: FiZap,        label: "Automation" },
      { to: "subscribers", Icon: FiUserCheck,  label: "Subscribers" },
      { to: "analytics",   Icon: FiPieChart,   label: "Analytics" },
      { to: "signature",   Icon: FiEdit,       label: "Signature" },
      { to: "config",      Icon: FiSettings,   label: "SMTP config" },
    ],
  },
  integrations: {
    base: "/integrations",
    title: "Integrations",
    items: [
      { to: "overview",   Icon: FiHome,        label: "Overview" },
      { to: "browse",     Icon: FiGrid,        label: "Browse all" },
      { to: "connected",  Icon: FiCheckCircle, label: "Connected" },
      { to: "webhooks",   Icon: FiLink,        label: "Webhooks" },
      { to: "zapier",     Icon: FiZap,         label: "Zapier & Make" },
      { to: "custom",     Icon: FiTool,        label: "Custom integrations" },
    ],
  },
  storage: {
    base: "/storage",
    title: "File Storage",
    items: [
      { to: "overview",  Icon: FiHome,        label: "Overview" },
      { to: "browse",    Icon: FiFolder,      label: "My files" },
      { to: "recent",    Icon: FiClock,       label: "Recent" },
      { to: "shared",    Icon: FiUsers,       label: "Shared with me" },
      { to: "trash",     Icon: FiTrash,       label: "Trash" },
      { to: "upload",    Icon: FiUpload,      label: "Upload" },
      { to: "settings",  Icon: FiSettings,    label: "Settings" },
    ],
  },
  autopilot: {
    base: "/autopilot",
    title: "Autopilot",
    items: [
      { to: "overview", Icon: FiCpu, label: "Overview" },
      { to: "flows",    Icon: FiZap, label: "Automations" },
      { to: "webhooks", Icon: FiLink, label: "Webhooks" },
    ],
  },
  tools: {
    base: "/tools",
    title: "Free Tools",
    items: [
      { to: "overview",    Icon: FiHome,      label: "Overview" },
      { to: "ai-ad-copy",  Icon: FiTarget,    label: "✨ AI Ad copy" },
      { to: "ai-email",    Icon: FiMail,      label: "✨ AI Email writer" },
      { to: "ai-rewriter", Icon: FiEdit,      label: "✨ AI Rewriter" },
      { to: "ai-translator", Icon: FiGlobe,   label: "✨ AI Translator" },
      { to: "ai-hashtags", Icon: FiHash,      label: "✨ AI Hashtag gen" },
      { to: "ai-lead-score", Icon: FiTrendingUp, label: "✨ AI Lead scorer" },
      { to: "form",      Icon: FiFileText,     label: "Form generator" },
      { to: "invoice",   Icon: FiFile,         label: "Invoice generator" },
      { to: "utm",       Icon: FiLink,         label: "UTM builder" },
      { to: "shortener", Icon: FiZap,          label: "Link shortener" },
      { to: "qr",        Icon: FiGrid,         label: "QR code generator" },
      { to: "signature", Icon: FiEdit,         label: "Email signature" },
      { to: "signature-creator", Icon: FiEdit, label: "Signature creator" },
      { to: "stamp-creator", Icon: FiAward,     label: "Stamp creator" },
      { to: "subject",   Icon: FiMail,         label: "Subject line tester" },
      { to: "validator", Icon: FiCheckCircle,  label: "Email validator" },
      { to: "counter",   Icon: FiActivity,     label: "Word counter" },
      { to: "password",  Icon: FiLock,         label: "Password generator" },
      { to: "abtest",    Icon: FiPieChart,     label: "A/B test calculator" },
      { to: "roi",       Icon: FiBarChart2,    label: "ROI calculator" },
      { to: "slug",      Icon: FiTag,          label: "Slug generator" },
      { to: "og",        Icon: FiLayers,       label: "OG tag preview" },
    ],
  },
  calendar: {
    base: "/calendar",
    title: "Calendar",
    items: [
      { to: "overview",     Icon: FiHome,       label: "Overview" },
      { to: "month",        Icon: FiGrid,       label: "Month view" },
      { to: "week",         Icon: FiLayers,     label: "Week view" },
      { to: "agenda",       Icon: FiFileText,   label: "Agenda" },
      { to: "upcoming",     Icon: FiClock,      label: "Upcoming" },
      { to: "create",       Icon: FiPlus,       label: "Create event" },
      { to: "availability", Icon: FiCheckCircle,label: "Availability" },
      { to: "booking",      Icon: FiLink,       label: "Booking links" },
    ],
  },
  pricing: {
    base: "/pricing",
    title: "Pricing & Billing",
    items: [
      { to: "overview",  Icon: FiHome,       label: "Overview" },
      { to: "plans",     Icon: FiAward,      label: "Plans" },
      { to: "current",   Icon: FiStar,       label: "Current subscription" },
      { to: "invoices",  Icon: FiFileText,   label: "Invoices" },
      { to: "payment",   Icon: FiCreditCard, label: "Payment methods" },
      { to: "history",   Icon: FiClock,      label: "Billing history" },
    ],
  },
  support: {
    base: "/support",
    title: "Support",
    items: [
      { to: "overview", Icon: FiHome,          label: "Overview" },
      { to: "tickets",  Icon: FiLifeBuoy,      label: "My tickets" },
      { to: "new",      Icon: FiPlus,          label: "New ticket" },
      { to: "faq",      Icon: FiHelpCircle,    label: "FAQs" },
      { to: "docs",     Icon: FiBookOpen,      label: "Documentation" },
      { to: "chat",     Icon: FiMessageSquare, label: "Live chat" },
    ],
  },
  settings: {
    base: "/settings",
    title: "Settings",
    items: [
      { to: "overview",      Icon: FiHome,           label: "Overview" },
      { to: "info",          Icon: FiUser,           label: "Profile info" },
      { to: "account",       Icon: FiSettings,       label: "Account settings" },
      { to: "password",      Icon: FiLock,           label: "Password & security" },
      { to: "notifications", Icon: FiBell,           label: "Notifications" },
      { to: "sms",           Icon: FiMessageSquare,  label: "SMS settings" },
      { to: "api",           Icon: FiKey,            label: "API keys" },
      { to: "team",          Icon: FiShield,         label: "Team members" },
    ],
  },
};

function currentSection(pathname) {
  const seg = pathname.split("/")[1];
  return SECTIONS[seg] || SECTIONS.dashboard;
}

export default function Sidebar({ open, onToggle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const conf = currentSection(pathname);
  const user = useCurrentUser();
  const { status }     = useWhatsAppStatus();
  const { status: ms } = useMetaStatus();
  const { status: es } = useEmailStatus();
  const { status: ss } = useStorageStatus();

  // Integration modules: hide sub-sidebar until credentials are set up.
  // Instagram always shows its full route list — gated pages show connect UI in content.
  const seg = pathname.split("/")[1];
  if (seg === "whatsapp" && !status?.connected) return null;
  if (seg === "meta"     && !ms?.connected)     return null;
  if (seg === "email"    && !es?.configured)    return null;
  if (seg === "storage"  && !ss?.configured)    return null;

  const moduleKey = seg in SECTIONS ? seg : "dashboard";
  const visibleItems = conf.items.filter(({ to }) => canAccess(user, moduleKey, to));

  return (
    <div className={`sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-head">
        <div className="sidebar-title">{conf.title}</div>
        <button className="sidebar-collapse-btn" onClick={onToggle} title="Collapse sidebar">
          <FiChevronsLeft />
        </button>
      </div>
      <ul className="menu">
        {visibleItems.map(({ to, Icon, label }) => (
          <li key={to}>
            <NavLink
              to={`${conf.base}/${to}`}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              <Icon className="m-icon" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      {!isOrganizationLogin() && (
        <div className="sidebar-footer">
          <div className="upgrade-card">
            <h4>Unlock Pro</h4>
            <p>Unlimited leads, AI automation & API access.</p>
            <button onClick={() => navigate("/pricing/plans")}>Upgrade</button>
          </div>
        </div>
      )}
    </div>
  );
}

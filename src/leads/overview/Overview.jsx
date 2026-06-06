import {
  FiUsers, FiLayers, FiPieChart, FiStar, FiTarget,
  FiZap, FiUpload, FiFilter, FiTag, FiSettings,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function LeadsOverview() {
  return (
    <ModuleOverview
      title="Leads"
      subtitle="Capture, organise and convert every prospect"
      illustration="/Generating new leads-bro-flat.png"
      accent="purple"
      intro="The Leads module is your central CRM hub. Bring in prospects from any channel — Meta forms, CSV imports, manual entry — then track them through your pipeline, score the hot ones, and automate follow-up so nothing falls through the cracks."
      primary={{ label: "View all leads", to: "/leads/all" }}
      secondary={{ label: "Import from CSV", to: "/leads/import" }}
      features={[
        { icon: <FiUsers />,    color: "purple", title: "All leads",          desc: "A unified inbox of every prospect with filters, tags, owners and full activity history.",      to: "/leads/all" },
        { icon: <FiLayers />,   color: "pink",   title: "Pipeline (Kanban)",  desc: "Drag cards across stages — New, Contacted, Hot, Qualified — to manage deals visually.",   to: "/leads/pipeline" },
        { icon: <FiPieChart />, color: "green",  title: "Funnel",             desc: "See conversion rates between stages and spot where leads are leaking out of the funnel.", to: "/leads/funnel" },
        { icon: <FiStar />,     color: "orange", title: "Hot leads",          desc: "AI-prioritised list of leads most likely to convert this week — call them first.",         to: "/leads/hot" },
        { icon: <FiTarget />,   color: "purple", title: "Meta Form leads",    desc: "Leads pulled in real-time from your Facebook & Instagram lead-gen ad forms.",             to: "/leads/meta-forms" },
        { icon: <FiZap />,      color: "pink",   title: "Automation",         desc: "Build no-code flows: tag a lead, assign an owner, send WhatsApp/email when triggers fire.", to: "/leads/automation" },
        { icon: <FiUpload />,   color: "green",  title: "Import CSV",         desc: "Bulk-upload contacts from any tool with column mapping and dedup safeguards.",             to: "/leads/import" },
        { icon: <FiFilter />,   color: "orange", title: "Sources",            desc: "Track where every lead came from — campaign, channel, referrer — and ROI per source.",   to: "/leads/sources" },
        { icon: <FiTag />,      color: "purple", title: "Tags & lists",       desc: "Group leads by interest, segment, or campaign for targeted outreach.",                    to: "/leads/tags" },
        { icon: <FiSettings />, color: "pink",   title: "Settings",           desc: "Configure pipeline stages, custom fields, scoring rules and assignment policies.",        to: "/leads/settings" },
      ]}
    />
  );
}

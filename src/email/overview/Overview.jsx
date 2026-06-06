import {
  FiMail, FiEdit, FiLayers, FiZap, FiUserCheck,
  FiPieChart, FiSettings,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function EmailOverview() {
  return (
    <ModuleOverview
      title="Email Marketing"
      subtitle="Newsletters, drips and transactional mail in one place"
      illustration="/Email campaign-amico-flat.png"
      accent="orange"
      intro="Design email campaigns with a drag-and-drop builder, send to segments of your CRM contacts, automate drip sequences, and track opens and clicks — all from your own SMTP so deliverability stays in your control."
      primary={{ label: "Create a campaign", to: "/email/create" }}
      secondary={{ label: "Configure SMTP", to: "/email/config" }}
      features={[
        { icon: <FiMail />,      color: "orange", title: "Campaigns",         desc: "All your one-off blasts in one list — drafts, scheduled, sent — with delivery stats.",       to: "/email/campaigns" },
        { icon: <FiEdit />,      color: "purple", title: "Create campaign",   desc: "Drag-and-drop email builder with image library, merge tags and instant test send.",         to: "/email/create" },
        { icon: <FiLayers />,    color: "pink",   title: "Templates",         desc: "Reusable starting points — newsletter, promo, welcome — clone and customise per send.",   to: "/email/templates" },
        { icon: <FiZap />,       color: "green",  title: "Automation",        desc: "Drip sequences and trigger-based emails — fire when a tag is added or a stage changes.",   to: "/email/automation" },
        { icon: <FiUserCheck />, color: "purple", title: "Subscribers",       desc: "Manage your mailing lists, opt-ins, suppression list and bounce handling.",                to: "/email/subscribers" },
        { icon: <FiPieChart />,  color: "orange", title: "Analytics",         desc: "Open, click, bounce, unsubscribe — drill down per-campaign or aggregated.",                to: "/email/analytics" },
        { icon: <FiEdit />,      color: "pink",   title: "Signature",         desc: "Branded signature you can append to every outgoing campaign and reply.",                   to: "/email/signature" },
        { icon: <FiSettings />,  color: "green",  title: "SMTP config",       desc: "Plug in your SMTP / SES / SendGrid creds — your domain, your reputation.",                 to: "/email/config" },
      ]}
    />
  );
}

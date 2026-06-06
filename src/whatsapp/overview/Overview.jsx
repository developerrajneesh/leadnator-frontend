import {
  FiSend, FiLayers, FiInbox, FiZap, FiMessageCircle,
  FiCpu, FiLink, FiBarChart2, FiPieChart, FiFileText, FiSettings,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function WhatsAppOverview() {
  return (
    <ModuleOverview
      title="WhatsApp Marketing"
      subtitle="Reach customers where they actually reply"
      illustration="/Chatting-bro-flat.png"
      accent="green"
      intro="Run end-to-end WhatsApp marketing on the official Cloud API: send approved-template broadcasts to thousands at once, chat one-to-one in a shared inbox, build chatbots, and trigger automations from any CRM event — all without leaving the app."
      primary={{ label: "Send a broadcast", to: "/whatsapp/broadcasts" }}
      secondary={{ label: "Open inbox", to: "/whatsapp/inbox" }}
      features={[
        { icon: <FiSend />,          color: "green",  title: "Broadcasts",  desc: "Send approved-template campaigns to large audiences with delivery tracking and rate-limit handling.", to: "/whatsapp/broadcasts" },
        { icon: <FiLayers />,        color: "purple", title: "Templates",   desc: "Create, edit and submit Meta-approved message templates with variables and media.",                  to: "/whatsapp/templates" },
        { icon: <FiInbox />,         color: "pink",   title: "Inbox",       desc: "Team inbox for one-to-one chats — assign conversations, reply with templates, attach files.",         to: "/whatsapp/inbox" },
        { icon: <FiZap />,           color: "orange", title: "Automation",  desc: "Trigger messages from CRM events: new lead, stage change, abandoned form — fully no-code.",          to: "/whatsapp/automation" },
        { icon: <FiMessageCircle />, color: "green",  title: "Contacts",    desc: "Manage subscribers, opt-ins, segments and import from your phone book or CRM.",                       to: "/whatsapp/contacts" },
        { icon: <FiCpu />,           color: "purple", title: "Chatbot",     desc: "Visual bot builder — qualify leads, answer FAQs, hand off to a human when intent gets complex.",      to: "/whatsapp/chatbot" },
        { icon: <FiLink />,          color: "pink",   title: "Webhook",     desc: "Forward incoming messages and delivery events to any external system in real-time.",                  to: "/whatsapp/webhook" },
        { icon: <FiBarChart2 />,     color: "orange", title: "Analytics",   desc: "Sent, delivered, read, replied — measure every campaign and message-template performance.",           to: "/whatsapp/analytics" },
        { icon: <FiPieChart />,      color: "green",  title: "Reports",     desc: "Downloadable performance reports for any date range — perfect for client/agency reviews.",            to: "/whatsapp/reports" },
        { icon: <FiFileText />,      color: "purple", title: "Forms",       desc: "Inline forms inside chats — collect name, email, address through guided template flows.",             to: "/whatsapp/forms" },
        { icon: <FiSettings />,      color: "pink",   title: "Settings",    desc: "Phone numbers, business profile, working hours, auto-reply and API credentials.",                     to: "/whatsapp/settings" },
      ]}
    />
  );
}

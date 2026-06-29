import {
  FiInbox, FiMessageCircle, FiZap, FiBarChart2, FiLink, FiSettings, FiImage,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function InstagramOverview() {
  return (
    <>
      <ModuleOverview
        title="Instagram"
        subtitle="DMs, comments & automations in one place"
        illustration="/Chatting-bro-flat.png"
        accent="pink"
        intro="Connect your Instagram Business account to manage direct messages, reply to comments, and run automations — welcome DMs, keyword triggers, comment-to-DM flows, and more."
        primary={{ label: "Connect Instagram", to: "/instagram/connect" }}
        secondary={{ label: "Set up automation", to: "/instagram/automation" }}
        features={[
          { icon: <FiInbox />,         color: "pink",   title: "DM Inbox",      desc: "Read and reply to Instagram direct messages from a unified team inbox.",           to: "/instagram/inbox" },
          { icon: <FiMessageCircle />, color: "purple", title: "Comments",      desc: "View post comments and reply instantly — or auto-reply with saved templates.",    to: "/instagram/comments" },
          { icon: <FiZap />,           color: "orange", title: "Automation",    desc: "Build flows for new DMs, keywords, comments, and story mentions.",                to: "/instagram/automation" },
          { icon: <FiImage />,         color: "green",  title: "Content",       desc: "See recent posts and engagement — plan replies and campaigns.",                   to: "/instagram/content" },
          { icon: <FiBarChart2 />,     color: "pink",   title: "Analytics",     desc: "Track DMs sent/received, active flows, and comment response rates.",             to: "/instagram/analytics" },
          { icon: <FiLink />,          color: "purple", title: "Webhook",       desc: "Receive real-time events for messages, comments, and mentions.",                  to: "/instagram/webhook" },
          { icon: <FiSettings />,      color: "orange", title: "Settings",      desc: "Auto-replies, connected account, and disconnect.",                                to: "/instagram/settings" },
        ]}
      />
    </>
  );
}

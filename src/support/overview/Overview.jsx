import {
  FiLifeBuoy, FiPlus, FiHelpCircle, FiBookOpen, FiMessageSquare,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function SupportOverview() {
  return (
    <ModuleOverview
      title="Support"
      subtitle="We've got your back — pick the channel that suits you"
      illustration="/Team spirit-bro-flat.png"
      accent="green"
      intro="Stuck on something? Search our FAQs, browse the documentation, raise a ticket or jump on live chat. Our team replies in business hours and the docs are open 24/7."
      primary={{ label: "Open a new ticket", to: "/support/new" }}
      secondary={{ label: "Read the docs", to: "/support/docs" }}
      features={[
        { icon: <FiLifeBuoy />,      color: "purple", title: "My tickets",     desc: "Every support request you've raised — status, replies and SLA timer.",                to: "/support/tickets" },
        { icon: <FiPlus />,          color: "green",  title: "New ticket",     desc: "Describe an issue, attach screenshots — our team picks it up within an hour.",       to: "/support/new" },
        { icon: <FiHelpCircle />,    color: "orange", title: "FAQs",           desc: "The quickest answers to the questions we hear most often.",                            to: "/support/faq" },
        { icon: <FiBookOpen />,      color: "pink",   title: "Documentation",  desc: "How-tos, API reference and integration guides — always up to date.",                   to: "/support/docs" },
        { icon: <FiMessageSquare />, color: "purple", title: "Live chat",      desc: "Talk to a real human — Mon–Sat, 9 am to 8 pm IST.",                                    to: "/support/chat" },
      ]}
    />
  );
}

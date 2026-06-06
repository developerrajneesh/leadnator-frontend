import {
  FiGrid, FiCheckCircle, FiLink, FiZap, FiTool,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function IntegrationsOverview() {
  return (
    <ModuleOverview
      title="Integrations"
      subtitle="Connect your CRM to the tools you already use"
      illustration="/Online world-amico-flat.png"
      accent="blue"
      intro="Pipe leads, contacts and events between this CRM and the rest of your stack — Google Sheets, Slack, Zapier, your own webhooks, custom REST endpoints. Browse the catalogue, connect with a click, then watch data flow both ways."
      primary={{ label: "Browse integrations", to: "/integrations/browse" }}
      secondary={{ label: "View connected", to: "/integrations/connected" }}
      features={[
        { icon: <FiGrid />,        color: "purple", title: "Browse all",          desc: "Catalogue of every supported integration — search by name or category.",                       to: "/integrations/browse" },
        { icon: <FiCheckCircle />, color: "green",  title: "Connected",           desc: "Manage everything you've already linked: pause, reconnect, delete or re-authorise.",            to: "/integrations/connected" },
        { icon: <FiLink />,        color: "orange", title: "Webhooks",            desc: "Outgoing webhooks fired on CRM events (lead.created, deal.won, …) — to any URL.",               to: "/integrations/webhooks" },
        { icon: <FiZap />,         color: "pink",   title: "Zapier & Make",       desc: "Trigger 5,000+ apps with no-code workflows via Zapier or Make (Integromat).",                   to: "/integrations/zapier" },
        { icon: <FiTool />,        color: "purple", title: "Custom integrations", desc: "Build your own integration with our REST API and OAuth — bring your stack to the CRM.",        to: "/integrations/custom" },
      ]}
    />
  );
}

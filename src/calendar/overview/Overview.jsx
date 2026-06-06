import {
  FiGrid, FiLayers, FiFileText, FiClock, FiPlus,
  FiCheckCircle, FiLink,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function CalendarOverview() {
  return (
    <ModuleOverview
      title="Calendar"
      subtitle="Schedule meetings, demos and follow-ups in one place"
      illustration="/Calendar-bro-flat.png"
      accent="blue"
      intro="A unified calendar for your CRM — see every event tied to a lead, share booking links so prospects pick a slot themselves, set your weekly availability and never let a follow-up slip again."
      primary={{ label: "View this month", to: "/calendar/month" }}
      secondary={{ label: "Create a booking link", to: "/calendar/booking" }}
      features={[
        { icon: <FiGrid />,        color: "purple", title: "Month view",     desc: "Classic month grid — every event coloured by type and lead status.",                  to: "/calendar/month" },
        { icon: <FiLayers />,      color: "pink",   title: "Week view",      desc: "Hour-by-hour week layout for tight planning of demos and calls.",                     to: "/calendar/week" },
        { icon: <FiFileText />,    color: "green",  title: "Agenda",         desc: "Linear list of upcoming items — quickly skim what's next without the grid.",          to: "/calendar/agenda" },
        { icon: <FiClock />,       color: "orange", title: "Upcoming",       desc: "Just the next 7 days — perfect quick-glance dashboard for your morning.",            to: "/calendar/upcoming" },
        { icon: <FiPlus />,        color: "purple", title: "Create event",   desc: "Schedule a meeting, attach a lead, send invites and reminders automatically.",         to: "/calendar/create" },
        { icon: <FiCheckCircle />, color: "pink",   title: "Availability",   desc: "Set working hours, buffer time and timezone so booking links pick valid slots only.", to: "/calendar/availability" },
        { icon: <FiLink />,        color: "green",  title: "Booking links",  desc: "Public links your prospects use to self-book — Calendly-style, branded.",             to: "/calendar/booking" },
      ]}
    />
  );
}

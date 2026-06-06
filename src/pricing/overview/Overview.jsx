import {
  FiAward, FiStar, FiFileText, FiCreditCard, FiClock,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function PricingOverview() {
  return (
    <ModuleOverview
      title="Pricing & Billing"
      subtitle="Plans, payment methods and every invoice in one place"
      illustration="/leadership-amico-flat.png"
      accent="orange"
      intro="See what plan you're on, when it renews, and what unlocks at the next tier. Compare plans side-by-side, manage payment methods, download invoices for accounting and review your full billing history."
      primary={{ label: "View plans", to: "/pricing/plans" }}
      secondary={{ label: "My subscription", to: "/pricing/current" }}
      features={[
        { icon: <FiAward />,      color: "orange", title: "Plans",                 desc: "Compare Starter, Growth and Pro side-by-side — feature by feature.",                  to: "/pricing/plans" },
        { icon: <FiStar />,       color: "purple", title: "Current subscription",  desc: "Your active plan, renewal date, usage limits and what's included.",                   to: "/pricing/current" },
        { icon: <FiFileText />,   color: "pink",   title: "Invoices",              desc: "Download GST-compliant PDF invoices for every charge — perfect for accounting.",      to: "/pricing/invoices" },
        { icon: <FiCreditCard />, color: "green",  title: "Payment methods",       desc: "Add, replace or remove cards and UPI — set a default for future renewals.",          to: "/pricing/payment" },
        { icon: <FiClock />,      color: "orange", title: "Billing history",       desc: "Timeline of every charge, refund and plan change — fully exportable.",                to: "/pricing/history" },
      ]}
    />
  );
}

import {
  FiTarget, FiMail, FiEdit, FiGlobe, FiHash, FiTrendingUp,
  FiFileText, FiFile, FiLink, FiZap, FiGrid, FiCheckCircle,
  FiActivity, FiLock, FiPieChart, FiBarChart2, FiTag, FiLayers, FiAward,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function ToolsOverview() {
  return (
    <ModuleOverview
      title="Free Tools"
      subtitle="A growing kit of marketer's utilities — no signup, no fluff"
      illustration="/Team goals-bro-flat.png"
      accent="purple"
      intro="A curated set of single-purpose tools that save you a tab. AI helpers for ad copy, emails, translation and lead scoring — plus the everyday workhorses: UTM builders, QR codes, password generators and a dozen more. Use any of them as often as you like."
      primary={{ label: "Try AI Ad copy", to: "/tools/ai-ad-copy" }}
      secondary={{ label: "Open Invoice generator", to: "/tools/invoice" }}
      features={[
        { icon: <FiTarget />,     color: "purple", title: "AI Ad copy",         desc: "Generate Meta / Google ad headlines and primary text from a one-line product brief.",   to: "/tools/ai-ad-copy" },
        { icon: <FiMail />,       color: "pink",   title: "AI Email writer",    desc: "Draft outreach, follow-ups and newsletters with tone and length controls.",             to: "/tools/ai-email" },
        { icon: <FiEdit />,       color: "orange", title: "AI Rewriter",        desc: "Rewrite copy to be shorter, friendlier, more formal — or in another voice entirely.",  to: "/tools/ai-rewriter" },
        { icon: <FiGlobe />,      color: "green",  title: "AI Translator",      desc: "Translate marketing copy between 30+ languages while keeping tone intact.",             to: "/tools/ai-translator" },
        { icon: <FiHash />,       color: "purple", title: "AI Hashtag gen",     desc: "Get a niche-tuned set of hashtags for any post idea — Instagram, X, LinkedIn.",         to: "/tools/ai-hashtags" },
        { icon: <FiTrendingUp />, color: "pink",   title: "AI Lead scorer",     desc: "Score a lead 0-100 from name, role and company signals — paste a list, get a CSV.",   to: "/tools/ai-lead-score" },
        { icon: <FiFileText />,   color: "orange", title: "Form generator",     desc: "Build embeddable lead-capture forms with custom fields and webhook delivery.",           to: "/tools/form" },
        { icon: <FiFile />,       color: "green",  title: "Invoice generator", desc: "Quick branded PDF invoices — perfect for freelancers and small agencies.",              to: "/tools/invoice" },
        { icon: <FiLink />,       color: "purple", title: "UTM builder",        desc: "Generate trackable campaign URLs with consistent UTM parameters.",                       to: "/tools/utm" },
        { icon: <FiZap />,        color: "pink",   title: "Link shortener",     desc: "Branded short links with click tracking — paste a URL, get a tiny one back.",           to: "/tools/shortener" },
        { icon: <FiGrid />,       color: "orange", title: "QR code generator",  desc: "PNG / SVG QR codes for URLs, vCards or WhatsApp deep-links.",                            to: "/tools/qr" },
        { icon: <FiEdit />,       color: "green",  title: "Email signature",    desc: "Polished HTML signatures with avatar, social links and click tracking.",                 to: "/tools/signature" },
        { icon: <FiEdit />,       color: "purple", title: "Signature creator",  desc: "Draw or type a signature and download PNG for invoices and PDFs.",                     to: "/tools/signature-creator" },
        { icon: <FiAward />,      color: "pink",   title: "Stamp creator",      desc: "Round or rectangle company seals — CIN, location, authorized signatory.",              to: "/tools/stamp-creator" },
        { icon: <FiMail />,       color: "purple", title: "Subject line tester",desc: "Score subject lines for open-rate predictors: length, sentiment, spam triggers.",        to: "/tools/subject" },
        { icon: <FiCheckCircle />,color: "pink",   title: "Email validator",    desc: "Validate any email — syntax, domain, MX, disposable detection.",                         to: "/tools/validator" },
        { icon: <FiActivity />,   color: "orange", title: "Word counter",       desc: "Words, characters, sentences, reading time — live as you type.",                         to: "/tools/counter" },
        { icon: <FiLock />,       color: "green",  title: "Password generator", desc: "Strong passwords with length, symbol and entropy controls.",                              to: "/tools/password" },
        { icon: <FiPieChart />,   color: "purple", title: "A/B test calculator",desc: "Plug in conversions and visitors, get statistical significance and lift.",               to: "/tools/abtest" },
        { icon: <FiBarChart2 />,  color: "pink",   title: "ROI calculator",     desc: "Estimate marketing ROI from spend, conversion rate and average deal size.",              to: "/tools/roi" },
        { icon: <FiTag />,        color: "orange", title: "Slug generator",     desc: "SEO-friendly URL slugs from any title — handles unicode and stop-words.",                to: "/tools/slug" },
        { icon: <FiLayers />,     color: "green",  title: "OG tag preview",     desc: "Preview how your URL renders on Facebook, X and LinkedIn — fix metadata before sharing.", to: "/tools/og" },
      ]}
    />
  );
}

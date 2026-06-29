import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPhone, FiLink, FiFileText, FiArrowRight,
  FiZap, FiPhoneCall, FiTrendingUp, FiUsers, FiGlobe,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { metaApi } from "../../api/meta";
import "./Create.css";

// Launchpad — pick an ad goal (LCM "Click to …" flow). Each goal opens its own
// Campaign → Ad Set → Creative → Launch wizard.
const GOALS = [
  {
    title: "Click to WhatsApp", desc: "Drive valuable conversations straight to your WhatsApp",
    Icon: FaWhatsapp, DecoIcon: FaWhatsapp, color: "#22C55E",
    chip: "High engagement", ChipIcon: FiZap,
    route: "/meta/create/whatsapp/campaign",
  },
  {
    title: "Click to Call", desc: "Get more phone calls from your ads",
    Icon: FiPhone, DecoIcon: FiPhone, color: "#F97316",
    chip: "Boost call volume", ChipIcon: FiPhoneCall,
    route: "/meta/create/call/campaign",
  },
  {
    title: "Click to Website", desc: "Send more people to your website or landing page",
    Icon: FiLink, DecoIcon: FiGlobe, color: "#EC4899",
    chip: "Increase traffic", ChipIcon: FiTrendingUp,
    route: "/meta/create/link/campaign",
  },
  {
    title: "Lead Form Ads", desc: "Collect leads and grow your customer base",
    Icon: FiFileText, DecoIcon: FiFileText, color: "#3B82F6",
    chip: "Generate quality leads", ChipIcon: FiUsers,
    route: "/meta/create/lead-form/campaign",
  },
];

export default function Create() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi.status()
      .then((s) => {
        setStatus(s);
        const acc = s?.selectedAdAccountId || s?.accounts?.[0]?.account_id || s?.accounts?.[0]?.id || "";
        if (acc) {
          // The flow components read the account id from localStorage; the FB
          // token stays server-side (injected by the backend).
          localStorage.setItem("fb_ad_account_id", acc);
          localStorage.setItem("fb_access_token", "server-injected");
        }
      })
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading your Meta ad account…</div>;
  }

  const acc = status?.selectedAdAccountId || status?.accounts?.[0]?.account_id || status?.accounts?.[0]?.id || "";
  if (!status?.connected || !acc) {
    return (
      <div className="card" style={{ maxWidth: 560, padding: 36, textAlign: "center", margin: "24px auto" }}>
        <h2 className="page-title" style={{ marginBottom: 6 }}>Connect a Meta ad account</h2>
        <p className="page-subtitle" style={{ marginBottom: 18 }}>Connect Facebook and pick an ad account to start creating campaigns.</p>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Meta accounts</button>
      </div>
    );
  }

  return (
    <div className="mc-wrap">
      <div className="mc-head">
        <div className="mc-head-left">
          <h1>Create campaign</h1>
          <p>Choose a goal to get started with your Meta ad campaign.</p>
        </div>
      </div>

      <div className="mc-grid">
        {GOALS.map((g) => (
          <button
            key={g.title}
            onClick={() => navigate(g.route)}
            className="mc-card"
            style={{ "--mc-accent": g.color }}
          >
            <span className="mc-deco" aria-hidden="true"><g.DecoIcon /></span>
            <span className="mc-icon"><g.Icon /></span>
            <span className="mc-body">
              <span className="mc-title">{g.title}</span>
              <span className="mc-desc">{g.desc}</span>
              <span className="mc-chip"><g.ChipIcon /> {g.chip}</span>
            </span>
            <span className="mc-arrow"><FiArrowRight /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

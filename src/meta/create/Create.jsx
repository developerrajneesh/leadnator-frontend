import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiLink, FiFileText, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { metaApi } from "../../api/meta";

// Launchpad — pick an ad goal (LCM "Click to …" flow). Each goal opens its own
// Campaign → Ad Set → Creative → Launch wizard.
const GOALS = [
  { title: "Click to WhatsApp", desc: "Drive chats straight to your WhatsApp", Icon: FaWhatsapp, color: "#25D366", route: "/meta/create/whatsapp/campaign" },
  { title: "Click to Call", desc: "Get phone calls from your ads", Icon: FiPhone, color: "#F97316", route: "/meta/create/call/campaign" },
  { title: "Click to Website", desc: "Send traffic to your website", Icon: FiLink, color: "#EC4899", route: "/meta/create/link/campaign" },
  { title: "Lead Form Ads", desc: "Collect leads with instant forms", Icon: FiFileText, color: "#3B82F6", route: "/meta/create/lead-form/campaign" },
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
    <>
      <h1 className="page-title">Create campaign</h1>
      <p className="page-subtitle">Pick a goal to start building your Meta ad.</p>
      <div className="grid-2" style={{ marginTop: 14 }}>
        {GOALS.map((g) => (
          <button
            key={g.title}
            onClick={() => navigate(g.route)}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", cursor: "pointer", padding: 20, border: "1px solid var(--border)" }}
          >
            <span style={{ width: 50, height: 50, borderRadius: 12, display: "grid", placeItems: "center", background: `${g.color}1a`, color: g.color, fontSize: 24, flexShrink: 0 }}>
              <g.Icon />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>{g.title}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{g.desc}</span>
            </span>
            <FiArrowRight style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </>
  );
}

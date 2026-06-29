import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPhone, FiLink, FiFileText, FiArrowRight, FiTarget, FiUsers, FiLayers,
  FiImage, FiPieChart, FiActivity, FiCreditCard, FiZap, FiInfo, FiSend,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SiMeta } from "react-icons/si";
import { metaApi } from "../../api/meta";

/* Capabilities / "how to use" landing for Meta Ads — mirrors the Autopilot
 * overview style. The live account snapshot now lives at /meta/account-info. */

const GOALS = [
  { Icon: FaWhatsapp, color: "#25D366", title: "Click to WhatsApp", desc: "Drive chats straight to your WhatsApp number.", route: "/meta/create/whatsapp/campaign" },
  { Icon: FiPhone,    color: "#F97316", title: "Click to Call",     desc: "Get phone calls from people who tap your ad.", route: "/meta/create/call/campaign" },
  { Icon: FiLink,     color: "#EC4899", title: "Click to Website",  desc: "Send qualified traffic to any landing page.", route: "/meta/create/link/campaign" },
  { Icon: FiFileText, color: "#3B82F6", title: "Lead Form Ads",     desc: "Collect leads with native instant forms.", route: "/meta/create/lead-form/campaign" },
];

const SECTIONS = [
  {
    title: "Build — pick a campaign goal",
    color: "#1877f2",
    items: GOALS.map((g) => ({ Icon: g.Icon, title: g.title, desc: g.desc })),
  },
  {
    title: "Target & create — reach the right people",
    color: "#7c3aed",
    items: [
      { Icon: FiUsers,  title: "Audiences", desc: "Build & save custom / lookalike audiences and reuse them across ad sets." },
      { Icon: FiLayers, title: "Ad sets", desc: "Set budget, schedule, placements and detailed targeting per ad set." },
      { Icon: FiImage,  title: "Ad creatives", desc: "Upload media, write copy, add a call-to-action and preview the ad." },
      { Icon: FiTarget, title: "Campaigns", desc: "Manage every campaign, ad set and ad — pause, edit or duplicate." },
    ],
  },
  {
    title: "Capture & measure — turn ads into leads",
    color: "#10b981",
    items: [
      { Icon: FiFileText, title: "Lead forms", desc: "Create instant forms and view every submission inside Leadnator." },
      { Icon: FiZap,      title: "Lead webhook", desc: "New form leads flow straight into your CRM in real time." },
      { Icon: FiPieChart, title: "Analytics", desc: "Spend, impressions, clicks, CTR, CPC, CPM and reach in one place." },
      { Icon: FiCreditCard, title: "Ad accounts", desc: "Connect Facebook, switch ad accounts and check available funds." },
    ],
  },
];

const STEPS = [
  { n: 1, title: "Connect your ad account", desc: "Log in with Facebook and pick the ad account you want to advertise from." },
  { n: 2, title: "Pick a goal & build", desc: "Choose WhatsApp, Call, Website or Lead Form, then set campaign → ad set → creative." },
  { n: 3, title: "Launch & track", desc: "Publish your ad and watch spend, leads and performance update live." },
];

export default function MetaOverview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    metaApi.status().then(setStatus).catch(() => setStatus(null));
  }, []);

  const connected = !!status?.connected;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Meta Ads</h1>
          <div className="page-subtitle" style={{ marginBottom: 0 }}>Run WhatsApp, Call, Website and Lead-Form campaigns on Facebook & Instagram — and capture every lead in your CRM.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => navigate("/meta/account-info")}>
            <FiInfo style={{ marginRight: 6 }} /> Account info
          </button>
          {connected
            ? <button className="btn btn-primary" onClick={() => navigate("/meta/create")}>Create campaign <FiArrowRight style={{ marginLeft: 6 }} /></button>
            : <button className="btn btn-primary" onClick={() => navigate("/meta/connect")}><SiMeta style={{ marginRight: 6 }} /> Connect Meta</button>}
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <div className="card-header"><div className="card-title"><SiMeta /> How Meta Ads works here</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#e7f0ff", color: "#1877f2", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>{s.n}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you can do */}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "22px 0 4px" }}>What you can do</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>Everything you need to launch and grow Meta ad campaigns.</p>

      {SECTIONS.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: sec.color }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{sec.title}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {sec.items.map((it) => (
              <div key={it.title} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start", margin: 0 }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: `${sec.color}1a`, color: sec.color, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
                  <it.Icon />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{it.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick-start goal cards */}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "22px 0 4px" }}>Start a campaign</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>Pick a goal — each one opens its own Campaign → Ad set → Creative → Launch wizard.</p>
      <div className="grid-2">
        {GOALS.map((g) => (
          <button
            key={g.title}
            onClick={() => navigate(connected ? g.route : "/meta/connect")}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", cursor: "pointer", padding: 20, border: "1px solid var(--border)", margin: 0 }}
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

      {/* CTA footer */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 18, background: "linear-gradient(90deg,#1877f20d,#10b9810d)" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}><FiSend style={{ verticalAlign: "middle", marginRight: 6 }} />Ready to advertise?</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{connected ? "Launch your next campaign in minutes." : "Connect your Meta account to get started."}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => navigate("/meta/analytics")}><FiActivity style={{ marginRight: 6 }} /> Analytics</button>
          {connected
            ? <button className="btn btn-primary" onClick={() => navigate("/meta/create")}>Create campaign <FiArrowRight style={{ marginLeft: 6 }} /></button>
            : <button className="btn btn-primary" onClick={() => navigate("/meta/connect")}>Connect Meta <FiArrowRight style={{ marginLeft: 6 }} /></button>}
        </div>
      </div>
    </div>
  );
}

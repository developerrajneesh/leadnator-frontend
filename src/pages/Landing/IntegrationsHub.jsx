import {
  FaWhatsapp, FaFacebook, FaInstagram, FaGoogle, FaShopify,
} from "react-icons/fa";
import {
  SiMeta, SiRazorpay, SiWoocommerce, SiGooglesheets, SiGmail,
  SiStripe, SiZapier, SiMake, SiHubspot, SiSalesforce, SiCalendly, SiZoom,
  SiGooglecalendar, SiMailchimp,
} from "react-icons/si";

/* ==========================================================
   Hub-and-spoke Integrations visualization.
   Center: Leadnator logo. Spokes: SVG bezier curves reaching
   out to app cards positioned on both sides.
   The SVG viewBox matches the container — card positions and
   path end-points are therefore pre-calculable at design time
   (no runtime getBoundingClientRect needed).
   ========================================================== */

// Vertical spacing of the 8 cards per side
// Container is 600px tall. Cards start at y=48 and repeat every 68px.
const CARD_Y = [48, 116, 184, 252, 320, 388, 456, 524];

// Left card inner edge x — right side of the card
const LEFT_EDGE_X = 260;
// Right card inner edge x — left side of the card
const RIGHT_EDGE_X = 740;
// Hub center
const HUB_X = 500;
const HUB_Y = 286;
const HUB_R = 58;

const LEFT = [
  { name: "WhatsApp Cloud",  Icon: FaWhatsapp,        color: "#25d366" },
  { name: "Meta Ads",        Icon: SiMeta,            color: "#1877f2" },
  { name: "Instagram",       Icon: FaInstagram,       color: "#e1306c" },
  { name: "Facebook",        Icon: FaFacebook,        color: "#1877f2" },
  { name: "Razorpay",        Icon: SiRazorpay,        color: "#2d8bff" },
  { name: "Shopify",         Icon: FaShopify,         color: "#95bf47" },
  { name: "WooCommerce",     Icon: SiWoocommerce,     color: "#7f54b3" },
  { name: "Google Sheets",   Icon: SiGooglesheets,    color: "#0f9d58" },
];

const RIGHT = [
  { name: "Gmail",           Icon: SiGmail,           color: "#ea4335" },
  { name: "Google Calendar", Icon: SiGooglecalendar,  color: "#4285f4" },
  { name: "Zapier",          Icon: SiZapier,          color: "#ff4a00" },
  { name: "Make",            Icon: SiMake,            color: "#6d00cc" },
  { name: "Stripe",          Icon: SiStripe,          color: "#635bff" },
  { name: "HubSpot",         Icon: SiHubspot,         color: "#ff7a59" },
  { name: "Salesforce",      Icon: SiSalesforce,      color: "#00a1e0" },
  { name: "Mailchimp",       Icon: SiMailchimp,       color: "#ffe01b" },
];

export default function IntegrationsHub() {
  return (
    <section className="ln-hub-section">
      <div className="ln-container">
        <div className="ln-hub-head">
          <span className="ln-eyebrow">Automate Anything</span>
          <h2>
            <span role="img" aria-label="bulb">💡</span>{" "}
            Imagine the possibilities of automating anything
          </h2>
          <p>
            Leadnator connects with <b>2,000+ apps</b> for seamless, real-time data
            transfer. For example — when a new sale happens on WooCommerce, auto-add
            the customer to Google Sheets, send a WhatsApp thank-you, and trigger a
            Gmail receipt. All without writing code.
          </p>
        </div>

        <div className="ln-hub" style={{ height: 600 }}>
          {/* Left column */}
          <div className="ln-hub-col ln-hub-col-left">
            {LEFT.map((a) => <AppPill key={a.name} {...a} />)}
          </div>

          {/* Center hub + curved lines */}
          <svg
            className="ln-hub-lines"
            viewBox={`0 0 1000 600`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#22c55e" stopOpacity="0.28" />
                <stop offset="70%" stopColor="#22c55e" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hubFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#16a34a" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              {/* Bright green core fading to transparent at the trailing edge —
                  painted on each packet so it reads as a moving "comet". */}
              <radialGradient id="packet" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#4ade80" stopOpacity="1" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Left spokes */}
            {CARD_Y.map((y, i) => {
              const startX = HUB_X - HUB_R;
              const startY = HUB_Y;
              const endX   = LEFT_EDGE_X;
              const endY   = y + 24;
              const cx1    = (startX + endX) / 2 - 30;
              const cx2    = (startX + endX) / 2 + 30;
              const d = `M ${startX} ${startY} C ${cx1} ${startY}, ${cx2} ${endY}, ${endX} ${endY}`;
              const id = `ln-hub-pathL${i}`;
              // Alternate direction: even i flows card→hub (inbound data),
              // odd i flows hub→card (outbound action).
              const reverse = i % 2 === 0;
              return (
                <g key={`L${i}`}>
                  <path id={id} d={d} className="ln-hub-path" />
                  <circle r="3.5" fill="url(#packet)">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      begin={`${(i * 0.35).toFixed(2)}s`}
                      keyPoints={reverse ? "1;0" : "0;1"}
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                  <circle cx={endX} cy={endY} r="4" className="ln-hub-endcap" />
                </g>
              );
            })}

            {/* Right spokes */}
            {CARD_Y.map((y, i) => {
              const startX = HUB_X + HUB_R;
              const startY = HUB_Y;
              const endX   = RIGHT_EDGE_X;
              const endY   = y + 24;
              const cx1    = (startX + endX) / 2 - 30;
              const cx2    = (startX + endX) / 2 + 30;
              const d = `M ${startX} ${startY} C ${cx1} ${startY}, ${cx2} ${endY}, ${endX} ${endY}`;
              const id = `ln-hub-pathR${i}`;
              const reverse = i % 2 === 1;
              return (
                <g key={`R${i}`}>
                  <path id={id} d={d} className="ln-hub-path" />
                  <circle r="3.5" fill="url(#packet)">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      begin={`${(i * 0.35 + 0.18).toFixed(2)}s`}
                      keyPoints={reverse ? "1;0" : "0;1"}
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                  <circle cx={endX} cy={endY} r="4" className="ln-hub-endcap" />
                </g>
              );
            })}

            {/* Hub pulse rings — two offset rings breathing outward */}
            <circle cx={HUB_X} cy={HUB_Y} r="120" fill="url(#hubGlow)" />
            <circle cx={HUB_X} cy={HUB_Y} className="ln-hub-pulse" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            <circle cx={HUB_X} cy={HUB_Y} className="ln-hub-pulse ln-hub-pulse-2" fill="none" stroke="#22c55e" strokeWidth="1.5" />

            <circle cx={HUB_X} cy={HUB_Y} r={HUB_R + 8} fill="#fff" />
            <circle cx={HUB_X} cy={HUB_Y} r={HUB_R} fill="#ffffff" stroke="#22c55e" strokeWidth="2" />
            <image
              href="/leadnator_logo.png"
              xlinkHref="/leadnator_logo.png"
              x={HUB_X - HUB_R * 0.75}
              y={HUB_Y - HUB_R * 0.75}
              width={HUB_R * 1.5}
              height={HUB_R * 1.5}
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>

          {/* Right column */}
          <div className="ln-hub-col ln-hub-col-right">
            {RIGHT.map((a) => <AppPill key={a.name} {...a} />)}
          </div>
        </div>

        {/* Footer bar — scroll of app names, desktop + mobile parity */}
        <div className="ln-hub-foot">
          <span>And 2,000+ more via Zapier, Make &amp; open REST APIs</span>
        </div>
      </div>
    </section>
  );
}

function AppPill({ name, Icon, color }) {
  return (
    <div className="ln-hub-app">
      <span className="ln-hub-app-name">{name}</span>
      <span className="ln-hub-app-ic" style={{ background: `${color}15`, color }}>
        <Icon />
      </span>
    </div>
  );
}

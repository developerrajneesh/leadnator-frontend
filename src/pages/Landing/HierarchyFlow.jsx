import {
  FiMessageSquare, FiPhoneCall, FiMail, FiCheck, FiArrowRight,
  FiZap, FiTarget, FiTrendingUp,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaWhatsapp, FaGoogle } from "react-icons/fa";
import { SiMeta } from "react-icons/si";

/* ==========================================================
   5X revenue hierarchy flow.

   Layout uses a container with fixed aspect-ratio 900:850 and
   the SVG viewBox matches (0 0 900 850). All DOM elements are
   placed absolutely using % coordinates derived from the SAME
   numbers the SVG uses — so boxes and connector lines stay
   aligned at every screen size.
   ========================================================== */

// Element Y centers (in SVG units) ---------------------------
const Y = {
  channels: 55,
  capture:  175,
  core:     265,
  actions:  360,
  qualify:  450,
  nurture:  540,
  branch:   640,
  outcomes: 740,
};

// Half-heights so we know where each connector should attach.
const H = {
  channels: 22,   // 44px circle
  capture:  32,   // 64px trapezoid
  core:     20,   // 40px pill
  actions:  22,   // 44px boxes
  qualify:  20,   // 40px pill
  nurture:  20,   // 40px pill
  branch:   19,   // 38px nodes
  outcomes: 19,   // 38px nodes
};

// Horizontal centers (SVG units) ------------------------------
const CH_X = [270, 360, 450, 540, 630];  // 5 channel icons
const AC_X = [180, 315, 450, 585, 720];  // 5 action boxes
const CENTER_X = 450;
const BRANCH_L = 260;  // x of Positive / Lead Won column
const BRANCH_R = 640;  // x of Negative / Long Nurture column

// Helpers: turn SVG coords into CSS % for absolute positioning.
// Container height matches the `/780` denominator below — so 780 = bottom
// of the dark panel. Keeping Y values unchanged inside the flow while
// trimming empty bottom space gives us balanced vertical padding.
const px = (x) => `${(x / 900) * 100}%`;
const py = (y) => `${(y / 780) * 100}%`;

// Edge-y helpers (top / bottom of each element)
const top    = (row) => Y[row] - H[row];
const bottom = (row) => Y[row] + H[row];

export default function HierarchyFlow() {
  const CHANNELS_TOP = [
    { Icon: FaFacebook,   color: "#1877f2" },
    { Icon: FaInstagram,  color: "#e1306c" },
    { Icon: FaGoogle,     color: "#fbbc05" },
    { Icon: FaWhatsapp,   color: "#25d366" },
    { Icon: FiMail,       color: "#ea4335" },
  ];
  const ACTIONS = [
    { Icon: FiMessageSquare, label: "AI Chat",    color: "#3b82f6" },
    { Icon: FiPhoneCall,     label: "AI Calling", color: "#22c55e" },
    { Icon: SiMeta,          label: "Chatbot",    color: "#a855f7" },
    { Icon: FaWhatsapp,      label: "WhatsApp",   color: "#14b8a6" },
    { Icon: FiMail,          label: "Email",      color: "#ef4444" },
  ];
  const DAYS = ["Day 01", "Day 03", "Day 05", "Day 07"];

  return (
    <section className="ln-hier-section">
      <div className="ln-container ln-hier-grid">
        {/* ===== LEFT: narrative ===== */}
        <div className="ln-hier-copy">
          <span className="ln-eyebrow">End-to-end revenue flow</span>
          <h2>
            <span className="ln-hier-5x">5X</span> your revenue with the power of
            <b className="ln-hier-ai"> AI</b> &amp;
            <b className="ln-hier-wa"> WhatsApp</b>
          </h2>
          <p className="ln-hier-lead">
            Leadnator compresses your entire sales funnel — from the first Meta ad
            click to a closed deal — into one automated pipeline. Every channel,
            every touchpoint, every follow-up runs for you.
          </p>

          <div className="ln-hier-points">
            <div className="ln-hier-point">
              <div className="ln-hier-point-ic" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                <FiTarget />
              </div>
              <div>
                <h4>Capture leads from every channel</h4>
                <p>
                  Facebook, Instagram, Google, WhatsApp and email flow into a single
                  Lead Capture queue — no tool-switching, no duplicates.
                </p>
              </div>
            </div>

            <div className="ln-hier-point">
              <div className="ln-hier-point-ic" style={{ background: "#dbeafe", color: "#2563eb" }}>
                <FiZap />
              </div>
              <div>
                <h4>Automate with the Leadnator engine</h4>
                <p>
                  AI Chat, AI Calling, Chatbot, WhatsApp and Email engage each lead
                  within seconds. Pre-built flows qualify and route them to the
                  right agent automatically.
                </p>
              </div>
            </div>

            <div className="ln-hier-point">
              <div className="ln-hier-point-ic" style={{ background: "#fef3c7", color: "#f97316" }}>
                <FiMessageSquare />
              </div>
              <div>
                <h4>7-day WhatsApp nurture sequence</h4>
                <p>
                  Every qualified lead drops into a 4-touch WhatsApp nurture
                  (Day 01 → 03 → 05 → 07). No response? They move to long-term
                  nurture. Positive intent? Straight to close.
                </p>
              </div>
            </div>

            <div className="ln-hier-point">
              <div className="ln-hier-point-ic" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <FiTrendingUp />
              </div>
              <div>
                <h4>Measurable 5× revenue lift</h4>
                <p>
                  Our best-performing teams report 3-5× higher conversion after
                  moving to this model — because leads never go cold and every
                  stage is tracked, scored and attributed.
                </p>
              </div>
            </div>
          </div>

          <div className="ln-hier-cta-row">
            <a href="/signup" className="ln-btn ln-btn-primary">
              Start your flow <FiArrowRight />
            </a>
            <a href="/features" className="ln-link-arrow">
              See every step <FiArrowRight />
            </a>
          </div>
        </div>

        {/* ===== RIGHT: animated flow diagram ===== */}
        <div className="ln-hier">
          {/* =================== SVG CONNECTORS =================== */}
          <svg
            className="ln-hier-svg"
            viewBox="0 0 900 780"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lh-line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="lh-pos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="lh-neg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <filter id="lh-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* 1. Channel icons → Lead Capture (fan-in bezier) */}
            {CH_X.map((x, i) => {
              const sy = bottom("channels");          // from icon bottom
              const ty = top("capture");              // into capture top
              return (
                <path
                  key={`ch-${i}`}
                  d={`M ${x} ${sy} C ${x} ${sy + 30}, ${CENTER_X} ${ty - 30}, ${CENTER_X} ${ty}`}
                  stroke="url(#lh-line)" strokeWidth="2" fill="none"
                  filter="url(#lh-glow)" className="lh-flow"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              );
            })}

            {/* 2. Lead Capture → Leadnator API (straight) */}
            <line
              x1={CENTER_X} y1={bottom("capture")}
              x2={CENTER_X} y2={top("core")}
              stroke="url(#lh-line)" strokeWidth="2.5"
              filter="url(#lh-glow)" className="lh-flow"
            />

            {/* 3. Leadnator API → 5 action boxes (fan-out bezier) */}
            {AC_X.map((x, i) => {
              const sy = bottom("core");
              const ty = top("actions");
              return (
                <path
                  key={`ac-${i}`}
                  d={`M ${CENTER_X} ${sy} C ${CENTER_X} ${sy + 25}, ${x} ${ty - 25}, ${x} ${ty}`}
                  stroke="url(#lh-line)" strokeWidth="2" fill="none"
                  filter="url(#lh-glow)" className="lh-flow"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              );
            })}

            {/* 4. 5 action boxes → Auto Qualify (fan-in bezier) */}
            {AC_X.map((x, i) => {
              const sy = bottom("actions");
              const ty = top("qualify");
              return (
                <path
                  key={`aq-${i}`}
                  d={`M ${x} ${sy} C ${x} ${sy + 20}, ${CENTER_X} ${ty - 20}, ${CENTER_X} ${ty}`}
                  stroke="url(#lh-line)" strokeWidth="2" fill="none"
                  filter="url(#lh-glow)" className="lh-flow"
                  style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                />
              );
            })}

            {/* 5. Auto Qualify → Auto Nurture */}
            <line
              x1={CENTER_X} y1={bottom("qualify")}
              x2={CENTER_X} y2={top("nurture")}
              stroke="url(#lh-line)" strokeWidth="2.5"
              filter="url(#lh-glow)" className="lh-flow"
            />

            {/* 6. Auto Nurture → Positive + Negative (split) */}
            <path
              d={`M ${CENTER_X} ${bottom("nurture")}
                 C ${CENTER_X} ${bottom("nurture") + 30},
                   ${BRANCH_L} ${top("branch") - 30},
                   ${BRANCH_L} ${top("branch")}`}
              stroke="url(#lh-pos)" strokeWidth="2.5" fill="none"
              filter="url(#lh-glow)" className="lh-flow"
            />
            <path
              d={`M ${CENTER_X} ${bottom("nurture")}
                 C ${CENTER_X} ${bottom("nurture") + 30},
                   ${BRANCH_R} ${top("branch") - 30},
                   ${BRANCH_R} ${top("branch")}`}
              stroke="url(#lh-neg)" strokeWidth="2.5" fill="none"
              filter="url(#lh-glow)" className="lh-flow"
            />

            {/* 7. Positive → Lead Won, Negative → Long Nurture */}
            <line
              x1={BRANCH_L} y1={bottom("branch")}
              x2={BRANCH_L} y2={top("outcomes")}
              stroke="url(#lh-pos)" strokeWidth="2.5"
              filter="url(#lh-glow)" className="lh-flow"
            />
            <line
              x1={BRANCH_R} y1={bottom("branch")}
              x2={BRANCH_R} y2={top("outcomes")}
              stroke="url(#lh-neg)" strokeWidth="2.5"
              filter="url(#lh-glow)" className="lh-flow"
            />
          </svg>

          {/* =================== DOM ELEMENTS =================== */}
          {/* Channel icons (row 1) */}
          {CHANNELS_TOP.map((c, i) => (
            <div
              key={i}
              className="lh-abs lh-channel"
              style={{ left: px(CH_X[i]), top: py(Y.channels), boxShadow: `0 0 20px ${c.color}55` }}
            >
              <c.Icon style={{ color: c.color }} />
            </div>
          ))}

          {/* Lead Capture trapezoid */}
          <div className="lh-abs lh-capture" style={{ left: "50%", top: py(Y.capture) }}>
            <span>Lead Capture</span>
          </div>

          {/* Leadnator API Automation */}
          <div className="lh-abs lh-core" style={{ left: "50%", top: py(Y.core) }}>
            <span className="lh-core-dot" />
            Leadnator API Automation
          </div>

          {/* 5 action boxes */}
          {ACTIONS.map((a, i) => (
            <div
              key={a.label}
              className="lh-abs lh-action"
              style={{ left: px(AC_X[i]), top: py(Y.actions), background: a.color }}
            >
              <a.Icon />
              <span>{a.label}</span>
            </div>
          ))}

          {/* Auto Qualify Lead */}
          <div className="lh-abs lh-pill lh-qualify" style={{ left: "50%", top: py(Y.qualify) }}>
            <FiCheck /> Auto Qualify Lead
          </div>

          {/* Auto Nurture + day tags */}
          <div className="lh-abs lh-nurture-wrap" style={{ left: "50%", top: py(Y.nurture) }}>
            <div className="lh-days">
              {DAYS.slice(0, 2).map((d) => (
                <span key={d} className="lh-day"><FaWhatsapp /> {d}</span>
              ))}
            </div>
            <div className="lh-pill lh-nurture">Auto Nurture</div>
            <div className="lh-days">
              {DAYS.slice(2).map((d) => (
                <span key={d} className="lh-day"><FaWhatsapp /> {d}</span>
              ))}
            </div>
          </div>

          {/* Positive / Negative branch */}
          <div className="lh-abs lh-branch-node pos" style={{ left: px(BRANCH_L), top: py(Y.branch) }}>Positive</div>
          <div className="lh-abs lh-branch-node neg" style={{ left: px(BRANCH_R), top: py(Y.branch) }}>Negative</div>

          {/* Outcomes */}
          <div className="lh-abs lh-outcome pos" style={{ left: px(BRANCH_L), top: py(Y.outcomes) }}>Lead Won</div>
          <div className="lh-abs lh-outcome neg" style={{ left: px(BRANCH_R), top: py(Y.outcomes) }}>Long Nurture</div>
        </div>
      </div>
    </section>
  );
}

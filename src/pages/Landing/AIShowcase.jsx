import {
  FiZap, FiCpu, FiArrowRight, FiCheck, FiStar, FiTarget, FiMessageCircle,
} from "react-icons/fi";

/* ==========================================================
   Animated AI workflow showcase.
   4 connected steps with a glowing data particle that keeps
   traveling down the spine. Floating sparkles around the edges.
   Replaces the static step-list on the Home page.
   ========================================================== */
export default function AIShowcase() {
  const STEPS = [
    { num: 1, Icon: FiTarget,        title: "Trigger",         sub: "Lead fills Meta form",           color: "#3b82f6" },
    { num: 2, Icon: FiCpu,           title: "Enrich + score",  sub: "AI ranks quality 0–100",         color: "#f59e0b" },
    { num: 3, Icon: FiMessageCircle, title: "Route to agent",  sub: "High-score → WhatsApp, rest → email", color: "#ec4899" },
    { num: 4, Icon: FiCheck,         title: "Deal closed",     sub: "Revenue attributed automatically",    color: "#22c55e", complete: true },
  ];

  return (
    <div className="ln-ai-showcase">
      {/* Gradient border wrapper (animated) */}
      <div className="ln-ai-showcase-inner">

        {/* Floating sparkles — pure CSS animation */}
        <span className="ln-ai-spark s1"><FiStar /></span>
        <span className="ln-ai-spark s2"><FiStar /></span>
        <span className="ln-ai-spark s3"><FiStar /></span>
        <span className="ln-ai-spark s4"><FiStar /></span>
        <span className="ln-ai-spark s5"><FiStar /></span>
        <span className="ln-ai-spark s6"><FiStar /></span>

        {/* Header bar */}
        <div className="ln-ai-header">
          <div className="ln-ai-header-dots">
            <span /><span /><span />
          </div>
          <div className="ln-ai-header-title">
            <FiCpu /> AI Studio · live
          </div>
          <div className="ln-ai-header-badge">
            <span className="ln-ai-pulse-dot" /> Running
          </div>
        </div>

        {/* SVG: the spine + flowing traveling dot */}
        <svg className="ln-ai-spine" viewBox="0 0 4 420" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ln-spine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b82f6" />
              <stop offset="33%"  stopColor="#f59e0b" />
              <stop offset="66%"  stopColor="#ec4899" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <line x1="2" y1="0" x2="2" y2="420" stroke="#e5e7eb" strokeWidth="2" />
          {/* Animated colored stroke (dashed flow) */}
          <line x1="2" y1="0" x2="2" y2="420"
                stroke="url(#ln-spine)" strokeWidth="2"
                className="ln-ai-spine-flow" />
        </svg>

        {/* Steps */}
        <div className="ln-ai-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`ln-ai-step ${s.complete ? "complete" : ""}`}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <div className="ln-ai-step-dot-wrap">
                <div className="ln-ai-step-dot" style={{ background: s.color }}>
                  <s.Icon />
                </div>
                <div className="ln-ai-step-ring" style={{ borderColor: s.color }} />
              </div>
              <div className="ln-ai-step-body">
                <div className="ln-ai-step-row">
                  <span className="ln-ai-step-num">Step {s.num}</span>
                  <h4>{s.title}</h4>
                </div>
                <p>{s.sub}</p>
              </div>
              {!s.complete && <FiArrowRight className="ln-ai-step-next" />}
            </div>
          ))}
        </div>

        {/* Footer — typing-style "generated" badge */}
        <div className="ln-ai-footer">
          <FiZap />
          <span className="ln-ai-typing">Generated in <b>1.24s</b> with GPT-4</span>
          <span className="ln-ai-cursor" />
        </div>

      </div>
    </div>
  );
}

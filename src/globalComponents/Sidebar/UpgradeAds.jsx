import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrendingUp, FiCpu, FiZap, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SiMeta } from "react-icons/si";

// Auto-rotating, GIF-style feature ad shown in the sidebar footer. Cycles
// through Pro highlights with a crossfade/slide + a shimmer sweep so it feels
// alive without an actual animated image.
const SLIDES = [
  { Icon: FiTrendingUp, title: "Unlimited leads",     text: "Capture & grow without limits" },
  { Icon: FiCpu,        title: "AI automation",       text: "Let AI run your follow-ups" },
  { Icon: FaWhatsapp,   title: "WhatsApp + AI bot",   text: "24/7 replies that convert" },
  { Icon: SiMeta,       title: "Meta Ads + AI",       text: "Smarter campaigns, less effort" },
  { Icon: FiZap,        title: "API & integrations",  text: "Connect your whole stack" },
];

export default function UpgradeAds() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return undefined;
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 2800);
    return () => clearInterval(id);
  }, []);

  const { Icon, title, text } = SLIDES[i];

  return (
    <div className="upgrade-ad" onClick={() => navigate("/pricing/plans")} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/pricing/plans")}>
      <div className="upgrade-ad-shine" />
      <div className="upgrade-ad-badge">✨ Unlock Pro</div>

      {/* key forces the slide to re-mount → replays the enter animation */}
      <div className="upgrade-ad-slide" key={i}>
        <span className="upgrade-ad-icon"><Icon /></span>
        <div className="upgrade-ad-copy">
          <div className="upgrade-ad-title">{title}</div>
          <div className="upgrade-ad-text">{text}</div>
        </div>
      </div>

      <div className="upgrade-ad-dots">
        {SLIDES.map((_, idx) => (
          <span key={idx} className={`upgrade-ad-dot ${idx === i ? "on" : ""}`} />
        ))}
      </div>

      <button type="button" className="upgrade-ad-btn" onClick={(e) => { e.stopPropagation(); navigate("/pricing/plans"); }}>
        Upgrade <FiArrowRight />
      </button>

      <style>{`
        .upgrade-ad {
          position: relative; overflow: hidden; cursor: pointer;
          border-radius: 14px; padding: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 45%, #ec4899 100%);
          background-size: 180% 180%;
          color: #fff;
          box-shadow: 0 10px 24px -10px rgba(124, 58, 237, .6);
          animation: ua-bg 8s ease infinite;
        }
        @keyframes ua-bg {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        /* diagonal shine sweep */
        .upgrade-ad-shine {
          position: absolute; top: 0; left: -60%; width: 50%; height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
          transform: skewX(-18deg);
          animation: ua-shine 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes ua-shine {
          0% { left: -60%; } 55%,100% { left: 130%; }
        }
        .upgrade-ad-badge {
          position: relative; font-size: 11px; font-weight: 800; letter-spacing: .3px;
          opacity: .95; margin-bottom: 10px;
        }
        .upgrade-ad-slide {
          position: relative; display: flex; align-items: center; gap: 10px;
          min-height: 42px;
          animation: ua-in .5s cubic-bezier(.2,.8,.2,1);
        }
        @keyframes ua-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .upgrade-ad-icon {
          flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.18); font-size: 17px;
          animation: ua-pop .5s ease;
        }
        @keyframes ua-pop { 0% { transform: scale(.6); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .upgrade-ad-title { font-size: 13.5px; font-weight: 800; line-height: 1.2; }
        .upgrade-ad-text  { font-size: 11px; opacity: .9; margin-top: 2px; line-height: 1.3; }
        .upgrade-ad-dots { display: flex; gap: 4px; margin: 11px 0 12px; }
        .upgrade-ad-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.4); transition: all .3s ease;
        }
        .upgrade-ad-dot.on { background: #fff; width: 14px; border-radius: 4px; }
        .upgrade-ad-btn {
          position: relative; width: 100%;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          background: #fff; color: #7c3aed; border: none; border-radius: 9px;
          padding: 8px 12px; font-weight: 800; font-size: 13px; cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .upgrade-ad-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
        @media (prefers-reduced-motion: reduce) {
          .upgrade-ad, .upgrade-ad-shine, .upgrade-ad-slide, .upgrade-ad-icon { animation: none; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { FiCheckCircle, FiArrowRight, FiX, FiZap } from "react-icons/fi";
import { useCurrentUser } from "../../api/hooks";

// One-time "Welcome / 2-day free Starter trial activated" modal. Shown once
// right after a fresh signup (the Auth screen sets the `ln_welcome` flag).
export default function WelcomeModal() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(true);
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 0, h: typeof window !== "undefined" ? window.innerHeight : 0 });

  useEffect(() => {
    if (sessionStorage.getItem("ln_welcome") === "1") {
      sessionStorage.removeItem("ln_welcome"); // show only once
      setOpen(true);
      // Stop emitting new confetti after the initial burst; existing pieces fall out.
      const t = setTimeout(() => setConfetti(false), 6000);
      const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener("resize", onResize);
      return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
    }
    return undefined;
  }, []);

  if (!open) return null;

  const firstName = (user?.name || "").trim().split(" ")[0] || "there";

  function close() { setOpen(false); }

  return (
    <div className="ln-welcome" onClick={close} role="dialog" aria-modal="true">
      <Confetti
        width={size.w}
        height={size.h}
        recycle={confetti}
        numberOfPieces={confetti ? 350 : 0}
        gravity={0.25}
        tweenDuration={6000}
        colors={["#7c3aed", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6", "#a78bfa"]}
        style={{ position: "fixed", inset: 0, zIndex: 301, pointerEvents: "none" }}
      />
      <div className="ln-welcome-card" onClick={(e) => e.stopPropagation()}>
        <button className="ln-welcome-x" onClick={close} aria-label="Close"><FiX /></button>

        <div className="ln-welcome-burst">🎉</div>
        <div className="ln-welcome-icon"><FiCheckCircle /></div>

        <h2 className="ln-welcome-title">Congratulations, {firstName}!</h2>
        <p className="ln-welcome-sub">
          Your <strong>2-day free Starter trial</strong> has been activated. Explore every
          module — no credit card needed.
        </p>

        <div className="ln-welcome-trial">
          <FiZap /> Starter trial · <strong>2 days free</strong>
        </div>

        <div className="ln-welcome-actions">
          <button className="ln-welcome-primary" onClick={close}>
            Start exploring <FiArrowRight />
          </button>
          <button className="ln-welcome-ghost" onClick={() => { close(); navigate("/pricing/plans"); }}>
            View plans
          </button>
        </div>
      </div>

      <style>{`
        .ln-welcome {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(15,23,42,.5); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center; padding: 18px;
          animation: lnw-fade .2s ease;
        }
        @keyframes lnw-fade { from { opacity: 0; } to { opacity: 1; } }
        .ln-welcome-card {
          position: relative; width: 100%; max-width: 430px; text-align: center;
          background: #fff; border-radius: 22px; padding: 40px 32px 30px;
          box-shadow: 0 40px 90px -30px rgba(15,23,42,.45);
          overflow: hidden;
          animation: lnw-pop .35s cubic-bezier(.2,.9,.25,1.1);
        }
        @keyframes lnw-pop { from { transform: translateY(14px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
        .ln-welcome-card::before {
          content: ""; position: absolute; top: -40%; left: -10%; right: -10%; height: 200px;
          background: radial-gradient(60% 100% at 50% 0%, rgba(124,58,237,.18), transparent 70%);
          pointer-events: none;
        }
        .ln-welcome-x {
          position: absolute; top: 12px; right: 12px; border: none; background: transparent;
          color: #9ca3af; font-size: 18px; cursor: pointer; line-height: 1; padding: 4px;
        }
        .ln-welcome-burst { position: relative; font-size: 30px; animation: lnw-bounce 1s ease infinite alternate; }
        @keyframes lnw-bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        .ln-welcome-icon {
          position: relative; width: 64px; height: 64px; margin: 6px auto 14px; border-radius: 50%;
          display: grid; place-items: center; color: #fff; font-size: 32px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          box-shadow: 0 14px 30px rgba(34,197,94,.4);
        }
        .ln-welcome-title { position: relative; margin: 0 0 8px; font-size: 23px; font-weight: 800; }
        .ln-welcome-sub { position: relative; margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: var(--text-muted); }
        .ln-welcome-trial {
          position: relative; display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: #7c3aed;
          background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 999px;
          padding: 8px 16px; margin-bottom: 22px;
        }
        .ln-welcome-actions { position: relative; display: flex; flex-direction: column; gap: 10px; }
        .ln-welcome-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #7c3aed, #ec4899); color: #fff; border: none;
          border-radius: 12px; padding: 13px; font-weight: 800; font-size: 14.5px; cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .ln-welcome-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(124,58,237,.35); }
        .ln-welcome-ghost {
          background: transparent; border: none; color: var(--text-muted);
          font-weight: 600; font-size: 13.5px; cursor: pointer; padding: 4px;
        }
        .ln-welcome-ghost:hover { color: var(--text); }
      `}</style>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { AD_TYPES, stepLabel } from "../config";

export default function WizardShell({ type, step, children }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  if (!cfg) return null;
  const idx = cfg.steps.indexOf(step);

  return (
    <>
      <button
        onClick={() => navigate("/meta/create")}
        className="btn btn-ghost"
        style={{ marginBottom: 12 }}
      >
        <FiArrowLeft /> Back to type picker
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: cfg.bg, color: cfg.color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          <cfg.Icon />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Create {cfg.title}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>{cfg.subtitle}</p>
        </div>
      </div>

      <Stepper steps={cfg.steps} currentIndex={idx} accent={cfg.color} />

      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        {children}
      </div>
    </>
  );
}

function Stepper({ steps, currentIndex, accent }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 140px", minWidth: 140 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: active ? accent : done ? "#10b981" : "#e5e7eb",
              color: (active || done) ? "white" : "#6b7280",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {done ? <FiCheck size={14} /> : i + 1}
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              color: active ? accent : done ? "#065f46" : "#6b7280",
            }}>
              {stepLabel(s)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

/**
 * ModuleOverview — landing page for each module.
 * Hero with a flat illustration + a grid of "what you can do here" cards.
 *
 * props:
 *   title       — page title
 *   subtitle    — short tagline
 *   illustration — public-folder image path (e.g. /Chatting-bro-flat.png)
 *   accent      — hero gradient accent: "purple" | "green" | "orange" | "pink" | "blue"
 *   intro       — paragraph(s) describing what the module is for
 *   features    — [{ icon, title, desc, to, color }]
 *   primary     — { label, to }   main CTA
 *   secondary   — { label, to }   optional second CTA
 */
export default function ModuleOverview({
  title,
  subtitle,
  illustration,
  accent = "purple",
  intro,
  features = [],
  primary,
  secondary,
  extra,
}) {
  const navigate = useNavigate();

  const heroBg = {
    purple: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 60%, #faf5ff 100%)",
    green:  "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 60%, #f0fdf4 100%)",
    orange: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 60%, #fff7ed 100%)",
    pink:   "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 60%, #fff1f2 100%)",
    blue:   "linear-gradient(135deg, #dbeafe 0%, #eff6ff 60%, #f0f9ff 100%)",
  }[accent];

  return (
    <div className="module-overview">
      <div className="mo-hero" style={{ background: heroBg }}>
        <div className="mo-hero-text">
          <h1 className="page-title" style={{ marginBottom: 6 }}>{title}</h1>
          {subtitle && <p className="page-subtitle" style={{ marginBottom: 14 }}>{subtitle}</p>}
          {intro && <p className="mo-intro">{intro}</p>}
          {(primary || secondary) && (
            <div className="mo-hero-ctas">
              {primary && (
                <button className="btn btn-primary" onClick={() => navigate(primary.to)}>
                  {primary.label} <FiArrowRight style={{ marginLeft: 6 }} />
                </button>
              )}
              {secondary && (
                <button className="btn btn-outline" onClick={() => navigate(secondary.to)}>
                  {secondary.label}
                </button>
              )}
            </div>
          )}
        </div>
        {illustration && (
          <div className="mo-hero-art">
            <img src={illustration} alt="" />
          </div>
        )}
      </div>

      {features.length > 0 && (
        <>
          <h2 className="mo-section-title">What you can do here</h2>
          <div className="mo-grid">
            {features.map((f) => (
              <button
                key={f.to + f.title}
                type="button"
                className="mo-card"
                onClick={() => navigate(f.to)}
              >
                <div className={`stat-icon ${f.color || "purple"}`}>{f.icon}</div>
                <div className="mo-card-title">{f.title}</div>
                <div className="mo-card-desc">{f.desc}</div>
                <div className="mo-card-link">
                  Open <FiArrowRight />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {extra}
    </div>
  );
}

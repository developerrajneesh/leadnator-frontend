import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { AD_TYPES } from "./config";

export default function Create() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi.status()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Create campaign</h1>
        <p className="page-subtitle">Pick a campaign type to start the wizard.</p>
        <div className="grid-2" style={{ marginTop: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <span className="skel skel-square" style={{ width: 48, height: 48, borderRadius: 12, display: "block", marginBottom: 14 }} />
              <span className="skel skel-line" style={{ width: 180, height: 16, display: "block", marginBottom: 8 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: "80%", display: "block", marginBottom: 4 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: "60%", display: "block" }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>You need to connect a Facebook account before creating campaigns.</p>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  // Group ad types by their Meta outcome so the launchpad is browsable.
  const groups = [
    { label: "Get conversations & leads", outcomes: ["OUTCOME_LEADS", "OUTCOME_ENGAGEMENT"], hint: "WhatsApp, Messenger, calls, lead forms — direct customer contact." },
    { label: "Drive traffic & sales",     outcomes: ["OUTCOME_TRAFFIC", "OUTCOME_SALES"],    hint: "Send people to your site, store, or shop catalog." },
    { label: "Build awareness",           outcomes: ["OUTCOME_AWARENESS"],                   hint: "Reach more people, get video views, increase brand recall." },
    { label: "Promote your app",          outcomes: ["OUTCOME_APP_PROMOTION"],               hint: "Drive installs and re-engage existing app users." },
  ];

  return (
    <>
      <h1 className="page-title">Create campaign</h1>
      <p className="page-subtitle">Pick the type of ad you want to run — {Object.keys(AD_TYPES).length} options grouped by goal.</p>

      {groups.map((g) => {
        const types = Object.values(AD_TYPES).filter((t) => g.outcomes.includes(t.objective));
        if (!types.length) return null;
        return (
          <div key={g.label} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{g.label}</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{g.hint}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {types.map((t) => (
                <button
                  key={t.key}
                  onClick={() => navigate(`/meta/create/${t.key}/campaign`)}
                  className="card"
                  style={{
                    textAlign: "left", cursor: "pointer", border: "1px solid var(--border)",
                    background: "white", display: "flex", alignItems: "center", gap: 14, padding: 16,
                    transition: "0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${t.color}22`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: t.bg, color: t.color,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}><t.Icon /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.subtitle}</div>
                    <div style={{ fontSize: 10, color: t.color, fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>
                      {t.steps.length} steps · {t.optimizationGoal.replace(/_/g, " ")}
                    </div>
                  </div>
                  <FiChevronRight style={{ color: "var(--text-muted)", fontSize: 20, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

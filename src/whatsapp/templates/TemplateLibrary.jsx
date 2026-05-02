import { useMemo, useState } from "react";
import { FiSearch, FiX, FiZap } from "react-icons/fi";
import {
  UTILITY_TEMPLATE_EXAMPLES,
  MARKETING_TEMPLATE_EXAMPLES,
  AUTHENTICATION_TEMPLATE_EXAMPLES,
  CTA_TEMPLATE_EXAMPLES,
} from "./examples";

const TABS = [
  { key: "marketing",      label: "Marketing",      color: "#7c3aed", bg: "#ede9fe", list: MARKETING_TEMPLATE_EXAMPLES },
  { key: "utility",        label: "Utility",        color: "#0f766e", bg: "#ccfbf1", list: UTILITY_TEMPLATE_EXAMPLES },
  { key: "authentication", label: "Authentication", color: "#b45309", bg: "#fef3c7", list: AUTHENTICATION_TEMPLATE_EXAMPLES },
  { key: "cta",            label: "CTA buttons",    color: "#0ea5e9", bg: "#e0f2fe", list: CTA_TEMPLATE_EXAMPLES },
];

export default function TemplateLibrary({ onClose, onPick }) {
  const [tab, setTab] = useState("marketing");
  const [q, setQ] = useState("");

  const list = TABS.find((t) => t.key === tab).list;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return list;
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(ql) ||
        e.description.toLowerCase().includes(ql) ||
        e.body.toLowerCase().includes(ql) ||
        e.name.toLowerCase().includes(ql)
    );
  }, [list, q]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 110,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 980, maxWidth: "96vw", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}
      >
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Template library</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {MARKETING_TEMPLATE_EXAMPLES.length} marketing + {UTILITY_TEMPLATE_EXAMPLES.length} utility + {AUTHENTICATION_TEMPLATE_EXAMPLES.length} authentication + {CTA_TEMPLATE_EXAMPLES.length} CTA examples — pick one to pre-fill the create form.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", padding: 4, background: "#f3f4f6", borderRadius: 10 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 8,
                  border: "none", cursor: "pointer",
                  background: tab === t.key ? "white" : "transparent",
                  color: tab === t.key ? t.color : "var(--text-muted)",
                  boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>({t.list.length})</span>
              </button>
            ))}
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <FiSearch style={{ position: "absolute", left: 12, top: 12, color: "#9ca3af" }} />
            <input
              placeholder="Search examples by title, body or description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 36, width: "100%", padding: "9px 12px 9px 36px", border: "1px solid var(--border)", borderRadius: 8 }}
            />
          </div>
        </div>

        <div style={{ overflow: "auto", padding: 18, background: "#f9fafb", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>No examples match "{q}".</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {filtered.map((ex) => (
                <ExampleCard key={ex.id} ex={ex} onPick={onPick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExampleCard({ ex, onPick }) {
  const tabCfg =
    ex.buttons?.length ? TABS[3]                 // CTA accent if it has buttons
    : ex.category === "UTILITY" ? TABS[1]
    : ex.category === "AUTHENTICATION" ? TABS[2]
    : TABS[0];
  const preview = ex.body.length > 160 ? `${ex.body.slice(0, 160).trim()}…` : ex.body;
  const buttons = ex.buttons || [];

  return (
    <div className="card" style={{ background: "white", display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{ex.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{ex.description}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
          background: tabCfg.bg, color: tabCfg.color, textTransform: "uppercase", flexShrink: 0,
        }}>{ex.category}</span>
      </div>

      <p style={{
        fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5,
        background: "#f9fafb", padding: 10, borderRadius: 6, margin: 0,
        border: "1px dashed #e5e7eb", whiteSpace: "pre-wrap",
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
      }}>{preview}</p>

      {buttons.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {buttons.map((b, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
              background: "#e0f2fe", color: "#0369a1", textTransform: "uppercase", letterSpacing: 0.3,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {b.type === "URL" ? "🔗" : b.type === "PHONE_NUMBER" ? "📞" : b.type === "COPY_CODE" ? "📋" : "↩"} {b.text || b.type}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>
        Suggested name: {ex.name}
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onPick(ex)}
        style={{ marginTop: "auto", background: tabCfg.color, borderColor: tabCfg.color, justifyContent: "center" }}
      >
        <FiZap /> Use this example
      </button>
    </div>
  );
}

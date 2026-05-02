import { FiX, FiCopy, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";

const STATUS_META = {
  APPROVED: { color: "#065f46", bg: "#d1fae5", Icon: FiCheckCircle, label: "Approved" },
  REJECTED: { color: "#b91c1c", bg: "#fee2e2", Icon: FiAlertCircle, label: "Rejected" },
  PENDING:  { color: "#92400e", bg: "#fef3c7", Icon: FiClock,       label: "Pending review" },
  PAUSED:   { color: "#6b7280", bg: "#f3f4f6", Icon: FiAlertCircle, label: "Paused" },
};

const CAT_COLORS = {
  MARKETING:      { color: "#7c3aed", bg: "#ede9fe" },
  UTILITY:        { color: "#0f766e", bg: "#ccfbf1" },
  AUTHENTICATION: { color: "#b45309", bg: "#fef3c7" },
};

function findComp(t, type) { return (t.components || []).find((c) => c.type === type); }

// Render body with {{1}}, {{2}}, {{name}} placeholders highlighted.
function renderBodyPreview(text) {
  if (!text) return "—";
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) =>
    /^\{\{[^}]+\}\}$/.test(p)
      ? <span key={i} style={{ background: "#fef3c7", color: "#92400e", padding: "1px 5px", borderRadius: 4, fontSize: "0.92em", fontWeight: 600 }}>{p}</span>
      : p
  );
}

export default function TemplateView({ template, onClose }) {
  const [copied, setCopied] = useState("");

  if (!template) return null;
  const t = template;
  const status = STATUS_META[t.status] || STATUS_META.PENDING;
  const cat = CAT_COLORS[t.category] || CAT_COLORS.MARKETING;

  const header = findComp(t, "HEADER");
  const body   = findComp(t, "BODY");
  const footer = findComp(t, "FOOTER");
  const buttons = findComp(t, "BUTTONS");

  // collect placeholders found in body
  const placeholders = [...new Set((body?.text || "").match(/\{\{[^}]+\}\}/g) || [])];

  function copy(text, label) {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 110,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{
        width: 880, maxWidth: "96vw", maxHeight: "90vh", padding: 0,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: cat.bg, color: cat.color, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {t.category}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: status.bg, color: status.color }}>
                <status.Icon size={12} /> {status.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{t.language}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text)" }}>{t.name}</h2>
            {t.id && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>ID: {t.id}</div>}
          </div>
          <button className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        {/* Body — split panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 0, overflow: "auto", flex: 1 }}>

          {/* LEFT — Components */}
          <div style={{ padding: "20px 22px", overflow: "auto" }}>
            {header && (
              <Section label="Header">
                <div style={{ padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  {header.text || `[${header.format} header]`}
                </div>
              </Section>
            )}

            <Section label="Body" actions={
              body?.text && (
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => copy(body.text, "body")}>
                  <FiCopy /> {copied === "body" ? "Copied!" : "Copy"}
                </button>
              )
            }>
              <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#111827" }}>
                {renderBodyPreview(body?.text)}
              </div>
            </Section>

            {footer && (
              <Section label="Footer">
                <div style={{ padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                  {footer.text}
                </div>
              </Section>
            )}

            {buttons && Array.isArray(buttons.buttons) && buttons.buttons.length > 0 && (
              <Section label="Buttons">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {buttons.buttons.map((b, i) => (
                    <div key={i} style={{ padding: 10, background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600 }}>{b.text}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{b.type}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {placeholders.length > 0 && (
              <Section label={`Variables (${placeholders.length})`}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {placeholders.map((p) => (
                    <span key={p} style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {(t.quality_score || t.last_updated_time) && (
              <Section label="Meta info">
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {t.quality_score && <div>Quality: <strong style={{ color: "var(--text)" }}>{JSON.stringify(t.quality_score)}</strong></div>}
                  {t.last_updated_time && <div>Last updated: <strong style={{ color: "var(--text)" }}>{new Date(t.last_updated_time).toLocaleString("en-IN")}</strong></div>}
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT — WhatsApp phone-style preview */}
          <div style={{ background: "#efeae2", padding: 20, borderLeft: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <FaWhatsapp style={{ color: "#25d366" }} /> Preview
            </div>

            <div style={{
              background: "white", borderRadius: 10,
              borderTopLeftRadius: 2,
              padding: "10px 12px 8px",
              maxWidth: "95%",
              fontSize: 13.5, lineHeight: 1.45, color: "#111b21",
              boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
            }}>
              {header?.text && (
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{header.text}</div>
              )}
              {header && header.format !== "TEXT" && !header.text && (
                <div style={{ background: "#f3f4f6", height: 80, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 11, marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
                  [{header.format}]
                </div>
              )}
              {body?.text && (
                <div style={{ whiteSpace: "pre-wrap" }}>{renderBodyPreview(body.text)}</div>
              )}
              {footer?.text && (
                <div style={{ fontSize: 11, color: "#667781", marginTop: 6, fontStyle: "italic" }}>{footer.text}</div>
              )}
              <div style={{ fontSize: 10, color: "#667781", marginTop: 4, textAlign: "right" }}>
                {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓
              </div>
            </div>

            {buttons && Array.isArray(buttons.buttons) && buttons.buttons.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, maxWidth: "95%" }}>
                {buttons.buttons.map((b, i) => (
                  <div key={i} style={{
                    background: "white", padding: "10px 12px",
                    borderRadius: 8, borderTopLeftRadius: 2,
                    textAlign: "center", color: "#0094ff", fontWeight: 600, fontSize: 13,
                    boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
                  }}>
                    {b.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {t.status === "APPROVED" ? "✅ Ready to use in broadcasts" : t.status === "REJECTED" ? "❌ Submit a new template — this one was rejected" : "⏳ Awaiting Meta review"}
          </span>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, actions, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--text-muted)" }}>{label}</div>
        {actions}
      </div>
      {children}
    </div>
  );
}

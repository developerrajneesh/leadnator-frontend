import { humanize } from "../leadFields";

// Reusable popover that lets the user pick which fields to show (table columns
// or card fields). `ordered` is the full list, `visible` the currently-on keys.
export default function FieldPicker({ ordered, visible, onToggle, onReset, onClose, title = "Manage fields", hint }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <div style={{
        position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 41, width: 290, maxHeight: 400,
        overflowY: "auto", background: "white", border: "1px solid var(--border)", borderRadius: 12,
        boxShadow: "0 12px 32px rgba(15,23,42,0.16)", padding: 12,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong style={{ fontSize: 13 }}>{title}</strong>
          <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 12 }} onClick={onReset}>Reset</button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
          {hint || <>Pick what to show. Nested fields appear as <code>parent.child</code>.</>}
        </div>
        {ordered.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>No leads yet.</div>
        ) : (
          ordered.map((k) => (
            <label
              key={k}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <input type="checkbox" checked={visible.includes(k)} onChange={() => onToggle(k)} />
              <span style={{ flex: 1 }}>{humanize(k)}</span>
              {k.includes(".") && <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{k}</span>}
            </label>
          ))
        )}
      </div>
    </>
  );
}

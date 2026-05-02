import { FiMail, FiMessageCircle, FiPhone, FiCheck, FiX } from "react-icons/fi";
import { waNumber } from "../../constants";

export default function LeadRow({ lead, expanded, onToggle }) {
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: "pointer" }}>
        <td>
          <span className="avatar-sm">{lead.name[0]}</span>
          <strong>{lead.name}</strong>
        </td>
        <td style={{ fontSize: 13 }}>{lead.email}</td>
        <td style={{ fontSize: 13 }}>{lead.phone}</td>
        <td style={{ fontSize: 12, color: "#6b7280" }}>
          {new Date(lead.submittedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </td>
        <td>
          {lead.synced
            ? <span className="badge qualified"><FiCheck style={{ verticalAlign: "middle" }} /> Synced</span>
            : <span className="badge contacted"><FiX style={{ verticalAlign: "middle" }} /> Pending</span>}
        </td>
        <td onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6 }}>
          <a className="mini-btn" href={`mailto:${lead.email}`} title="Email"><FiMail /></a>
          <a className="mini-btn" target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(lead.phone)}`} title="WhatsApp"><FiMessageCircle /></a>
          <a className="mini-btn" href={`tel:${waNumber(lead.phone)}`} title="Call"><FiPhone /></a>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} style={{ background: "#f9fafb", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 }}>
              Form answers
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {Object.entries(lead.answers).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.04 }}>{k}</div>
                  <div style={{ fontSize: 13, color: "#111827", marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

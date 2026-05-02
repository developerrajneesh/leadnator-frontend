import { FiClock, FiMapPin, FiUsers, FiX } from "react-icons/fi";
import { typeMeta, fmtTime, fmtDate } from "../constants";

export default function EventModal({ event, onClose, onDelete }) {
  const t = typeMeta(event.type);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: t.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            <t.Icon />
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge" style={{ background: `${t.color}22`, color: t.color }}>{t.label}</span>
            <h3 style={{ marginTop: 6 }}>{event.title}</h3>
          </div>
          <button className="mini-btn" onClick={onClose}><FiX /></button>
        </div>
        <div className="event-meta"><FiClock /> {fmtDate(event.start)} · {fmtTime(event.start)} – {fmtTime(event.end)}</div>
        {event.location && <div className="event-meta"><FiMapPin /> {event.location}</div>}
        {event.attendees?.length > 0 && <div className="event-meta"><FiUsers /> {event.attendees.join(", ")}</div>}
        {event.notes && <div style={{ marginTop: 14, padding: 12, background: "#f9fafb", borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>{event.notes}</div>}
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={() => onDelete(event.id)}>Delete</button>
          <button className="btn btn-outline">Edit</button>
          <button className="btn btn-primary">Join</button>
        </div>
      </div>
    </div>
  );
}

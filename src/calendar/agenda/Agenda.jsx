import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { typeMeta, fmtTime } from "../constants";
import { useEvents } from "../../api/calendar";
import EventModal from "../components/EventModal";

export default function Agenda() {
  const { events, loading, removeEvent } = useEvents();
  const [openEvent, setOpenEvent] = useState(null);

  if (loading && events.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading events…</div>;
  }

  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  const grouped = sorted.reduce((acc, e) => {
    const key = new Date(e.start).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">Calendar — Agenda</h1>
      <p className="page-subtitle">A chronological list of every scheduled event.</p>
      <div className="card" style={{ padding: 0 }}>
        {sorted.length === 0 && (
          <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <FiCalendar style={{ fontSize: 34, marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No records found</div>
            <div style={{ fontSize: 13 }}>No scheduled events yet — created events and bookings will appear here.</div>
          </div>
        )}
        {Object.entries(grouped).map(([day, evs]) => (
          <div key={day}>
            <div style={{ padding: "12px 20px", background: "#f9fafb", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.05 }}>
              {new Date(day).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {evs.map((e) => {
              const t = typeMeta(e.type);
              return (
                <div key={e.id} onClick={() => setOpenEvent(e)}
                  style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, cursor: "pointer", alignItems: "center" }}>
                  <div style={{ width: 48, textAlign: "center", color: "#6b7280", fontSize: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.color }}>{fmtTime(e.start)}</div>
                    <div style={{ fontSize: 11 }}>{fmtTime(e.end)}</div>
                  </div>
                  <div style={{ width: 3, height: 36, background: t.color, borderRadius: 2 }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 14 }}>{e.title}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      <t.Icon style={{ verticalAlign: "middle", marginRight: 4 }} />{t.label}
                      {e.location && <> · {e.location}</>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEvent(null)} onDelete={async (id) => { await removeEvent(id); setOpenEvent(null); }} />}
    </>
  );
}

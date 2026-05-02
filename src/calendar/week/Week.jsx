import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { sameDay, typeMeta, fmtTime } from "../constants";
import { useEvents } from "../../api/calendar";
import EventModal from "../components/EventModal";

export default function Week() {
  const { events, removeEvent } = useEvents();
  const [anchor, setAnchor] = useState(() => new Date());
  const [openEvent, setOpenEvent] = useState(null);

  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay()); start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });

  return (
    <>
      <h1 className="page-title">Calendar — Week</h1>
      <p className="page-subtitle">Seven days at a glance.</p>
      <div className="cal-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="mini-btn" onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); }}><FiChevronLeft /></button>
          <h2 style={{ fontSize: 16 }}>
            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {days[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </h2>
          <button className="mini-btn" onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); }}><FiChevronRight /></button>
          <button className="btn btn-outline" onClick={() => setAnchor(new Date())}>Today</button>
        </div>
      </div>
      <div className="week-grid">
        {days.map((d, i) => {
          const dayEvents = events.filter((e) => sameDay(e.start, d)).sort((a, b) => new Date(a.start) - new Date(b.start));
          const isToday = sameDay(d, new Date());
          return (
            <div key={i} className={`week-col ${isToday ? "today" : ""}`}>
              <div className="week-head">
                <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{d.getDate()}</div>
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {dayEvents.length === 0 && <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: 20 }}>No events</div>}
                {dayEvents.map((e) => {
                  const t = typeMeta(e.type);
                  return (
                    <div key={e.id} onClick={() => setOpenEvent(e)}
                      style={{ background: `${t.color}22`, color: t.color, borderLeft: `3px solid ${t.color}`, padding: 8, borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                      <strong>{fmtTime(e.start)}</strong>
                      <div style={{ marginTop: 2, color: "#111827" }}>{e.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEvent(null)} onDelete={async (id) => { await removeEvent(id); setOpenEvent(null); }} />}
    </>
  );
}

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { EVENT_TYPES, typeMeta, sameDay, fmtTime } from "../constants";
import { useEvents } from "../../api/calendar";
import EventModal from "../components/EventModal";
import GoogleSyncButton from "../components/GoogleSyncButton";

export default function Month() {
  const { events, loading, removeEvent } = useEvents();
  const [filter, setFilter] = useState("all");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const [openEvent, setOpenEvent] = useState(null);

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const offset = i - startDow;
    let dayDate, inMonth = true;
    if (offset < 0) { dayDate = new Date(year, month - 1, daysInPrev + offset + 1); inMonth = false; }
    else if (offset >= daysInMonth) { dayDate = new Date(year, month + 1, offset - daysInMonth + 1); inMonth = false; }
    else { dayDate = new Date(year, month, offset + 1); }
    cells.push({ date: dayDate, inMonth });
  }

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const today = new Date();

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Calendar — Month</h1>
          <p className="page-subtitle">Full month view with all your events and filters.</p>
        </div>
        <GoogleSyncButton />
      </div>

      <div className="cal-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="mini-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}><FiChevronLeft /></button>
          <h2 style={{ fontSize: 18, minWidth: 180, textAlign: "center" }}>
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button className="mini-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}><FiChevronRight /></button>
          <button className="btn btn-outline" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className={`pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({events.length})</span>
          {EVENT_TYPES.map((t) => {
            const count = events.filter((e) => e.type === t.key).length;
            return (
              <span
                key={t.key}
                className={`pill ${filter === t.key ? "active" : ""}`}
                onClick={() => setFilter(t.key)}
                style={filter === t.key ? { background: t.color, borderColor: t.color } : {}}
              >
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: t.color, marginRight: 6 }} />
                {t.label} ({count})
              </span>
            );
          })}
        </div>
      </div>

      <div className="cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((c, i) => {
          const dayEvents = filtered.filter((e) => sameDay(e.start, c.date));
          const isToday = sameDay(c.date, today);
          return (
            <div key={i} className={`cal-cell ${c.inMonth ? "" : "out"} ${isToday ? "today" : ""}`}>
              <div className="cal-cell-head">
                <span className="cal-daynum">{c.date.getDate()}</span>
                {dayEvents.length > 3 && <span className="cal-more">+{dayEvents.length - 3}</span>}
              </div>
              {dayEvents.slice(0, 3).map((e) => {
                const t = typeMeta(e.type);
                return (
                  <div key={e.id} className="cal-event"
                    style={{ background: `${t.color}22`, color: t.color, borderLeft: `3px solid ${t.color}` }}
                    onClick={(ev) => { ev.stopPropagation(); setOpenEvent(e); }}>
                    <strong>{fmtTime(e.start)}</strong> {e.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEvent(null)} onDelete={async (id) => { await removeEvent(id); setOpenEvent(null); }} />}
      {loading && events.length === 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading events…</div>
      )}
    </>
  );
}

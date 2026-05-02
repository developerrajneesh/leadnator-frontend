import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { typeMeta, fmtDate, fmtTime } from "../constants";
import { useEvents } from "../../api/calendar";
import EventModal from "../components/EventModal";

export default function Upcoming() {
  const { events, loading, removeEvent } = useEvents();
  const [openEvent, setOpenEvent] = useState(null);

  if (loading && events.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;
  }

  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 10);

  return (
    <>
      <h1 className="page-title">Calendar — Upcoming</h1>
      <p className="page-subtitle">Your next 10 scheduled events.</p>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiClock /> Next 10 events
        </div>
        {upcoming.length === 0 && <div className="empty" style={{ padding: 40 }}>Nothing on the calendar.</div>}
        {upcoming.map((e) => {
          const t = typeMeta(e.type);
          const when = new Date(e.start);
          const diffDays = Math.ceil((when - now) / 86400000);
          return (
            <div key={e.id} onClick={() => setOpenEvent(e)} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: `${t.color}22`, color: t.color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{when.getDate()}</div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{when.toLocaleDateString("en-US", { month: "short" })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{e.title}</strong>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{fmtDate(e.start)} · {fmtTime(e.start)}</div>
              </div>
              <span className="badge" style={{ background: `${t.color}22`, color: t.color }}>in {diffDays} {diffDays === 1 ? "day" : "days"}</span>
            </div>
          );
        })}
      </div>
      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEvent(null)} onDelete={async (id) => { await removeEvent(id); setOpenEvent(null); }} />}
    </>
  );
}

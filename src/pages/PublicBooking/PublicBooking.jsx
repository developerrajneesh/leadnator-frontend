import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiClock, FiMapPin, FiChevronLeft, FiChevronRight,
  FiCheck, FiAlertCircle, FiCalendar,
} from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const DEFAULT_AVAIL = {
  timezone: "Asia/Kolkata",
  slots: [
    { day: 0, enabled: false, start: "10:00", end: "17:00" },
    { day: 1, enabled: true,  start: "10:00", end: "17:00" },
    { day: 2, enabled: true,  start: "10:00", end: "17:00" },
    { day: 3, enabled: true,  start: "10:00", end: "17:00" },
    { day: 4, enabled: true,  start: "10:00", end: "17:00" },
    { day: 5, enabled: true,  start: "10:00", end: "17:00" },
    { day: 6, enabled: false, start: "10:00", end: "14:00" },
  ],
  buffer: 15, minNotice: 60,
};

function toMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function fromMinutes(m) { const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function buildSlots(date, avail, duration, bookedTimes) {
  const daySlot = avail.slots.find((s) => s.day === date.getDay());
  if (!daySlot || !daySlot.enabled) return [];
  const slots = [];
  const step = duration + (avail.buffer || 0);
  const startM = toMinutes(daySlot.start);
  const endM = toMinutes(daySlot.end);
  const now = new Date();
  const minBookable = new Date(now.getTime() + (avail.minNotice || 0) * 60000);
  for (let m = startM; m + duration <= endM; m += step) {
    const slotDate = new Date(date);
    const [h, mm] = fromMinutes(m).split(":").map(Number);
    slotDate.setHours(h, mm, 0, 0);
    if (slotDate < minBookable) continue;
    const label = fromMinutes(m);
    if (!bookedTimes.has(slotDate.toISOString())) slots.push({ label, iso: slotDate.toISOString() });
  }
  return slots;
}

export default function PublicBooking() {
  const { bookingId } = useParams();
  const [type, setType] = useState(null);
  const [avail, setAvail] = useState(DEFAULT_AVAIL);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("slot");
  const [attendee, setAttendee] = useState({ name: "", email: "", phone: "", notes: "" });

  async function loadBookingData() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/public/booking/${encodeURIComponent(bookingId)}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error("Failed to load booking link");
      const data = await res.json();
      setType(data.bookingType);
      setAvail(data.availability || DEFAULT_AVAIL);
      setBookedSlots(data.bookedSlots || []);
    } catch (err) {
      setError(err.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookingData(); /* eslint-disable-next-line */ }, [bookingId]);

  const bookedTimes = useMemo(() => new Set(bookedSlots), [bookedSlots]);
  const slotsForSelected = useMemo(() => {
    if (!selectedDate || !type) return [];
    return buildSlots(selectedDate, avail, type.duration, bookedTimes);
  }, [selectedDate, type, avail, bookedTimes]);

  if (notFound) return (
    <div className="public-form-wrap">
      <div className="public-form-card" style={{ textAlign: "center" }}>
        <FiAlertCircle style={{ fontSize: 40, color: "var(--danger)", marginBottom: 14 }} />
        <h2>Link not found</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>This booking link is broken or was removed.</p>
      </div>
    </div>
  );
  if (loading || !type) {
    return (
      <div className="public-form-wrap">
        <div className="public-form-card" style={{ textAlign: "center" }}>
          {error
            ? <><FiAlertCircle style={{ fontSize: 32, color: "var(--danger)" }} /><p style={{ marginTop: 10 }}>{error}</p></>
            : "Loading…"}
        </div>
      </div>
    );
  }

  if (step === "done" && selectedSlot) {
    const d = new Date(selectedSlot);
    return (
      <div className="public-form-wrap">
        <div className="public-form-card" style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", background: "#d1fae5", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <FiCheck style={{ fontSize: 32, color: "#059669" }} />
          </div>
          <h2>You're booked!</h2>
          <p style={{ color: "#6b7280", marginTop: 8 }}>A confirmation has been sent to <strong>{attendee.email}</strong>.</p>
          <div style={{ marginTop: 20, padding: 18, background: `${type.color}11`, borderLeft: `3px solid ${type.color}`, borderRadius: 8, textAlign: "left" }}>
            <strong style={{ fontSize: 15 }}>{type.name}</strong>
            <div style={{ fontSize: 13, marginTop: 6 }}><FiCalendar style={{ verticalAlign: "middle", marginRight: 6 }} />{d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}><FiClock style={{ verticalAlign: "middle", marginRight: 6 }} />{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — {type.duration} min</div>
            <div style={{ fontSize: 13, marginTop: 4 }}><FiMapPin style={{ verticalAlign: "middle", marginRight: 6 }} />{type.location}</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "form" && selectedSlot) {
    async function submit(e) {
      e.preventDefault();
      setSubmitting(true); setError("");
      try {
        const res = await fetch(`${BASE_URL}/public/booking/${encodeURIComponent(bookingId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: selectedSlot, ...attendee }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Booking failed");
        setStep("done");
      } catch (err) {
        setError(err.message || "Booking failed.");
      } finally { setSubmitting(false); }
    }
    const d = new Date(selectedSlot);
    return (
      <div className="public-form-wrap">
        <div className="public-form-card" style={{ maxWidth: 560 }}>
          <button className="mini-btn" onClick={() => { setStep("slot"); setError(""); }} style={{ marginBottom: 14 }}><FiChevronLeft /> Back</button>
          <div style={{ padding: 14, background: `${type.color}11`, borderLeft: `3px solid ${type.color}`, borderRadius: 8, marginBottom: 20 }}>
            <strong>{type.name}</strong>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {type.duration} min
            </div>
          </div>
          <h2 style={{ marginBottom: 16 }}>Confirm your details</h2>
          {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group"><label>Your name *</label><input value={attendee.name} onChange={(e) => setAttendee({ ...attendee, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email *</label><input type="email" value={attendee.email} onChange={(e) => setAttendee({ ...attendee, email: e.target.value })} required /></div>
            <div className="form-group"><label>Phone</label><input value={attendee.phone} onChange={(e) => setAttendee({ ...attendee, phone: e.target.value })} /></div>
            <div className="form-group">
              <label>Anything we should know?</label>
              <textarea rows="3" value={attendee.notes} onChange={(e) => setAttendee({ ...attendee, notes: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%", padding: 12 }}>
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const y = monthCursor.getFullYear(), m = monthCursor.getMonth();
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const offset = i - startDow;
    let d, inMonth = true;
    if (offset < 0) { d = new Date(y, m - 1, daysInPrev + offset + 1); inMonth = false; }
    else if (offset >= daysInMonth) { d = new Date(y, m + 1, offset - daysInMonth + 1); inMonth = false; }
    else { d = new Date(y, m, offset + 1); }
    const disabled = d < today || !avail.slots.find((s) => s.day === d.getDay())?.enabled;
    cells.push({ date: d, inMonth, disabled });
  }

  return (
    <div className="public-form-wrap">
      <div className="public-form-card" style={{ maxWidth: 860 }}>
        <div className="booking-head">
          <div style={{ width: 54, height: 54, borderRadius: 14, background: `linear-gradient(135deg, ${type.color}, ${type.color}aa)`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            <FiCalendar />
          </div>
          <div>
            <h2 style={{ fontSize: 22 }}>{type.name}</h2>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              <FiClock style={{ verticalAlign: "middle", marginRight: 4 }} /> {type.duration} min ·
              {" "}<FiMapPin style={{ verticalAlign: "middle", marginRight: 4 }} /> {type.location}
            </div>
            {type.description && <p style={{ fontSize: 13, marginTop: 8 }}>{type.description}</p>}
          </div>
        </div>
        <div className="booking-body">
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15 }}>{monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="mini-btn" onClick={() => setMonthCursor(new Date(y, m - 1, 1))}><FiChevronLeft /></button>
                <button className="mini-btn" onClick={() => setMonthCursor(new Date(y, m + 1, 1))}><FiChevronRight /></button>
              </div>
            </div>
            <div className="book-cal-grid">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} className="book-dow">{d}</div>)}
              {cells.map((c, i) => {
                const isSelected = selectedDate && sameDay(c.date, selectedDate);
                const isToday = sameDay(c.date, new Date());
                return (
                  <button key={i}
                    className={`book-day ${!c.inMonth ? "out" : ""} ${c.disabled ? "disabled" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                    disabled={c.disabled || !c.inMonth}
                    onClick={() => { setSelectedDate(c.date); setSelectedSlot(null); }}>
                    {c.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>
              {selectedDate ? selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "Select a date"}
            </h3>
            {!selectedDate && <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13, border: "2px dashed var(--border)", borderRadius: 10 }}>Pick a day to see open times</div>}
            {selectedDate && slotsForSelected.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13, border: "2px dashed var(--border)", borderRadius: 10 }}>No slots available.</div>}
            <div className="slot-list">
              {slotsForSelected.map((s) => (
                <button key={s.iso} className={`slot-btn ${selectedSlot === s.iso ? "selected" : ""}`} onClick={() => setSelectedSlot(s.iso)}>{s.label}</button>
              ))}
            </div>
            {selectedSlot && (
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={() => setStep("form")}>
                Confirm {new Date(selectedSlot).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

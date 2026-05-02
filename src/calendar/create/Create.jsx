import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheckCircle } from "react-icons/fi";
import { EVENT_TYPES } from "../constants";
import { useEvents } from "../../api/calendar";

export default function Create() {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    title: "", type: "meeting",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00", endTime: "11:00",
    location: "", attendees: "", notes: "",
  });

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess(null);
    try {
      const start = new Date(`${f.date}T${f.startTime}`);
      const end = new Date(`${f.date}T${f.endTime}`);
      if (end <= start) { setError("End time must be after start time."); setSubmitting(false); return; }
      const event = await addEvent({
        title: f.title,
        type: f.type,
        start: start.toISOString(),
        end: end.toISOString(),
        location: f.location,
        attendees: f.attendees ? f.attendees.split(",").map((a) => a.trim()).filter(Boolean) : [],
        notes: f.notes,
      });
      setSuccess(event);
      setF({
        title: "", type: f.type,
        date: new Date().toISOString().slice(0, 10),
        startTime: "10:00", endTime: "11:00",
        location: "", attendees: "", notes: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create event.");
    } finally { setSubmitting(false); }
  }

  return (
    <>
      <h1 className="page-title">Create event</h1>
      <p className="page-subtitle">Add a new event to your calendar.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title"><FiPlus /> Create event</div></div>

        {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {success && (
          <div style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
            <span><FiCheckCircle style={{ verticalAlign: "middle", marginRight: 6 }} />Created <strong>{success.title}</strong>.</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate("/calendar/upcoming")}>View upcoming →</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate("/calendar/month")}>Month view →</button>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group"><label>Title *</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></div>
          <div className="grid-2-equal">
            <div className="form-group">
              <label>Type</label>
              <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                {EVENT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Date</label><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required /></div>
          </div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Start</label><input type="time" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} required /></div>
            <div className="form-group"><label>End</label><input type="time" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Location</label><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Google Meet / Office / Phone" /></div>
          <div className="form-group"><label>Attendees (comma-separated emails)</label><input value={f.attendees} onChange={(e) => setF({ ...f, attendees: e.target.value })} placeholder="anita@acme.in, deepak@worksdelight.com" /></div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows="3" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <FiPlus /> {submitting ? "Saving…" : "Add to calendar"}
          </button>
        </form>
      </div>
    </>
  );
}

import { useState } from "react";

export default function BookingEditor({ init, onSave, onClose }) {
  const [f, setF] = useState(init || {
    id: `book_${Math.random().toString(36).slice(2, 8)}`,
    name: "", duration: 30, location: "Google Meet", description: "", color: "#7c3aed",
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <h3>{init ? "Edit booking type" : "New booking type"}</h3>
        <div className="form-group"><label>Name</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Duration (min)</label>
            <select value={f.duration} onChange={(e) => setF({ ...f, duration: +e.target.value })}>
              <option value={15}>15 min</option><option value={30}>30 min</option>
              <option value={45}>45 min</option><option value={60}>60 min</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <select value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })}>
              <option>Google Meet</option><option>Zoom</option>
              <option>Phone</option><option>In person</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Description</label><textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="form-group">
          <label>Accent color</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#ef4444"].map((c) => (
              <button key={c} type="button" onClick={() => setF({ ...f, color: c })}
                style={{ width: 32, height: 32, borderRadius: 8, background: c, border: f.color === c ? "3px solid #111827" : "2px solid white", boxShadow: "0 0 0 1px var(--border)", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (f.name) { onSave(f); onClose(); } }}>{init ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

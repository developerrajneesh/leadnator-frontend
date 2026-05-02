import { useEffect, useMemo, useState } from "react";
import {
  FiPlus, FiClock, FiMapPin, FiShare2, FiExternalLink, FiTrash2, FiCalendar,
  FiLink,
} from "react-icons/fi";
import { calApi } from "../../api/calendar";
import BookingShareModal from "./components/BookingShareModal";
import BookingEditor from "./components/BookingEditor";

export default function Booking() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await calApi.bookingTypes();
      setTypes(res.bookingTypes || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function upsert(t) {
    try {
      const payload = {
        name: t.name, duration: t.duration, location: t.location,
        description: t.description, color: t.color, slug: t.slug || "",
      };
      if (t.id && types.find((x) => x.id === t.id)) {
        const res = await calApi.updateBookingType(t.id, payload);
        setTypes((list) => list.map((x) => (x.id === t.id ? res.bookingType : x)));
      } else {
        const res = await calApi.createBookingType(payload);
        setTypes((list) => [res.bookingType, ...list]);
      }
      // Mirror to localStorage so the public /book/:id page can still read it.
      localStorage.setItem(`leadnator_booking_${t.id || ""}`, JSON.stringify(t));
    } catch (err) { alert(err.message || "Failed to save."); }
  }

  async function remove(id) {
    if (!confirm("Delete this booking type?")) return;
    try {
      await calApi.deleteBookingType(id);
      setTypes((list) => list.filter((t) => t.id !== id));
      localStorage.removeItem(`leadnator_booking_${id}`);
    } catch (err) { alert(err.message); }
  }

  // mirror DB → localStorage so public /book/:id pages can still read
  useMemo(() => {
    types.forEach((t) => localStorage.setItem(`leadnator_booking_${t.id}`, JSON.stringify(t)));
  }, [types]);

  return (
    <>
      <h1 className="page-title">Booking links</h1>
      <p className="page-subtitle">Share a link, let people pick an open slot — automatically.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {types.length} booking type{types.length === 1 ? "" : "s"} · shareable link for each
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><FiPlus /> New booking type</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading booking types…</div>
      ) : types.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No booking types yet. Click "New booking type" to create one.
        </div>
      ) : (
        <div className="grid-2">
          {types.map((t) => (
            <div className="card booking-card" key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: 16 }}>{t.name}</h3>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    <FiClock style={{ verticalAlign: "middle" }} /> {t.duration} min · <FiMapPin style={{ verticalAlign: "middle" }} /> {t.location}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="mini-btn" onClick={() => setEditing(t)} title="Edit"><FiCalendar /></button>
                  <button className="mini-btn danger" onClick={() => remove(t.id)} title="Delete"><FiTrash2 /></button>
                </div>
              </div>
              {t.description && <p style={{ fontSize: 13, color: "#374151", marginTop: 10, lineHeight: 1.5 }}>{t.description}</p>}
              <div style={{ marginTop: 14, padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 12, fontFamily: "monospace", color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
                <FiLink style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{window.location.host}/book/{t.id}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => setSharing(t)} style={{ flex: 1 }}><FiShare2 /> Share link</button>
                <a className="btn btn-outline" href={`/book/${t.id}`} target="_blank" rel="noreferrer"><FiExternalLink /></a>
              </div>
            </div>
          ))}
        </div>
      )}

      {sharing && <BookingShareModal type={sharing} onClose={() => setSharing(null)} />}
      {creating && <BookingEditor onSave={upsert} onClose={() => setCreating(false)} />}
      {editing && <BookingEditor init={editing} onSave={upsert} onClose={() => setEditing(null)} />}
    </>
  );
}

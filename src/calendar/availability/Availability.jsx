import { useEffect, useState } from "react";
import { FiCheckCircle, FiCheck } from "react-icons/fi";
import { DAYS } from "../constants";
import { calApi } from "../../api/calendar";

export default function Availability() {
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    calApi.availability()
      .then((res) => setAvail(res.availability))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(i, patch) {
    setAvail({ ...avail, slots: avail.slots.map((s, idx) => idx === i ? { ...s, ...patch } : s) });
  }

  async function save() {
    setSaving(true); setError("");
    try {
      const { id, _id, user, createdAt, updatedAt, ...payload } = avail;
      const res = await calApi.saveAvailability(payload);
      setAvail(res.availability);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || "Failed to save availability.");
    } finally { setSaving(false); }
  }

  if (loading || !avail) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading availability…</div>;
  }

  return (
    <>
      <h1 className="page-title">Availability</h1>
      <p className="page-subtitle">Set the hours when people can book time with you.</p>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><div className="card-title"><FiCheckCircle /> Weekly availability</div></div>

        {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div className="grid-2-equal" style={{ marginBottom: 18 }}>
          <div className="form-group">
            <label>Timezone</label>
            <select value={avail.timezone} onChange={(e) => setAvail({ ...avail, timezone: e.target.value })}>
              <option>Asia/Kolkata</option><option>UTC</option>
              <option>America/New_York</option><option>Europe/London</option><option>Asia/Dubai</option>
            </select>
          </div>
          <div className="form-group">
            <label>Buffer between bookings (min)</label>
            <input type="number" value={avail.buffer} onChange={(e) => setAvail({ ...avail, buffer: +e.target.value || 0 })} />
          </div>
        </div>
        <div className="form-group">
          <label>Minimum notice before booking (min)</label>
          <input type="number" value={avail.minNotice} onChange={(e) => setAvail({ ...avail, minNotice: +e.target.value || 0 })} style={{ maxWidth: 200 }} />
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", display: "block", margin: "20px 0 10px" }}>Weekly hours</label>
        {avail.slots.map((s, i) => (
          <div key={s.day} className="avail-row">
            <label className="avail-day">
              <input type="checkbox" checked={s.enabled} onChange={() => update(i, { enabled: !s.enabled })} />
              <strong style={{ fontSize: 13 }}>{DAYS[s.day]}</strong>
            </label>
            {s.enabled ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="time" value={s.start} onChange={(e) => update(i, { start: e.target.value })} />
                <span style={{ color: "#9ca3af" }}>—</span>
                <input type="time" value={s.end} onChange={(e) => update(i, { end: e.target.value })} />
              </div>
            ) : <span style={{ color: "#9ca3af", fontSize: 13 }}>Unavailable</span>}
          </div>
        ))}
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: 18 }}>
          {saving ? "Saving…" : saved ? <><FiCheck /> Saved!</> : "Save availability"}
        </button>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { FiCheckCircle, FiCheck } from "react-icons/fi";
import { DAYS } from "../constants";
import { calApi } from "../../api/calendar";

// All IANA timezones the browser knows about, with a small fallback for older
// engines that don't support Intl.supportedValuesOf.
const TIMEZONES = (() => {
  try {
    const list = Intl.supportedValuesOf("timeZone");
    if (Array.isArray(list) && list.length) return list;
  } catch { /* fall through */ }
  return ["UTC", "Asia/Kolkata", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney"];
})();

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

      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12, maxWidth: 1000 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start", maxWidth: 1000 }}>
        {/* Left — general booking settings */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header"><div className="card-title"><FiCheckCircle /> Booking settings</div></div>

          <div className="form-group">
            <label>Timezone</label>
            <select value={avail.timezone} onChange={(e) => setAvail({ ...avail, timezone: e.target.value })}>
              {avail.timezone && !TIMEZONES.includes(avail.timezone) && (
                <option value={avail.timezone}>{avail.timezone}</option>
              )}
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Buffer between bookings (min)</label>
            <input type="number" value={avail.buffer} onChange={(e) => setAvail({ ...avail, buffer: +e.target.value || 0 })} />
          </div>
          <div className="form-group">
            <label>Minimum notice before booking (min)</label>
            <input type="number" value={avail.minNotice} onChange={(e) => setAvail({ ...avail, minNotice: +e.target.value || 0 })} />
          </div>

          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: 8, width: "100%" }}>
            {saving ? "Saving…" : saved ? <><FiCheck /> Saved!</> : "Save availability"}
          </button>
        </div>

        {/* Right — weekly hours */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header"><div className="card-title"><FiCheckCircle /> Weekly hours</div></div>
          {avail.slots.map((s, i) => (
            <div key={s.day} className="avail-row">
              <label className="avail-day">
                <input type="checkbox" checked={s.enabled} onChange={() => update(i, { enabled: !s.enabled })} />
                <strong style={{ fontSize: 13 }}>{DAYS[s.day]}</strong>
              </label>
              {s.enabled ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(() => {
                    const is24 = s.start === "00:00" && (s.end === "23:59" || s.end === "24:00");
                    return (
                      <>
                        <input type="time" value={s.start} disabled={is24} onChange={(e) => update(i, { start: e.target.value })} />
                        <span style={{ color: "#9ca3af" }}>—</span>
                        <input type="time" value={s.end} disabled={is24} onChange={(e) => update(i, { end: e.target.value })} />
                        <button
                          type="button"
                          onClick={() => update(i, is24 ? { start: "10:00", end: "17:00" } : { start: "00:00", end: "23:59" })}
                          title={is24 ? "Open all day — click to set custom hours" : "Open 24 hours"}
                          style={{
                            border: `1px solid ${is24 ? "#7c3aed" : "var(--border)"}`,
                            background: is24 ? "#7c3aed" : "#fff",
                            color: is24 ? "#fff" : "var(--text-muted)",
                            borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          24h
                        </button>
                      </>
                    );
                  })()}
                </div>
              ) : <span style={{ color: "#9ca3af", fontSize: 13 }}>Unavailable</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

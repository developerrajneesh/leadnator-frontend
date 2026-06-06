import { useEffect, useState } from "react";
import { FiCheckCircle, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { DAYS } from "../constants";
import { calApi } from "../../api/calendar";
import { notify } from "../../globalComponents/Toast/Toast";

export default function Availability() {
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [gstatus, setGstatus] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    calApi.availability()
      .then((res) => setAvail(res.availability))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Google connection status + handle the OAuth callback redirect (?google=...).
  useEffect(() => {
    calApi.googleStatus().then(setGstatus).catch(() => setGstatus({ configured: false, connected: false }));
    const params = new URLSearchParams(window.location.search);
    const g = params.get("google");
    if (g === "connected") notify.success("Google Calendar connected!");
    else if (g === "error") notify.error(params.get("msg") || "Google connection failed");
    if (g) {
      params.delete("google"); params.delete("msg");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
    }
  }, []);

  async function connectGoogle() {
    setConnecting(true);
    try {
      const { url } = await calApi.googleConnect();
      window.location.href = url;
    } catch (err) {
      notify.error(err.message || "Could not start Google connect");
      setConnecting(false);
    }
  }
  async function disconnectGoogle() {
    try {
      await calApi.googleDisconnect();
      setGstatus((s) => ({ ...s, connected: false, email: "" }));
      notify.success("Google disconnected");
    } catch (err) { notify.error(err.message || "Failed to disconnect"); }
  }

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

      {/* Google Calendar / Meet sync (Calendly-style) */}
      <div className="card" style={{ maxWidth: 720, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <FcGoogle size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Google Calendar &amp; Meet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {gstatus?.connected
                ? <>Connected as <strong>{gstatus.email}</strong> — new bookings auto-create a Meet link and sync to both calendars.</>
                : "Connect to auto-generate Google Meet links and add bookings to your and the attendee's calendars."}
            </div>
          </div>
          {gstatus && !gstatus.configured ? (
            <span style={{ fontSize: 12, color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: 8 }}>Not configured on server</span>
          ) : gstatus?.connected ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#047857", background: "#dcfce7", padding: "6px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}><FiCheck /> Connected</span>
              <button className="btn btn-outline" onClick={disconnectGoogle} style={{ color: "#ef4444", borderColor: "#fecaca" }}>Disconnect</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={connectGoogle} disabled={connecting || !gstatus}>
              <FcGoogle style={{ marginRight: 6, background: "#fff", borderRadius: 3 }} /> {connecting ? "Redirecting…" : "Sync with Google"}
            </button>
          )}
        </div>
      </div>

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

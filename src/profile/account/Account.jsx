import { useEffect, useState } from "react";
import { FiSettings, FiCheck } from "react-icons/fi";
import { profileApi } from "../../api/profile";

const LANGUAGES = [
  { value: "en", label: "English (India)" },
  { value: "en-US", label: "English (US)" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
];
const TIMEZONES = [
  "Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles",
  "Europe/London", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney",
];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "AED", "SGD"];
const DATE_FORMATS = ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

export default function Account() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    profileApi.settings()
      .then((res) => setS(res.settings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await profileApi.saveSettings({
        language: s.language, timezone: s.timezone, currency: s.currency,
        dateFormat: s.dateFormat, weekStart: s.weekStart,
      });
      setS(res.settings);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function deleteAccount() {
    alert("Account deletion requires support assistance. Please contact support@leadnator.app.");
  }

  if (loading || !s) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <>
      <h1 className="page-title">Account settings</h1>
      <p className="page-subtitle">Language, timezone and regional preferences.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title"><FiSettings /> Account settings</div></div>
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Language</label>
            <select value={s.language} onChange={(e) => setS({ ...s, language: e.target.value })}>
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })}>
              {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Currency</label>
            <select value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date format</label>
            <select value={s.dateFormat} onChange={(e) => setS({ ...s, dateFormat: e.target.value })}>
              {DATE_FORMATS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Week starts on</label>
          <select value={s.weekStart} onChange={(e) => setS({ ...s, weekStart: e.target.value })} style={{ maxWidth: 200 }}>
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : saved ? <><FiCheck /> Saved!</> : "Save settings"}
        </button>

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <h4 style={{ color: "var(--danger)", marginBottom: 6 }}>Danger zone</h4>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Permanently delete your account and all associated data.</p>
          <button className="btn btn-danger" onClick={deleteAccount}>Delete my account</button>
        </div>
      </div>
    </>
  );
}

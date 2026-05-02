import { useEffect, useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { profileApi } from "../../api/profile";

const ITEMS = [
  { key: "newLead",        label: "New lead arrives",  desc: "Instant email when a new lead is captured." },
  { key: "campaignDone",   label: "Campaign finished", desc: "Get notified when a campaign completes." },
  { key: "weeklyReport",   label: "Weekly summary",    desc: "A report every Monday morning." },
  { key: "billingAlerts",  label: "Billing alerts",    desc: "Reminders for renewals." },
  { key: "productUpdates", label: "Product updates",   desc: "New features and what's changed." },
];

const DEFAULT_PREFS = {
  newLead: true, campaignDone: true, weeklyReport: true,
  billingAlerts: true, productUpdates: false,
};

export default function Notifications() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    profileApi.settings()
      .then((res) => setPrefs({ ...DEFAULT_PREFS, ...(res.settings?.notifications || {}) }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true); setError("");
    try {
      await profileApi.saveNotifications(next);
      setSaved(true); setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setPrefs(prefs); // revert
      setError(err.message);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <>
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">Choose what and when we email you.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="card-title"><FiBell /> Notification preferences</div>
          {saved && <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600 }}><FiCheck /> Saved</span>}
        </div>
        {ITEMS.map((i) => (
          <div key={i.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <strong style={{ fontSize: 13 }}>{i.label}</strong>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{i.desc}</p>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
              <input type="checkbox" disabled={saving} checked={prefs[i.key]} onChange={() => toggle(i.key)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", inset: 0, background: prefs[i.key] ? "var(--primary)" : "#d1d5db", borderRadius: 24, transition: ".2s" }}>
                <span style={{ position: "absolute", height: 18, width: 18, left: prefs[i.key] ? 22 : 3, top: 3, background: "white", borderRadius: "50%", transition: ".2s" }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}

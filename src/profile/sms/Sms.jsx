import { useEffect, useState } from "react";
import { FiMessageSquare, FiCheck, FiAlertCircle } from "react-icons/fi";
import { profileApi } from "../../api/profile";

function validatePhone(v) {
  return /^\+\d{8,15}$/.test(v.trim());
}

export default function Sms() {
  const [sms, setSms] = useState({ enabled: false, provider: "twilio", phone: "", accountSid: "", authToken: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    profileApi.settings()
      .then((res) => {
        const s = res.settings?.sms || {};
        setSms({
          enabled:    !!s.enabled,
          provider:   s.provider || "twilio",
          phone:      s.phone || "",
          accountSid: "",
          authToken:  "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(e) {
    e.preventDefault();
    setError(""); setSaved(false);

    if (sms.enabled) {
      if (!sms.phone.trim()) return setError("Enter your Twilio phone number to enable SMS.");
      if (!validatePhone(sms.phone)) return setError("Phone must be in E.164 format — e.g. +14435065703");
    }

    setSaving(true);
    try {
      const payload = { ...sms };
      // Only send credentials if they were filled in (don't blank out existing ones)
      if (!payload.accountSid) delete payload.accountSid;
      if (!payload.authToken)  delete payload.authToken;
      const res = await profileApi.saveSms(payload);
      const s = res.settings?.sms || {};
      setSms({
        enabled:    !!s.enabled,
        provider:   s.provider || "twilio",
        phone:      s.phone || "",
        accountSid: "",
        authToken:  "",
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { setError(err.message || "Failed to save SMS settings."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <>
      <h1 className="page-title">SMS settings</h1>
      <p className="page-subtitle">Configure Twilio to send SMS messages to your leads.</p>

      <form onSubmit={save} className="card" style={{ maxWidth: 640 }}>
        <div className="card-header">
          <div className="card-title"><FiMessageSquare style={{ verticalAlign: "middle", marginRight: 6 }} />SMS delivery</div>
        </div>

        {/* Enabled toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
          <div>
            <strong style={{ fontSize: 14 }}>Enable SMS</strong>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              When on, you can send one-off SMS and WhatsApp fall-backs through Twilio.
            </p>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 48, height: 26, flexShrink: 0 }}>
            <input type="checkbox" checked={sms.enabled} onChange={() => setSms({ ...sms, enabled: !sms.enabled })} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", inset: 0, cursor: "pointer", background: sms.enabled ? "var(--primary)" : "#d1d5db", borderRadius: 26, transition: ".2s" }}>
              <span style={{ position: "absolute", height: 20, width: 20, left: sms.enabled ? 25 : 3, top: 3, background: "white", borderRadius: "50%", transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </span>
          </label>
        </div>

        {sms.enabled && (
          <>
            <div className="form-group">
              <label>Twilio phone number <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="tel" required
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="+14435065703"
                style={{ fontFamily: "monospace" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                Use the full number in <strong>E.164 format</strong>. Find it in your Twilio console → Phone Numbers.
              </p>
            </div>

            <div className="grid-2-equal">
              <div className="form-group">
                <label>Account SID (re-enter to update)</label>
                <input value={sms.accountSid} onChange={(e) => setSms({ ...sms, accountSid: e.target.value })} placeholder="ACxxxxxxxx…" style={{ fontFamily: "monospace" }} />
              </div>
              <div className="form-group">
                <label>Auth Token (re-enter to update)</label>
                <input type="password" value={sms.authToken} onChange={(e) => setSms({ ...sms, authToken: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
              Credentials are stored encrypted server-side and never sent back to the browser.
            </p>
          </>
        )}

        {error && (
          <div style={{ padding: "10px 12px", background: "#fef2f2", color: "var(--danger)", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <FiAlertCircle style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : saved ? <><FiCheck /> Saved</> : "Save SMS settings"}
        </button>
      </form>
    </>
  );
}

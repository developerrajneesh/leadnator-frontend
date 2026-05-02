import { useEffect, useState } from "react";
import { FiSettings, FiCheckCircle, FiSend, FiAlertCircle } from "react-icons/fi";
import { emailApi } from "../../api/email";

const PRESETS = {
  gmail:    { host: "smtp.gmail.com",      port: 587, secure: false, hint: "Use a Google App Password (not your account password)." },
  outlook:  { host: "smtp.office365.com",  port: 587, secure: false, hint: "Use an app password if 2FA is on." },
  sendgrid: { host: "smtp.sendgrid.net",   port: 587, secure: false, hint: "Username is literally 'apikey', password is your API key." },
  ses:      { host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false, hint: "Use SMTP credentials from the SES console." },
  zoho:     { host: "smtp.zoho.in",        port: 587, secure: false, hint: "Use an app-specific password." },
  custom:   { host: "", port: 587, secure: false, hint: "Enter your provider's SMTP host & port." },
};

export default function Config() {
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testingSend, setTestingSend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.config();
      setCfg({ ...res.config, password: "" });   // password never returned, blank field for "no change"
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    setCfg((c) => ({ ...c, host: p.host, port: p.port, secure: p.secure }));
  }

  async function save(e) {
    e?.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.saveConfig(cfg);
      setCfg({ ...res.config, password: "" });
      setSuccess("Saved.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function verify() {
    setTesting(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.testConfig();
      if (res.ok) {
        setSuccess(res.message || "Connection verified ✅");
        await load();
        // Let the sidebar + email-gate know the user is configured now,
        // without forcing a page reload.
        import("../useEmailStatus").then((m) => m.refreshEmailStatus()).catch(() => {});
      }
    } catch (err) { setError(err.message); }
    finally { setTesting(false); }
  }

  async function sendTest() {
    if (!testTo) return;
    setTestingSend(true); setError(""); setSuccess("");
    try {
      await emailApi.testSend(testTo);
      setSuccess(`Test email sent to ${testTo} ✅`);
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) { setError(err.message); }
    finally { setTestingSend(false); }
  }

  if (loading || !cfg) {
    return (
      <>
        <h1 className="page-title">Email — SMTP config</h1>
        <p className="page-subtitle">Configure the outbound SMTP server your campaigns send from.</p>
        <div className="card" style={{ maxWidth: 680 }}>
          <div className="grid-2-equal" style={{ gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
                <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <span className="skel skel-line skel-line-sm" style={{ width: 140, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <span className="skel" style={{ width: 120, height: 38, borderRadius: 8 }} />
            <span className="skel" style={{ width: 140, height: 38, borderRadius: 8 }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Email — SMTP config</h1>
      <p className="page-subtitle">
        Configure how Leadnator sends emails on your behalf.
        {cfg.verified
          ? <span style={{ color: "var(--accent)", marginLeft: 8 }}><FiCheckCircle style={{ verticalAlign: "middle" }} /> Verified</span>
          : <span style={{ color: "#b45309", marginLeft: 8 }}><FiAlertCircle style={{ verticalAlign: "middle" }} /> Not verified</span>}
      </p>

      {error   && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 8, marginBottom: 12, fontSize: 13 }}><FiCheckCircle style={{ verticalAlign: "middle", marginRight: 6 }} />{success}</div>}

      <form onSubmit={save} className="card" style={{ maxWidth: 720 }}>
        <div className="card-header">
          <div className="card-title"><FiSettings /> SMTP server</div>
        </div>

        <div className="form-group">
          <label>Quick preset</label>
          <select value="" onChange={(e) => applyPreset(e.target.value)}>
            <option value="">— Pick a preset —</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook / Office365</option>
            <option value="sendgrid">SendGrid</option>
            <option value="ses">Amazon SES (us-east-1)</option>
            <option value="zoho">Zoho Mail</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="grid-2-equal">
          <div className="form-group"><label>SMTP host *</label>
            <input required value={cfg.host || ""} onChange={(e) => setCfg({ ...cfg, host: e.target.value })} placeholder="smtp.gmail.com" />
          </div>
          <div className="form-group"><label>Port *</label>
            <input required type="number" value={cfg.port || 587} onChange={(e) => setCfg({ ...cfg, port: +e.target.value })} />
          </div>
        </div>

        <div className="grid-2-equal">
          <div className="form-group"><label>Username *</label>
            <input required value={cfg.username || ""} onChange={(e) => setCfg({ ...cfg, username: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="form-group"><label>Password / App password</label>
            <input type="password" value={cfg.password || ""} onChange={(e) => setCfg({ ...cfg, password: e.target.value })} placeholder={cfg.username ? "Leave blank to keep existing" : "App password"} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Stored encrypted server-side, never returned to the browser.
            </div>
          </div>
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
          <input type="checkbox" checked={!!cfg.secure} onChange={(e) => setCfg({ ...cfg, secure: e.target.checked })} />
          Use SSL/TLS (port 465)
        </label>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 6 }} />

        <div className="grid-2-equal">
          <div className="form-group"><label>From name</label>
            <input value={cfg.fromName || ""} onChange={(e) => setCfg({ ...cfg, fromName: e.target.value })} placeholder="Leadnator" />
          </div>
          <div className="form-group"><label>From email *</label>
            <input required type="email" value={cfg.fromEmail || ""} onChange={(e) => setCfg({ ...cfg, fromEmail: e.target.value })} placeholder="hello@example.com" />
          </div>
        </div>
        <div className="form-group"><label>Reply-to email (optional)</label>
          <input type="email" value={cfg.replyTo || ""} onChange={(e) => setCfg({ ...cfg, replyTo: e.target.value })} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-outline" onClick={verify} disabled={testing}>
            {testing ? "Verifying…" : "Verify connection"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save config"}
          </button>
        </div>
      </form>

      <div className="card" style={{ maxWidth: 720, marginTop: 16 }}>
        <div className="card-header"><div className="card-title"><FiSend /> Send test email</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="recipient@example.com" style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={sendTest} disabled={!testTo || testingSend}>
            <FiSend /> {testingSend ? "Sending…" : "Send test"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          Useful to check end-to-end delivery before launching a campaign.
        </div>
      </div>
    </>
  );
}

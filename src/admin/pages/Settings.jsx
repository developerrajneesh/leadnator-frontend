import { useEffect, useState } from "react";
import { FiSave, FiKey, FiGlobe, FiShield, FiMail, FiAlertTriangle, FiUnlock } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

export default function AdminSettings() {
  const [form, setForm] = useState({
    siteName: "Leadnator",
    supportEmail: "support@leadnator.com",
    signupEnabled: true,
    maintenanceMode: false,
    trialDays: 14,
    defaultPlan: "Starter",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
  });

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Platform configuration and administrative controls.</p>

      <MasterPasswordCard />

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiGlobe style={{ marginRight: 8, verticalAlign: "middle" }} />Platform</div>
          </div>
          <div className="form-group"><label>Site name</label><input value={form.siteName} onChange={(e) => update("siteName", e.target.value)} /></div>
          <div className="form-group"><label>Support email</label><input value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} /></div>
          <div className="form-group"><label>Default plan</label>
            <select value={form.defaultPlan} onChange={(e) => update("defaultPlan", e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}>
              <option>Starter</option><option>Growth</option><option>Pro</option>
            </select>
          </div>
          <div className="form-group"><label>Trial period (days)</label><input type="number" value={form.trialDays} onChange={(e) => update("trialDays", +e.target.value)} /></div>

          <Toggle label="Signups enabled" hint="Allow new users to register." value={form.signupEnabled} onChange={(v) => update("signupEnabled", v)} />
          <Toggle label="Maintenance mode" hint="Block all user traffic. Admins can still log in." value={form.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiMail style={{ marginRight: 8, verticalAlign: "middle" }} />Email / SMTP</div>
          </div>
          <div className="form-group"><label>SMTP host</label><input value={form.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} /></div>
          <div className="form-group"><label>SMTP port</label><input type="number" value={form.smtpPort} onChange={(e) => update("smtpPort", +e.target.value)} /></div>
          <div className="form-group"><label>From address</label><input defaultValue="no-reply@leadnator.com" /></div>
          <button className="auth-submit" style={{ width: "auto", padding: "10px 16px" }}>Send test email</button>
        </div>
      </div>

      <div className="grid-2-equal" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiKey style={{ marginRight: 8, verticalAlign: "middle" }} />API keys</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Meta Ads",  key: "••••••••••••••1a2b", created: "2026-01-11" },
              { name: "SendGrid",  key: "••••••••••••••9f4c", created: "2026-02-02" },
              { name: "Twilio",    key: "••••••••••••••3e7d", created: "2026-03-18" },
              { name: "Razorpay",  key: "••••••••••••••8c2a", created: "2026-02-20" },
            ].map((k) => (
              <div key={k.name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{k.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{k.key}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Added {new Date(k.created).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiShield style={{ marginRight: 8, verticalAlign: "middle" }} />Security</div>
          </div>
          <Toggle label="Require 2FA for admins" hint="All admin accounts must enable two-factor." value={true} />
          <Toggle label="IP allowlist" hint="Restrict admin login by IP." value={false} />
          <Toggle label="Session auto-logout (30m)" hint="Force logout after 30 minutes of inactivity." value={true} />
          <Toggle label="Audit logging" hint="Record every admin action." value={true} />
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="admin-action">Cancel</button>
        <button className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}><FiSave style={{ marginRight: 6 }} />Save changes</button>
      </div>
    </>
  );
}

function MasterPasswordCard() {
  const [status, setStatus] = useState(null);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.admin.masterPassword().then(setStatus).catch(() => setStatus({ enabled: false }));
  }, []);

  async function save() {
    if (value.length < 8) return notify.error("Master password must be at least 8 characters.");
    setSaving(true);
    try {
      const r = await api.admin.setMasterPassword(value);
      setStatus(r);
      setValue("");
      notify.success("Master password set. It can now sign into any account.");
    } catch (err) {
      notify.error(err.message || "Failed to set master password");
    } finally { setSaving(false); }
  }
  async function disable() {
    if (!confirm("Disable the master password? It will no longer sign into any account.")) return;
    setSaving(true);
    try {
      const r = await api.admin.clearMasterPassword();
      setStatus(r);
      notify.success("Master password disabled.");
    } catch (err) {
      notify.error(err.message || "Failed to disable");
    } finally { setSaving(false); }
  }

  const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

  return (
    <div className="card" style={{ marginBottom: 16, border: "1px solid #fde68a", background: "#fffbeb" }}>
      <div className="card-header">
        <div className="card-title"><FiUnlock style={{ marginRight: 8, verticalAlign: "middle", color: "#b45309" }} />Master password</div>
        {status && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, color: status.enabled ? "#047857" : "#64748b", background: status.enabled ? "#dcfce7" : "#f1f5f9" }}>
            {status.enabled ? "Active" : "Not set"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", marginBottom: 14, lineHeight: 1.5 }}>
        <FiAlertTriangle style={{ marginTop: 2, flexShrink: 0 }} />
        <span>
          Anyone who knows this password can sign in to <strong>any user account</strong> by entering that account's email and this password.
          It's stored encrypted (bcrypt) and every master-password login is logged. Use a long, unique password and share it with no one.
        </span>
      </div>

      <div className="form-group">
        <label>{status?.enabled ? "Set a new master password" : "Set a master password"}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="At least 8 characters"
            style={{ flex: 1 }}
            autoComplete="new-password"
          />
          <button type="button" className="btn btn-outline" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={save} disabled={saving || !value}>
          <FiKey style={{ marginRight: 6 }} /> {saving ? "Saving…" : status?.enabled ? "Update password" : "Set master password"}
        </button>
        {status?.enabled && (
          <button className="btn btn-outline" onClick={disable} disabled={saving} style={{ color: "#ef4444", borderColor: "#fecaca" }}>
            Disable
          </button>
        )}
        {status?.enabled && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Updated {fmt(status.updatedAt)}{status.lastMasterLoginAt ? ` · last used ${fmt(status.lastMasterLoginAt)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  const [v, setV] = useState(value);
  const checked = onChange ? value : v;
  const handle = () => {
    if (onChange) onChange(!checked);
    else setV(!v);
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</div>
      </div>
      <button
        onClick={handle}
        style={{
          width: 40, height: 22, borderRadius: 12, border: "none", cursor: "pointer",
          background: checked ? "var(--primary)" : "#d1d5db",
          position: "relative", transition: "0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 20 : 2,
          width: 18, height: 18, borderRadius: "50%", background: "white", transition: "0.2s",
        }} />
      </button>
    </div>
  );
}

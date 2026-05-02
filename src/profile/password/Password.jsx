import { useState } from "react";
import { FiLock, FiCheck } from "react-icons/fi";
import { profileApi } from "../../api/profile";

export default function Password() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(""); setDone(false);
    if (form.newPassword !== form.confirm) { setError("New passwords don't match."); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }

    setSaving(true);
    try {
      await profileApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally { setSaving(false); }
  }

  return (
    <>
      <h1 className="page-title">Password & security</h1>
      <p className="page-subtitle">Update your password and enable 2FA.</p>

      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-header"><div className="card-title"><FiLock /> Change password</div></div>

        {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {done  && <div style={{ padding: 10, background: "#d1fae5", color: "#065f46", borderRadius: 8, fontSize: 13, marginBottom: 12 }}><FiCheck style={{ verticalAlign: "middle", marginRight: 6 }} />Password updated successfully.</div>}

        <form onSubmit={submit}>
          <div className="form-group"><label>Current password *</label>
            <input type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div className="form-group"><label>New password * (min 6 chars)</label>
            <input type="password" required minLength="6" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <div className="form-group"><label>Confirm new password *</label>
            <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </button>
        </form>

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <h4 style={{ marginBottom: 8 }}>Two-factor authentication</h4>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Add an extra layer of security with TOTP (Google Authenticator).</p>
          <button className="btn btn-outline" onClick={() => alert("2FA setup coming soon — your account is currently protected by password only.")}>Enable 2FA</button>
        </div>
      </div>
    </>
  );
}

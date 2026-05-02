import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { profileApi, syncStoredUser } from "../../api/profile";
import { useCurrentUser } from "../../api/hooks";

export default function Info() {
  const CURRENT_USER = useCurrentUser();
  const [form, setForm] = useState({
    name: CURRENT_USER.name || "",
    email: CURRENT_USER.email || "",
    phone: CURRENT_USER.phone || "",
    company: CURRENT_USER.company || "",
    website: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Pull settings (bio, website) on mount
  useEffect(() => {
    profileApi.settings()
      .then((res) => {
        const s = res.settings || {};
        setForm((f) => ({ ...f, bio: s.bio || "", website: s.website || "" }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      // Save user info (name, email, phone, company)
      const userRes = await profileApi.updateInfo({
        name: form.name, email: form.email, phone: form.phone, company: form.company,
      });
      // Save settings (bio, website)
      await profileApi.saveSettings({ bio: form.bio, website: form.website });

      syncStoredUser({
        name: userRes.user.name, email: userRes.user.email,
        phone: userRes.user.phone, company: userRes.user.company,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <>
      <h1 className="page-title">Profile info</h1>
      <p className="page-subtitle">Personal details that appear across the app.</p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), #ec4899)",
            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700,
          }}>{(form.name?.[0] || "?").toUpperCase()}</div>
          <div>
            <h3>{form.name || "—"}</h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>{form.email}</p>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="grid-2-equal">
            <div className="form-group"><label>Full name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" /></div>
            <div className="form-group"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Website</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.com" /></div>
          <div className="form-group">
            <label>Bio</label>
            <textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : saved ? <><FiCheck /> Saved!</> : "Save changes"}
          </button>
        </form>
      </div>
    </>
  );
}

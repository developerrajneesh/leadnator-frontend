import { useEffect, useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { FiSave, FiLogOut } from "react-icons/fi";
import { igApi } from "../../api/instagram";
import { refreshInstagramStatus } from "../useInstagramStatus";

export default function Settings() {
  const [connection, setConnection] = useState(null);
  const [settings, setSettings] = useState({
    dmAutoReply: false,
    dmAutoReplyText: "",
    commentAutoReply: false,
    commentReplyText: "",
    storyMentionNotify: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await igApi.settings();
      setConnection(r.connection);
      if (r.settings) setSettings((s) => ({ ...s, ...r.settings }));
    } catch { /* not connected */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await igApi.saveSettings({ settings });
      alert("Settings saved.");
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function disconnect() {
    if (!confirm("Disconnect Instagram? Automations will stop.")) return;
    await igApi.disconnect();
    await refreshInstagramStatus();
    window.location.href = "/instagram/overview";
  }

  if (loading) return <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <>
      <h1 className="page-title">Instagram — Settings</h1>
      <p className="page-subtitle">Connected account and automation defaults.</p>

      {connection && (
        <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          {connection.profilePictureUrl ? (
            <img src={connection.profilePictureUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaInstagram color="#e1306c" size={28} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>@{connection.username}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{connection.name} · {connection.pageName}</div>
          </div>
          <button type="button" className="btn btn-outline" style={{ color: "#b91c1c" }} onClick={disconnect}>
            <FiLogOut /> Disconnect
          </button>
        </div>
      )}

      <form onSubmit={save} className="card">
        <div className="card-title">Automation defaults</div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13 }}>
          <input type="checkbox" checked={settings.dmAutoReply} onChange={(e) => setSettings({ ...settings, dmAutoReply: e.target.checked })} />
          Auto-reply to new DMs
        </label>
        <textarea
          rows={2}
          value={settings.dmAutoReplyText}
          onChange={(e) => setSettings({ ...settings, dmAutoReplyText: e.target.value })}
          placeholder="Thanks for your message! We'll reply soon."
          style={{ width: "100%", marginBottom: 16 }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13 }}>
          <input type="checkbox" checked={settings.commentAutoReply} onChange={(e) => setSettings({ ...settings, commentAutoReply: e.target.checked })} />
          Auto-reply to new comments
        </label>
        <textarea
          rows={2}
          value={settings.commentReplyText}
          onChange={(e) => setSettings({ ...settings, commentReplyText: e.target.value })}
          placeholder="Thanks for commenting! Check your DMs."
          style={{ width: "100%", marginBottom: 16 }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13 }}>
          <input type="checkbox" checked={settings.storyMentionNotify} onChange={(e) => setSettings({ ...settings, storyMentionNotify: e.target.checked })} />
          Notify on story mentions
        </label>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          <FiSave /> {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </>
  );
}

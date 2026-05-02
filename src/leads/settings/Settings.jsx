import { useEffect, useState } from "react";
import { FiTarget, FiMessageCircle, FiSave, FiAlertCircle } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const STATUSES = [
  { v: "new",       l: "New" },
  { v: "contacted", l: "Contacted" },
  { v: "hot",       l: "Hot" },
  { v: "qualified", l: "Qualified" },
];

export default function LeadSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.leads.settings()
      .then((r) => setSettings(r.settings))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function patch(section, changes) {
    setSettings((s) => ({ ...s, [section]: { ...s[section], ...changes } }));
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.leads.saveSettings({
        metaForms: settings.metaForms,
        whatsapp:  settings.whatsapp,
      });
      setSettings(r.settings);
      notify.success("Lead settings saved");
    } catch (err) {
      notify.error(err.message || "Failed to save settings");
    } finally { setSaving(false); }
  }

  if (loading) return <LeadSettingsSkeleton />;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!settings) return null;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Leads — Settings</h1>
          <p className="page-subtitle">Control which sources can automatically create leads in your workspace.</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <FiSave /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Meta Forms */}
      <SourceCard
        icon={<FiTarget />}
        color="#1877f2"
        title="Meta Lead Ads forms"
        description="When someone submits a lead form on Facebook or Instagram, auto-create a lead in this workspace. Turning this off means inbound Meta leads are ignored until you turn it back on."
        enabled={settings.metaForms.enabled}
        onToggle={(v) => patch("metaForms", { enabled: v })}
      >
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Default status</label>
            <select
              disabled={!settings.metaForms.enabled}
              value={settings.metaForms.defaultStatus}
              onChange={(e) => patch("metaForms", { defaultStatus: e.target.value })}
            >
              {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Default value (₹)</label>
            <input
              type="number"
              disabled={!settings.metaForms.enabled}
              value={settings.metaForms.defaultValue}
              onChange={(e) => patch("metaForms", { defaultValue: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Default tags (comma separated)</label>
          <input
            disabled={!settings.metaForms.enabled}
            value={(settings.metaForms.defaultTags || []).join(", ")}
            onChange={(e) => patch("metaForms", {
              defaultTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })}
            placeholder="e.g. meta, paid, warm"
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            The tag <code>meta-lead</code> is always added automatically so you can filter on it.
          </div>
        </div>
      </SourceCard>

      {/* WhatsApp */}
      <SourceCard
        icon={<FiMessageCircle />}
        color="#25d366"
        title="WhatsApp inbound messages"
        description="When an unknown number messages your WhatsApp Business number, automatically create a lead. We de-duplicate by phone so the same number never creates two leads."
        enabled={settings.whatsapp.enabled}
        onToggle={(v) => patch("whatsapp", { enabled: v })}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input
            id="wa-first-only"
            type="checkbox"
            disabled={!settings.whatsapp.enabled}
            checked={settings.whatsapp.firstMessageOnly}
            onChange={(e) => patch("whatsapp", { firstMessageOnly: e.target.checked })}
          />
          <label htmlFor="wa-first-only" style={{ fontSize: 13 }}>
            Only on the <b>first</b> message from a new number (recommended)
          </label>
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Default status</label>
            <select
              disabled={!settings.whatsapp.enabled}
              value={settings.whatsapp.defaultStatus}
              onChange={(e) => patch("whatsapp", { defaultStatus: e.target.value })}
            >
              {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Default value (₹)</label>
            <input
              type="number"
              disabled={!settings.whatsapp.enabled}
              value={settings.whatsapp.defaultValue}
              onChange={(e) => patch("whatsapp", { defaultValue: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Default tags (comma separated)</label>
          <input
            disabled={!settings.whatsapp.enabled}
            value={(settings.whatsapp.defaultTags || []).join(", ")}
            onChange={(e) => patch("whatsapp", {
              defaultTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })}
            placeholder="e.g. whatsapp, india"
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            The tag <code>whatsapp</code> is always added automatically.
          </div>
        </div>
      </SourceCard>

      <div style={{ padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, fontSize: 12, color: "#9a3412", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          These toggles only affect <b>automatic</b> lead creation from external sources. Manual entry
          (Add lead, Import CSV) is always on.
        </div>
      </div>
    </>
  );
}

function SourceCard({ icon, color, title, description, enabled, onToggle, children }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5, maxWidth: 680 }}>{description}</div>
          </div>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>

      {enabled && (
        <div style={{ paddingTop: 10, borderTop: "1px dashed var(--border)", marginTop: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* Matches the real page layout (header + save button + 2 source cards +
   amber info banner) so the transition to loaded state has zero jump. */
function LeadSettingsSkeleton() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Leads — Settings</h1>
          <p className="page-subtitle">Control which sources can automatically create leads in your workspace.</p>
        </div>
        <span className="skel" style={{ width: 140, height: 38, borderRadius: 10 }} />
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <span className="skel skel-line" style={{ width: 220, height: 16, display: "block", marginBottom: 8 }} />
                <span className="skel skel-line skel-line-sm" style={{ width: "80%", display: "block", marginBottom: 4 }} />
                <span className="skel skel-line skel-line-sm" style={{ width: "55%", display: "block" }} />
              </div>
            </div>
            <span className="skel" style={{ width: 44, height: 24, borderRadius: 12, flexShrink: 0 }} />
          </div>
          <div style={{ paddingTop: 10, borderTop: "1px dashed var(--border)", marginTop: 10 }}>
            <div className="grid-2-equal">
              <div>
                <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 8 }} />
                <span className="skel" style={{ width: "100%", height: 36, borderRadius: 8, display: "block" }} />
              </div>
              <div>
                <span className="skel skel-line skel-line-sm" style={{ width: 110, display: "block", marginBottom: 8 }} />
                <span className="skel" style={{ width: "100%", height: 36, borderRadius: 8, display: "block" }} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <span className="skel skel-line skel-line-sm" style={{ width: 160, display: "block", marginBottom: 8 }} />
              <span className="skel" style={{ width: "100%", height: 36, borderRadius: 8, display: "block" }} />
            </div>
          </div>
        </div>
      ))}

      <div style={{ padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10 }}>
        <span className="skel skel-line" style={{ width: "85%", display: "block" }} />
      </div>
    </>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "var(--primary, #7c3aed)" : "#d1d5db",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, background: "#fff", borderRadius: "50%",
        transition: "left 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

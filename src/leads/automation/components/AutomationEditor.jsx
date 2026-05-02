import { useState } from "react";
import { FiMail, FiMessageCircle } from "react-icons/fi";
import { TRIGGER_LABELS } from "../constants";

export default function AutomationEditor({ init, onSave, onClose }) {
  const [f, setF] = useState(init || {
    id: `auto_${Date.now()}`,
    name: "", trigger: "new_lead", source: "any", status: "active", delay: 0,
    channels: { email: true, whatsapp: false },
    emailSubject: "Hi {{firstName}}, thanks for reaching out!",
    emailBody: "Hi {{firstName}},\n\nThanks — I'll follow up shortly.\n\n— Team",
    whatsappBody: "Hey {{firstName}}! Thanks for getting in touch.",
    triggered: 0, lastRun: "—",
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <h3>{init ? "Edit automation" : "New automation"}</h3>
        <p className="sub">Auto-reply to new leads via email and/or WhatsApp.</p>

        <div className="form-group">
          <label>Automation name</label>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Welcome new Meta Ads lead" required />
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Trigger</label>
            <select value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })}>
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Source filter</label>
            <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
              <option value="any">Any source</option>
              <option>Meta Ads</option><option>Google Ads</option>
              <option>Website</option><option>Referral</option>
              <option>Manual</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Send after (minutes) — 0 for instant</label>
          <input type="number" min="0" value={f.delay} onChange={(e) => setF({ ...f, delay: +e.target.value || 0 })} />
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Channels</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <label className={`channel-toggle ${f.channels.email ? "active" : ""}`}>
            <input type="checkbox" checked={f.channels.email} onChange={() => setF({ ...f, channels: { ...f.channels, email: !f.channels.email } })} />
            <FiMail /> Email
          </label>
          <label className={`channel-toggle ${f.channels.whatsapp ? "active" : ""}`}>
            <input type="checkbox" checked={f.channels.whatsapp} onChange={() => setF({ ...f, channels: { ...f.channels, whatsapp: !f.channels.whatsapp } })} />
            <FiMessageCircle /> WhatsApp
          </label>
        </div>

        {f.channels.email && (
          <div style={{ padding: 12, background: "#eef2ff", borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", marginBottom: 8 }}>
              <FiMail style={{ verticalAlign: "middle" }} /> Email auto-reply
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Subject</label>
              <input value={f.emailSubject} onChange={(e) => setF({ ...f, emailSubject: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Message</label>
              <textarea rows="4" value={f.emailBody} onChange={(e) => setF({ ...f, emailBody: e.target.value })} />
            </div>
          </div>
        )}

        {f.channels.whatsapp && (
          <div style={{ padding: 12, background: "#d1fae5", borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#047857", marginBottom: 8 }}>
              <FiMessageCircle style={{ verticalAlign: "middle" }} /> WhatsApp auto-reply
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Message</label>
              <textarea rows="3" value={f.whatsappBody} onChange={(e) => setF({ ...f, whatsappBody: e.target.value })} />
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
          Available variables: <code>{"{{firstName}}"}</code> · <code>{"{{name}}"}</code> · <code>{"{{email}}"}</code>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { if (f.name) { onSave(f); onClose(); } }}>
            {init ? "Save changes" : "Create automation"}
          </button>
        </div>
      </div>
    </div>
  );
}

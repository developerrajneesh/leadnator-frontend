import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSave } from "react-icons/fi";
import { STATUSES } from "../../constants";

export default function EditLeadModal({ lead, onClose, onSave }) {
  const [name, setName]     = useState(lead.name || "");
  const [email, setEmail]   = useState(lead.email || "");
  const [phone, setPhone]   = useState(lead.phone || "");
  const [source, setSource] = useState(lead.source || "Manual");
  const [status, setStatus] = useState(lead.status || "new");
  const [tagsStr, setTagsStr] = useState((lead.tags || []).join(", "));
  const [notes, setNotes]   = useState(lead.notes || "");
  const [value, setValue]   = useState(lead.value || 0);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source,
        status,
        tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
        notes,
        value: Number(value) || 0,
      });
    } finally { setSaving(false); }
  }

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 560, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", position: "relative", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title">Edit lead</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div className="form-group">
          <label>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Manual</option><option>Website</option><option>Meta Ads</option>
              <option>Referral</option><option>Google Ads</option><option>Import</option>
              <option>LinkedIn</option><option>Event</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="b2b, priority, warm" />
          </div>
          <div className="form-group">
            <label>Value (₹)</label>
            <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ fontFamily: "inherit", fontSize: 13 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

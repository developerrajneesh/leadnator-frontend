import { useState } from "react";
import { FiShare2, FiCopy, FiCheck, FiMail, FiMessageCircle, FiExternalLink } from "react-icons/fi";

export default function BookingShareModal({ type, onClose }) {
  const shareUrl = `${window.location.origin}/book/${type.id}`;
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=7c3aed&data=${encodeURIComponent(shareUrl)}`;
  const emailBody = encodeURIComponent(`Hi,\n\nHere's a link to book a ${type.duration}-min ${type.name.toLowerCase()} with me:\n${shareUrl}`);
  const waText = encodeURIComponent(`Hey! Pick a time that works for you: ${shareUrl}`);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <h3><FiShare2 style={{ verticalAlign: "middle", marginRight: 8 }} />Share booking link</h3>
        <p className="sub">Anyone with this link can pick an open slot from your calendar.</p>
        <div style={{ padding: 12, background: `${type.color}11`, borderLeft: `3px solid ${type.color}`, borderRadius: 8, marginBottom: 16 }}>
          <strong>{type.name}</strong>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{type.duration} min · {type.location}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={shareUrl} readOnly style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "monospace", fontSize: 12, background: "#f9fafb" }} />
          <button className="btn btn-primary" onClick={copy}>{copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          <a className="share-btn email" href={`mailto:?subject=${encodeURIComponent("Let's find a time")}&body=${emailBody}`}><FiMail /> Email</a>
          <a className="share-btn whatsapp" href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer"><FiMessageCircle /> WhatsApp</a>
          <a className="share-btn open" href={shareUrl} target="_blank" rel="noreferrer"><FiExternalLink /> Open</a>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: 12, background: "#f9fafb", borderRadius: 8 }}>
          <img src={qrUrl} alt="QR" style={{ width: 90, height: 90, borderRadius: 6 }} />
          <div>
            <strong style={{ fontSize: 13 }}>Scan to open</strong>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Put this QR on business cards.</p>
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  FiShare2, FiCopy, FiCheck, FiMail, FiMessageCircle, FiExternalLink,
} from "react-icons/fi";
import { copyText } from "../../utils";

export default function ShareModal({ formId, title, onClose }) {
  const shareUrl = `${window.location.origin}/form/${formId}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    copyText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const emailSubject = encodeURIComponent(`Quick form: ${title}`);
  const emailBody = encodeURIComponent(`Hi,\n\nI'd love your input — please fill this quick form:\n${shareUrl}\n\nThanks!`);
  const waText = encodeURIComponent(`Hi! Please fill this form when you get a minute: ${shareUrl}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=7c3aed&data=${encodeURIComponent(shareUrl)}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="640" frameborder="0" style="border:1px solid #e5e7eb;border-radius:12px"></iframe>`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3><FiShare2 style={{ verticalAlign: "middle", marginRight: 8 }} />Share your form</h3>
        <p className="sub">Send this link to anyone — they can fill the form from any device.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <input value={shareUrl} readOnly style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "monospace", fontSize: 12, background: "#f9fafb" }} />
          <button className="btn btn-primary" onClick={copy} style={{ minWidth: 100 }}>{copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <a className="share-btn email" href={`mailto:?subject=${emailSubject}&body=${emailBody}`}><FiMail /> Email</a>
          <a className="share-btn whatsapp" href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer"><FiMessageCircle /> WhatsApp</a>
          <a className="share-btn open" href={shareUrl} target="_blank" rel="noreferrer"><FiExternalLink /> Open</a>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 14, background: "#f9fafb", borderRadius: 10, marginBottom: 14 }}>
          <img src={qrUrl} alt="QR code" style={{ width: 100, height: 100, borderRadius: 6 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 13 }}>Scan on mobile</strong>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>
              Print this QR on posters, print ads or business cards.
            </p>
          </div>
        </div>

        <details>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--primary)", padding: "8px 0" }}>Embed on your website</summary>
          <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 8, fontSize: 11, overflow: "auto", margin: "8px 0 0", fontFamily: "monospace" }}>{embedCode}</pre>
          <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => copyText(embedCode)}><FiCopy /> Copy embed code</button>
        </details>

        <div className="modal-actions" style={{ marginTop: 18 }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

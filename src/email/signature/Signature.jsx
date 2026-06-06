import { useEffect, useState } from "react";
import { FiEdit, FiCopy, FiCheck, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { emailApi } from "../../api/email";

function buildHtml(f) {
  if (!f.name && !f.email && !f.title && !f.company && !f.phone && !f.website && !f.avatarUrl) return "";

  const avatar = f.avatarUrl
    ? `<img src="${f.avatarUrl}" alt="" width="56" height="56" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:inline-block" />`
    : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;display:inline-block;text-align:center;line-height:56px;font-size:22px;font-weight:700">${(f.name?.[0] || "?").toUpperCase()}</div>`;

  return `
    <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif">
      <tr>
        <td style="padding-right:16px;border-right:2px solid #7c3aed">
          ${avatar}
        </td>
        <td style="padding-left:16px;font-size:13px;color:#1f2937">
          <div style="font-weight:700;font-size:15px">${f.name || ""}</div>
          <div style="color:#6b7280">${f.title || ""}${f.title && f.company ? " · " : ""}<strong style="color:#7c3aed">${f.company || ""}</strong></div>
          ${f.email   ? `<div style="margin-top:6px">📧 <a href="mailto:${f.email}" style="color:#7c3aed;text-decoration:none">${f.email}</a></div>` : ""}
          ${f.phone   ? `<div>📱 ${f.phone}</div>` : ""}
          ${f.website ? `<div>🌐 <a href="https://${f.website}" style="color:#7c3aed;text-decoration:none">${f.website}</a></div>` : ""}
        </td>
      </tr>
    </table>
  `.trim();
}

export default function Signature() {
  const [f, setF] = useState({
    name: "", title: "", company: "",
    email: "", phone: "", website: "",
    avatarUrl: "",
    enabled: true,
    html: "",
  });
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.config();
      const sig = res.config?.signature || {};
      setF({
        name:   sig.name    || "",
        title:  sig.title   || "",
        company:sig.company || "",
        email:  sig.email   || "",
        phone:  sig.phone   || "",
        website:sig.website || "",
        avatarUrl: sig.avatarUrl || "",
        enabled: sig.enabled !== false,
        html:    sig.html   || "",
      });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const previewHtml = buildHtml(f);
  const hasSignature = !!previewHtml;

  async function save() {
    setSaving(true); setError("");
    try {
      // Always send the freshly-built HTML so server stays in sync with the form
      const html = previewHtml;
      const enabled = hasSignature ? f.enabled : false;
      await emailApi.saveSignature({
        enabled, html,
        name: f.name, title: f.title, company: f.company,
        email: f.email, phone: f.phone, website: f.website,
        avatarUrl: f.avatarUrl,
      });
      setF((s) => ({ ...s, enabled, html }));
      setSavedAt(new Date());
      setTimeout(() => setSavedAt(null), 2000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function clear() {
    if (!confirm("Remove your saved signature?")) return;
    setSaving(true);
    try {
      await emailApi.saveSignature({
        enabled: false, html: "",
        name: "", title: "", company: "", email: "", phone: "", website: "", avatarUrl: "",
      });
      setF({ name: "", title: "", company: "", email: "", phone: "", website: "", avatarUrl: "", enabled: true, html: "" });
      setSavedAt(new Date());
      setTimeout(() => setSavedAt(null), 2000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleEnabled(next) {
    setF((s) => ({ ...s, enabled: next }));
    try {
      await emailApi.saveSignature({ enabled: next });
    } catch (err) {
      // revert on error
      setF((s) => ({ ...s, enabled: !next }));
      alert(err.message);
    }
  }

  function copy() {
    navigator.clipboard?.writeText(previewHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Email — Signature</h1>
        <p className="page-subtitle">Design a signature that gets appended to every campaign.</p>
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="card">
            <span className="skel skel-line" style={{ width: 180, height: 16, display: "block", marginBottom: 16 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
                <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
              </div>
            ))}
          </div>
          <div className="card">
            <span className="skel skel-line" style={{ width: 120, height: 16, display: "block", marginBottom: 16 }} />
            <span className="skel" style={{ width: "100%", height: 220, borderRadius: 10, display: "block" }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Email — Signature</h1>
      <p className="page-subtitle">
        Build a signature that auto-appends to every campaign email.
        {hasSignature
          ? <span style={{ color: "var(--accent)", marginLeft: 8 }}>✅ Saved</span>
          : <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>· Not set yet</span>}
      </p>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {/* Auto-append toggle */}
      <div className="card" style={{ marginBottom: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <strong style={{ fontSize: 14 }}>Auto-append to outgoing campaigns</strong>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
            {hasSignature
              ? "Every email sent through Leadnator will end with your signature. You can override per-campaign on the send screen."
              : "Set up your signature first — then this toggle activates."}
          </p>
        </div>
        <label style={{ position: "relative", display: "inline-block", width: 48, height: 26, flexShrink: 0, opacity: hasSignature ? 1 : 0.4, cursor: hasSignature ? "pointer" : "not-allowed" }}>
          <input
            type="checkbox"
            disabled={!hasSignature}
            checked={f.enabled && hasSignature}
            onChange={(e) => hasSignature && toggleEnabled(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: "absolute", inset: 0, borderRadius: 26, transition: ".2s",
            background: f.enabled && hasSignature ? "var(--primary)" : "#d1d5db",
          }}>
            <span style={{
              position: "absolute", height: 20, width: 20,
              left: f.enabled && hasSignature ? 25 : 3, top: 3,
              background: "white", borderRadius: "50%", transition: ".2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </span>
        </label>
      </div>

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiEdit /> Edit signature</div></div>

          {/* Avatar / logo upload */}
          <div className="form-group">
            <label>Photo / logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                background: f.avatarUrl ? "white" : "linear-gradient(135deg, #7c3aed, #ec4899)",
                color: "white", fontWeight: 800, fontSize: 24,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", border: "1px solid var(--border)",
              }}>
                {f.avatarUrl
                  ? <img src={f.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (f.name?.[0] || "?").toUpperCase()}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="sig-avatar-upload" className="btn btn-outline" style={{ cursor: "pointer", justifyContent: "center" }}>
                  <FiUpload /> {f.avatarUrl ? "Change photo" : "Upload photo"}
                </label>
                <input
                  id="sig-avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploadError("");
                    if (file.size > 500 * 1024) {
                      setUploadError("Image must be under 500 KB (large images bloat every email and trigger spam filters).");
                      return;
                    }
                    if (!/^image\//.test(file.type)) {
                      setUploadError("Please upload an image file.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setF((s) => ({ ...s, avatarUrl: reader.result }));
                    reader.readAsDataURL(file);
                  }}
                />
                {f.avatarUrl && (
                  <button type="button" onClick={() => setF({ ...f, avatarUrl: "" })}
                    className="btn btn-ghost" style={{ justifyContent: "center", color: "#b91c1c" }}>
                    <FiX /> Remove photo
                  </button>
                )}
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  PNG, JPG, WebP or GIF · max 500 KB · cropped to a circle.
                </div>
                {uploadError && (
                  <div style={{ fontSize: 12, color: "#b91c1c" }}>{uploadError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group"><label>Full name</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Title</label>
              <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Founder" />
            </div>
            <div className="form-group"><label>Company</label>
              <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Leadnator" />
            </div>
          </div>
          <div className="form-group"><label>Email</label>
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="form-group"><label>Phone</label>
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </div>
          <div className="form-group"><label>Website</label>
            <input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} placeholder="leadnator.com" />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            {hasSignature && <button className="btn btn-ghost" onClick={clear} style={{ color: "#b91c1c" }}><FiTrash2 /> Clear</button>}
            <button className="btn btn-outline" onClick={copy} disabled={!hasSignature}>
              <FiCopy /> {copied ? "Copied!" : "Copy HTML"}
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : savedAt ? <><FiCheck /> Saved!</> : "Save signature"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Preview</div></div>
          {hasSignature ? (
            <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, background: "white" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 10 }}>
              Fill the fields on the left to see a live preview.
            </div>
          )}

          <div style={{ marginTop: 14, padding: 12, background: "#f9fafb", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text)" }}>How it works:</strong><br />
            • If a signature is saved + toggle is ON → every campaign email auto-appends it<br />
            • You can <strong>uncheck "Append signature"</strong> on the Create Campaign screen to disable for that send only<br />
            • If no signature is set, the toggle stays disabled
          </div>
        </div>
      </div>
    </>
  );
}

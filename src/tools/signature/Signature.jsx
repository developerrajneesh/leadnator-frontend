import { useState } from "react";
import { FiEdit, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Signature() {
  const [f, setF] = useState({
    name: "Deepak Sharma", title: "Founder", company: "Leadnator",
    email: "deepak@leadnator.app", phone: "+91 95196 90019", website: "leadnator.app",
  });

  const html = `
    <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif">
      <tr>
        <td style="padding-right:16px;border-right:2px solid #7c3aed">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;display:inline-block;text-align:center;line-height:56px;font-size:22px;font-weight:700">${f.name[0] || "?"}</div>
        </td>
        <td style="padding-left:16px;font-size:13px;color:#1f2937">
          <div style="font-weight:700;font-size:15px">${f.name}</div>
          <div style="color:#6b7280">${f.title} · <strong style="color:#7c3aed">${f.company}</strong></div>
          <div style="margin-top:6px">📧 <a href="mailto:${f.email}" style="color:#7c3aed;text-decoration:none">${f.email}</a></div>
          <div>📱 ${f.phone}</div>
          <div>🌐 <a href="https://${f.website}" style="color:#7c3aed;text-decoration:none">${f.website}</a></div>
        </td>
      </tr>
    </table>
  `.trim();

  return (
    <>
      <h1 className="page-title">Email signature</h1>
      <p className="page-subtitle">Build a clean HTML signature for your outbound emails.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiEdit /> Email signature</div></div>
          <div className="form-group"><label>Full name</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Title</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
            <div className="form-group"><label>Company</label><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Email</label><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="form-group"><label>Phone</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="form-group"><label>Website</label><input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={() => copyText(html)}><FiCopy /> Copy HTML</button>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Preview</div></div>
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, background: "white" }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </>
  );
}

import { useMemo, useState } from "react";
import { FiLink, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Utm() {
  const [f, setF] = useState({
    url: "https://leadnator.com", source: "newsletter", medium: "email",
    campaign: "spring_sale", content: "", term: "",
  });
  const built = useMemo(() => {
    try {
      const u = new URL(f.url);
      const params = { utm_source: f.source, utm_medium: f.medium, utm_campaign: f.campaign, utm_content: f.content, utm_term: f.term };
      Object.entries(params).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); });
      return u.toString();
    } catch { return "Invalid URL"; }
  }, [f]);

  return (
    <>
      <h1 className="page-title">UTM builder</h1>
      <p className="page-subtitle">Tag campaign URLs so you can attribute traffic correctly.</p>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><div className="card-title"><FiLink /> UTM builder</div></div>
        <div className="form-group"><label>Website URL *</label><input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></div>
        <div className="grid-2-equal">
          <div className="form-group"><label>Campaign source *</label><input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></div>
          <div className="form-group"><label>Campaign medium *</label><input value={f.medium} onChange={(e) => setF({ ...f, medium: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>Campaign name *</label><input value={f.campaign} onChange={(e) => setF({ ...f, campaign: e.target.value })} /></div>
        <div className="grid-2-equal">
          <div className="form-group"><label>Campaign content</label><input value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /></div>
          <div className="form-group"><label>Campaign term</label><input value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })} /></div>
        </div>
        <div style={{ background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 8, fontFamily: "monospace", fontSize: 13, wordBreak: "break-all" }}>{built}</div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => copyText(built)}><FiCopy /> Copy URL</button>
      </div>
    </>
  );
}

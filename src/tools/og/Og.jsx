import { useState } from "react";
import { FiLayers, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Og() {
  const [f, setF] = useState({
    title: "Leadnator — AI-powered Lead Management",
    description: "Capture, qualify and close leads faster with AI-written emails, ads and WhatsApp broadcasts.",
    url: "leadnator.app",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
  });

  const meta = `<!-- Open Graph -->
<meta property="og:title" content="${f.title}" />
<meta property="og:description" content="${f.description}" />
<meta property="og:url" content="https://${f.url}" />
<meta property="og:image" content="${f.image}" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${f.title}" />
<meta name="twitter:description" content="${f.description}" />
<meta name="twitter:image" content="${f.image}" />`;

  return (
    <>
      <h1 className="page-title">OG tag preview</h1>
      <p className="page-subtitle">Preview how your links look on Facebook, LinkedIn and X.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiLayers /> OG tag preview</div></div>
          <div className="form-group"><label>Title</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={95} /></div>
          <div className="form-group"><label>Description</label><textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={200} /></div>
          <div className="form-group"><label>URL / domain</label><input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></div>
          <div className="form-group"><label>Image URL</label><input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={() => copyText(meta)}><FiCopy /> Copy meta tags</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "#f3f4f6", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Facebook / LinkedIn</div>
            {f.image && <img src={f.image} alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />}
            <div style={{ padding: 12, background: "#f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>{f.url}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 1.4 }}>{f.description}</div>
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 14 }}>
            <div style={{ padding: "10px 14px", background: "#f3f4f6", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>X (Twitter)</div>
            {f.image && <img src={f.image} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />}
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{f.url}</div>
              <div style={{ fontSize: 13, marginTop: 2, lineHeight: 1.3 }}>{f.title}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

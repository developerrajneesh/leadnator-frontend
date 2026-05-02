import { useMemo, useState } from "react";
import { FiTag, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Slug() {
  const [text, setText] = useState("10 Best Email Marketing Strategies for 2026!");
  const [sep, setSep] = useState("-");

  const slug = useMemo(() => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, sep);
  }, [text, sep]);

  return (
    <>
      <h1 className="page-title">Slug generator</h1>
      <p className="page-subtitle">Turn any title into a clean, SEO-friendly URL slug.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title"><FiTag /> Slug generator</div></div>
        <div className="form-group"><label>Title / text</label><input value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div className="form-group">
          <label>Separator</label>
          <select value={sep} onChange={(e) => setSep(e.target.value)}>
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
          </select>
        </div>
        <div style={{ padding: 14, background: "#0f172a", color: "#a78bfa", borderRadius: 8, fontFamily: "monospace", fontSize: 14, wordBreak: "break-all" }}>
          {slug || "your-slug-appears-here"}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => copyText(slug)}><FiCopy /> Copy slug</button>
      </div>
    </>
  );
}

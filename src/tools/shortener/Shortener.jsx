import { useState } from "react";
import { FiZap, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Shortener() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [links, setLinks] = useState([
    { id: 1, long: "https://leadnator.com/pricing?utm_source=twitter", short: "ldn.app/p1", clicks: 482, created: "2 days ago" },
    { id: 2, long: "https://leadnator.com/blog/email-deliverability", short: "ldn.app/deliver", clicks: 124, created: "1 week ago" },
  ]);

  function shorten(e) {
    e.preventDefault();
    if (!url) return;
    const code = alias || Math.random().toString(36).slice(2, 7);
    setLinks([{ id: Date.now(), long: url, short: `ldn.app/${code}`, clicks: 0, created: "just now" }, ...links]);
    setUrl(""); setAlias("");
  }

  return (
    <>
      <h1 className="page-title">Link shortener</h1>
      <p className="page-subtitle">Create short, trackable links for your campaigns.</p>
      <div className="card" style={{ maxWidth: 720, marginBottom: 16 }}>
        <div className="card-header"><div className="card-title"><FiZap /> Link shortener</div></div>
        <form onSubmit={shorten}>
          <div className="form-group"><label>Long URL</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required /></div>
          <div className="form-group"><label>Custom alias (optional)</label><input value={alias} onChange={(e) => setAlias(e.target.value)} /></div>
          <button className="btn btn-primary" type="submit">Shorten URL</button>
        </form>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">Your short links</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Short URL</th><th>Destination</th><th>Clicks</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td><strong style={{ fontFamily: "monospace" }}>{l.short}</strong></td>
                  <td style={{ fontSize: 12, color: "#6b7280", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.long}</td>
                  <td><span className="badge growth">{l.clicks}</span></td>
                  <td style={{ fontSize: 12, color: "#6b7280" }}>{l.created}</td>
                  <td><button className="btn btn-outline" onClick={() => copyText(l.short)}><FiCopy /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { FiLink, FiCopy } from "react-icons/fi";
import { igApi } from "../../api/instagram";

export default function Webhook() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    igApi.webhook().then(setConfig).catch(() => {});
  }, []);

  function copy(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  }

  return (
    <>
      <h1 className="page-title">Instagram — Webhook</h1>
      <p className="page-subtitle">Point Meta webhooks here to receive DMs, comments, and mentions in real time.</p>

      <div className="card">
        <div className="card-title"><FiLink /> Webhook URL</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Add this URL in Meta App Dashboard → Webhooks → Instagram.
        </p>
        {config && (
          <>
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <code style={{ flex: 1, padding: 10, background: "var(--border)", borderRadius: 8, fontSize: 12, wordBreak: "break-all" }}>
                {config.url}
              </code>
              <button type="button" className="btn btn-outline" onClick={() => copy(config.url)}><FiCopy /></button>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Verify token</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={config.verifyToken || ""} style={{ flex: 1 }} />
                <button type="button" className="btn btn-outline" onClick={() => copy(config.verifyToken)}><FiCopy /></button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
              Subscribe to: {config.fields?.join(", ")}
            </p>
          </>
        )}
      </div>
    </>
  );
}

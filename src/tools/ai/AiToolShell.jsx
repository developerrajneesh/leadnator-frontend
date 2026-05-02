import { useState } from "react";
import { FiZap, FiCopy, FiRefreshCw } from "react-icons/fi";
import { aiApi } from "../../api/meta";

// Reusable layout for AI-powered tools.
// Caller provides: title, subtitle, Icon, color, formFields, buildPrompt(formState), systemPrompt.
export default function AiToolShell({
  title, subtitle, Icon = FiZap, color = "#7c3aed",
  initialState, fields,                 // [{ key, label, type, options?, placeholder?, rows? }]
  buildPrompt,                          // (state) => string
  systemPrompt,                         // string
  resultLabel = "Generated copy",
  multipleResults = false,              // split result by \n into separate "result cards"
}) {
  const [form, setForm] = useState(initialState);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function generate() {
    setBusy(true); setError(""); setOutput("");
    try {
      const prompt = buildPrompt(form);
      const res = await aiApi.text({ prompt, system: systemPrompt, temperature: 0.85 });
      setOutput(res.content || "");
    } catch (err) {
      setError(err.message || "AI generation failed.");
    } finally { setBusy(false); }
  }

  function copy(text, key) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  const resultBlocks = multipleResults && output
    ? output.split("\n").map((s) => s.trim()).filter(Boolean)
    : (output ? [output] : []);

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          <Icon />
        </span>
        {title}
      </h1>
      <p className="page-subtitle">{subtitle}</p>

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Brief</div>
          </div>

          {fields.map((f) => (
            <div className="form-group" key={f.key}>
              <label>{f.label}{f.required && " *"}</label>
              {f.type === "textarea" ? (
                <textarea
                  rows={f.rows || 3}
                  value={form[f.key] || ""}
                  onChange={(e) => up(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }}
                />
              ) : f.type === "select" ? (
                <select value={form[f.key] || ""} onChange={(e) => up(f.key, e.target.value)}>
                  {f.options.map((o) =>
                    typeof o === "string"
                      ? <option key={o} value={o}>{o}</option>
                      : <option key={o.value} value={o.value}>{o.label}</option>
                  )}
                </select>
              ) : (
                <input
                  value={form[f.key] || ""}
                  onChange={(e) => up(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
              {f.help && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{f.help}</div>}
            </div>
          ))}

          {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={busy}
            style={{ background: color, borderColor: color, width: "100%", padding: 12 }}
          >
            <FiZap /> {busy ? "Generating with AI…" : "Generate"}
          </button>
        </div>

        <div className="card" style={{ background: "#fafbfc" }}>
          <div className="card-header">
            <div className="card-title">{resultLabel}</div>
            {output && (
              <button className="btn btn-ghost" onClick={generate} disabled={busy}>
                <FiRefreshCw /> Regenerate
              </button>
            )}
          </div>

          {!output && !busy && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <FiZap style={{ fontSize: 32, marginBottom: 10, color: `${color}88` }} />
              <p>Fill the brief and click Generate.</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Powered by Gemini.</p>
            </div>
          )}

          {busy && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ display: "inline-block", width: 32, height: 32, borderRadius: "50%", border: `3px solid ${color}33`, borderTopColor: color, animation: "spin 0.7s linear infinite" }} />
              <p style={{ marginTop: 10 }}>Thinking…</p>
            </div>
          )}

          {resultBlocks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resultBlocks.map((block, i) => (
                <div
                  key={i}
                  style={{
                    background: "white", padding: 14, borderRadius: 10,
                    border: "1px solid var(--border)", fontSize: 13.5, lineHeight: 1.6,
                    whiteSpace: "pre-wrap", position: "relative", color: "var(--text)",
                  }}
                >
                  {block}
                  <button
                    className="btn btn-ghost"
                    onClick={() => copy(block, `r${i}`)}
                    style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 11 }}
                  >
                    <FiCopy /> {copied === `r${i}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </>
  );
}

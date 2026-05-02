import { useMemo, useState } from "react";
import { FiLock, FiRefreshCw, FiCopy } from "react-icons/fi";
import { copyText } from "../utils";

export default function Password() {
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");

  function generate() {
    let chars = "";
    if (opts.upper) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (opts.lower) chars += "abcdefghijkmnopqrstuvwxyz";
    if (opts.numbers) chars += "23456789";
    if (opts.symbols) chars += "!@#$%^&*-_=+?";
    if (!chars) return setPassword("Select at least one option");
    let p = "";
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) p += chars[arr[i] % chars.length];
    setPassword(p);
  }

  const strength = useMemo(() => {
    if (!password || password.includes("Select")) return { label: "—", color: "#9ca3af", pct: 0 };
    let s = 0;
    if (password.length >= 12) s += 30;
    if (/[A-Z]/.test(password)) s += 20;
    if (/[a-z]/.test(password)) s += 20;
    if (/\d/.test(password)) s += 15;
    if (/[^A-Za-z0-9]/.test(password)) s += 15;
    s = Math.min(100, s);
    if (s < 40) return { label: "Weak", color: "#ef4444", pct: s };
    if (s < 70) return { label: "Good", color: "#f59e0b", pct: s };
    if (s < 90) return { label: "Strong", color: "#10b981", pct: s };
    return { label: "Very strong", color: "#059669", pct: s };
  }, [password]);

  return (
    <>
      <h1 className="page-title">Password generator</h1>
      <p className="page-subtitle">Create strong, random passwords with your preferred rules.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title"><FiLock /> Password generator</div></div>
        <div style={{
          padding: 16, background: "#0f172a", color: "#e2e8f0",
          borderRadius: 10, fontFamily: "monospace", fontSize: 18, letterSpacing: 1,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          minHeight: 56, wordBreak: "break-all",
        }}>
          <span>{password || "Click Generate to create a password"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline" onClick={generate}><FiRefreshCw /></button>
            <button className="btn btn-primary" onClick={() => copyText(password)}><FiCopy /></button>
          </div>
        </div>
        <div style={{ margin: "14px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#6b7280", minWidth: 70 }}>Strength:</span>
          <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${strength.pct}%`, background: strength.color, transition: "0.2s" }} />
          </div>
          <strong style={{ color: strength.color, fontSize: 13, minWidth: 90, textAlign: "right" }}>{strength.label}</strong>
        </div>
        <div className="form-group">
          <label>Length: <strong>{len}</strong></label>
          <input type="range" min="6" max="64" value={len} onChange={(e) => setLen(+e.target.value)} style={{ width: "100%" }} />
        </div>
        <div className="grid-2-equal">
          {[
            { k: "upper", label: "Uppercase (A–Z)" },
            { k: "lower", label: "Lowercase (a–z)" },
            { k: "numbers", label: "Numbers (0–9)" },
            { k: "symbols", label: "Symbols (!@#...)" },
          ].map((o) => (
            <label key={o.k} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={opts[o.k]} onChange={() => setOpts({ ...opts, [o.k]: !opts[o.k] })} />
              <span style={{ fontSize: 13 }}>{o.label}</span>
            </label>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={generate}><FiRefreshCw /> Generate password</button>
      </div>
    </>
  );
}

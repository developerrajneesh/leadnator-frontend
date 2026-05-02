import { useEffect, useRef, useState } from "react";
import { FiGrid, FiUpload, FiX, FiDownload } from "react-icons/fi";

const SIZES = [
  { value: 240, label: "Small (240px)" },
  { value: 360, label: "Medium (360px)" },
  { value: 512, label: "Large (512px)" },
  { value: 800, label: "Print (800px)" },
];
const LOGO_RATIOS = [
  { value: 0.18, label: "Small (18%)" },
  { value: 0.24, label: "Medium (24%)" },
  { value: 0.30, label: "Large (30%)" }, // max safe at ecc=H
];
const FONTS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "Georgia, serif",                label: "Georgia" },
  { value: "'Courier New', monospace",      label: "Monospace" },
  { value: "Arial Black, sans-serif",       label: "Heavy" },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

export default function Qr() {
  const [text, setText] = useState("https://leadnator.app");
  const [size, setSize] = useState(360);
  const [color, setColor] = useState("7c3aed");
  const [bgColor, setBgColor] = useState("ffffff");

  const [logoMode, setLogoMode] = useState("text"); // "none" | "text" | "image"
  const [logoText, setLogoText] = useState("Leadnator");
  const [logoImage, setLogoImage] = useState(""); // dataURL
  const [logoRatio, setLogoRatio] = useState(0.24);
  const [logoFont, setLogoFont] = useState("Inter, system-ui, sans-serif");
  const [logoTextColor, setLogoTextColor] = useState("7c3aed");
  const [logoBg, setLogoBg] = useState("ffffff");
  const [rounded, setRounded] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  // Use ecc=H for max redundancy so the center logo doesn't break scanning.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=H&margin=2&color=${color}&bgcolor=${bgColor}&data=${encodeURIComponent(text)}`;

  async function render() {
    if (!text || !canvasRef.current) return;
    setBusy(true); setError("");
    try {
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // 1. Draw QR background
      ctx.fillStyle = `#${bgColor}`;
      ctx.fillRect(0, 0, size, size);

      // 2. Draw QR code
      const qrImg = await loadImage(qrUrl);
      ctx.drawImage(qrImg, 0, 0, size, size);

      // 3. Draw center badge (logo)
      if (logoMode !== "none" && (logoMode === "image" ? logoImage : logoText.trim())) {
        const badgeSize = Math.round(size * logoRatio);
        const x = (size - badgeSize) / 2;
        const y = (size - badgeSize) / 2;
        const radius = rounded ? badgeSize * 0.18 : 0;

        // White rounded box behind logo (so scanner still reads QR around it)
        ctx.fillStyle = `#${logoBg}`;
        roundRect(ctx, x, y, badgeSize, badgeSize, radius);
        ctx.fill();

        // subtle border
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (logoMode === "image" && logoImage) {
          const img = await loadImage(logoImage);
          const pad = badgeSize * 0.12;
          const innerSize = badgeSize - pad * 2;
          // contain-fit
          const ratio = Math.min(innerSize / img.width, innerSize / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          ctx.drawImage(img, x + (badgeSize - w) / 2, y + (badgeSize - h) / 2, w, h);
        } else if (logoMode === "text" && logoText.trim()) {
          // Auto-fit text size to badge width
          ctx.fillStyle = `#${logoTextColor}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fontSize = Math.round(badgeSize * 0.32);
          ctx.font = `700 ${fontSize}px ${logoFont}`;
          // shrink until it fits
          while (ctx.measureText(logoText).width > badgeSize * 0.84 && fontSize > 8) {
            fontSize -= 1;
            ctx.font = `700 ${fontSize}px ${logoFont}`;
          }
          ctx.fillText(logoText, size / 2, size / 2);
        }
      }
    } catch (err) {
      setError(err.message || "QR render failed");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    const t = setTimeout(render, 200);  // debounce
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, size, color, bgColor, logoMode, logoText, logoImage, logoRatio, logoFont, logoTextColor, logoBg, rounded]);

  function download() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function handleLogoUpload(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setLogoImage(reader.result); setLogoMode("image"); };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <h1 className="page-title">QR code generator</h1>
      <p className="page-subtitle">Generate custom QR codes with a center logo or brand text.</p>

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiGrid /> QR code generator</div></div>

          <div className="form-group">
            <label>Content</label>
            <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div className="grid-2-equal">
            <div className="form-group">
              <label>Size</label>
              <select value={size} onChange={(e) => setSize(+e.target.value)}>
                {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>QR color (hex)</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="color" value={`#${color}`} onChange={(e) => setColor(e.target.value.slice(1))} style={{ width: 44, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: 8 }} />
                <input value={color} onChange={(e) => setColor(e.target.value.replace("#", ""))} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* CENTER LOGO SECTION */}
          <div style={{ marginTop: 8, padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "#fafbfc" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.4, marginBottom: 10 }}>
              Center logo
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { v: "none",  l: "None" },
                { v: "text",  l: "Text" },
                { v: "image", l: "Image" },
              ].map((m) => (
                <button key={m.v} type="button" onClick={() => setLogoMode(m.v)}
                  style={{
                    flex: 1, padding: "8px 12px", fontSize: 13, fontWeight: 600,
                    borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${logoMode === m.v ? "var(--primary)" : "var(--border)"}`,
                    background: logoMode === m.v ? "var(--primary-50)" : "white",
                    color: logoMode === m.v ? "var(--primary)" : "var(--text)",
                  }}>{m.l}</button>
              ))}
            </div>

            {logoMode === "text" && (
              <>
                <div className="form-group">
                  <label>Center text</label>
                  <input value={logoText} onChange={(e) => setLogoText(e.target.value)} maxLength="14" placeholder="Leadnator" />
                </div>
                <div className="grid-2-equal">
                  <div className="form-group">
                    <label>Font</label>
                    <select value={logoFont} onChange={(e) => setLogoFont(e.target.value)}>
                      {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Text color</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type="color" value={`#${logoTextColor}`} onChange={(e) => setLogoTextColor(e.target.value.slice(1))} style={{ width: 44, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: 8 }} />
                      <input value={logoTextColor} onChange={(e) => setLogoTextColor(e.target.value.replace("#", ""))} style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {logoMode === "image" && (
              <div className="form-group">
                <label>Center image</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {logoImage && (
                    <img src={logoImage} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)", padding: 4, background: "white" }} />
                  )}
                  <label className="btn btn-outline" style={{ cursor: "pointer", margin: 0 }}>
                    <FiUpload /> {logoImage ? "Change" : "Upload logo"}
                    <input type="file" accept="image/*" hidden onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                  </label>
                  {logoImage && (
                    <button type="button" className="btn btn-ghost" onClick={() => setLogoImage("")} style={{ color: "#b91c1c" }}>
                      <FiX /> Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {logoMode !== "none" && (
              <div className="grid-2-equal">
                <div className="form-group">
                  <label>Logo size</label>
                  <select value={logoRatio} onChange={(e) => setLogoRatio(+e.target.value)}>
                    {LOGO_RATIOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge color</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="color" value={`#${logoBg}`} onChange={(e) => setLogoBg(e.target.value.slice(1))} style={{ width: 44, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: 8 }} />
                    <input value={logoBg} onChange={(e) => setLogoBg(e.target.value.replace("#", ""))} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
            )}

            {logoMode !== "none" && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
                <input type="checkbox" checked={rounded} onChange={(e) => setRounded(e.target.checked)} />
                Rounded badge
              </label>
            )}
          </div>

          {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginTop: 12 }}>{error}</div>}

          <button className="btn btn-primary" onClick={download} disabled={busy} style={{ marginTop: 14 }}>
            <FiDownload /> {busy ? "Rendering…" : "Download PNG"}
          </button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            Uses high error-correction (ECC level H) so your QR still scans even with the center logo.
          </p>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360, padding: 20, background: "#f9fafb" }}>
          {text
            ? <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "white" }} />
            : <div className="empty">Enter content to generate</div>}
        </div>
      </div>
    </>
  );
}

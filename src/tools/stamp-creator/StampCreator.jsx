import { useEffect, useRef, useState } from "react";
import { FiAward, FiDownload } from "react-icons/fi";
import { downloadCanvas } from "../utils";

const SHAPES = [
  { value: "round", label: "Round (classic)" },
  { value: "rect", label: "Rectangle" },
];

const COLORS = [
  { value: "#b91c1c", label: "Red" },
  { value: "#1d4ed8", label: "Blue" },
  { value: "#0f172a", label: "Black" },
  { value: "#7c3aed", label: "Purple" },
];

const SIZES = [
  { px: 280, label: "280px" },
  { px: 360, label: "360px" },
  { px: 480, label: "480px (print)" },
];

function drawArcText(ctx, text, cx, cy, radius, startAngle, endAngle, fontSize) {
  const chars = [...text];
  if (!chars.length) return;
  const angleStep = (endAngle - startAngle) / chars.length;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  chars.forEach((char, i) => {
    const angle = startAngle + angleStep * (i + 0.5);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

export default function StampCreator() {
  const [shape, setShape] = useState("round");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [color, setColor] = useState(COLORS[0].value);
  const [company, setCompany] = useState("LEADNATOR PVT LTD");
  const [tagline, setTagline] = useState("AUTHORIZED SIGNATORY");
  const [centerLine, setCenterLine] = useState("Mumbai, India");
  const [regNo, setRegNo] = useState("CIN: U72900MH2024PTC000000");
  const [transparent, setTransparent] = useState(true);

  const canvasRef = useRef(null);
  const size = SIZES[sizeIdx].px;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = shape === "round" ? size : size * 1.35;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, size / 80);

    if (shape === "round") {
      const cx = w / 2;
      const cy = h / 2;
      const r = size / 2 - ctx.lineWidth * 2;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r - size * 0.08, 0, Math.PI * 2);
      ctx.stroke();

      const top = company.trim().toUpperCase() || "COMPANY NAME";
      drawArcText(ctx, top, cx, cy, r - size * 0.06, Math.PI * 1.15, Math.PI * 1.85, Math.max(10, size / 22));

      ctx.font = `bold ${Math.max(11, size / 24)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mid = tagline.trim() || "AUTHORIZED SIGNATORY";
      ctx.fillText(mid, cx, cy - size * 0.02);

      ctx.font = `${Math.max(9, size / 32)}px Arial, sans-serif`;
      if (centerLine.trim()) ctx.fillText(centerLine.trim(), cx, cy + size * 0.1);
      if (regNo.trim()) ctx.fillText(regNo.trim(), cx, cy + size * 0.2);
    } else {
      const pad = size * 0.08;
      const bw = w - pad * 2;
      const bh = h - pad * 2;
      ctx.strokeRect(pad, pad, bw, bh);
      ctx.strokeRect(pad + 6, pad + 6, bw - 12, bh - 12);

      const innerW = bw - 40;
      let y = pad + 28;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      ctx.font = `bold ${Math.max(14, size / 18)}px Arial, sans-serif`;
      const companyLines = wrapLines(ctx, (company.trim() || "COMPANY NAME").toUpperCase(), innerW);
      companyLines.forEach((line) => {
        ctx.fillText(line, w / 2, y);
        y += Math.max(16, size / 16);
      });

      y += 6;
      ctx.font = `bold ${Math.max(11, size / 26)}px Arial, sans-serif`;
      ctx.fillText((tagline.trim() || "AUTHORIZED SIGNATORY"), w / 2, y);
      y += Math.max(18, size / 14);

      ctx.font = `${Math.max(10, size / 30)}px Arial, sans-serif`;
      if (centerLine.trim()) {
        ctx.fillText(centerLine.trim(), w / 2, y);
        y += Math.max(14, size / 18);
      }
      if (regNo.trim()) ctx.fillText(regNo.trim(), w / 2, y);
    }
  }, [shape, sizeIdx, color, company, tagline, centerLine, regNo, transparent, size]);

  return (
    <>
      <h1 className="page-title">Stamp creator</h1>
      <p className="page-subtitle">
        Design a company rubber-stamp style seal for invoices, letters and official documents.
      </p>

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiAward /> Stamp details</div>
          </div>

          <div className="form-group">
            <label>Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value)}>
              {SHAPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-2-equal">
            <div className="form-group">
              <label>Size</label>
              <select value={sizeIdx} onChange={(e) => setSizeIdx(+e.target.value)}>
                {SIZES.map((s, i) => (
                  <option key={s.label} value={i}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Stamp color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Company / business name</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ACME PVT LTD" />
          </div>
          <div className="form-group">
            <label>Center line (e.g. Authorized signatory)</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={centerLine} onChange={(e) => setCenterLine(e.target.value)} placeholder="Mumbai, India" />
          </div>
          <div className="form-group">
            <label>Registration / CIN / GST (optional)</label>
            <input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="CIN: …" />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16 }}>
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            Transparent background
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, "company-stamp.png")}
          >
            <FiDownload /> Download PNG
          </button>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 360,
            padding: 24,
            background: transparent
              ? "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 0 0 / 16px 16px"
              : "#f9fafb",
          }}
        >
          <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      </div>
    </>
  );
}

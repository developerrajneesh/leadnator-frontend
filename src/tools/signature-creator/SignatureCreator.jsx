import { useCallback, useEffect, useRef, useState } from "react";
import { FiEdit3, FiDownload, FiTrash2, FiType } from "react-icons/fi";
import { downloadCanvas } from "../utils";

const FONTS = [
  { value: "'Segoe Script', 'Brush Script MT', cursive", label: "Script" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
  { value: "'Great Vibes', cursive", label: "Great Vibes" },
  { value: "Georgia, serif", label: "Classic serif" },
  { value: "'Courier New', monospace", label: "Monospace" },
];

const SIZES = [
  { w: 600, h: 200, label: "Wide (600×200)" },
  { w: 400, h: 160, label: "Medium (400×160)" },
  { w: 320, h: 120, label: "Compact (320×120)" },
];

export default function SignatureCreator() {
  const [mode, setMode] = useState("draw");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [strokeColor, setStrokeColor] = useState("#1e293b");
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [typedName, setTypedName] = useState("Deepak Sharma");
  const [font, setFont] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(56);
  const [transparent, setTransparent] = useState(true);

  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const { w, h } = SIZES[sizeIdx];

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = transparent ? "rgba(0,0,0,0)" : "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [w, h, transparent]);

  useEffect(() => {
    setupCanvas();
    if (mode === "type") renderTyped();
  }, [mode, sizeIdx, transparent, setupCanvas]);

  function renderTyped() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas();
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = strokeColor;
    ctx.font = `${fontSize}px ${font}`;
    ctx.textBaseline = "middle";
    const text = typedName.trim() || "Your Name";
    const tw = ctx.measureText(text).width;
    let fs = fontSize;
    while (tw > w - 40 && fs > 20) {
      fs -= 2;
      ctx.font = `${fs}px ${font}`;
    }
    const finalW = ctx.measureText(text).width;
    ctx.fillText(text, (w - finalW) / 2, h / 2);
  }

  useEffect(() => {
    if (mode === "type") renderTyped();
  }, [typedName, font, fontSize, strokeColor, mode]);

  function pointerPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * w,
      y: ((clientY - rect.top) / rect.height) * h,
    };
  }

  function startDraw(e) {
    if (mode !== "draw") return;
    e.preventDefault();
    drawing.current = true;
    last.current = pointerPos(e);
    setHasDrawn(true);
  }

  function moveDraw(e) {
    if (!drawing.current || mode !== "draw") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = pointerPos(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function endDraw() {
    drawing.current = false;
  }

  function clearCanvas() {
    setHasDrawn(false);
    setupCanvas();
    if (mode === "type") renderTyped();
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (mode === "draw" && !hasDrawn) return;
    downloadCanvas(canvas, "signature.png");
  }

  return (
    <>
      <h1 className="page-title">Signature creator</h1>
      <p className="page-subtitle">
        Draw or type a signature, then download a PNG for invoices, contracts and PDFs.
      </p>

      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FiEdit3 /> Settings</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { v: "draw", label: "Draw", Icon: FiEdit3 },
              { v: "type", label: "Type", Icon: FiType },
            ].map(({ v, label, Icon }) => (
              <button
                key={v}
                type="button"
                className={mode === v ? "btn btn-primary" : "btn btn-outline"}
                onClick={() => setMode(v)}
                style={{ flex: 1 }}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Canvas size</label>
            <select value={sizeIdx} onChange={(e) => setSizeIdx(+e.target.value)}>
              {SIZES.map((s, i) => (
                <option key={s.label} value={i}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-2-equal">
            <div className="form-group">
              <label>Ink color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                style={{ width: "100%", height: 40, padding: 2, border: "1px solid var(--border)", borderRadius: 8 }}
              />
            </div>
            {mode === "draw" ? (
              <div className="form-group">
                <label>Stroke width ({strokeWidth}px)</label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(+e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Font size ({fontSize}px)</label>
                <input
                  type="range"
                  min={28}
                  max={80}
                  value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                />
              </div>
            )}
          </div>

          {mode === "type" && (
            <>
              <div className="form-group">
                <label>Your name</label>
                <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Font style</label>
                <select value={font} onChange={(e) => setFont(e.target.value)}>
                  {FONTS.map((f) => (
                    <option key={f.label} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16 }}>
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            Transparent background (for documents)
          </label>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-outline" onClick={clearCanvas}>
              <FiTrash2 /> Clear
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={mode === "draw" && !hasDrawn}
            >
              <FiDownload /> Download PNG
            </button>
          </div>

          {mode === "draw" && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
              Draw with mouse or finger in the preview area on the right.
            </p>
          )}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, padding: 24, background: transparent ? "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 0 0 / 16px 16px" : "#f9fafb" }}>
          <canvas
            ref={canvasRef}
            style={{
              border: "1px dashed var(--border)",
              borderRadius: 8,
              cursor: mode === "draw" ? "crosshair" : "default",
              touchAction: "none",
              background: transparent ? "transparent" : "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
          />
        </div>
      </div>
    </>
  );
}

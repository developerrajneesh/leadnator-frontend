import { useRef, useState } from "react";
import { FiUpload, FiDownload, FiCheckCircle, FiAlertCircle, FiFileText } from "react-icons/fi";
import { api } from "../../api/client";

const SAMPLE_CSV = `name,email,phone,source
Jane Doe,jane@example.com,+919812345678,Website
Rahul Sharma,rahul@example.com,+919876543210,Referral
Priya Patel,priya@example.com,+919900112233,Google Ads
`;

function downloadSample() {
  const blob = new Blob(["﻿" + SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "leadnator-sample-leads.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Parse CSV text → array of row objects keyed by (lowercased) header.
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length < 2) return [];
  const headers = nonEmpty[0].map((h) => h.trim().toLowerCase());
  return nonEmpty.slice(1).map((cells) => {
    const o = {};
    headers.forEach((h, i) => { o[h] = (cells[i] || "").trim(); });
    return o;
  });
}

export default function Import() {
  const fileInput = useRef(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    setError(""); setResult(null);
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) { setError("Please choose a .csv file."); return; }

    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) { setError("No rows found. Make sure the file has a header row (name,email,phone,source)."); return; }
    if (!rows[0].name && !rows[0].email) {
      setError("Couldn't find name/email columns. Download the sample to see the expected format.");
      return;
    }

    setImporting(true);
    try {
      const r = await api.leads.import(rows);
      setResult({ ...r, total: rows.length });
    } catch (err) {
      setError(err.data?.upgrade ? `${err.message}` : (err.message || "Import failed."));
    } finally {
      setImporting(false);
    }
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <>
      <h1 className="page-title">Import CSV</h1>
      <p className="page-subtitle">Bring leads in from a spreadsheet.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div className="card-title"><FiUpload /> Import leads from CSV</div>
          <button type="button" className="btn btn-outline" style={{ fontSize: 13 }} onClick={downloadSample}>
            <FiDownload /> Download sample
          </button>
        </div>
        <p className="page-subtitle">Supported columns: name, email, phone, source. Duplicates and rows beyond your plan are skipped.</p>

        <div
          onClick={() => !importing && fileInput.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary)" : "var(--primary)"}`,
            borderRadius: 12, padding: 40, textAlign: "center",
            background: dragOver ? "#ede9fe" : "var(--primary-50)",
            cursor: importing ? "default" : "pointer", transition: "background 0.15s",
          }}
        >
          <input
            ref={fileInput} type="file" accept=".csv" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleFile(f); }}
          />
          <FiUpload style={{ fontSize: 32, color: "var(--primary)", marginBottom: 10 }} />
          <p>{importing ? "Importing…" : "Drag & drop your CSV here, or"}</p>
          {!importing && (
            <button type="button" className="btn btn-primary" style={{ marginTop: 10 }}
              onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
              Browse file
            </button>
          )}
          <p style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
            Not sure about the format?{" "}
            <button type="button" onClick={(e) => { e.stopPropagation(); downloadSample(); }}
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, padding: 0, textDecoration: "underline" }}>
              Download a sample CSV
            </button>
          </p>
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: 13, display: "flex", gap: 8 }}>
            <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} /> <div>{error}</div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>
              <FiCheckCircle /> Imported {result.imported} of {result.total} lead{result.total === 1 ? "" : "s"}
            </div>
            <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.7 }}>
              {result.skippedDuplicate > 0 && <div>• {result.skippedDuplicate} skipped — already in your leads</div>}
              {result.skippedInvalid > 0 && <div>• {result.skippedInvalid} skipped — missing/invalid name or email</div>}
              {result.skippedLimit > 0 && (
                <div style={{ color: "#92400e" }}>• {result.skippedLimit} skipped — plan limit of {result.planLimit} reached. <a href="/pricing" style={{ color: "var(--primary)", fontWeight: 600 }}>Upgrade</a></div>
              )}
              {result.imported > 0 && <div style={{ marginTop: 6 }}><a href="/leads/all" style={{ color: "var(--primary)", fontWeight: 600 }}><FiFileText style={{ verticalAlign: "middle" }} /> View imported leads</a></div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

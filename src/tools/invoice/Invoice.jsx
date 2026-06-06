import { useMemo, useState } from "react";
import {
  FiFile, FiPlus, FiTrash2, FiDownload, FiPrinter,
  FiRefreshCw, FiCopy, FiUpload, FiX,
} from "react-icons/fi";
import InvoicePreview from "./components/InvoicePreview";
import { buildInvoiceHtml } from "./buildHtml";
import { copyText } from "../utils";

const CURRENCIES = [
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "en-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
];

function newItem() {
  return {
    id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description: "",
    qty: 1,
    rate: 0,
  };
}

function defaultState() {
  const today = new Date();
  const due = new Date(Date.now() + 14 * 86400000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const num = `INV-${today.getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`;

  return {
    currency: "INR",
    number: num,
    issueDate: fmt(today),
    dueDate: fmt(due),
    from: {
      name: "Leadnator Technologies Pvt Ltd",
      address: "5th Floor, Tower B, Sector 63\nNoida, Uttar Pradesh 201301, India",
      email: "billing@leadnator.com",
      phone: "+91 98xxxxxxxx",
      gst: "09ABCDE1234F1Z5",
      logo: "",
    },
    to: {
      name: "Acme Retail Pvt Ltd",
      address: "221-B, Baker Street\nMumbai, Maharashtra 400001",
      email: "accounts@acme.in",
      phone: "",
      gst: "",
    },
    items: [
      { id: "it_1", description: "Growth plan subscription (1 month)", qty: 1, rate: 499 },
      { id: "it_2", description: "Meta Ads managed service",           qty: 1, rate: 4500 },
    ],
    discount: 0,
    taxRate: 18,
    notes: "Thank you for your business!",
    terms: "Payment due within 14 days. Late payments attract 2% monthly interest.",
  };
}

export default function Invoice() {
  const [inv, setInv] = useState(defaultState);
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((c) => c.code === inv.currency) || CURRENCIES[0];

  const totals = useMemo(() => {
    const subtotal = inv.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
    const discountAmount = subtotal * ((Number(inv.discount) || 0) / 100);
    const taxable = subtotal - discountAmount;
    const taxAmount = taxable * ((Number(inv.taxRate) || 0) / 100);
    const total = taxable + taxAmount;
    return { subtotal, discountAmount, taxable, taxAmount, total };
  }, [inv.items, inv.discount, inv.taxRate]);

  function update(patch) {
    setInv((s) => ({ ...s, ...patch }));
  }
  function updateFrom(patch) {
    setInv((s) => ({ ...s, from: { ...s.from, ...patch } }));
  }
  function updateTo(patch) {
    setInv((s) => ({ ...s, to: { ...s.to, ...patch } }));
  }
  function updateItem(id, patch) {
    setInv((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }
  function addItem() {
    setInv((s) => ({ ...s, items: [...s.items, newItem()] }));
  }
  function removeItem(id) {
    setInv((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
  }
  function reset() {
    if (confirm("Reset invoice to default values?")) setInv(defaultState());
  }

  function downloadPdf() {
    const html = buildInvoiceHtml(inv, totals, currency);
    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) {
      alert("Please allow pop-ups to generate the PDF.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  }

  function printInvoice() {
    downloadPdf();
  }

  function copyHtml() {
    copyText(buildInvoiceHtml(inv, totals, currency));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <h1 className="page-title">Invoice generator</h1>
      <p className="page-subtitle">Create professional invoices and download them as PDF.</p>

      <div className="toolbar" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={reset}><FiRefreshCw /> Reset</button>
        <button className="btn btn-outline" onClick={copyHtml}><FiCopy /> {copied ? "Copied!" : "Copy HTML"}</button>
        <button className="btn btn-outline" onClick={printInvoice}><FiPrinter /> Print</button>
        <button className="btn btn-primary" onClick={downloadPdf}><FiDownload /> Download PDF</button>
      </div>

      <div className="grid-2-equal">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><FiFile style={{ marginRight: 6, verticalAlign: "middle" }} />Invoice details</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Invoice number</label>
                <input value={inv.number} onChange={(e) => update({ number: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={inv.currency}
                  onChange={(e) => update({ currency: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Issue date</label>
                <input type="date" value={inv.issueDate} onChange={(e) => update({ issueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Due date</label>
                <input type="date" value={inv.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">From (your business)</div>
            </div>
            <div className="form-group">
              <label>Logo</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12,
                  background: inv.from.logo ? "white" : "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                  border: "1px solid var(--border)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                  color: "white", fontWeight: 800, fontSize: 24,
                }}>
                  {inv.from.logo
                    ? <img src={inv.from.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : (inv.from.name?.trim()?.[0]?.toUpperCase() || "L")}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    htmlFor="invoice-logo-upload"
                    className="btn btn-outline"
                    style={{ cursor: "pointer", justifyContent: "center" }}
                  >
                    <FiUpload /> {inv.from.logo ? "Change logo" : "Upload logo"}
                  </label>
                  <input
                    id="invoice-logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Please upload an image under 2 MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => updateFrom({ logo: reader.result });
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                  {inv.from.logo && (
                    <button
                      type="button"
                      onClick={() => updateFrom({ logo: "" })}
                      className="btn btn-ghost"
                      style={{ justifyContent: "center", color: "#b91c1c" }}
                    >
                      <FiX /> Remove logo
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    PNG, JPG, SVG or WebP · max 2 MB. Recommended: square, transparent background.
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group"><label>Business name</label><input value={inv.from.name} onChange={(e) => updateFrom({ name: e.target.value })} /></div>
            <div className="form-group">
              <label>Address</label>
              <textarea rows="2" value={inv.from.address} onChange={(e) => updateFrom({ address: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group"><label>Email</label><input value={inv.from.email} onChange={(e) => updateFrom({ email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input value={inv.from.phone} onChange={(e) => updateFrom({ phone: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>GSTIN / Tax ID</label><input value={inv.from.gst} onChange={(e) => updateFrom({ gst: e.target.value })} /></div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Bill to</div>
            </div>
            <div className="form-group"><label>Client name</label><input value={inv.to.name} onChange={(e) => updateTo({ name: e.target.value })} /></div>
            <div className="form-group">
              <label>Address</label>
              <textarea rows="2" value={inv.to.address} onChange={(e) => updateTo({ address: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group"><label>Email</label><input value={inv.to.email} onChange={(e) => updateTo({ email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input value={inv.to.phone} onChange={(e) => updateTo({ phone: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Client GSTIN (optional)</label><input value={inv.to.gst} onChange={(e) => updateTo({ gst: e.target.value })} /></div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Line items</div>
              <button className="btn btn-secondary" onClick={addItem}><FiPlus /> Add item</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 34px", gap: 8, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, padding: "0 4px" }}>
                <span>Description</span>
                <span style={{ textAlign: "right" }}>Qty</span>
                <span style={{ textAlign: "right" }}>Rate</span>
                <span style={{ textAlign: "right" }}>Amount</span>
                <span></span>
              </div>
              {inv.items.map((it) => {
                const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                return (
                  <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 34px", gap: 8, alignItems: "center" }}>
                    <input
                      value={it.description}
                      placeholder="Item description"
                      onChange={(e) => updateItem(it.id, { description: e.target.value })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}
                    />
                    <input
                      type="number" min="0" step="1"
                      value={it.qty}
                      onChange={(e) => updateItem(it.id, { qty: e.target.value })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8, textAlign: "right" }}
                    />
                    <input
                      type="number" min="0" step="0.01"
                      value={it.rate}
                      onChange={(e) => updateItem(it.id, { rate: e.target.value })}
                      style={{ padding: 9, border: "1px solid var(--border)", borderRadius: 8, textAlign: "right" }}
                    />
                    <div style={{ textAlign: "right", fontWeight: 700, padding: "0 4px" }}>
                      {currency.symbol}{amount.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      disabled={inv.items.length === 1}
                      title="Remove item"
                      style={{
                        background: "white", border: "1px solid var(--border)",
                        borderRadius: 8, cursor: inv.items.length === 1 ? "not-allowed" : "pointer",
                        opacity: inv.items.length === 1 ? 0.4 : 1, color: "#b91c1c", padding: 8,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                      }}
                    ><FiTrash2 /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Totals & notes</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Discount (%)</label>
                <input type="number" min="0" max="100" value={inv.discount} onChange={(e) => update({ discount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tax / GST (%)</label>
                <input type="number" min="0" max="100" value={inv.taxRate} onChange={(e) => update({ taxRate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows="2" value={inv.notes} onChange={(e) => update({ notes: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div className="form-group">
              <label>Terms</label>
              <textarea rows="2" value={inv.terms} onChange={(e) => update({ terms: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 16, alignSelf: "start" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="card-header" style={{ padding: "14px 18px" }}>
              <div className="card-title">Live preview</div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Total: <strong style={{ color: "var(--primary)" }}>{currency.symbol}{totals.total.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}</strong>
              </span>
            </div>
            <div style={{ background: "#f3f4f6", padding: 18, maxHeight: "calc(100vh - 140px)", overflow: "auto" }}>
              <InvoicePreview inv={inv} totals={totals} currency={currency} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

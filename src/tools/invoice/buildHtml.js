function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function buildInvoiceHtml(inv, totals, currency) {
  const money = (n) =>
    `${currency.symbol}${Number(n || 0).toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const rows = inv.items
    .map((it) => {
      const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
      return `
        <tr>
          <td>${esc(it.description) || "&mdash;"}</td>
          <td class="num">${esc(it.qty)}</td>
          <td class="num">${money(it.rate)}</td>
          <td class="num bold">${money(amount)}</td>
        </tr>`;
    })
    .join("");

  const discountRow = Number(inv.discount) > 0
    ? `<tr><td>Discount (${esc(inv.discount)}%)</td><td class="neg">- ${money(totals.discountAmount)}</td></tr>`
    : "";
  const taxRow = Number(inv.taxRate) > 0
    ? `<tr><td>Tax (${esc(inv.taxRate)}%)</td><td>${money(totals.taxAmount)}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${esc(inv.number)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #111827;
    margin: 0;
    padding: 40px;
    background: white;
    font-size: 13px;
    line-height: 1.5;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .logo {
    width: 44px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
    color: white; display: inline-flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 20px; margin-bottom: 12px;
  }
  .logo-img {
    max-width: 140px; max-height: 64px; object-fit: contain;
    display: block; margin-bottom: 12px;
  }
  .biz-name { font-size: 15px; font-weight: 700; }
  .muted { color: #6b7280; font-size: 12px; }
  .xmuted { color: #9ca3af; font-size: 11px; }
  .pre { white-space: pre-line; }
  .right { text-align: right; }
  .title {
    font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: #7c3aed;
  }
  .meta {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
    margin-bottom: 28px; padding: 16px 0;
    border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;
  }
  .label {
    font-size: 10px; color: #9ca3af; text-transform: uppercase;
    font-weight: 600; letter-spacing: 0.05em; margin-bottom: 6px;
  }
  .due { color: #b45309; font-weight: 600; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  table.items thead tr { background: #faf5ff; }
  table.items th {
    text-align: left; padding: 10px 12px; font-size: 11px;
    text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.04em;
  }
  table.items th.num { text-align: right; }
  table.items td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
  table.items td.num { text-align: right; }
  table.items td.bold { font-weight: 600; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
  .totals table { width: 280px; border-collapse: collapse; }
  .totals td { padding: 6px 0; font-size: 13px; }
  .totals td:first-child { color: #6b7280; }
  .totals td:last-child { text-align: right; font-weight: 600; }
  .totals .neg { color: #b91c1c; }
  .grand {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0 0; margin-top: 8px; border-top: 2px solid #111827;
  }
  .grand .g-label { font-size: 13px; font-weight: 700; }
  .grand .g-val { font-size: 20px; font-weight: 800; color: #7c3aed; }
  .foot {
    border-top: 1px solid #e5e7eb; padding-top: 18px;
    font-size: 12px; color: #4b5563;
  }
  .foot .section { margin-bottom: 12px; }
  .foot-brand {
    text-align: center; color: #9ca3af; font-size: 11px;
    margin-top: 28px; padding-top: 16px; border-top: 1px solid #f3f4f6;
  }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div>
      ${inv.from.logo
        ? `<img src="${esc(inv.from.logo)}" alt="Logo" class="logo-img" />`
        : `<div class="logo">${esc((inv.from.name || "L").trim()[0].toUpperCase())}</div>`}
      <div class="biz-name">${esc(inv.from.name) || "Your business"}</div>
      <div class="muted pre">${esc(inv.from.address)}</div>
      <div class="muted" style="margin-top:4px">${esc(inv.from.email)}${inv.from.phone ? ` · ${esc(inv.from.phone)}` : ""}</div>
      ${inv.from.gst ? `<div class="xmuted" style="margin-top:2px">GSTIN: ${esc(inv.from.gst)}</div>` : ""}
    </div>
    <div class="right">
      <div class="title">INVOICE</div>
      <div class="muted" style="margin-top:4px">#${esc(inv.number)}</div>
    </div>
  </div>

  <div class="meta">
    <div>
      <div class="label">Bill to</div>
      <div style="font-weight:700">${esc(inv.to.name) || "Client"}</div>
      <div class="muted pre" style="margin-top:2px">${esc(inv.to.address)}</div>
      ${inv.to.email ? `<div class="muted" style="margin-top:2px">${esc(inv.to.email)}</div>` : ""}
      ${inv.to.gst ? `<div class="xmuted" style="margin-top:2px">GSTIN: ${esc(inv.to.gst)}</div>` : ""}
    </div>
    <div>
      <div class="label">Issue date</div>
      <div style="font-weight:600">${fmtDate(inv.issueDate)}</div>
    </div>
    <div>
      <div class="label">Due date</div>
      <div class="due">${fmtDate(inv.dueDate)}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="num" style="width:60px">Qty</th>
        <th class="num" style="width:110px">Rate</th>
        <th class="num" style="width:120px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div>
      <table>
        <tbody>
          <tr><td>Subtotal</td><td>${money(totals.subtotal)}</td></tr>
          ${discountRow}
          ${taxRow}
        </tbody>
      </table>
      <div class="grand">
        <span class="g-label">Total</span>
        <span class="g-val">${money(totals.total)}</span>
      </div>
    </div>
  </div>

  ${(inv.notes || inv.terms) ? `<div class="foot">
    ${inv.notes ? `<div class="section"><div class="label">Notes</div><div class="pre">${esc(inv.notes)}</div></div>` : ""}
    ${inv.terms ? `<div class="section"><div class="label">Terms</div><div class="pre">${esc(inv.terms)}</div></div>` : ""}
  </div>` : ""}

  <div class="foot-brand">Generated with Leadnator · leadnator.app</div>
</div>
</body>
</html>`;
}

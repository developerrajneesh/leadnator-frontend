function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function InvoicePreview({ inv, totals, currency }) {
  const money = (n) => `${currency.symbol}${Number(n || 0).toLocaleString(currency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{
      background: "white",
      padding: "40px 44px",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      maxWidth: 760,
      margin: "0 auto",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#111827",
      fontSize: 13,
      lineHeight: 1.5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          {inv.from.logo ? (
            <img
              src={inv.from.logo}
              alt="Logo"
              style={{ maxWidth: 140, maxHeight: 64, objectFit: "contain", display: "block", marginBottom: 12 }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
              color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 20, marginBottom: 12,
            }}>{inv.from.name?.trim()?.[0]?.toUpperCase() || "L"}</div>
          )}
          <div style={{ fontSize: 15, fontWeight: 700 }}>{inv.from.name || "Your business"}</div>
          <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "pre-line", marginTop: 2 }}>
            {inv.from.address}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {inv.from.email}{inv.from.phone ? ` · ${inv.from.phone}` : ""}
          </div>
          {inv.from.gst && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>GSTIN: {inv.from.gst}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#7c3aed" }}>INVOICE</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>#{inv.number}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28, padding: "16px 0", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>Bill to</div>
          <div style={{ fontWeight: 700 }}>{inv.to.name || "Client"}</div>
          <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "pre-line", marginTop: 2 }}>
            {inv.to.address}
          </div>
          {inv.to.email && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{inv.to.email}</div>}
          {inv.to.gst && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>GSTIN: {inv.to.gst}</div>}
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>Issue date</div>
          <div style={{ fontWeight: 600 }}>{fmtDate(inv.issueDate)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>Due date</div>
          <div style={{ fontWeight: 600, color: "#b45309" }}>{fmtDate(inv.dueDate)}</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#faf5ff" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em" }}>Description</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em", width: 60 }}>Qty</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em", width: 110 }}>Rate</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em", width: 120 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it) => {
            const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
            return (
              <tr key={it.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px" }}>{it.description || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>{it.qty}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>{money(it.rate)}</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>{money(amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
        <div style={{ width: 280 }}>
          <Row label="Subtotal" value={money(totals.subtotal)} />
          {Number(inv.discount) > 0 && (
            <Row label={`Discount (${inv.discount}%)`} value={`- ${money(totals.discountAmount)}`} color="#b91c1c" />
          )}
          {Number(inv.taxRate) > 0 && (
            <Row label={`Tax (${inv.taxRate}%)`} value={money(totals.taxAmount)} />
          )}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 0 0", marginTop: 8, borderTop: "2px solid #111827",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#7c3aed" }}>{money(totals.total)}</span>
          </div>
        </div>
      </div>

      {(inv.notes || inv.terms) && (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 18, fontSize: 12, color: "#4b5563" }}>
          {inv.notes && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>Notes</div>
              <div style={{ whiteSpace: "pre-line" }}>{inv.notes}</div>
            </div>
          )}
          {inv.terms && (
            <div>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>Terms</div>
              <div style={{ whiteSpace: "pre-line" }}>{inv.terms}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 11, marginTop: 28, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
        Generated with Leadnator · leadnator.app
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || "#111827" }}>{value}</span>
    </div>
  );
}

import { useMemo, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

export default function Validator() {
  const [input, setInput] = useState("deepak@worksdelight.com\ninvalid-email\nanita@acme.in\ntyp0@gnail.com");

  const results = useMemo(() => {
    return input.split("\n").map((line) => {
      const email = line.trim();
      if (!email) return null;
      const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const domain = email.split("@")[1] || "";
      const typo = ["gnail.com", "gmial.com", "yaho.com", "hotnail.com"].includes(domain);
      const disposable = ["mailinator.com", "tempmail.com", "10minutemail.com"].includes(domain);
      let status = "valid"; let reason = "Looks good";
      if (!basic) { status = "invalid"; reason = "Not a valid format"; }
      else if (typo) { status = "invalid"; reason = `Typo in domain "${domain}"`; }
      else if (disposable) { status = "risky"; reason = "Disposable email domain"; }
      return { email, status, reason };
    }).filter(Boolean);
  }, [input]);

  const counts = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});

  return (
    <>
      <h1 className="page-title">Email validator</h1>
      <p className="page-subtitle">Check emails for typos, disposable domains, and bad syntax.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiCheckCircle /> Email validator</div></div>
          <div className="form-group">
            <label>One email per line</label>
            <textarea rows="10" value={input} onChange={(e) => setInput(e.target.value)} style={{ fontFamily: "monospace" }} />
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <span className="badge qualified">✓ Valid: {counts.valid || 0}</span>
            <span className="badge contacted">⚠ Risky: {counts.risky || 0}</span>
            <span className="badge hot">✗ Invalid: {counts.invalid || 0}</span>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">Results</div>
          <div className="table-wrap" style={{ maxHeight: 460, overflowY: "auto" }}>
            <table>
              <thead><tr><th>Email</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.email}</td>
                    <td>
                      <span className={`badge ${r.status === "valid" ? "qualified" : r.status === "risky" ? "contacted" : "hot"}`}>
                        {r.status === "valid" ? <FiCheckCircle style={{ marginRight: 4, verticalAlign: "middle" }} /> :
                         r.status === "risky" ? <FiAlertCircle style={{ marginRight: 4, verticalAlign: "middle" }} /> :
                         <FiX style={{ marginRight: 4, verticalAlign: "middle" }} />}
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

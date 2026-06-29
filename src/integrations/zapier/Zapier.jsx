const ZAPS = [
  { name: "When a lead is created → Create row in Google Sheets",    runs: 420, service: "Zapier" },
  { name: "When a campaign is sent → Post to Slack",                 runs: 38,  service: "Zapier" },
  { name: "When a lead is qualified → Add to HubSpot list",          runs: 124, service: "Make"   },
];

export default function Zapier() {
  return (
    <>
      <h1 className="page-title">Zapier & Make</h1>
      <p className="page-subtitle">No-code automations powered by third-party platforms.</p>
      <div className="grid-2-equal" style={{ marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: "#ff4a00", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, marginBottom: 14 }}>Z</div>
          <h3>Zapier</h3>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 16px" }}>Connect Leadnator to 6,000+ apps without code.</p>
          <a className="btn btn-primary" href="https://zapier.com/apps" target="_blank" rel="noreferrer">Open Zapier</a>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: "#6366f1", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, marginBottom: 14 }}>M</div>
          <h3>Make (Integromat)</h3>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 16px" }}>Visual automation platform for complex workflows.</p>
          <a className="btn btn-primary" href="https://www.make.com/en/integrations" target="_blank" rel="noreferrer">Open Make</a>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">Active zaps</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Workflow</th><th>Platform</th><th>Runs (30d)</th></tr></thead>
            <tbody>
              {ZAPS.map((z) => (
                <tr key={z.name}>
                  <td><strong>{z.name}</strong></td>
                  <td><span className="badge growth">{z.service}</span></td>
                  <td>{z.runs.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import { FiTool, FiZap } from "react-icons/fi";

export default function Custom() {
  const sdks = [
    { name: "Node.js",   install: "npm install @leadnator/sdk" },
    { name: "Python",    install: "pip install leadnator" },
    { name: "PHP",       install: "composer require leadnator/sdk" },
    { name: "Ruby",      install: "gem install leadnator" },
  ];
  return (
    <>
      <h1 className="page-title">Custom integrations</h1>
      <p className="page-subtitle">Build your own with our REST API and SDKs.</p>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiTool /> Build your own</div></div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            Use our REST API to build a fully custom integration. Authentication is via API keys (Profile → API keys).
          </p>
          <div style={{ background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 8, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>
            {`curl https://api.leadnator.com/v1/leads \\
  -H "Authorization: Bearer $LEADNATOR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Aarav","email":"a@x.com"}'`}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary">Read API docs</button>
            <button className="btn btn-outline">Download OpenAPI spec</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><FiZap /> SDKs</div></div>
          {sdks.map((s) => (
            <div key={s.name} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <strong style={{ fontSize: 13 }}>{s.name}</strong>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.install}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { FiDownload, FiUsers, FiMail, FiCheckCircle } from "react-icons/fi";
import { api } from "../../api/client";

const KINDS = [
  { value: "leads",     label: "All leads",       Icon: FiUsers, color: "purple",
    desc: "Contacts, status, value, source and tags for every lead." },
  { value: "campaigns", label: "Email campaigns", Icon: FiMail,  color: "pink",
    desc: "Campaign name, status, sent / opens / clicks totals." },
];

export default function Exports() {
  const [kind, setKind] = useState("leads");
  const [overview, setOverview] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [lastDownload, setLastDownload] = useState(null);

  useEffect(() => {
    api.dashboard.overview().then(setOverview).catch(() => {});
  }, []);

  const rowCount =
    kind === "leads"     ? overview?.leads?.total   :
    kind === "campaigns" ? overview?.email?.campaigns :
    0;

  const download = () => {
    if (!kind) return;
    setDownloading(true);
    window.location.href = api.dashboard.exportUrl(kind);
    setLastDownload({ kind, at: new Date() });
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <>
      <h1 className="page-title">Exports</h1>
      <p className="page-subtitle">Download a fresh CSV snapshot of your workspace data.</p>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Download CSV</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {rowCount != null ? `${rowCount.toLocaleString()} rows available` : "Loading…"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 10 }}>
          {KINDS.map((k) => {
            const active = kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: 14, borderRadius: 12, textAlign: "left", cursor: "pointer",
                  background: active ? "var(--primary-50, #faf5ff)" : "#fff",
                  border: active ? "2px solid var(--primary, #7c3aed)" : "1px solid var(--border)",
                }}
              >
                <div
                  className={`stat-icon ${k.color}`}
                  style={{
                    width: 40, height: 40, margin: 0, flexShrink: 0, borderRadius: 10,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <k.Icon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{k.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{k.desc}</div>
                </div>
                {active && <FiCheckCircle style={{ color: "var(--primary, #7c3aed)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <button
            className="btn btn-primary"
            onClick={download}
            disabled={downloading || (rowCount === 0)}
          >
            <FiDownload /> {downloading ? "Preparing…" : "Download CSV"}
          </button>
          {rowCount === 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              No rows to export yet for this type.
            </span>
          )}
          {lastDownload && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Last download: {lastDownload.kind} · {lastDownload.at.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><div className="card-title">Scheduled exports</div></div>
        <p className="page-subtitle" style={{ marginTop: 0 }}>
          Automated weekly delivery to your inbox is coming soon. For now, use the one-click download above —
          the CSV reflects your workspace at the moment you click.
        </p>
      </div>
    </>
  );
}

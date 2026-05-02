import { useEffect, useState } from "react";
import { FiDownload, FiUsers, FiMail, FiFilter, FiTarget } from "react-icons/fi";
import { api } from "../../api/client";

export default function Reports() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard.overview()
      .then(setOverview)
      .catch((e) => setError(e.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading reports…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!overview) return null;

  const { leads, email } = overview;
  const sourceRows = (leads.sourceBreakdown || []).length;
  const funnelRows = Object.keys(leads.byStatus || {}).length;

  const reports = [
    {
      kind: "leads",
      Icon: FiUsers,
      color: "purple",
      name: "All leads",
      desc: "Every lead in your workspace with contact details, status, value and tags.",
      rows: leads.total || 0,
      disabled: (leads.total || 0) === 0,
    },
    {
      kind: "campaigns",
      Icon: FiMail,
      color: "pink",
      name: "Email campaigns",
      desc: "Campaign name, status, sent / opens / clicks totals.",
      rows: email.campaigns || 0,
      disabled: (email.campaigns || 0) === 0,
    },
    {
      kind: null,
      Icon: FiFilter,
      color: "orange",
      name: "Source attribution",
      desc: "Lead counts grouped by acquisition source.",
      rows: sourceRows,
      disabled: true,
      note: "Included in the All leads export.",
    },
    {
      kind: null,
      Icon: FiTarget,
      color: "green",
      name: "Conversion funnel",
      desc: "Stage counts: New → Contacted → Hot → Qualified.",
      rows: funnelRows,
      disabled: true,
      note: "Included in the All leads export.",
    },
  ];

  const onDownload = (kind) => {
    if (!kind) return;
    window.location.href = api.dashboard.exportUrl(kind);
  };

  return (
    <>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">On-demand CSV exports from your live workspace data.</p>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          Available reports
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report</th>
                <th>Rows</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={`stat-icon ${r.color}`} style={{ width: 36, height: 36, margin: 0, flexShrink: 0 }}>
                        <r.Icon />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {r.desc}
                          {r.note && <span style={{ marginLeft: 6, fontStyle: "italic" }}>— {r.note}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{r.rows.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-outline"
                      disabled={r.disabled}
                      onClick={() => onDownload(r.kind)}
                      title={r.disabled ? (r.note || "No rows to export yet") : "Download CSV"}
                    >
                      <FiDownload /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

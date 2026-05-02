/* Shared skeleton for Meta CampaignDetail / AdsetDetail / AdDetail pages.
   All three share the same visual rhythm — header with back button and
   title, 4 stat cards, a details card with field rows, a children card
   below. Matches that layout so transitions are jump-free. */

export default function MetaDetailSkeleton({ label = "item" }) {
  return (
    <>
      {/* Breadcrumb + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span className="skel skel-square" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
          <span className="skel skel-line" style={{ width: 280, height: 18, display: "block" }} />
        </div>
        <span className="skel" style={{ width: 110, height: 36, borderRadius: 8 }} />
      </div>

      {/* 4 stat cards */}
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
            <span className="skel skel-line" style={{ width: 90, height: 22, display: "block", marginBottom: 6 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 130, display: "block" }} />
          </div>
        ))}
      </div>

      {/* Details card */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">
            <span className="skel skel-line" style={{ width: 150, height: 16 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <span className="skel skel-line skel-line-sm" style={{ width: 90, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line" style={{ width: 140, display: "block" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Children table — ads inside adset, adsets inside campaign */}
      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span className="skel skel-line" style={{ width: 140, height: 16 }} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Status</th><th>Budget</th><th>Spend</th><th>Results</th><th></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="skel-row">
                  <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                  <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                  <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                  <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                  <td><span className="skel skel-line skel-line-sm" style={{ width: 50 }} /></td>
                  <td><span className="skel skel-square" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

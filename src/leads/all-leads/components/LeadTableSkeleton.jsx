/* Skeleton placeholder that mirrors LeadTable's column layout so the
   switch from loading → loaded doesn't cause a layout jump. Uses the
   global `.skel*` shimmer classes from App.css. */

export default function LeadTableSkeleton({ rows = 8 }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Contact</th><th>Source</th><th>Status</th><th>Tags</th>
              <th>Created</th><th>Value</th><th style={{ width: 140, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="skel-row">
                <td>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span className="skel skel-circle" />
                    <span className="skel skel-line" style={{ width: 120 }} />
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="skel skel-line" style={{ width: 170 }} />
                    <span className="skel skel-line skel-line-sm" style={{ width: 110 }} />
                  </div>
                </td>
                <td><span className="skel skel-line" style={{ width: 80 }} /></td>
                <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                <td>
                  <div style={{ display: "inline-flex", gap: 4 }}>
                    <span className="skel skel-pill" style={{ width: 40 }} />
                    <span className="skel skel-pill" style={{ width: 55 }} />
                  </div>
                </td>
                <td><span className="skel skel-line" style={{ width: 70 }} /></td>
                <td><span className="skel skel-line" style={{ width: 60 }} /></td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <span className="skel skel-square" />
                    <span className="skel skel-square" />
                    <span className="skel skel-square" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

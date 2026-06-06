import { DEFAULT_PIPELINE_STAGES } from "../../constants";

const CARDS_PER_STAGE = [4, 3, 2, 3, 2];

export default function KanbanSkeleton({ count = 5 }) {
  const cols = DEFAULT_PIPELINE_STAGES.slice(0, count);
  const extra = count > cols.length
    ? Array.from({ length: count - cols.length }, (_, i) => ({
        key: `skel-${i}`, label: "", color: "#e5e7eb",
      }))
    : [];
  const stages = [...cols, ...extra].slice(0, count);

  return (
    <div className="kanban">
      {stages.map((stage, i) => (
        <div key={stage.key} className="kanban-col">
          <div className="kanban-col-head" style={{ borderTopColor: stage.color }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="skel skel-line" style={{ width: 70, height: 10 }} />
              <span className="skel skel-pill" style={{ width: 22, height: 14 }} />
            </div>
            <span className="skel skel-line skel-line-sm" style={{ width: 60, marginTop: 6 }} />
          </div>
          <div className="kanban-col-body">
            {Array.from({ length: CARDS_PER_STAGE[i % CARDS_PER_STAGE.length] }).map((_, j) => (
              <div key={j} className="kanban-card" style={{ cursor: "default", pointerEvents: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="skel skel-circle" />
                  <span className="skel skel-line" style={{ width: 110 }} />
                </div>
                <span className="skel skel-line skel-line-sm" style={{ width: "80%", display: "block", marginBottom: 6 }} />
                <span className="skel skel-line skel-line-sm" style={{ width: "55%", display: "block", marginBottom: 12 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="skel skel-pill" style={{ width: 50 }} />
                  <span className="skel skel-line" style={{ width: 60, height: 11 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

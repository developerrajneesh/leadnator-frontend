import { PIPELINE_STAGES } from "../../constants";

/* Matches the real Pipeline Kanban layout so the transition from loading
   to loaded doesn't cause column-width flicker. Uses the global `.skel*`
   shimmer toolkit from App.css. */

// Pseudo-random card counts per stage so it looks believable.
const CARDS_PER_STAGE = [4, 3, 2, 3, 2];

export default function KanbanSkeleton() {
  return (
    <div className="kanban">
      {PIPELINE_STAGES.map((stage, i) => (
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

import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import { PIPELINE_STAGES } from "../constants";
import KanbanCard from "./components/KanbanCard";
import KanbanSkeleton from "./components/KanbanSkeleton";
import AddLeadModal from "../all-leads/components/AddLeadModal";
import { notify } from "../../globalComponents/Toast/Toast";

export default function Pipeline() {
  const { leads: apiLeads, loading, updateLead, addLead } = useLeads();
  const [leads, setLeads] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [addStage, setAddStage] = useState(null); // "new" | "contacted" | ... or "" to just open

  async function handleAdd(lead) {
    try {
      await addLead(lead);
      notify.success(`Lead "${lead.name}" added to ${lead.status}`);
      setAddStage(null);
    } catch (err) {
      notify.error(err.message || "Failed to add lead.");
    }
  }

  useEffect(() => { setLeads(apiLeads); }, [apiLeads]);

  // Click-and-drag horizontal pan — scrolls the parent `.content` element so
  // the sticky column headers stay pinned below the global header.
  const kanbanRef = useRef(null);
  const panRef = useRef({ active: false, startX: 0, scrollLeft: 0, scrollEl: null, moved: false });

  function panDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest(".kanban-card")) return;
    if (e.target.closest("button, a, input, select, textarea")) return;

    const kanban = kanbanRef.current;
    const scrollEl = kanban?.closest(".content");
    if (!scrollEl) return;

    panRef.current = {
      active: true,
      startX: e.pageX,
      scrollLeft: scrollEl.scrollLeft,
      scrollEl,
      moved: false,
    };
    kanban.classList.add("panning");
  }

  function panMove(e) {
    const p = panRef.current;
    if (!p.active || !p.scrollEl) return;
    const walk = e.pageX - p.startX;
    if (Math.abs(walk) > 3) p.moved = true;
    p.scrollEl.scrollLeft = p.scrollLeft - walk;
  }

  function panEnd() {
    panRef.current.active = false;
    panRef.current.scrollEl = null;
    kanbanRef.current?.classList.remove("panning");
  }

  function drop(stageKey) {
    if (!dragId) return;
    const id = dragId;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: stageKey } : l)));
    setDragId(null);
    updateLead(id, { status: stageKey }).catch((err) => {
      alert(err.message || "Failed to update lead status.");
    });
  }

  const totalValue = leads.reduce((s, l) => s + l.value, 0);

  return (
    <>
      <h1 className="page-title">Pipeline</h1>
      <p className="page-subtitle">Drag leads between stages. Kanban view of your sales pipeline.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Drag leads between stages · <strong>₹{totalValue.toLocaleString()}</strong> pipeline value
        </div>
        <button className="btn btn-primary" onClick={() => setAddStage("new")}><FiPlus /> Add lead</button>
      </div>

      {loading && leads.length === 0 ? (
        <KanbanSkeleton />
      ) : (
      <div
        className="kanban"
        ref={kanbanRef}
        onMouseDown={panDown}
        onMouseMove={panMove}
        onMouseUp={panEnd}
        onMouseLeave={panEnd}
      >
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={stage.key}
              className="kanban-col"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={() => drop(stage.key)}
            >
              <div className="kanban-col-head" style={{ borderTopColor: stage.color }}>
                <div>
                  <strong style={{ fontSize: 13 }}>{stage.label}</strong>
                  <span className="kanban-count">{stageLeads.length}</span>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>₹{stageValue.toLocaleString()}</div>
              </div>
              <div className="kanban-col-body">
                {stageLeads.map((l) => (
                  <KanbanCard
                    key={l.id}
                    lead={l}
                    stageColor={stage.color}
                    dragging={dragId === l.id}
                    onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
                {stageLeads.length === 0 && <div className="kanban-empty">Drop leads here</div>}
                <button className="kanban-add" onClick={() => setAddStage(stage.key)}><FiPlus /> Add lead</button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {addStage && (
        <AddLeadModal
          initialStatus={addStage}
          onClose={() => setAddStage(null)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}

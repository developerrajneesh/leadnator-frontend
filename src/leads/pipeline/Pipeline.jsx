import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiSettings, FiColumns } from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import { profileApi } from "../../api/profile";
import { refreshPipelineStages, setPipelineStagesCache, usePipelineStages } from "../usePipelineStages";
import { discoverFields, orderFields, DEFAULT_CARD_FIELDS } from "../leadFields";
import KanbanCard from "./components/KanbanCard";
import KanbanSkeleton from "./components/KanbanSkeleton";
import PipelineEditorModal from "./components/PipelineEditorModal";
import FieldPicker from "../components/FieldPicker";
import AddLeadModal from "../all-leads/components/AddLeadModal";
import { notify } from "../../globalComponents/Toast/Toast";

const CARD_KEY = "leadnator_lead_card_fields";

export default function Pipeline() {
  const { leads: apiLeads, loading, updateLead, addLead, reload } = useLeads();
  const { stages, loading: stagesLoading } = usePipelineStages();
  const [leads, setLeads] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [addStage, setAddStage] = useState(null);
  const [editPipeline, setEditPipeline] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [showFields, setShowFields] = useState(false);
  const [cardFields, setCardFields] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(CARD_KEY)); return Array.isArray(s) && s.length ? s : DEFAULT_CARD_FIELDS; }
    catch { return DEFAULT_CARD_FIELDS; }
  });

  // Load the saved card fields from the user's DB settings.
  useEffect(() => {
    let alive = true;
    profileApi.settings()
      .then((r) => {
        const f = r?.settings?.leadCardFields;
        if (alive && Array.isArray(f) && f.length) {
          setCardFields(f);
          try { localStorage.setItem(CARD_KEY, JSON.stringify(f)); } catch { /* ignore */ }
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // "name" is the card's fixed header (always shown), so it isn't a toggleable field.
  const orderedFields = useMemo(
    () => orderFields(discoverFields(apiLeads).filter((k) => k !== "name"), DEFAULT_CARD_FIELDS),
    [apiLeads],
  );

  function persistFields(next) {
    try { localStorage.setItem(CARD_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    profileApi.saveSettings({ leadCardFields: next }).catch(() => {});
  }
  function toggleField(k) {
    setCardFields((cur) => {
      const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
      persistFields(next);
      return next;
    });
  }
  function resetFields() {
    setCardFields(DEFAULT_CARD_FIELDS);
    persistFields(DEFAULT_CARD_FIELDS);
  }

  async function openPipelineEditor() {
    await refreshPipelineStages();
    setEditorKey((k) => k + 1);
    setEditPipeline(true);
  }

  async function handleAdd(lead) {
    try {
      await addLead(lead);
      notify.success(`Lead "${lead.name}" added`);
      setAddStage(null);
    } catch (err) {
      notify.error(err.message || "Failed to add lead.");
    }
  }

  useEffect(() => { setLeads(apiLeads); }, [apiLeads]);

  const kanbanRef = useRef(null);
  const panRef = useRef({ active: false, startX: 0, scrollLeft: 0, scrollEl: null, moved: false });

  function panDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest(".kanban-card")) return;
    if (e.target.closest("button, a, input, select, textarea")) return;
    const kanban = kanbanRef.current;
    const scrollEl = kanban?.closest(".content");
    if (!scrollEl) return;
    panRef.current = { active: true, startX: e.pageX, scrollLeft: scrollEl.scrollLeft, scrollEl, moved: false };
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
      notify.error(err.message || "Failed to update lead status.");
      reload();
    });
  }

  const stageKeys = new Set(stages.map((s) => s.key));
  const orphanLeads = leads.filter((l) => !stageKeys.has(l.status));

  const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);
  const showSkeleton = (loading || stagesLoading) && leads.length === 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Pipeline</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Drag leads between stages · <strong>₹{totalValue.toLocaleString()}</strong> pipeline value
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowFields((v) => !v)}>
              <FiColumns /> Card fields ({cardFields.length})
            </button>
            {showFields && (
              <FieldPicker
                ordered={orderedFields}
                visible={cardFields}
                onToggle={toggleField}
                onReset={resetFields}
                onClose={() => setShowFields(false)}
                title="Card fields"
                hint={<>Pick what each card shows. Nested fields appear as <code>parent.child</code>.</>}
              />
            )}
          </div>
          <button type="button" className="btn btn-outline" onClick={openPipelineEditor}>
            <FiSettings /> Customize columns ({stages.length})
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setAddStage(stages[0]?.key || "new")}>
            <FiPlus /> Add lead
          </button>
        </div>
      </div>

      {showSkeleton ? (
        <KanbanSkeleton count={stages.length || 5} />
      ) : (
        <div
          className="kanban"
          ref={kanbanRef}
          onMouseDown={panDown}
          onMouseMove={panMove}
          onMouseUp={panEnd}
          onMouseLeave={panEnd}
        >
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);
            const stageValue = stageLeads.reduce((s, l) => s + (l.value || 0), 0);
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
                      fields={cardFields}
                    />
                  ))}
                  {stageLeads.length === 0 && <div className="kanban-empty">Drop leads here</div>}
                  <button type="button" className="kanban-add" onClick={() => setAddStage(stage.key)}>
                    <FiPlus /> Add lead
                  </button>
                </div>
              </div>
            );
          })}

          {orphanLeads.length > 0 && (
            <div
              className="kanban-col"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={() => drop(stages[0]?.key)}
            >
              <div className="kanban-col-head" style={{ borderTopColor: "#6b7280" }}>
                <div>
                  <strong style={{ fontSize: 13 }}>Other</strong>
                  <span className="kanban-count">{orphanLeads.length}</span>
                </div>
              </div>
              <div className="kanban-col-body">
                {orphanLeads.map((l) => (
                  <KanbanCard
                    key={l.id}
                    lead={l}
                    stageColor="#6b7280"
                    dragging={dragId === l.id}
                    onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragEnd={() => setDragId(null)}
                      fields={cardFields}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {addStage && (
        <AddLeadModal
          initialStatus={addStage}
          onClose={() => setAddStage(null)}
          onAdd={handleAdd}
        />
      )}

      {editPipeline && (
        <PipelineEditorModal
          key={editorKey}
          stages={stages}
          leads={leads}
          onClose={() => setEditPipeline(false)}
          onSaved={async (saved) => {
            if (saved?.length) setPipelineStagesCache(saved);
            await refreshPipelineStages();
            setEditPipeline(false);
            reload();
          }}
        />
      )}
    </>
  );
}

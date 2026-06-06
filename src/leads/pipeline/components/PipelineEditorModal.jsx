import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiSave } from "react-icons/fi";
import { api } from "../../../api/client";
import { notify } from "../../../globalComponents/Toast/Toast";
import { refreshPipelineStages, setPipelineStagesCache } from "../../usePipelineStages";
import { DEFAULT_PIPELINE_STAGES, normalizePipelineStages } from "../../constants";
import "./PipelineEditorModal.css";

function cloneStages(list) {
  return normalizePipelineStages(list);
}

export default function PipelineEditorModal({ stages: initial, leads = [], onClose, onSaved }) {
  const [stages, setStages] = useState(() => cloneStages(initial));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function leadCountForStage(key) {
    return leads.filter((l) => l.status === key).length;
  }

  function canDeleteStage(key) {
    return leadCountForStage(key) === 0;
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.leads.settings()
      .then((r) => {
        if (cancelled) return;
        const saved = r.settings?.pipelineStages;
        setStages(
          Array.isArray(saved) && saved.length
            ? cloneStages(saved)
            : cloneStages(DEFAULT_PIPELINE_STAGES)
        );
      })
      .catch(() => {
        if (!cancelled) setStages(cloneStages(initial));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function patch(i, changes) {
    setStages((list) => list.map((s, idx) => (idx === i ? { ...s, ...changes } : s)));
  }

  function move(i, dir) {
    setStages((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function addColumn() {
    setStages((list) => [
      ...list,
      { key: `stage_${Date.now()}`, label: "New stage", color: "#7c3aed", system: false },
    ]);
  }

  function requestDelete(key) {
    const count = leadCountForStage(key);
    if (count > 0) {
      const label = stages.find((s) => s.key === key)?.label || key;
      notify.warn(
        `"${label}" has ${count} lead${count !== 1 ? "s" : ""}. Move them to another column on the pipeline first, then delete.`
      );
      return;
    }
    setStages((list) => list.filter((s) => s.key !== key));
  }

  async function save() {
    const cleaned = stages
      .map((s) => ({
        key: s.key,
        label: (s.label || "").trim(),
        color: s.color || "#7c3aed",
        system: !!s.system,
      }))
      .filter((s) => s.label);
    if (!cleaned.length) {
      notify.warn("Keep at least one stage.");
      return;
    }

    const allowedKeys = new Set(cleaned.map((s) => s.key));
    const stranded = leads.filter((l) => l.status && !allowedKeys.has(l.status));
    if (stranded.length > 0) {
      const byStatus = stranded.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {});
      const [statusKey, n] = Object.entries(byStatus)[0];
      const label = stages.find((s) => s.key === statusKey)?.label
        || initial.find((s) => s.key === statusKey)?.label
        || statusKey;
      notify.warn(
        `Cannot save: ${n} lead${n !== 1 ? "s" : ""} still in "${label}". Move them on the pipeline before removing this column.`
      );
      return;
    }

    setSaving(true);
    try {
      const r = await api.leads.saveSettings({ pipelineStages: cleaned });
      const saved = r.settings?.pipelineStages || cleaned;
      setPipelineStagesCache(saved);
      await refreshPipelineStages();
      onSaved?.(saved);
      notify.success("Pipeline updated");
      onClose?.();
    } catch (err) {
      notify.error(err.message || "Failed to save pipeline");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="pe-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="card pe-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="card-title">Customize pipeline</div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close"><FiX /></button>
        </div>

        <p className="pe-intro">
          Reorder columns, rename stages, or change colors. Delete a column only when it has zero leads.
          {!loading && (
            <span className="pe-count">{stages.length} column{stages.length !== 1 ? "s" : ""}</span>
          )}
        </p>

        {loading ? (
          <div className="pe-loading">Loading your pipeline…</div>
        ) : (
          <div className="pe-list">
            {stages.map((s, i) => {
              const leadCount = leadCountForStage(s.key);
              const deleteBlocked = !canDeleteStage(s.key);
              const deleteTitle = deleteBlocked
                ? `${leadCount} lead${leadCount !== 1 ? "s" : ""} — move them out before deleting`
                : "Remove column";

              return (
              <div key={s.key} className="pe-row">
                <div className="pe-reorder">
                  <button
                    type="button"
                    className="pe-reorder-btn"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                  >
                    <FiChevronUp />
                  </button>
                  <button
                    type="button"
                    className="pe-reorder-btn"
                    disabled={i === stages.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                  >
                    <FiChevronDown />
                  </button>
                </div>

                <input
                  className="pe-input"
                  value={s.label}
                  onChange={(e) => patch(i, { label: e.target.value })}
                  placeholder="Stage name"
                />

                <div className="pe-color" style={{ "--pe-accent": s.color }} title="Column color">
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => patch(i, { color: e.target.value })}
                  />
                </div>

                {leadCount > 0 && (
                  <span className="pe-lead-badge" title={deleteTitle}>
                    {leadCount} lead{leadCount !== 1 ? "s" : ""}
                  </span>
                )}

                <button
                  type="button"
                  className={`pe-delete${deleteBlocked ? " pe-delete--disabled" : ""}`}
                  onClick={() => requestDelete(s.key)}
                  disabled={deleteBlocked}
                  title={deleteTitle}
                  aria-label="Remove column"
                >
                  <FiTrash2 />
                </button>
              </div>
            );
            })}
          </div>
        )}

        {!loading && (
          <>
            <button type="button" className="pe-add" onClick={addColumn}>
              <FiPlus /> Add column
            </button>
            {!stages.some((s) => s.key === "lost") && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
                <strong>Lost</strong> column is missing from this workspace. It was removed when columns were customized.
              </p>
            )}
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: 10, width: "100%" }}
              onClick={() => {
                setStages(cloneStages(DEFAULT_PIPELINE_STAGES));
                notify.info("Restored 5 default columns — click Save pipeline to apply.");
              }}
            >
              Restore default columns (New, Contacted, Qualified, Hot, Lost)
            </button>
          </>
        )}

        <div className="pe-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving || loading}>
            <FiSave /> {saving ? "Saving…" : "Save pipeline"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

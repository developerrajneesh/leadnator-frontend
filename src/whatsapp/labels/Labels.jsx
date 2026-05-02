import { useEffect, useState } from "react";
import {
  FiTag, FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiSave, FiUsers,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

// Preset swatches the user can pick instantly; they can also type a custom hex.
const PALETTE = [
  "#7c3aed", "#1877f2", "#25d366", "#0ea5e9", "#06b6d4",
  "#10b981", "#f59e0b", "#f97316", "#ef4444", "#ec4899",
  "#a855f7", "#64748b",
];

export default function Labels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null or {id?, name, color, description}
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.labels(); setLabels(r.labels || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setEditing({ name: "", color: "#7c3aed", description: "" }); }
  function openEdit(l)  { setEditing({ id: l.id, name: l.name, color: l.color, description: l.description || "" }); }
  function close()      { setEditing(null); }

  async function save() {
    if (!editing.name.trim()) { notify.warn("Name required"); return; }
    try {
      if (editing.id) {
        await waApi.updateLabel(editing.id, { name: editing.name.trim(), color: editing.color, description: editing.description });
        notify.success("Label updated");
      } else {
        await waApi.createLabel({ name: editing.name.trim(), color: editing.color, description: editing.description });
        notify.success("Label created");
      }
      close();
      load();
    } catch (err) { notify.error(err.message); }
  }

  async function remove(l) {
    const msg = l.contactCount
      ? `Delete "${l.name}"? It's attached to ${l.contactCount} contact${l.contactCount === 1 ? "" : "s"} — they'll lose this label.`
      : `Delete "${l.name}"?`;
    if (!confirm(msg)) return;
    setBusyId(l.id);
    try { await waApi.deleteLabel(l.id); notify.success("Label deleted"); load(); }
    catch (err) { notify.error(err.message); }
    finally { setBusyId(""); }
  }

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiTag style={{ color: "#7c3aed" }} /> WhatsApp Labels
      </h1>
      <p className="page-subtitle">Tag contacts with color-coded labels for fast filtering in the inbox, broadcasts, and campaigns.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New label</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiTag /> {labels.length} label{labels.length === 1 ? "" : "s"}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : labels.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No labels yet. Click <strong>New label</strong> to create your first one (e.g. VIP, Prospect, Support).
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Label</th>
                <th>Description</th>
                <th style={{ width: 120 }}>Contacts</th>
                <th>Created</th>
                <th style={{ width: 160, textAlign: "right" }}>Actions</th>
              </tr></thead>
              <tbody>
                {labels.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700,
                        background: `${l.color}1a`, color: l.color, border: `1px solid ${l.color}33`,
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                        {l.name}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.description || "—"}
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <FiUsers style={{ color: "var(--text-muted)" }} /> {l.contactCount}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="admin-action" onClick={() => openEdit(l)}><FiEdit2 /> Edit</button>
                        <button className="admin-action danger" disabled={busyId === l.id} onClick={() => remove(l)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <LabelEditor
          editing={editing}
          onChange={setEditing}
          onClose={close}
          onSave={save}
        />
      )}
    </>
  );
}

function LabelEditor({ editing, onChange, onClose, onSave }) {
  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(); }}
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 460, maxWidth: "96vw" }}
      >
        <div className="card-header">
          <div className="card-title">{editing.id ? "Edit label" : "New label"}</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        {/* Live preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700,
            background: `${editing.color}1a`, color: editing.color, border: `1px solid ${editing.color}55`,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: editing.color }} />
            {editing.name || "Label preview"}
          </span>
        </div>

        <div className="form-group">
          <label>Name *</label>
          <input
            autoFocus
            value={editing.name}
            onChange={(e) => onChange({ ...editing, name: e.target.value })}
            maxLength={40}
            placeholder="VIP, Prospect, Support, New lead…"
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            {PALETTE.map((c) => {
              const on = c === editing.color;
              return (
                <button
                  key={c} type="button"
                  onClick={() => onChange({ ...editing, color: c })}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: on ? `3px solid ${c}` : "2px solid transparent",
                    background: c, cursor: "pointer",
                    boxShadow: on ? `0 0 0 2px white inset` : "none",
                  }}
                  title={c}
                />
              );
            })}
          </div>
          <input
            type="color"
            value={editing.color}
            onChange={(e) => onChange({ ...editing, color: e.target.value })}
            style={{ width: 60, height: 34, padding: 2, border: "1px solid var(--border)", borderRadius: 6 }}
          />
          <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{editing.color}</span>
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <input
            value={editing.description}
            onChange={(e) => onChange({ ...editing, description: e.target.value })}
            maxLength={120}
            placeholder="What does this label mean?"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!editing.name.trim()}>
            <FiSave /> {editing.id ? "Save changes" : "Create label"}
          </button>
        </div>
      </form>
    </div>
  );
}

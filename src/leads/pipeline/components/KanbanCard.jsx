import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiMail, FiPhone, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";
import { waNumber } from "../../constants";
import { useLeads } from "../../../api/hooks";
import { getByPath, formatValue, humanize, DEFAULT_CARD_FIELDS } from "../../leadFields";
import QuickContactModal from "./QuickContactModal";
import EditLeadModal from "../../all-leads/components/EditLeadModal";

const KNOWN_FIELDS = new Set(["name", "email", "phone", "source", "value", "tags", "status"]);

export default function KanbanCard({ lead, stageColor, dragging, onDragStart, onDragEnd, fields }) {
  const F = fields && fields.length ? fields : DEFAULT_CARD_FIELDS;
  const has = (k) => F.includes(k);
  const extra = F.filter((k) => !KNOWN_FIELDS.has(k));
  const navigate = useNavigate();
  const { updateLead, removeLead } = useLeads();

  const [modalTab, setModalTab] = useState(null); // "email" | "whatsapp" | null
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing]   = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  async function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    try { await removeLead(lead.id); }
    catch (err) { alert(err.message || "Failed to delete lead."); }
  }

  async function handleSave(patch) {
    try { await updateLead(lead.id, patch); setEditing(false); }
    catch (err) { alert(err.message || "Failed to update lead."); }
  }

  function stop(e) { e.stopPropagation(); e.preventDefault?.(); }

  return (
    <>
      <div
        className={`kanban-card ${dragging ? "dragging" : ""}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="avatar-sm" style={{ margin: 0 }}>{lead.name[0]}</span>
            <strong style={{ fontSize: 13 }}>{lead.name}</strong>
          </div>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onMouseDown={stop}
              onClick={(e) => { stop(e); setMenuOpen((o) => !o); }}
              draggable={false}
              style={{
                background: "transparent", border: "none", padding: 4, cursor: "pointer",
                color: "#9ca3af", display: "inline-flex", borderRadius: 6,
              }}
              title="More actions"
            >
              <FiMoreVertical />
            </button>
            {menuOpen && (
              <div
                onMouseDown={stop}
                onClick={stop}
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "white", border: "1px solid var(--border)",
                  borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  minWidth: 140, zIndex: 20, overflow: "hidden",
                }}
              >
                <MenuItem icon={<FiEye />}    label="View"   onClick={() => { setMenuOpen(false); navigate(`/leads/all/${lead.id}`); }} />
                <MenuItem icon={<FiEdit2 />}  label="Edit"   onClick={() => { setMenuOpen(false); setEditing(true); }} />
                <MenuItem icon={<FiTrash2 />} label="Delete" onClick={handleDelete} danger />
              </div>
            )}
          </div>
        </div>

        {has("email") && lead.email && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, wordBreak: "break-word" }}>{lead.email}</p>}
        {has("phone") && lead.phone && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{lead.phone}</p>}

        {(has("source") || has("value")) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            {has("source") ? <span className="badge" style={{ background: "#f3f4f6", color: "#374151", fontSize: 10 }}>{lead.source}</span> : <span />}
            {has("value") && <strong style={{ fontSize: 12, color: stageColor }}>₹{Number(lead.value || 0).toLocaleString()}</strong>}
          </div>
        )}

        {has("status") && (
          <div style={{ marginTop: 8 }}>
            <span className="badge" style={{ background: "#f3f4f6", color: "#374151", fontSize: 10, textTransform: "capitalize" }}>{lead.status}</span>
          </div>
        )}

        {has("tags") && (lead.tags || []).length > 0 && (
          <div style={{ marginTop: 8 }}>
            {lead.tags.slice(0, 3).map((t) => (
              <span key={t} className="badge" style={{ background: "#eef2ff", color: "#4338ca", fontSize: 10, marginRight: 4 }}>{t}</span>
            ))}
          </div>
        )}

        {extra.map((k) => {
          const v = getByPath(lead, k);
          if (v == null || v === "") return null;
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6, fontSize: 11 }}>
              <span style={{ color: "#9ca3af", flexShrink: 0 }}>{humanize(k)}</span>
              <span style={{ color: "#374151", fontWeight: 600, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatValue(v, k)}</span>
            </div>
          );
        })}

        <div className="kanban-actions">
          <button
            type="button"
            className="kanban-action email"
            onClick={(e) => { e.stopPropagation(); setModalTab("email"); }}
            onMouseDown={(e) => e.stopPropagation()}
            title={`Email ${lead.email || "(no email)"}`}
            disabled={!lead.email}
          ><FiMail /></button>
          <button
            type="button"
            className="kanban-action whatsapp"
            onClick={(e) => { e.stopPropagation(); setModalTab("whatsapp"); }}
            onMouseDown={(e) => e.stopPropagation()}
            title={`WhatsApp ${lead.phone || "(no phone)"}`}
            disabled={!lead.phone}
            style={{ color: lead.phone ? "#25d366" : undefined }}
          ><SiWhatsapp /></button>
          <a
            className="kanban-action call"
            href={`tel:${waNumber(lead.phone)}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            title={`Call ${lead.phone}`}
          ><FiPhone /></a>
        </div>
      </div>

      {modalTab && (
        <QuickContactModal
          key={`${lead.id}-${modalTab}`}
          lead={lead}
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
        />
      )}
      {editing && (
        <EditLeadModal lead={lead} onClose={() => setEditing(false)} onSave={handleSave} />
      )}
    </>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", padding: "8px 12px", border: "none", background: "transparent",
        display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13,
        color: danger ? "#b91c1c" : "var(--text)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? "#fef2f2" : "#f9fafb"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {icon} {label}
    </button>
  );
}

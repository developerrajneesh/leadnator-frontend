import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave, FiArrowLeft, FiTrash2, FiPlay, FiPause, FiX, FiCheck,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { CATEGORIES, NODE_TYPES, nodeMeta, isCondition } from "./nodeTypes";

const NODE_W = 220;
const NODE_H = 88;

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// Snap value to nearest grid line (16px) — nicer alignment.
function snap(v) { return Math.round(v / 16) * 16; }

export default function FlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [selectedId, setSelectedId] = useState(null);   // node id selected for editing
  const [linkFrom, setLinkFrom] = useState(null);       // { nodeId, port } currently dragging a connection from
  // (in-progress link path is drawn directly to SVG via linkPathRef)
  const canvasRef = useRef(null);
  const dragRef = useRef(null);                         // { nodeId, offsetX, offsetY } for moving a node

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await waApi.flow(id);
      setFlow(res.flow);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // ---------- direct-DOM drag (60fps, no React re-renders during drag) ----------
  // dragRef: { nodeId, offsetX, offsetY, startX, startY, lastX, lastY, raf }
  // While dragging, we mutate node.style.transform + connected SVG paths' "d"
  // attribute directly. Final position is committed to React state on mouseup.

  const nodeRefs = useRef(new Map());     // nodeId → DOM div
  const edgeRefs = useRef(new Map());     // edgeId → SVG <path>
  const linkPathRef = useRef(null);       // dashed in-progress link path

  function setNodeRef(id, el) { if (el) nodeRefs.current.set(id, el); else nodeRefs.current.delete(id); }
  function setEdgeRef(id, el) { if (el) edgeRefs.current.set(id, el); else edgeRefs.current.delete(id); }

  // Compute current x/y of a node, preferring the live drag override if any.
  function liveXY(node) {
    const d = dragRef.current;
    if (d && d.nodeId === node.id) return { x: d.lastX ?? node.x, y: d.lastY ?? node.y };
    return { x: node.x, y: node.y };
  }

  function bezierStr(a, b) {
    const dy = Math.abs(b.y - a.y) * 0.5 + 20;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  }

  function portFor(nodeId, port = "in", overrideXY) {
    const node = flow?.nodes?.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const pos = overrideXY && overrideXY.id === nodeId ? overrideXY : { x: node.x, y: node.y };
    if (port === "in")  return { x: pos.x + NODE_W / 2, y: pos.y };
    if (port === "yes") return { x: pos.x + NODE_W * 0.25, y: pos.y + NODE_H };
    if (port === "no")  return { x: pos.x + NODE_W * 0.75, y: pos.y + NODE_H };
    return { x: pos.x + NODE_W / 2, y: pos.y + NODE_H };
  }

  // Update only the SVG paths connected to a node we're currently dragging.
  function refreshConnectedEdges(nodeId, x, y) {
    const override = { id: nodeId, x, y };
    (flow?.edges || []).forEach((e) => {
      if (e.fromNode !== nodeId && e.toNode !== nodeId) return;
      const pathEls = edgeRefs.current.get(e.id);
      if (!pathEls) return;
      const a = portFor(e.fromNode, e.fromPort, override);
      const b = portFor(e.toNode,   "in",       override);
      const d = bezierStr(a, b);
      pathEls.visible.setAttribute("d", d);
      pathEls.hit.setAttribute("d", d);
    });
  }

  function onCanvasMouseMove(e) {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    // While drawing a connection, paint the dashed in-progress line directly to SVG.
    if (linkFrom && linkPathRef.current) {
      const a = portFor(linkFrom.nodeId, linkFrom.port);
      linkPathRef.current.setAttribute("d", bezierStr(a, { x: mx, y: my }));
    }

    const d = dragRef.current;
    if (!d) return;

    // Coalesce mousemove → next paint. Browser hands us many events per frame.
    d.lastClientX = e.clientX;
    d.lastClientY = e.clientY;
    if (d.raf) return;

    d.raf = requestAnimationFrame(() => {
      d.raf = null;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, d.lastClientX - rect.left - d.offsetX);
      const y = Math.max(0, d.lastClientY - rect.top  - d.offsetY);
      d.lastX = x; d.lastY = y;
      const el = nodeRefs.current.get(d.nodeId);
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      refreshConnectedEdges(d.nodeId, x, y);
    });
  }

  function onCanvasMouseUp(e) {
    const d = dragRef.current;
    if (d) {
      if (d.raf) cancelAnimationFrame(d.raf);
      const finalX = snap(d.lastX ?? d.startX);
      const finalY = snap(d.lastY ?? d.startY);
      // Commit to state — React re-renders ONCE with the final snapped position.
      setFlow((f) => ({
        ...f,
        nodes: f.nodes.map((n) => n.id === d.nodeId ? { ...n, x: finalX, y: finalY } : n),
      }));
      // Keep the DOM transform at the final position. (Blanking it would snap the
      // node to 0,0 on a plain click, since React skips re-applying an unchanged
      // transform value.)
      const el = nodeRefs.current.get(d.nodeId);
      if (el) {
        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
        el.style.willChange = "";
      }
      dragRef.current = null;
    }
    // Only cancel an in-progress link if the mouseup hit the bare canvas
    // (not bubbled from a node — node handlers call stopPropagation).
    if (linkFrom && e.target === canvasRef.current) {
      setLinkFrom(null);
      if (linkPathRef.current) linkPathRef.current.setAttribute("d", "");
    }
  }

  // ---------- drop from palette → canvas ----------
  function onCanvasDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-node-type");
    if (!type) return;
    const meta = nodeMeta(type);
    const r = canvasRef.current.getBoundingClientRect();
    const x = snap(e.clientX - r.left - NODE_W / 2);
    const y = snap(e.clientY - r.top  - NODE_H / 2);

    const config = {};
    meta.fields.forEach((f) => { if (f.default != null) config[f.key] = f.default; });

    const newNode = {
      id: uid("n"),
      type, title: meta.title,
      x: Math.max(0, x), y: Math.max(0, y),
      config,
    };
    setFlow((f) => ({ ...f, nodes: [...(f.nodes || []), newNode] }));
    setSelectedId(newNode.id);
  }

  // ---------- node move ----------
  function startDragNode(e, nodeId) {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const node = flow.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    dragRef.current = {
      nodeId,
      offsetX: e.clientX - r.left - node.x,
      offsetY: e.clientY - r.top  - node.y,
      startX: node.x, startY: node.y,
      lastX: node.x,  lastY: node.y,
      lastClientX: e.clientX, lastClientY: e.clientY,
      raf: null,
    };
    // Promote the dragged node to its own GPU layer for buttery transforms.
    const el = nodeRefs.current.get(nodeId);
    if (el) el.style.willChange = "transform";
  }

  // ---------- connections ----------
  function startLink(e, nodeId, port = "out") {
    e.stopPropagation();
    setLinkFrom({ nodeId, port });
  }

  function completeLink(toNodeId) {
    if (!linkFrom) return;
    if (linkFrom.nodeId === toNodeId) { setLinkFrom(null); return; }
    const newEdge = {
      id: uid("e"),
      fromNode: linkFrom.nodeId,
      fromPort: linkFrom.port,
      toNode: toNodeId,
    };
    // dedupe identical edge
    setFlow((f) => {
      const exists = (f.edges || []).some((ed) => ed.fromNode === newEdge.fromNode && ed.fromPort === newEdge.fromPort && ed.toNode === newEdge.toNode);
      if (exists) return f;
      return { ...f, edges: [...(f.edges || []), newEdge] };
    });
    setLinkFrom(null);
  }

  function deleteEdge(edgeId) {
    setFlow((f) => ({ ...f, edges: f.edges.filter((e) => e.id !== edgeId) }));
  }

  function deleteNode(nodeId) {
    setFlow((f) => ({
      ...f,
      nodes: f.nodes.filter((n) => n.id !== nodeId),
      edges: f.edges.filter((e) => e.fromNode !== nodeId && e.toNode !== nodeId),
    }));
    if (selectedId === nodeId) setSelectedId(null);
  }

  function updateNodeConfig(nodeId, patch) {
    setFlow((f) => ({
      ...f,
      nodes: f.nodes.map((n) => n.id === nodeId ? { ...n, config: { ...(n.config || {}), ...patch } } : n),
    }));
  }

  function updateNodeTitle(nodeId, title) {
    setFlow((f) => ({ ...f, nodes: f.nodes.map((n) => n.id === nodeId ? { ...n, title } : n) }));
  }

  // ---------- save / activate ----------
  async function save() {
    setSaving(true); setError("");
    try {
      const res = await waApi.updateFlow(flow.id, {
        name: flow.name, status: flow.status, nodes: flow.nodes, edges: flow.edges,
      });
      setFlow(res.flow);
      setSavedAt(new Date());
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleStatus() {
    const nextStatus = flow.status === "active" ? "paused" : "active";
    setFlow((f) => ({ ...f, status: nextStatus }));
    setSaving(true);
    try {
      await waApi.updateFlow(flow.id, { ...flow, status: nextStatus });
      setSavedAt(new Date());
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading flow…</div>;
  if (!flow)   return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>{error || "Flow not found"}</div>;

  const selectedNode = (flow.nodes || []).find((n) => n.id === selectedId);

  // helpers to get a port's center for SVG path
  function portPoint(nodeId, port = "in") {
    const n = flow.nodes.find((x) => x.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    if (port === "in")  return { x: n.x + NODE_W / 2, y: n.y };
    if (port === "yes") return { x: n.x + NODE_W * 0.25, y: n.y + NODE_H };
    if (port === "no")  return { x: n.x + NODE_W * 0.75, y: n.y + NODE_H };
    return { x: n.x + NODE_W / 2, y: n.y + NODE_H }; // out
  }

  function bezier(a, b) {
    const dy = Math.abs(b.y - a.y) * 0.5 + 20;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/whatsapp/automation")}>
            <FiArrowLeft /> Back
          </button>
          <input
            value={flow.name}
            onChange={(e) => setFlow({ ...flow, name: e.target.value })}
            style={{ fontSize: 18, fontWeight: 700, padding: "6px 10px", border: "1px solid transparent", borderRadius: 6, background: "transparent", minWidth: 240 }}
            onFocus={(e) => e.target.style.borderColor = "var(--border)"}
            onBlur={(e) => e.target.style.borderColor = "transparent"}
          />
          <span className={`badge ${flow.status === "active" ? "qualified" : flow.status === "paused" ? "contacted" : "lost"}`}>{flow.status}</span>
          {savedAt && <span style={{ fontSize: 11, color: "var(--text-muted)" }}><FiCheck /> Saved {savedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {flow.status === "active"
            ? <button className="btn btn-outline" onClick={toggleStatus} disabled={saving}><FiPause /> Pause</button>
            : <button className="btn btn-outline" onClick={toggleStatus} disabled={saving}><FiPlay /> Activate</button>}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 12, minHeight: 0 }}>

        {/* PALETTE */}
        <div className="card" style={{ overflowY: "auto", padding: 14 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Drag to canvas</div>
          {Object.entries(CATEGORIES).map(([cat, meta]) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: meta.color, marginBottom: 6, letterSpacing: 0.4 }}>
                {meta.label}
              </div>
              {NODE_TYPES.filter((n) => n.cat === cat).map((nt) => (
                <div
                  key={nt.type}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("application/x-node-type", nt.type)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", marginBottom: 4, borderRadius: 8,
                    background: meta.bg, color: meta.color, cursor: "grab",
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  <nt.Icon /> {nt.title}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CANVAS */}
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onCanvasDrop}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onClick={(e) => {
            // Only deselect / cancel if the click landed on the bare canvas,
            // not on a node or port that bubbled up.
            if (e.target === canvasRef.current) {
              setSelectedId(null);
              setLinkFrom(null);
            }
          }}
          style={{
            position: "relative", overflow: "auto",
            background: "white",
            border: "1px solid var(--border)", borderRadius: 12,
            backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            minHeight: 540,
          }}
        >
          {/* SVG layer for connections */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
              </marker>
            </defs>

            {(flow.edges || []).map((e) => {
              const a = portPoint(e.fromNode, e.fromPort);
              const b = portPoint(e.toNode, "in");
              const isYes = e.fromPort === "yes";
              const isNo  = e.fromPort === "no";
              const stroke = isYes ? "#10b981" : isNo ? "#ef4444" : "#7c3aed";
              const d = bezier(a, b);
              return (
                <g key={e.id} style={{ pointerEvents: "auto" }}>
                  <path
                    ref={(el) => {
                      const cur = edgeRefs.current.get(e.id) || {};
                      cur.visible = el;
                      if (el) edgeRefs.current.set(e.id, cur);
                    }}
                    d={d} fill="none" stroke={stroke} strokeWidth="2" markerEnd="url(#arrow)"
                  />
                  {/* invisible thick path for click-to-delete */}
                  <path
                    ref={(el) => {
                      const cur = edgeRefs.current.get(e.id) || {};
                      cur.hit = el;
                      if (el) edgeRefs.current.set(e.id, cur);
                    }}
                    d={d} fill="none" stroke="transparent" strokeWidth="14" style={{ cursor: "pointer" }}
                    onClick={(ev) => { ev.stopPropagation(); if (confirm("Remove this connection?")) deleteEdge(e.id); }}
                  />
                </g>
              );
            })}

            {/* In-progress link from output → mouse — its `d` is updated directly in mousemove */}
            {linkFrom && (
              <path
                ref={linkPathRef}
                d=""
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeDasharray="6,5"
              />
            )}
          </svg>

          {/* Empty state */}
          {(!flow.nodes || flow.nodes.length === 0) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: 30 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Build your flow</div>
                <div style={{ fontSize: 13 }}>Drag a <strong>Trigger</strong> from the left panel to get started.</div>
              </div>
            </div>
          )}

          {/* Nodes */}
          {(flow.nodes || []).map((n) => {
            const meta = nodeMeta(n.type);
            const cat = CATEGORIES[meta.cat];
            const selected = selectedId === n.id;
            const cond = isCondition(n.type);

            return (
              <div
                key={n.id}
                ref={(el) => setNodeRef(n.id, el)}
                style={{
                  position: "absolute", left: 0, top: 0,
                  transform: `translate3d(${n.x}px, ${n.y}px, 0)`,
                  width: NODE_W, minHeight: NODE_H,
                  background: "white", borderRadius: 10,
                  border: `2px solid ${selected ? cat.color : "var(--border)"}`,
                  boxShadow: selected ? `0 6px 18px ${cat.color}33` : "0 2px 6px rgba(0,0,0,0.06)",
                  userSelect: "none",
                  cursor: dragRef.current?.nodeId === n.id ? "grabbing" : "default",
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedId(n.id); }}
                onMouseUp={(e) => {
                  // If a link drag is in progress and we release on this node,
                  // wire it up. stopPropagation so canvas doesn't cancel.
                  if (linkFrom && linkFrom.nodeId !== n.id) {
                    e.stopPropagation();
                    completeLink(n.id);
                  }
                }}
              >
                {/* Top input port — also accepts the drop */}
                <div
                  title="Input"
                  onMouseUp={(e) => {
                    if (linkFrom && linkFrom.nodeId !== n.id) {
                      e.stopPropagation();
                      completeLink(n.id);
                    }
                  }}
                  style={{
                    position: "absolute", top: -7, left: NODE_W / 2 - 7,
                    width: 14, height: 14, borderRadius: "50%",
                    background: linkFrom && linkFrom.nodeId !== n.id ? cat.color : "white",
                    border: `2px solid ${cat.color}`,
                    cursor: linkFrom ? "crosshair" : "default",
                    transition: "background 0.1s",
                  }}
                />

                {/* Header (drag handle) */}
                <div
                  onMouseDown={(e) => startDragNode(e, n.id)}
                  style={{
                    padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
                    background: cat.bg, color: cat.color, borderTopLeftRadius: 8, borderTopRightRadius: 8,
                    cursor: "grab",
                  }}
                >
                  <meta.Icon style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title || meta.title}
                  </strong>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this node?")) deleteNode(n.id); }}
                    style={{ background: "transparent", border: "none", color: cat.color, cursor: "pointer", padding: 2 }}
                    title="Delete"
                  ><FiTrash2 size={12} /></button>
                </div>

                {/* Body summary */}
                <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {meta.fields.length === 0
                    ? <em>No config</em>
                    : meta.fields.map((f) => (
                        <div key={f.key} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.label}: <strong style={{ color: "var(--text)" }}>{n.config?.[f.key] ?? "—"}</strong>
                        </div>
                      ))}
                </div>

                {/* Output ports */}
                {cond ? (
                  <>
                    <PortDot label="YES" color="#10b981"
                      style={{ left: NODE_W * 0.25 - 7, bottom: -7 }}
                      onMouseDown={(e) => startLink(e, n.id, "yes")} />
                    <PortDot label="NO" color="#ef4444"
                      style={{ left: NODE_W * 0.75 - 7, bottom: -7 }}
                      onMouseDown={(e) => startLink(e, n.id, "no")} />
                  </>
                ) : (
                  <PortDot
                    color={cat.color}
                    style={{ left: NODE_W / 2 - 7, bottom: -7 }}
                    onMouseDown={(e) => startLink(e, n.id, "out")}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* CONFIG PANEL */}
        <div className="card" style={{ padding: 14, overflowY: "auto" }}>
          {!selectedNode ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tip</div>
              Click a node to configure it.<br /><br />
              Drag from a node's <span style={{ color: "#7c3aed", fontWeight: 700 }}>bottom dot</span> to another node's <span style={{ color: "#7c3aed", fontWeight: 700 }}>top dot</span> to connect them.
            </div>
          ) : (
            <ConfigPanel
              node={selectedNode}
              onTitleChange={(v) => updateNodeTitle(selectedNode.id, v)}
              onConfigChange={(patch) => updateNodeConfig(selectedNode.id, patch)}
              onClose={() => setSelectedId(null)}
              onDelete={() => { if (confirm("Delete this node?")) deleteNode(selectedNode.id); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PortDot({ color, style, onMouseDown, label }) {
  return (
    <div
      onMouseDown={onMouseDown}
      title={label || "Drag to connect"}
      style={{
        position: "absolute", width: 14, height: 14, borderRadius: "50%",
        background: color, border: "2px solid white", cursor: "crosshair",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)", ...style,
      }}
    >
      {label && (
        <span style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color }}>{label}</span>
      )}
    </div>
  );
}

function ConfigPanel({ node, onTitleChange, onConfigChange, onClose, onDelete }) {
  const meta = nodeMeta(node.type);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="card-title">Configure node</div>
        <button className="btn btn-ghost" onClick={onClose}><FiX /></button>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4, fontWeight: 700, letterSpacing: 0.3 }}>
        {meta.title}
      </div>

      <div className="form-group">
        <label>Display name</label>
        <input value={node.title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>

      {meta.fields.map((f) => (
        <div className="form-group" key={f.key}>
          <label>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              rows="3"
              value={node.config?.[f.key] ?? ""}
              onChange={(e) => onConfigChange({ [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }}
            />
          ) : f.type === "select" ? (
            <select value={node.config?.[f.key] ?? f.default ?? ""} onChange={(e) => onConfigChange({ [f.key]: e.target.value })}>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"}
              value={node.config?.[f.key] ?? ""}
              onChange={(e) => onConfigChange({ [f.key]: f.type === "number" ? +e.target.value : e.target.value })}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}

      <button className="btn btn-danger" onClick={onDelete} style={{ width: "100%", marginTop: 14 }}>
        <FiTrash2 /> Delete node
      </button>
    </>
  );
}

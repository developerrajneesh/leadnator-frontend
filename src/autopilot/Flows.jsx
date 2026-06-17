import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FiPlus,
  FiTrash2,
  FiMail,
  FiMessageCircle,
  FiGlobe,
  FiExternalLink,
  FiCode,
  FiUserPlus,
  FiTag,
  FiClock,
  FiGitBranch,
  FiZap,
  FiShuffle,
  FiArrowRight,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiSave,
  FiArrowLeft,
  FiActivity,
  FiCopy,
} from "react-icons/fi";
import { notify } from "../globalComponents/Toast/Toast";
import { api } from "../api/client";
import { emailApi } from "../api/email";

/* --------------------------------------------------------------------------
 * GHL-style workflow builder, rendered with React Flow (@xyflow/react).
 *   The flow is a tree (trigger → steps; a condition node has yes/no sub-flows).
 *   We auto-layout that tree into React Flow nodes/edges. React Flow handles
 *   pan / zoom / controls / minimap; a custom edge carries the "+" inserter.
 *   The design is persisted to the Autopilot record (config.trigger/steps).
 * ------------------------------------------------------------------------ */

// Layout geometry
const NODE_W = 270;   // node width (used for centering math)
const ROW_Y = 150;    // vertical distance between rows
const H_GAP = 44;     // horizontal gap between a yes/no pair

// Accent palette per node kind (matches the color-coded step chips).
const KIND = {
  trigger:   { color: "#7c3aed", bg: "#f5f3ff" },
  comms:     { color: "#0ea5e9", bg: "#e0f2fe" },
  crm:       { color: "#10b981", bg: "#dcfce7" },
  logic:     { color: "#f59e0b", bg: "#fef3c7" },
  developer: { color: "#475569", bg: "#f1f5f9" },
};

// The full action catalog. `group` drives the picker sections; `kind` drives color.
const CATALOG = [
  // ---- Triggers ----
  { type: "trigger.webhook",       group: "Triggers", kind: "trigger", icon: FiGlobe,       title: "Inbound webhook",     desc: "Start when a webhook receives a payload",
    fields: [{ key: "event", label: "Event name", type: "text", placeholder: "new_lead" }] },
  { type: "trigger.new_lead",      group: "Triggers", kind: "trigger", icon: FiZap,         title: "Lead created",        desc: "Start when a new lead is added",
    fields: [{ key: "source", label: "Limit to source (optional)", type: "text", placeholder: "Any source" }] },
  { type: "trigger.form_submitted",group: "Triggers", kind: "trigger", icon: FiCheckCircle, title: "Form submitted",      desc: "Start when a public form is submitted",
    fields: [{ key: "formId", label: "Form ID (optional)", type: "text", placeholder: "Any form" }] },
  { type: "trigger.tag_added",     group: "Triggers", kind: "trigger", icon: FiTag,         title: "Tag added",           desc: "Start when a contact gets a tag",
    fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "hot-lead" }] },

  // ---- Communication ----
  { type: "action.send_email",     group: "Communication", kind: "comms", icon: FiMail,          title: "Send email",     desc: "Send a templated email",
    fields: [
      { key: "senderId", label: "Send from", type: "emailSender" },
      { key: "to", label: "Recipient email field", type: "text", placeholder: "email", hint: "The key in your webhook payload that holds the recipient's email (e.g. email, contact_email). You can also use {{email}}." },
      { key: "subject", label: "Subject", type: "text", placeholder: "Hello {{firstName}}" },
      { key: "body", label: "Body", type: "textarea", placeholder: "Write your email…" },
    ] },
  { type: "action.send_whatsapp",  group: "Communication", kind: "comms", icon: FiMessageCircle, title: "Send WhatsApp",  desc: "Send a WhatsApp template / text",
    fields: [{ key: "template", label: "Template name", type: "text", placeholder: "hello_world" }, { key: "body", label: "Fallback text", type: "textarea", placeholder: "Hi {{firstName}} 👋" }] },

  // ---- CRM ----
  { type: "action.create_contact", group: "CRM", kind: "crm", icon: FiUserPlus, title: "Create / update contact", desc: "Upsert the contact into a list",
    fields: [
      { key: "emailField", label: "Email field", type: "text", placeholder: "email", hint: "Payload key that holds the email (e.g. email, contact_email) or {{email}}. Leave blank to auto-detect." },
      { key: "nameField", label: "Name field (optional)", type: "text", placeholder: "name", hint: "Auto-detected if left blank." },
      { key: "phoneField", label: "Phone field (optional)", type: "text", placeholder: "phone", hint: "Auto-detected if left blank." },
      { key: "list", label: "Source / list", type: "text", placeholder: "Autopilot" },
    ] },
  { type: "action.add_tag",        group: "CRM", kind: "crm", icon: FiTag,      title: "Add tag",                 desc: "Tag the contact",
    fields: [{ key: "tag", label: "Tag", type: "text", placeholder: "nurtured" }] },
  { type: "action.update_status",  group: "CRM", kind: "crm", icon: FiZap,      title: "Change lead status",      desc: "Move the lead to a stage",
    fields: [{ key: "status", label: "Status", type: "text", placeholder: "qualified" }] },

  // ---- Data ----
  { type: "action.field_mapper",   group: "Data", kind: "logic", icon: FiShuffle, title: "Field mapper", desc: "Rename incoming webhook fields to your own field names",
    fields: [{ key: "mappings", label: "Field mappings", type: "mapping" }] },

  // ---- Logic ----
  { type: "wait.delay",            group: "Logic", kind: "logic", icon: FiClock,     title: "Wait / delay",   desc: "Pause before the next step",
    fields: [{ key: "amount", label: "Amount", type: "number", placeholder: "1" }, { key: "unit", label: "Unit", type: "select", options: ["minutes", "hours", "days"] }] },
  { type: "condition.if_else",     group: "Logic", kind: "logic", icon: FiGitBranch, title: "If / else",      desc: "Branch on a field value",
    fields: [{ key: "field", label: "Field", type: "text", placeholder: "status" }, { key: "op", label: "Operator", type: "select", options: ["equals", "not equals", "contains", "is empty"] }, { key: "value", label: "Value", type: "text", placeholder: "won" }] },

  // ---- Developer ----
  { type: "action.call_webhook",   group: "Developer", kind: "developer", icon: FiExternalLink, title: "Call webhook", desc: "POST data to an external URL",
    fields: [{ key: "url", label: "Webhook URL", type: "text", placeholder: "https://example.com/hook" }] },
  { type: "action.run_js",         group: "Developer", kind: "developer", icon: FiCode,         title: "Run JS",       desc: "Run a sandboxed script",
    fields: [{ key: "script", label: "JavaScript (sandbox)", type: "textarea", placeholder: "// return { ok: true };" }] },
];

const BY_TYPE = Object.fromEntries(CATALOG.map((c) => [c.type, c]));
const isTriggerType = (type) => type?.startsWith("trigger.");
const isBranchType = (type) => type === "condition.if_else";

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
function metaFor(type) {
  return BY_TYPE[type] || { title: type, kind: "developer", icon: FiZap, desc: "", fields: [] };
}
function blankConfig(type) {
  return metaFor(type).fields.reduce((acc, f) => {
    if (f.default != null) acc[f.key] = f.default;
    else if (f.type === "select") acc[f.key] = f.options?.[0] || "";
    else if (f.type === "mapping") acc[f.key] = [{ from: "", to: "" }];
    return acc;
  }, {});
}
// One-line summary shown under the step title.
function summarize(node) {
  const meta = metaFor(node.type);
  if (node.type === "wait.delay" && node.config?.amount) {
    return `Wait ${node.config.amount} ${node.config.unit || "minutes"}`;
  }
  if (node.type === "action.field_mapper") {
    const rows = (node.config?.mappings || []).filter((m) => m.from && m.to);
    return rows.length
      ? rows.map((m) => `${m.from} → ${m.to}`).slice(0, 2).join(", ") + (rows.length > 2 ? ` +${rows.length - 2} more` : "")
      : meta.desc;
  }
  const first = meta.fields.find((f) => node.config?.[f.key]);
  if (first) {
    const v = String(node.config[first.key]);
    return `${first.label}: ${v.length > 38 ? v.slice(0, 38) + "…" : v}`;
  }
  return meta.desc;
}

// Create a fresh node. Condition nodes carry their own yes/no sub-flows.
function makeNode(type) {
  const node = { id: uid("n"), type, title: metaFor(type).title, config: blankConfig(type) };
  if (isBranchType(type)) { node.yes = []; node.no = []; }
  return node;
}

/* --- Tree ops. A "path" addresses a nested list as [{ id, branch }, …]
 * (branch = "yes" | "no"); [] is the root list. --- */
function updateList(list, path, updater) {
  if (path.length === 0) return updater(list);
  const [seg, ...rest] = path;
  return list.map((n) =>
    n.id === seg.id ? { ...n, [seg.branch]: updateList(n[seg.branch] || [], rest, updater) } : n,
  );
}
function mapTree(list, id, fn) {
  return list.map((n) => {
    let node = n.id === id ? fn(n) : n;
    if (node.yes) node = { ...node, yes: mapTree(node.yes, id, fn) };
    if (node.no)  node = { ...node, no: mapTree(node.no, id, fn) };
    return node;
  });
}
function filterTree(list, id) {
  return list
    .filter((n) => n.id !== id)
    .map((n) => {
      let node = n;
      if (node.yes) node = { ...node, yes: filterTree(node.yes, id) };
      if (node.no)  node = { ...node, no: filterTree(node.no, id) };
      return node;
    });
}
function findInTree(list, id) {
  for (const n of list) {
    if (n.id === id) return n;
    const f = (n.yes && findInTree(n.yes, id)) || (n.no && findInTree(n.no, id));
    if (f) return f;
  }
  return null;
}

// Horizontal span a branch needs — a fork is two EQUAL columns of max(yes, no).
function subtreeWidth(nodes) {
  let w = NODE_W;
  for (const n of nodes || []) {
    if (isBranchType(n.type)) {
      const half = Math.max(subtreeWidth(n.yes), subtreeWidth(n.no), NODE_W);
      const fork = 2 * half + H_GAP;
      if (fork > w) w = fork;
    }
  }
  return w;
}

/* ---- Convert the tree → React Flow nodes + edges with computed positions.
 * `ctx` carries the callbacks the nodes/edges fire (add/delete/move). ---- */
function buildGraph(trigger, steps, selectedId, ctx, exec = { execMode: false, execMap: {} }) {
  const nodes = [];
  const edges = [];
  let endSeq = 0;
  const { execMode, execMap } = exec;

  const link = (sourceId, sourceHandle, targetId, path, index) => {
    // In execution view, light up an edge only if its source ran AND (for a
    // condition) the recorded branch matches this handle, and it leads to a
    // node that also ran (or to an End cap on the taken path).
    let executed = false;
    if (execMode && execMap[sourceId]) {
      const tgtRan = !!execMap[targetId] || String(targetId).startsWith("end-");
      executed = (sourceHandle === "yes" || sourceHandle === "no")
        ? execMap[sourceId]?.branch === sourceHandle && tgtRan
        : tgtRan;
    }
    edges.push({
      id: `e-${sourceId}.${sourceHandle}-${targetId}`,
      source: sourceId, sourceHandle,
      target: targetId, targetHandle: "in",
      type: "add",
      animated: executed,
      data: { onAdd: () => ctx.onAdd(path, index), execMode, executed },
    });
  };

  function place(list, path, centerX, startY, parentId, parentHandle) {
    let y = startY;
    let prevId = parentId, prevHandle = parentHandle;

    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      const branch = isBranchType(node.type);
      nodes.push({
        id: node.id,
        type: branch ? "condition" : "step",
        position: { x: centerX - NODE_W / 2, y },
        selected: node.id === selectedId,
        data: {
          node,
          selected: node.id === selectedId,
          index: i,
          count: list.length,
          execMode,
          exec: execMap[node.id],
          onDelete: () => ctx.onDelete(node.id),
          onMove: (dir) => ctx.onMove(path, i, dir),
        },
      });
      link(prevId, prevHandle, node.id, path, i);

      if (branch) {
        const half = Math.max(subtreeWidth(node.yes), subtreeWidth(node.no), NODE_W);
        const childY = y + ROW_Y;
        place(node.yes || [], [...path, { id: node.id, branch: "yes" }], centerX - (half + H_GAP) / 2, childY, node.id, "yes");
        place(node.no  || [], [...path, { id: node.id, branch: "no"  }], centerX + (half + H_GAP) / 2, childY, node.id, "no");
        return; // a condition is terminal on its trunk — branches carry on
      }
      prevId = node.id; prevHandle = "out";
      y += ROW_Y;
    }

    // Trunk that doesn't end in a condition gets an End cap (with an append "+").
    const endId = `end-${parentId}.${parentHandle}.${endSeq++}`;
    nodes.push({ id: endId, type: "end", position: { x: centerX - 60, y }, data: {} });
    link(prevId, prevHandle, endId, path, list.length);
  }

  if (!trigger) {
    nodes.push({ id: "add-trigger", type: "addTrigger", position: { x: -NODE_W / 2, y: 0 }, data: { onAddTrigger: ctx.onAddTrigger } });
    return { nodes, edges };
  }

  nodes.push({
    id: trigger.id,
    type: "trigger",
    position: { x: -NODE_W / 2, y: 0 },
    selected: trigger.id === selectedId,
    data: { node: trigger, selected: trigger.id === selectedId, execMode, exec: execMap[trigger.id] },
  });
  place(steps, [], 0, ROW_Y, trigger.id, "out");
  return { nodes, edges };
}

export default function AutopilotFlows() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("Untitled workflow");
  const [published, setPublished] = useState(false);
  const [trigger, setTrigger] = useState(null);   // single trigger node | null
  const [steps, setSteps] = useState([]);          // ordered nodes (tree)
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [picker, setPicker] = useState(null);      // { mode, path, index }
  const [search, setSearch] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [execCall, setExecCall] = useState(null); // a call whose run is overlaid on the canvas

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const flowWrapRef = useRef(null);

  // Start the view at the TOP, horizontally centered (the tree is centered on
  // canvas x=0), instead of fitView's vertical centering. Runs once on init.
  function onFlowInit(inst) {
    const w = flowWrapRef.current?.clientWidth || 900;
    inst.setViewport({ x: w / 2, y: 36, zoom: 0.75 });
  }

  // Load this autopilot's saved flow from the backend.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.autopilot.get(id)
      .then((res) => {
        if (!alive) return;
        setName(res.name || "Untitled workflow");
        setPublished(res.status === "active");
        setWebhookUrl(res.webhookUrl || "");
        setTrigger(res.config?.trigger || null);
        setSteps(Array.isArray(res.config?.steps) ? res.config.steps : []);
      })
      .catch(() => {
        if (!alive) return;
        notify.error("Could not load this autopilot");
        navigate("/autopilot/flows");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, navigate]);

  // ---- tree mutations (functional updates → stable, no stale closures) ----
  function patchNode(nodeId, patch) {
    if (trigger?.id === nodeId) { setTrigger((t) => ({ ...t, ...patch })); return; }
    setSteps((list) => mapTree(list, nodeId, (n) => ({ ...n, ...patch })));
  }
  function patchConfig(nodeId, key, value) {
    if (trigger?.id === nodeId) { setTrigger((t) => ({ ...t, config: { ...t.config, [key]: value } })); return; }
    setSteps((list) => mapTree(list, nodeId, (n) => ({ ...n, config: { ...n.config, [key]: value } })));
  }
  function openTriggerPicker() { setPicker({ mode: "trigger" }); setSearch(""); }
  function openActionPicker(path, index) { setPicker({ mode: "action", path, index }); setSearch(""); }
  function chooseFromPicker(type) {
    const node = makeNode(type);
    if (picker?.mode === "trigger") {
      setTrigger(node);
    } else {
      const path = picker?.path || [];
      const at = picker?.index ?? 0;
      setSteps((list) => updateList(list, path, (l) => { const next = [...l]; next.splice(at, 0, node); return next; }));
    }
    setSelectedId(node.id);
    setPicker(null);
    setSearch("");
  }
  function removeNode(nodeId) {
    setTrigger((t) => (t?.id === nodeId ? null : t));
    setSteps((list) => filterTree(list, nodeId));
    setSelectedId((cur) => (cur === nodeId ? null : cur));
  }
  function moveStep(path, index, dir) {
    setSteps((list) => updateList(list, path, (l) => {
      const target = index + dir;
      if (target < 0 || target >= l.length) return l;
      const next = [...l];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    }));
  }

  // Re-layout into React Flow whenever the tree (or selection) changes. RF owns
  // its own node/edge state (so it can measure + animate); we push fresh layout.
  useEffect(() => {
    const ctx = { onDelete: removeNode, onMove: moveStep, onAdd: openActionPicker, onAddTrigger: openTriggerPicker };
    const execMap = {};
    if (execCall) for (const s of execCall.steps || []) if (s.nodeId) execMap[s.nodeId] = s;
    const g = buildGraph(trigger, steps, selectedId, ctx, { execMode: !!execCall, execMap });
    setRfNodes(g.nodes);
    setRfEdges(g.edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, steps, selectedId, execCall]);

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    if (trigger?.id === selectedId) return trigger;
    return findInTree(steps, selectedId);
  }, [selectedId, trigger, steps]);

  // The execution step for the selected node (only meaningful in execution view).
  const execStep = useMemo(
    () => (execCall && selectedId ? (execCall.steps || []).find((s) => s.nodeId === selectedId) : null),
    [execCall, selectedId],
  );

  async function persist() {
    setSaving(true);
    try {
      await api.autopilot.update(id, {
        name,
        status: published ? "active" : "disabled",
        config: { trigger, steps },
      });
      notify.success("Workflow saved");
    } catch (err) {
      notify.error(err.message || "Failed to save");
    } finally { setSaving(false); }
  }

  const pickerItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pool = CATALOG.filter((c) =>
      picker?.mode === "trigger" ? isTriggerType(c.type) : !isTriggerType(c.type),
    );
    const filtered = q ? pool.filter((c) => (c.title + " " + c.desc).toLowerCase().includes(q)) : pool;
    return filtered.reduce((acc, c) => { (acc[c.group] = acc[c.group] || []).push(c); return acc; }, {});
  }, [picker, search]);

  function onNodeClick(_e, n) {
    if (n.type === "addTrigger") openTriggerPicker();
    else if (n.type !== "end") setSelectedId(n.id);
  }

  if (loading) {
    return (
      <div className="content-pad">
        <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading workflow…</div>
      </div>
    );
  }

  return (
    <div className="content-pad" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* ---------------- Toolbar ---------------- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <Link to="/autopilot/flows" className="icon-btn" title="Back to all workflows" style={{ color: "#475569" }}>
          <FiArrowLeft />
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Workflow name"
          style={{
            fontSize: 18, fontWeight: 700, border: "1px solid transparent", background: "transparent",
            padding: "6px 10px", borderRadius: 8, minWidth: 200, flex: "0 1 320px", color: "#0f172a",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid var(--border)")}
          onBlur={(e) => (e.target.style.border = "1px solid transparent")}
        />

        <div style={{ flex: 1 }} />

        {/* Draft / Published segmented toggle */}
        <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 999, overflow: "hidden", background: "white" }}>
          {[{ k: false, label: "Draft" }, { k: true, label: "Published" }].map(({ k, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPublished(k)}
              style={{
                border: "none", padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: published === k ? (k ? "#10b981" : "#f1f5f9") : "transparent",
                color: published === k ? (k ? "white" : "#0f172a") : "#64748b",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="btn btn-outline" type="button" onClick={() => setShowLogs(true)}>
          <FiActivity style={{ marginRight: 6 }} /> Logs
        </button>
        <button className="btn btn-primary" type="button" onClick={persist} disabled={saving}>
          <FiSave style={{ marginRight: 6 }} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ---------------- Webhook URL bar ---------------- */}
      {webhookUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.4, flexShrink: 0 }}>Webhook URL</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontFamily: "monospace", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{webhookUrl}</span>
          <span style={{ fontSize: 11.5, color: "#94a3b8", flexShrink: 0 }}>{published ? "live" : "draft — publish to activate"}</span>
          <button className="icon-btn" type="button" title="Copy webhook URL" onClick={() => { navigator.clipboard.writeText(webhookUrl); notify.success("Webhook URL copied"); }} style={{ color: "#7c3aed", flexShrink: 0 }}>
            <FiCopy size={16} />
          </button>
        </div>
      )}

      {/* ---------------- Execution-view banner ---------------- */}
      {execCall && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
          <FiActivity style={{ color: "#059669", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#065f46", flex: 1, minWidth: 0 }}>
            Viewing execution · {fmtTime(execCall.ts)} · {(execCall.steps || []).length} node(s) ran
            {(execCall.steps || []).some((s) => s.status === "error") ? " · has errors" : ""}
          </span>
          <button className="btn btn-outline" type="button" onClick={() => { setExecCall(null); setSelectedId(null); }} style={{ padding: "5px 12px", fontSize: 13, flexShrink: 0 }}>
            <FiX style={{ marginRight: 5 }} /> Exit execution view
          </button>
        </div>
      )}

      {/* ---------------- React Flow canvas ----------------
          NOTE: a real height is required — React Flow has no intrinsic size.
          Don't use flex:1 here; in a flex-column with no definite height it
          collapses to 0 (flex-basis 0%) and the canvas renders blank. */}
      <div ref={flowWrapRef} className="card" style={{ height: "calc(100vh - 240px)", minHeight: 520, padding: 0, overflow: "hidden" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedId(null)}
          onInit={onFlowInit}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          minZoom={0.2}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant="dots" gap={22} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeColor={miniColor} nodeStrokeWidth={2} style={{ background: "#f8fafc" }} />
        </ReactFlow>
      </div>

      {/* ---------------- Config drawer (edit mode) ---------------- */}
      {selectedNode && !execCall && (
        <ConfigDrawer
          node={selectedNode}
          onClose={() => setSelectedId(null)}
          onTitle={(v) => patchNode(selectedNode.id, { title: v })}
          onField={(k, v) => patchConfig(selectedNode.id, k, v)}
          onDelete={() => removeNode(selectedNode.id)}
        />
      )}

      {/* ---------------- Execution detail drawer (execution view) ---------------- */}
      {selectedNode && execCall && (
        <ExecNodeDrawer
          node={selectedNode}
          step={execStep}
          call={execCall}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ---------------- Action / trigger picker ---------------- */}
      {picker && (
        <Picker
          mode={picker.mode}
          groups={pickerItems}
          search={search}
          setSearch={setSearch}
          onPick={chooseFromPicker}
          onClose={() => { setPicker(null); setSearch(""); }}
        />
      )}

      {/* ---------------- Webhook call logs ---------------- */}
      {showLogs && (
        <LogsModal
          currentId={id}
          onClose={() => setShowLogs(false)}
          onViewInFlow={(call) => { setExecCall(call); setSelectedId(null); setShowLogs(false); }}
        />
      )}
    </div>
  );
}

/* ============================ React Flow pieces ============================ */

const miniColor = (n) => {
  if (n.type === "end" || n.type === "addTrigger") return "#cbd5e1";
  const node = n.data?.node;
  return node ? (KIND[metaFor(node.type).kind]?.color || "#94a3b8") : "#94a3b8";
};

const handleStyle = { width: 8, height: 8, background: "#94a3b8", border: "2px solid white" };

function cardStyle(node, selected) {
  const k = KIND[metaFor(node.type).kind] || KIND.developer;
  return {
    width: NODE_W, borderRadius: 14, background: "white", position: "relative", cursor: "pointer",
    border: `2px solid ${selected ? k.color : "var(--border)"}`,
    boxShadow: selected ? `0 10px 24px ${k.color}22` : "0 2px 10px rgba(15,23,42,0.06)",
  };
}

// Card style with execution overlay: dim un-run nodes, ring + color the ones
// that ran (by status), when viewing a recorded execution.
function execCardStyle(node, data) {
  const base = cardStyle(node, data.selected);
  if (!data.execMode) return base;
  if (!data.exec) return { ...base, opacity: 0.4 };
  const st = STEP_STATUS[data.exec.status] || STEP_STATUS.logged;
  return { ...base, border: `2px solid ${st.c}`, boxShadow: `0 0 0 3px ${st.bg}` };
}
function ExecBadge({ exec }) {
  if (!exec) return null;
  const st = STEP_STATUS[exec.status] || STEP_STATUS.logged;
  return (
    <span style={{
      position: "absolute", top: -10, right: -6, fontSize: 9, fontWeight: 800, textTransform: "uppercase",
      letterSpacing: 0.3, color: st.c, background: st.bg, border: "1px solid white", borderRadius: 999,
      padding: "2px 7px", pointerEvents: "none", whiteSpace: "nowrap",
    }}>{st.label}</span>
  );
}

function CardInner({ node, badge, controls }) {
  const meta = metaFor(node.type);
  const k = KIND[meta.kind] || KIND.developer;
  const Icon = meta.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {badge && (
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: k.color, background: k.bg, padding: "2px 7px", borderRadius: 6 }}>{badge}</span>
          )}
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{node.title}</div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{summarize(node)}</div>
      </div>
      {controls && (
        <div className="nodrag" style={{ display: "flex", gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {controls}
        </div>
      )}
    </div>
  );
}

function StepControls({ index, count, onDelete, onMove }) {
  return (
    <>
      <button className="icon-btn nodrag" type="button" title="Move up" disabled={index === 0} onClick={() => onMove(-1)} style={{ color: "#94a3b8" }}><FiChevronUp size={14} /></button>
      <button className="icon-btn nodrag" type="button" title="Move down" disabled={index === count - 1} onClick={() => onMove(1)} style={{ color: "#94a3b8" }}><FiChevronDown size={14} /></button>
      <button className="icon-btn nodrag" type="button" title="Delete" onClick={onDelete} style={{ color: "#ef4444" }}><FiTrash2 size={14} /></button>
    </>
  );
}

function TriggerNode({ data }) {
  return (
    <div style={execCardStyle(data.node, data)}>
      <ExecBadge exec={data.exec} />
      <CardInner node={data.node} badge="Trigger" />
      <Handle type="source" position={Position.Bottom} id="out" style={handleStyle} />
    </div>
  );
}

function StepNode({ data }) {
  return (
    <div style={execCardStyle(data.node, data)}>
      <ExecBadge exec={data.exec} />
      <Handle type="target" position={Position.Top} id="in" style={handleStyle} />
      <CardInner node={data.node} controls={data.execMode ? null : <StepControls index={data.index} count={data.count} onDelete={data.onDelete} onMove={data.onMove} />} />
      <Handle type="source" position={Position.Bottom} id="out" style={handleStyle} />
    </div>
  );
}

function ConditionNode({ data }) {
  return (
    <div style={execCardStyle(data.node, data)}>
      <ExecBadge exec={data.exec} />
      <Handle type="target" position={Position.Top} id="in" style={handleStyle} />
      <CardInner node={data.node} controls={data.execMode ? null : <StepControls index={data.index} count={data.count} onDelete={data.onDelete} onMove={data.onMove} />} />
      <Handle type="source" position={Position.Bottom} id="yes" style={{ ...handleStyle, left: "28%", background: "#10b981" }} />
      <Handle type="source" position={Position.Bottom} id="no"  style={{ ...handleStyle, left: "72%", background: "#ef4444" }} />
      <span style={branchTag("#10b981", "#dcfce7", "28%")}>Yes</span>
      <span style={branchTag("#ef4444", "#fee2e2", "72%")}>No</span>
    </div>
  );
}
function branchTag(color, bg, left) {
  return {
    position: "absolute", bottom: -24, left, transform: "translateX(-50%)",
    fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase",
    color, background: bg, padding: "2px 9px", borderRadius: 999, pointerEvents: "none",
  };
}

function EndNode() {
  return (
    <div style={{
      position: "relative", width: 120, padding: "8px 0", borderRadius: 999, textAlign: "center",
      border: "1px solid var(--border)", background: "white", color: "#94a3b8",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
    }}>
      <Handle type="target" position={Position.Top} id="in" style={handleStyle} />
      End
    </div>
  );
}

function AddTriggerNode({ data }) {
  return (
    <button
      type="button"
      onClick={data.onAddTrigger}
      style={{
        width: NODE_W, padding: "20px 18px", borderRadius: 14, cursor: "pointer",
        border: "2px dashed #c4b5fd", background: "#faf5ff", color: "#7c3aed",
        fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      <FiZap /> Add a trigger to start
    </button>
  );
}

// Smoothstep edge with a "+" insert button at its midpoint.
function AddEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 14,
  });
  const execMode = data?.execMode;
  const executed = data?.executed;
  const stroke = execMode ? (executed ? "#10b981" : "#e2e8f0") : "#cbd5e1";
  const strokeWidth = execMode ? (executed ? 2.5 : 1.5) : 2;
  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke, strokeWidth }} />
      {!execMode && (
        <EdgeLabelRenderer>
          <button
            className="nodrag nopan"
            type="button"
            title="Add step"
            onClick={(e) => { e.stopPropagation(); data?.onAdd?.(); }}
            style={{
              position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all", width: 26, height: 26, borderRadius: "50%",
              border: "2px solid #7c3aed", background: "white", color: "#7c3aed",
              display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(124,58,237,0.25)",
            }}
          >
            <FiPlus size={14} />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Stable references (React Flow warns if these are recreated each render).
const NODE_TYPES = { trigger: TriggerNode, step: StepNode, condition: ConditionNode, end: EndNode, addTrigger: AddTriggerNode };
const EDGE_TYPES = { add: AddEdge };

/* --------------------------- Config drawer --------------------------- */
function ConfigDrawer({ node, onClose, onTitle, onField, onDelete }) {
  const meta = metaFor(node.type);
  const k = KIND[meta.kind] || KIND.developer;
  const Icon = meta.icon;
  const [senders, setSenders] = useState([]);
  const needsSenders = meta.fields.some((f) => f.type === "emailSender");
  useEffect(() => {
    if (!needsSenders) return;
    emailApi.config().then((r) => setSenders(r.config?.senders || [])).catch(() => {});
  }, [needsSenders]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.28)", zIndex: 60 }} />
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 92vw)", background: "white",
          zIndex: 61, boxShadow: "-12px 0 32px rgba(15,23,42,0.18)", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 18, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: "grid", placeItems: "center" }}>
            <Icon size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{isTriggerType(node.type) ? "Trigger" : "Action"}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{meta.title}</div>
          </div>
          <button className="btn btn-ghost" type="button" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gap: 14 }}>
          <div className="form-group">
            <label>Step name</label>
            <input value={node.title} onChange={(e) => onTitle(e.target.value)} placeholder="Step name" />
          </div>

          {meta.fields.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No configuration required for this step.</div>
          ) : (
            meta.fields.map((field) => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                {field.type === "mapping" ? (
                  <MappingEditor
                    rows={Array.isArray(node.config[field.key]) ? node.config[field.key] : []}
                    onChange={(rows) => onField(field.key, rows)}
                  />
                ) : field.type === "textarea" ? (
                  <textarea rows={4} value={node.config[field.key] || ""} placeholder={field.placeholder}
                    onChange={(e) => onField(field.key, e.target.value)} />
                ) : field.type === "select" ? (
                  <select value={node.config[field.key] || ""} onChange={(e) => onField(field.key, e.target.value)}>
                    {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === "emailSender" ? (
                  senders.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      No sender profiles — add one under <Link to="/email/config" style={{ color: "var(--primary)" }}>Email → Config</Link>. Your default domain sender will be used.
                    </div>
                  ) : (
                    <select value={node.config[field.key] || ""} onChange={(e) => onField(field.key, e.target.value)}>
                      <option value="">Default sender</option>
                      {senders.map((s) => (
                        <option key={s._id} value={s._id}>{s.name ? `${s.name} <${s.email}>` : s.email}{s.isDefault ? " — default" : ""}</option>
                      ))}
                    </select>
                  )
                ) : (
                  <input type={field.type === "number" ? "number" : "text"} value={node.config[field.key] || ""} placeholder={field.placeholder}
                    onChange={(e) => onField(field.key, e.target.value)} />
                )}
                {field.hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.4 }}>{field.hint}</div>}
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-outline" type="button" onClick={onDelete} style={{ width: "100%", color: "#ef4444", borderColor: "#fecaca" }}>
            <FiTrash2 style={{ marginRight: 6 }} /> Delete this step
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------------- Execution detail drawer (read-only) ----------------
 * Shown when a node is clicked while viewing a recorded execution. Tells you
 * exactly what that node saw: its status, the input payload, the output/
 * response it produced, plus the original request (body / query / headers). */
function ExecNodeDrawer({ node, step, call, onClose }) {
  const meta = metaFor(node.type);
  const k = KIND[meta.kind] || KIND.developer;
  const Icon = meta.icon;
  const st = step ? (STEP_STATUS[step.status] || STEP_STATUS.logged) : null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.28)", zIndex: 60 }} />
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 94vw)", background: "white",
          zIndex: 61, boxShadow: "-12px 0 32px rgba(15,23,42,0.18)", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 18, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: "grid", placeItems: "center" }}>
            <Icon size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Execution · {fmtTime(call.ts)}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{node.title || meta.title}</div>
          </div>
          {st && (
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: st.c, background: st.bg, borderRadius: 6, padding: "3px 9px", flexShrink: 0 }}>{st.label}</span>
          )}
          <button className="btn btn-ghost" type="button" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gap: 14 }}>
          {!step ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              This node <strong>did not run</strong> in this execution (the flow took a different branch or stopped earlier).
            </div>
          ) : (
            <>
              {step.message && (
                <div style={{ fontSize: 13, color: "#334155", background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px" }}>
                  {step.message}
                  {step.branch && <span style={{ marginLeft: 6, fontWeight: 800, textTransform: "uppercase", color: step.branch === "yes" ? "#10b981" : "#ef4444" }}>→ {step.branch}</span>}
                </div>
              )}
              <JsonBlock label="Input payload (what this node saw)" data={step.input} />
              <JsonBlock label="Output / response" data={step.output} />
            </>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#7c3aed" }}>Original request</div>
            <JsonBlock label="Body" data={call.body} />
            <JsonBlock label="Params (query)" data={call.query} />
            <JsonBlock label="Headers" data={call.headers} />
          </div>
        </div>
      </aside>
    </>
  );
}

/* --------------------------- Mapping editor --------------------------- */
function MappingEditor({ rows, onChange }) {
  const list = rows.length ? rows : [{ from: "", to: "" }];
  const update = (i, key, value) => onChange(list.map((r, ix) => (ix === i ? { ...r, [key]: value } : r)));
  const add = () => onChange([...list, { from: "", to: "" }]);
  const remove = (i) => { const next = list.filter((_, ix) => ix !== i); onChange(next.length ? next : [{ from: "", to: "" }]); };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr 28px", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 }}>
        <span>Incoming field</span>
        <span />
        <span>Save as</span>
        <span />
      </div>
      {list.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr 28px", gap: 6, alignItems: "center" }}>
          <input value={row.from || ""} placeholder="email_address" onChange={(e) => update(i, "from", e.target.value)} />
          <FiArrowRight style={{ color: "#94a3b8" }} />
          <input value={row.to || ""} placeholder="email" onChange={(e) => update(i, "to", e.target.value)} />
          <button className="icon-btn" type="button" title="Remove mapping" onClick={() => remove(i)} style={{ color: "#ef4444" }}>
            <FiX size={15} />
          </button>
        </div>
      ))}
      <button className="btn btn-outline" type="button" onClick={add} style={{ justifySelf: "start", padding: "6px 12px", fontSize: 13 }}>
        <FiPlus style={{ marginRight: 6 }} /> Add mapping
      </button>
    </div>
  );
}

/* ------------------------------ Picker ------------------------------ */
function Picker({ mode, groups, search, setSearch, onPick, onClose }) {
  const empty = Object.keys(groups).length === 0;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 70 }} />
      <div
        role="dialog"
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 71,
          width: "min(620px, 94vw)", maxHeight: "82vh", background: "white", borderRadius: 18,
          boxShadow: "0 24px 60px rgba(15,23,42,0.32)", display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{mode === "trigger" ? "Choose a trigger" : "Add an action"}</h3>
            <button className="btn btn-ghost" type="button" onClick={onClose}><FiX /></button>
          </div>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={mode === "trigger" ? "Search triggers…" : "Search actions…"}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid var(--border)" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {empty ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>No matches for “{search}”.</div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#94a3b8", marginBottom: 10 }}>{group}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {items.map((c) => {
                    const k = KIND[c.kind] || KIND.developer;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.type}
                        type="button"
                        onClick={() => onPick(c.type)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 11, padding: 12, borderRadius: 12, textAlign: "left",
                          border: "1px solid var(--border)", background: "white", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = k.color; e.currentTarget.style.background = k.bg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "white"; }}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: k.bg, color: k.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <Icon size={17} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{c.title}</div>
                          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.35 }}>{c.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------ Logs ------------------------------- */
function fmtTime(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}

function LogsModal({ onClose, currentId, onViewInFlow }) {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(currentId || null);
  const [detail, setDetail] = useState(null);       // { id, name, callCount, lastCalledAt, calls }
  const [openIdx, setOpenIdx] = useState(null);

  const detailLoading = !!selectedId && detail?.id !== selectedId;

  useEffect(() => {
    let alive = true;
    api.autopilot.list()
      .then((res) => {
        if (!alive) return;
        const list = res.autopilots || res || [];
        setHooks(list);
        setSelectedId((cur) => cur || list[0]?.id || null);
      })
      .catch(() => alive && setHooks([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    api.autopilot.logs(selectedId)
      .then((res) => { if (alive) { setDetail(res); setOpenIdx(null); } })
      .catch(() => alive && setDetail(null));
    return () => { alive = false; };
  }, [selectedId]);

  async function clearLogs() {
    if (!selectedId || !confirm("Clear stored call logs for this webhook?")) return;
    try {
      await api.autopilot.clearLogs(selectedId);
      setDetail((d) => (d ? { ...d, calls: [] } : d));
      setOpenIdx(null);
      notify.success("Logs cleared");
    } catch (err) { notify.error(err.message || "Failed to clear logs"); }
  }

  const calls = detail?.calls || [];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 70 }} />
      <div
        role="dialog"
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 71,
          width: "min(860px, 95vw)", height: "min(640px, 90vh)", background: "white", borderRadius: 18,
          boxShadow: "0 24px 60px rgba(15,23,42,0.32)", display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><FiActivity /> Webhook call logs</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}><FiX /></button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : hooks.length === 0 ? (
          <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>No webhooks yet</div>
              <div>Create an Autopilot webhook on the Overview page, then call it to see logs here.</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 0 }}>
            <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto", padding: 10 }}>
              {hooks.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedId(h.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, marginBottom: 6, cursor: "pointer",
                    border: "1px solid " + (selectedId === h.id ? "#7c3aed" : "transparent"),
                    background: selectedId === h.id ? "#f5f3ff" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}
                >
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: 13.5, color: "#0f172a" }}>{h.name || "Autopilot hook"}</span>
                  <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#ede9fe", borderRadius: 999, padding: "2px 9px" }}>{h.callCount || 0}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#475569" }}>
                  Called <strong style={{ color: "#0f172a" }}>{detail?.callCount ?? 0}</strong> time{(detail?.callCount ?? 0) === 1 ? "" : "s"}
                  {detail?.lastCalledAt && <span> · last {fmtTime(detail.lastCalledAt)}</span>}
                </div>
                <button className="btn btn-ghost" type="button" onClick={clearLogs} disabled={!calls.length} style={{ color: "#ef4444", fontSize: 13 }}>
                  <FiTrash2 style={{ marginRight: 5 }} /> Clear
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {detailLoading ? (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--text-muted)" }}>Loading…</div>
                ) : calls.length === 0 ? (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No calls recorded yet</div>
                      <div>Trigger the webhook (POST or GET) and refresh to see what arrived.</div>
                    </div>
                  </div>
                ) : (
                  calls.map((call, i) => (
                    <CallRow
                      key={i}
                      call={call}
                      open={openIdx === i}
                      onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                      onViewInFlow={selectedId === currentId ? () => onViewInFlow?.(call) : null}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const METHOD_COLOR = { GET: "#0ea5e9", POST: "#10b981", PUT: "#f59e0b", DELETE: "#ef4444" };
const STEP_STATUS = {
  ok:      { c: "#047857", bg: "#dcfce7", label: "OK" },
  error:   { c: "#b91c1c", bg: "#fee2e2", label: "Error" },
  skipped: { c: "#64748b", bg: "#f1f5f9", label: "Skipped" },
  logged:  { c: "#0369a1", bg: "#e0f2fe", label: "Logged" },
};

function CallRow({ call, open, onToggle, onViewInFlow }) {
  const color = METHOD_COLOR[call.method] || "#64748b";
  const steps = call.steps || [];
  const [tab, setTab] = useState("request");
  const failed = steps.filter((s) => s.status === "error").length;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: open ? "#f8fafc" : "white", cursor: "pointer", border: "none", textAlign: "left" }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color, background: color + "1a", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>{call.method || "POST"}</span>
        <span style={{ fontSize: 13, color: "#0f172a", flex: 1 }}>{fmtTime(call.ts)}</span>
        {steps.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: failed ? "#b91c1c" : "#0369a1", background: failed ? "#fee2e2" : "#e0f2fe", borderRadius: 999, padding: "2px 8px" }}>
            {failed ? `${failed} failed` : `${steps.length} node${steps.length === 1 ? "" : "s"}`}
          </span>
        )}
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{call.ip || ""}</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {/* tabs */}
          <div style={{ display: "flex", gap: 4, padding: "8px 12px 0" }}>
            {[{ k: "request", label: "Request" }, { k: "execution", label: `Execution log${steps.length ? ` (${steps.length})` : ""}` }].map(({ k, label }) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                style={{
                  border: "none", background: "transparent", cursor: "pointer", padding: "6px 10px",
                  fontSize: 12.5, fontWeight: 700, borderRadius: 8,
                  color: tab === k ? "#7c3aed" : "#64748b",
                  borderBottom: tab === k ? "2px solid #7c3aed" : "2px solid transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "request" ? (
            <div style={{ padding: 12, display: "grid", gap: 12 }}>
              <JsonBlock label="Params (query)" data={call.query} />
              <JsonBlock label="Body" data={call.body} />
              <JsonBlock label="Headers" data={call.headers} />
            </div>
          ) : (
            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              {steps.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic", padding: "8px 0" }}>
                  No execution recorded for this call (the workflow had no steps, or this call predates execution tracing).
                </div>
              ) : (
                <>
                  {onViewInFlow && (
                    <button
                      type="button"
                      onClick={onViewInFlow}
                      className="btn btn-outline"
                      style={{ justifySelf: "start", padding: "6px 12px", fontSize: 13, color: "#7c3aed", borderColor: "#ddd6fe" }}
                    >
                      <FiGitBranch style={{ marginRight: 6 }} /> View on canvas
                    </button>
                  )}
                  {steps.map((s, i) => <StepTrace key={i} step={s} index={i} />)}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepTrace({ step, index }) {
  const [open, setOpen] = useState(false);
  const st = STEP_STATUS[step.status] || STEP_STATUS.logged;
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: open ? "#f8fafc" : "white", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", flexShrink: 0 }}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {step.title || step.type}
            {step.branch && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: step.branch === "yes" ? "#10b981" : "#ef4444" }}>{step.branch}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{step.message || step.type}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: st.c, background: st.bg, borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>{st.label}</span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {open && (
        <div style={{ padding: 11, borderTop: "1px solid var(--border)", display: "grid", gap: 10 }}>
          <JsonBlock label="Input payload" data={step.input} />
          <JsonBlock label="Output / response" data={step.output} />
        </div>
      )}
    </div>
  );
}

function JsonBlock({ label, data }) {
  const empty = !data || (typeof data === "object" && Object.keys(data).length === 0);
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {empty ? (
        <div style={{ fontSize: 12.5, color: "#cbd5e1", fontStyle: "italic" }}>empty</div>
      ) : (
        <pre style={{
          margin: 0, padding: 12, borderRadius: 10, background: "#0f172a", color: "#e2e8f0",
          fontSize: 12, lineHeight: 1.5, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

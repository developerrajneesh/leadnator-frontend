// Maps an email "drip" (a linear sequence) to/from a LeadFlow's node/edge graph
// so it runs on the existing flowRunner engine. Email flows are marked with
// `trigger.config.kind === "email"` so the email automation page lists only them.

export const TRIGGERS = [
  { type: "trigger.new_lead",       label: "New lead is added" },
  { type: "trigger.status_changed", label: "Lead status changes" },
  { type: "trigger.tag_added",      label: "Tag is added to a lead" },
];

export const WAIT_UNITS = [
  { value: "",        label: "Send immediately" },
  { value: "minutes", label: "Minutes" },
  { value: "hours",   label: "Hours" },
  { value: "days",    label: "Days" },
];

export function blankStep() {
  return { waitValue: 0, waitUnit: "", senderId: "", templateId: "", subject: "", body: "" };
}

export function blankForm() {
  return {
    name: "",
    status: "draft",
    trigger: { type: "trigger.new_lead", status: "", tag: "" },
    steps: [blankStep()],
  };
}

function triggerTitle(trigger) {
  const t = TRIGGERS.find((x) => x.type === trigger.type);
  return t ? t.label : "Trigger";
}

// Build LeadFlow { name, nodes, edges } from the drip form.
export function compile(form) {
  const { name, trigger, steps } = form;
  const nodes = [];
  const edges = [];
  let x = 80;

  nodes.push({
    id: "trigger",
    type: trigger.type,
    title: triggerTitle(trigger),
    x, y: 120,
    config: {
      kind: "email",
      ...(trigger.type === "trigger.status_changed" ? { status: trigger.status || "" } : {}),
      ...(trigger.type === "trigger.tag_added" ? { tag: trigger.tag || "" } : {}),
      // Stash the structured form so the editor round-trips exactly.
      emailFlow: { trigger, steps },
    },
  });

  let prev = "trigger";
  steps.forEach((s, i) => {
    x += 240;
    const waitVal = Number(s.waitValue || 0);
    if (waitVal > 0 && s.waitUnit) {
      const wid = `wait${i}`;
      nodes.push({
        id: wid, type: `wait.${s.waitUnit}`, title: `Wait ${waitVal} ${s.waitUnit}`,
        x, y: 120, config: { [s.waitUnit]: waitVal },
      });
      edges.push({ id: `e_${prev}_${wid}`, fromNode: prev, fromPort: "out", toNode: wid });
      prev = wid;
      x += 220;
    }
    const sid = `send${i}`;
    nodes.push({
      id: sid, type: "action.send_message", title: "Send email",
      x, y: 120,
      config: {
        channels: ["email"],
        senderId: s.senderId || "",
        templateId: s.templateId || "",
        subject: s.subject || "",
        body: s.body || "",
      },
    });
    edges.push({ id: `e_${prev}_${sid}`, fromNode: prev, fromPort: "out", toNode: sid });
    prev = sid;
  });

  return { name, nodes, edges };
}

// Rebuild the drip form from a saved LeadFlow (prefers the stashed form).
export function decompile(flow) {
  const trig = (flow.nodes || []).find((n) => n.type?.startsWith("trigger."));
  const stored = trig?.config?.emailFlow;
  if (stored?.trigger && Array.isArray(stored?.steps)) {
    return {
      name: flow.name || "",
      status: flow.status || "draft",
      trigger: { type: "trigger.new_lead", status: "", tag: "", ...stored.trigger },
      steps: stored.steps.length ? stored.steps.map((s) => ({ ...blankStep(), ...s })) : [blankStep()],
    };
  }
  // Fallback: walk the linear chain from the trigger.
  const form = blankForm();
  form.name = flow.name || "";
  form.status = flow.status || "draft";
  if (trig) {
    form.trigger = { type: trig.type, status: trig.config?.status || "", tag: trig.config?.tag || "" };
  }
  const byId = Object.fromEntries((flow.nodes || []).map((n) => [n.id, n]));
  const nextOf = (id) => (flow.edges || []).find((e) => e.fromNode === id)?.toNode;
  const steps = [];
  let cur = trig ? nextOf(trig.id) : null;
  let pendingWait = null;
  const guard = new Set();
  while (cur && byId[cur] && !guard.has(cur)) {
    guard.add(cur);
    const n = byId[cur];
    if (n.type?.startsWith("wait.")) {
      const unit = n.type.split(".")[1];
      pendingWait = { waitUnit: unit, waitValue: Number(n.config?.[unit] || 0) };
    } else if (n.type === "action.send_message") {
      steps.push({
        ...blankStep(),
        ...(pendingWait || {}),
        senderId: n.config?.senderId || "",
        templateId: n.config?.templateId || "",
        subject: n.config?.subject || "",
        body: n.config?.body || "",
      });
      pendingWait = null;
    }
    cur = nextOf(cur);
  }
  if (steps.length) form.steps = steps;
  return form;
}

// Is this LeadFlow an email drip (vs a WhatsApp/graph flow)?
export function isEmailFlow(flow) {
  const trig = (flow.nodes || []).find((n) => n.type?.startsWith("trigger."));
  return trig?.config?.kind === "email";
}

// Short human summary of the drip for the list view.
export function summarize(flow) {
  const sends = (flow.nodes || []).filter((n) => n.type === "action.send_message").length;
  return `${sends} email${sends === 1 ? "" : "s"}`;
}

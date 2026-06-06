import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiZap } from "react-icons/fi";
import { igApi } from "../../api/instagram";

const ACTION_TYPES = [
  { id: "send_dm", label: "Send DM reply" },
  { id: "reply_comment", label: "Reply to comment" },
  { id: "add_tag", label: "Add lead tag" },
  { id: "wait", label: "Wait" },
];

export default function FlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [dmText, setDmText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    igApi.flow(id).then((r) => {
      setFlow(r.flow);
      const dm = r.flow?.nodes?.find((n) => n.type === "send_dm");
      const cm = r.flow?.nodes?.find((n) => n.type === "reply_comment");
      setDmText(dm?.config?.text || "");
      setCommentText(cm?.config?.text || "");
    }).catch(() => navigate("/instagram/automation"));
  }, [id]);

  async function save() {
    if (!flow) return;
    setSaving(true);
    const nodes = [
      { id: "trigger", type: flow.trigger || "dm.received", title: "Trigger", x: 40, y: 80, config: {} },
      { id: "action_dm", type: "send_dm", title: "Send DM", x: 280, y: 60, config: { text: dmText } },
      { id: "action_comment", type: "reply_comment", title: "Reply comment", x: 280, y: 180, config: { text: commentText } },
    ];
    const edges = [
      { id: "e1", fromNode: "trigger", fromPort: "out", toNode: "action_dm" },
    ];
    try {
      await igApi.updateFlow(id, { ...flow, nodes, edges });
      alert("Flow saved.");
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  if (!flow) return <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading flow…</p>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/instagram/automation")}>
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>{flow.name}</h1>
        <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={save} disabled={saving}>
          <FiSave /> {saving ? "Saving…" : "Save flow"}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title"><FiZap /> Trigger: {flow.trigger}</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          When this event fires, the actions below run automatically.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-title">{ACTION_TYPES[0].label}</div>
          <textarea
            rows={4}
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
            placeholder="Hi {{firstName}}! Thanks for your DM…"
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>
        <div className="card">
          <div className="card-title">{ACTION_TYPES[1].label}</div>
          <textarea
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Thanks for commenting! Check your DMs."
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>
      </div>
    </>
  );
}

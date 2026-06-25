import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiZap, FiMessageCircle, FiSend, FiTag, FiClock, FiImage } from "react-icons/fi";
import { igApi, igMediaPictureUrl } from "../../api/instagram";

const TRIGGERS = {
  "dm.received": "New DM received",
  "comment.new": "New comment on post",
  "story.mention": "Story mention",
  "keyword.dm": "DM contains keyword",
};

const MATCH_TYPES = {
  any: "Contains any keyword",
  all: "Contains all keywords",
  exact: "Exactly matches",
};

const DEFAULT_TRIGGER_CONFIG = {
  postScope: "all",        // "all" | "specific"
  mediaIds: [],            // selected post ids when postScope === "specific"
  keywords: "",            // comma-separated keyword filter
  matchType: "any",        // any | all | exact
};

const DEFAULT_ACTIONS = {
  reply_comment: { enabled: false, text: "" },
  private_reply: { enabled: false, text: "" },
  send_dm:       { enabled: false, text: "" },
  add_tag:       { enabled: false, tag: "" },
  wait:          { enabled: false, seconds: 0 },
};

export default function FlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [trigger, setTrigger] = useState("dm.received");
  const [tcfg, setTcfg] = useState(DEFAULT_TRIGGER_CONFIG);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    igApi.flow(id).then((r) => {
      const f = r.flow;
      setFlow(f);
      setTrigger(f.trigger || "dm.received");
      setTcfg({ ...DEFAULT_TRIGGER_CONFIG, ...(f.triggerConfig || {}) });

      // Hydrate action state from saved nodes.
      const next = JSON.parse(JSON.stringify(DEFAULT_ACTIONS));
      for (const n of f.nodes || []) {
        if (!next[n.type]) continue;
        next[n.type] = { ...next[n.type], enabled: true, ...(n.config || {}) };
      }
      setActions(next);
    }).catch(() => navigate("/instagram/automation"));
  }, [id]);

  // Load posts only when targeting specific posts on a comment trigger.
  useEffect(() => {
    if (trigger !== "comment.new" || tcfg.postScope !== "specific" || posts.length) return;
    setPostsLoading(true);
    igApi.media({ limit: 50 })
      .then((r) => setPosts(r.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [trigger, tcfg.postScope]);

  function setAction(type, patch) {
    setActions((a) => ({ ...a, [type]: { ...a[type], ...patch } }));
  }

  function toggleMedia(mediaId) {
    setTcfg((c) => {
      const has = c.mediaIds.includes(mediaId);
      return { ...c, mediaIds: has ? c.mediaIds.filter((m) => m !== mediaId) : [...c.mediaIds, mediaId] };
    });
  }

  async function save(silent = false) {
    if (!flow) return;
    setSaving(true);

    // Build nodes: trigger node + each enabled action node.
    const nodes = [
      { id: "trigger", type: trigger, title: TRIGGERS[trigger] || "Trigger", x: 40, y: 80, config: { ...tcfg } },
    ];
    const edges = [];
    let prev = "trigger";
    let y = 40;
    const commentOnly = ["reply_comment", "private_reply"];
    for (const [type, cfg] of Object.entries(actions)) {
      if (!cfg.enabled) continue;
      // Don't persist comment-specific actions on non-comment triggers (or vice versa).
      if (commentOnly.includes(type) && trigger !== "comment.new") continue;
      if (type === "send_dm" && trigger === "comment.new") continue;
      const { enabled, ...config } = cfg;
      const nodeId = `action_${type}`;
      nodes.push({ id: nodeId, type, title: type, x: 320, y, config });
      edges.push({ id: `e_${nodeId}`, fromNode: prev, fromPort: "out", toNode: nodeId });
      prev = nodeId;
      y += 110;
    }

    try {
      await igApi.updateFlow(id, { ...flow, trigger, triggerConfig: tcfg, nodes, edges });
      setFlow((f) => ({ ...f, trigger, triggerConfig: tcfg, nodes, edges }));
      if (!silent) alert("Flow saved.");
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      await save(true); // test runs against the saved flow
      const r = await igApi.testFlow(id, {
        text: testText,
        mediaId: tcfg.postScope === "specific" ? (tcfg.mediaIds[0] || "") : "",
        username: "tester",
      });
      setTestResult(r);
    } catch (err) { alert(err.message); }
    finally { setTesting(false); }
  }

  if (!flow) return <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading flow…</p>;

  const isComment = trigger === "comment.new";
  const isKeywordDm = trigger === "keyword.dm";
  const usesKeywords = isComment || isKeywordDm;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/instagram/automation")}>
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>{flow.name}</h1>
        <span className={`badge badge-${flow.status === "active" ? "green" : "gray"}`} style={{ marginLeft: 4 }}>{flow.status}</span>
        <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={save} disabled={saving}>
          <FiSave /> {saving ? "Saving…" : "Save flow"}
        </button>
      </div>

      {/* ---------- Trigger ---------- */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title"><FiZap /> Trigger — when should this run?</div>

        <div className="form-group" style={{ marginTop: 10 }}>
          <label>Event</label>
          <select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
            {Object.entries(TRIGGERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Comment-trigger: which posts */}
        {isComment && (
          <div className="form-group">
            <label>Which posts?</label>
            <div style={{ display: "flex", gap: 18, marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
                <input type="radio" name="postScope" checked={tcfg.postScope === "all"}
                  onChange={() => setTcfg((c) => ({ ...c, postScope: "all" }))} />
                All posts
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
                <input type="radio" name="postScope" checked={tcfg.postScope === "specific"}
                  onChange={() => setTcfg((c) => ({ ...c, postScope: "specific" }))} />
                Specific posts
              </label>
            </div>

            {tcfg.postScope === "specific" && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, maxHeight: 240, overflowY: "auto" }}>
                {postsLoading ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>Loading posts…</p>
                ) : posts.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}><FiImage /> No posts found.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                    {posts.map((p) => {
                      const sel = tcfg.mediaIds.includes(p.id);
                      return (
                        <button type="button" key={p.id} onClick={() => toggleMedia(p.id)}
                          style={{
                            textAlign: "left", padding: 6, borderRadius: 8, cursor: "pointer",
                            border: sel ? "2px solid var(--primary, #7c3aed)" : "1px solid var(--border)",
                            background: sel ? "rgba(124,58,237,0.06)" : "transparent",
                          }}>
                          <img src={igMediaPictureUrl(p.id)} alt="" loading="lazy"
                            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                            style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, background: "var(--border)" }} />
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.caption ? p.caption.slice(0, 40) : p.mediaType}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
                  {tcfg.mediaIds.length} post{tcfg.mediaIds.length === 1 ? "" : "s"} selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Keyword filter for comment + keyword.dm */}
        {usesKeywords && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>{isComment ? "Only when comment contains" : "Keywords"} {isComment && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>}</label>
              <input value={tcfg.keywords} onChange={(e) => setTcfg((c) => ({ ...c, keywords: e.target.value }))}
                placeholder="price, link, info" />
              <small style={{ color: "var(--text-muted)" }}>Comma-separated. Leave blank to match every {isComment ? "comment" : "DM"}.</small>
            </div>
            <div className="form-group">
              <label>Match</label>
              <select value={tcfg.matchType} onChange={(e) => setTcfg((c) => ({ ...c, matchType: e.target.value }))}>
                {Object.entries(MATCH_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        )}

        {trigger === "dm.received" && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Runs on every new DM from a user.</p>
        )}
        {trigger === "story.mention" && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Runs when someone mentions your account in their story.</p>
        )}
      </div>

      {/* ---------- Actions ---------- */}
      <div className="card-title" style={{ marginBottom: 10 }}>Actions — what should happen?</div>
      <div style={{ display: "grid", gap: 12 }}>

        {isComment && (
          <ActionCard icon={<FiMessageCircle />} title="Reply to the comment"
            enabled={actions.reply_comment.enabled}
            onToggle={(v) => setAction("reply_comment", { enabled: v })}>
            <textarea rows={3} value={actions.reply_comment.text}
              onChange={(e) => setAction("reply_comment", { text: e.target.value })}
              placeholder="Thanks for commenting! 🙌"
              style={{ width: "100%" }} />
          </ActionCard>
        )}

        {isComment && (
          <ActionCard icon={<FiSend />} title="Send a private DM to the commenter"
            enabled={actions.private_reply.enabled}
            onToggle={(v) => setAction("private_reply", { enabled: v })}>
            <textarea rows={3} value={actions.private_reply.text}
              onChange={(e) => setAction("private_reply", { text: e.target.value })}
              placeholder="Hey {{firstName}}, here's the link you asked for…"
              style={{ width: "100%" }} />
          </ActionCard>
        )}

        {trigger !== "comment.new" && (
          <ActionCard icon={<FiSend />} title="Send DM reply"
            enabled={actions.send_dm.enabled}
            onToggle={(v) => setAction("send_dm", { enabled: v })}>
            <textarea rows={3} value={actions.send_dm.text}
              onChange={(e) => setAction("send_dm", { text: e.target.value })}
              placeholder="Hi {{firstName}}! Thanks for your message…"
              style={{ width: "100%" }} />
          </ActionCard>
        )}

        <ActionCard icon={<FiTag />} title="Add a tag to the lead"
          enabled={actions.add_tag.enabled}
          onToggle={(v) => setAction("add_tag", { enabled: v })}>
          <input value={actions.add_tag.tag}
            onChange={(e) => setAction("add_tag", { tag: e.target.value })}
            placeholder="hot-lead" style={{ width: "100%" }} />
        </ActionCard>

        <ActionCard icon={<FiClock />} title="Wait before running actions"
          enabled={actions.wait.enabled}
          onToggle={(v) => setAction("wait", { enabled: v })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="number" min={0} value={actions.wait.seconds}
              onChange={(e) => setAction("wait", { seconds: Number(e.target.value) })}
              style={{ width: 120 }} />
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>seconds delay</span>
          </div>
        </ActionCard>
      </div>

      {isComment && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-title"><FiZap /> Test this flow</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 10px" }}>
            Type a sample comment to check whether this flow would run and what it would send. (Saves the flow first.)
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={testText} onChange={(e) => setTestText(e.target.value)}
              placeholder="e.g. what's the price?" style={{ flex: 1 }} />
            <button type="button" className="btn btn-outline" onClick={runTest} disabled={testing}>
              {testing ? "Testing…" : "Run test"}
            </button>
          </div>

          {testResult && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: "1px solid var(--border)",
              background: testResult.matched ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.07)" }}>
              <strong style={{ color: testResult.matched ? "#059669" : "#b45309" }}>
                {testResult.matched ? "✓ Flow matches — it would run" : "✗ Flow would not run"}
              </strong>
              {testResult.reasons?.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>• {r}</div>
              ))}
              {testResult.actions?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Would send:</div>
                  {testResult.actions.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, padding: "4px 0" }}>
                      <span className="badge badge-gray" style={{ marginRight: 6 }}>{a.type}</span>{a.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
        Tip: use <code>{"{{firstName}}"}</code> and <code>{"{{username}}"}</code> in your messages — they're replaced per user.
      </p>
    </>
  );
}

function ActionCard({ icon, title, enabled, onToggle, children }) {
  return (
    <div className="card" style={{ opacity: enabled ? 1 : 0.7 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: enabled ? 10 : 0 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <span className="card-title" style={{ margin: 0 }}>{icon} {title}</span>
      </label>
      {enabled && children}
    </div>
  );
}

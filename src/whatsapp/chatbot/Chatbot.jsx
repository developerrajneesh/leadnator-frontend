import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCpu, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiPlay, FiPause, FiZap, FiList,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const editPath = (b) => (b.type === "ai" ? `/whatsapp/chatbot/ai/${b.id}` : `/whatsapp/chatbot/${b.id}`);

export default function Chatbot() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("manual");
  const [creating, setCreating] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const [numbersLoading, setNumbersLoading] = useState(true);
  const [phoneNumberId, setPhoneNumberId] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const r = await waApi.chatbots(); setBots(r.chatbots || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  // Connected WhatsApp number(s) — a chatbot is tied to a number.
  useEffect(() => {
    (async () => {
      setNumbersLoading(true);
      let nums = [];
      try {
        const info = await waApi.accountInfo();
        nums = (info.phoneNumbers || []).map((n) => ({ id: n.id, display: n.display_phone_number || n.id, name: n.verified_name || "" }));
      } catch { /* fall back to status below */ }
      if (nums.length === 0) {
        try {
          const st = await waApi.status();
          const c = st?.connection;
          if (c?.phoneNumberId) nums = [{ id: c.phoneNumberId, display: c.phoneNumber || c.displayName || c.phoneNumberId, name: c.verifiedName || "" }];
        } catch { /* none connected */ }
      }
      setNumbers(nums);
      setPhoneNumberId((prev) => prev || nums[0]?.id || "");
      setNumbersLoading(false);
    })();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!phoneNumberId) { notify.error("Connect a WhatsApp number first (WhatsApp → Settings)."); return; }
    setCreating(true);
    try {
      const num = numbers.find((n) => n.id === phoneNumberId);
      const r = await waApi.createChatbot({ name: name.trim(), type, phoneNumberId, phoneNumber: num?.display || "" });
      notify.success(`${type === "ai" ? "AI" : "Manual"} chatbot "${r.chatbot.name}" created`);
      navigate(editPath(r.chatbot));
    } catch (err) { notify.error(err.message); }
    finally { setCreating(false); }
  }

  async function toggle(bot) {
    const status = bot.status === "active" ? "paused" : "active";
    try {
      await waApi.updateChatbot(bot.id, { status });
      notify.info(`Chatbot ${status === "active" ? "activated" : "paused"}`);
      load();
    } catch (err) { notify.error(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this chatbot? This cannot be undone.")) return;
    try { await waApi.deleteChatbot(id); notify.success("Chatbot deleted"); load(); }
    catch (err) { notify.error(err.message); }
  }

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiCpu style={{ color: "#7c3aed" }} /> WhatsApp Chatbot
      </h1>
      <p className="page-subtitle">
        Build a <strong>Manual</strong> (keyword-flow) or <strong>AI</strong> (knowledge-base) chatbot for incoming WhatsApp messages.
        Only <strong>one chatbot can be active per number</strong> at a time — activating one pauses the rest.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); setName(""); setType("manual"); setPhoneNumberId((p) => p || numbers[0]?.id || ""); }}>
          <FiPlus /> New chatbot
        </button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card" style={{ width: 460, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title"><FiCpu /> New chatbot</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Chatbot name *</label>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Support bot" />
            </div>
            <div className="form-group">
              <label>WhatsApp number</label>
              {numbersLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", padding: "10px 0" }}>
                  <FiRefreshCw className="spin" /> Fetching connected numbers…
                </div>
              ) : numbers.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  No connected WhatsApp number found. Connect one under <strong>WhatsApp → Settings</strong> first.
                </div>
              ) : (
                <>
                  <select
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}
                  >
                    {numbers.map((n) => (
                      <option key={n.id} value={n.id}>📱 {n.display}{n.name ? ` — ${n.name}` : ""}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    This bot answers on the selected number. One bot can be active per number at a time.
                  </div>
                </>
              )}
            </div>
            <div className="form-group">
              <label>Chatbot type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { id: "manual", Icon: FiList, title: "Manual chatbot", desc: "Keyword flows with buttons, lists & CTAs you design step-by-step." },
                  { id: "ai", Icon: FiZap, title: "AI chatbot", desc: "Answers from your knowledge base. Add info, tone & CTAs." },
                ].map(({ id, Icon, title, desc }) => (
                  <button
                    type="button" key={id} onClick={() => setType(id)}
                    style={{
                      textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                      border: type === id ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: type === id ? "var(--primary-50, #f5f3ff)" : "white",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                      <Icon style={{ color: "var(--primary)" }} /> {title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
                {creating ? "Creating…" : "Create & open builder"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiCpu /> {bots.length} chatbot{bots.length === 1 ? "" : "s"}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Number</th><th>Type</th><th>Status</th><th>Steps / KB</th><th>Messages handled</th>
                <th>Last active</th><th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 180 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 50 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 90 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="skel" style={{ width: 60, height: 28, borderRadius: 6 }} />
                        <span className="skel" style={{ width: 70, height: 28, borderRadius: 6 }} />
                        <span className="skel" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : bots.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  No chatbots yet. Click "New chatbot" to build your first one.
                </td></tr>
              ) : bots.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.name}</strong>
                    {b.description && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.description}</div>}
                  </td>
                  <td>
                    {(b.phoneNumber || b.phoneNumberId)
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>📱 {b.phoneNumber || b.phoneNumberId}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    <span className="badge" style={{ background: b.type === "ai" ? "#ede9fe" : "#e0f2fe", color: b.type === "ai" ? "#6d28d9" : "#0369a1", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {b.type === "ai" ? <><FiZap /> AI</> : <><FiList /> Manual</>}
                    </span>
                  </td>
                  <td><span className={`badge ${b.status === "active" ? "qualified" : b.status === "paused" ? "contacted" : "lost"}`}>{b.status}</span></td>
                  <td>{b.type === "ai" ? (b.ai?.knowledgeBase ? "KB set" : "No KB") : `${(b.steps || []).length} steps`}</td>
                  <td>{b.messagesHandled || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {b.lastHandledAt ? new Date(b.lastHandledAt).toLocaleString("en-IN") : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" onClick={() => navigate(editPath(b))}><FiEdit /> Edit</button>
                      <button
                        className="admin-action"
                        onClick={() => toggle(b)}
                        style={b.status !== "active" ? { background: "#dcfce7", color: "#166534", fontWeight: 600 } : undefined}
                      >
                        {b.status === "active" ? <><FiPause /> Pause</> : <><FiPlay /> Activate</>}
                      </button>
                      <button className="admin-action danger" onClick={() => remove(b.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

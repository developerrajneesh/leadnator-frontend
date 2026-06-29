import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiZap, FiSave, FiPlay, FiPause, FiPlus, FiTrash2, FiBookOpen, FiLink, FiPhone,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const TONES = [
  { id: "friendly", label: "Friendly & warm" },
  { id: "professional", label: "Professional" },
  { id: "concise", label: "Short & concise" },
];

const inputStyle = { width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "inherit" };

export default function AiChatbotBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState(null);
  const [saving, setSaving] = useState(false);

  // editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fallback, setFallback] = useState("");
  const [ai, setAi] = useState({ knowledgeBase: "", greeting: "", tone: "friendly", ctas: [] });

  useEffect(() => {
    waApi.chatbot(id).then((r) => {
      const b = r.chatbot;
      setBot(b);
      setName(b.name || "");
      setDescription(b.description || "");
      setFallback(b.fallback || "");
      setAi({
        knowledgeBase: b.ai?.knowledgeBase || "",
        greeting: b.ai?.greeting || "Hi 👋 How can I help you today?",
        tone: b.ai?.tone || "friendly",
        ctas: b.ai?.ctas || [],
      });
    }).catch(() => navigate("/whatsapp/chatbot"));
  }, [id, navigate]);

  function setCta(i, patch) {
    setAi((s) => ({ ...s, ctas: s.ctas.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));
  }
  function addCta() {
    setAi((s) => ({ ...s, ctas: [...s.ctas, { label: "", kind: "url", value: "" }] }));
  }
  function removeCta(i) {
    setAi((s) => ({ ...s, ctas: s.ctas.filter((_, idx) => idx !== i) }));
  }

  async function save(extra = {}) {
    setSaving(true);
    try {
      const r = await waApi.updateChatbot(id, { name, description, fallback, ai, ...extra });
      setBot(r.chatbot);
      if (!extra.status) notify.success("AI chatbot saved");
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  async function toggleStatus() {
    const next = bot.status === "active" ? "paused" : "active";
    await save({ status: next });
    notify.info(next === "active" ? "AI chatbot activated — other chatbots paused" : "AI chatbot paused");
  }

  if (!bot) return <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/whatsapp/chatbot")}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <FiZap style={{ color: "#7c3aed" }} /> {name || "AI chatbot"}
        </h1>
        <span className={`badge ${bot.status === "active" ? "qualified" : bot.status === "paused" ? "contacted" : "lost"}`}>{bot.status}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={toggleStatus} disabled={saving}>
            {bot.status === "active" ? <><FiPause /> Pause</> : <><FiPlay /> Activate</>}
          </button>
          <button className="btn btn-primary" onClick={() => save()} disabled={saving}><FiSave /> {saving ? "Saving…" : "Save"}</button>
        </div>
      </div>

      <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#5b21b6", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
        Only one chatbot runs per number. <strong>Activating this AI bot pauses your Manual bot</strong> (and vice-versa).
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title">Basics</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-group"><label>Tone</label>
            <select value={ai.tone} onChange={(e) => setAi((s) => ({ ...s, tone: e.target.value }))} style={inputStyle}>
              {TONES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Description (internal)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this bot is for" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}><label>Greeting (first message)</label>
          <textarea rows={2} value={ai.greeting} onChange={(e) => setAi((s) => ({ ...s, greeting: e.target.value }))} style={inputStyle} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><FiBookOpen /> Knowledge base</div></div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>
          Paste everything the AI should know — products, pricing, policies, FAQs, hours, links. The AI answers customer
          questions using only this information.
        </p>
        <textarea
          rows={12}
          value={ai.knowledgeBase}
          onChange={(e) => setAi((s) => ({ ...s, knowledgeBase: e.target.value }))}
          placeholder={"e.g.\nWe sell handmade candles. Prices: ₹299–₹899.\nShipping: free over ₹999, 3–5 days pan-India.\nReturns within 7 days.\nSupport hours: Mon–Sat 10am–7pm.\nWebsite: example.com"}
          style={{ ...inputStyle, fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.5 }}
        />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{ai.knowledgeBase.length.toLocaleString()} characters</div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiLink /> Call-to-action buttons</div>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={addCta}><FiPlus /> Add CTA</button>
        </div>
        {ai.ctas.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Add WhatsApp-sendable buttons — a <strong>Visit website</strong> link, or <strong>quick-reply</strong> options the customer can tap.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ai.ctas.map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 1.4fr 34px", gap: 8, alignItems: "center" }}>
                <input value={c.label} placeholder="Button label" maxLength={20} onChange={(e) => setCta(i, { label: e.target.value })} style={inputStyle} />
                <select value={c.kind} onChange={(e) => setCta(i, { kind: e.target.value })} style={inputStyle}>
                  <option value="url">🔗 Visit website</option>
                  <option value="reply">💬 Quick reply</option>
                </select>
                {c.kind === "url" ? (
                  <input
                    value={c.value}
                    placeholder="https://example.com"
                    onChange={(e) => setCta(i, { value: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
                    Tapping sends the label back — the AI answers it.
                  </div>
                )}
                <button type="button" onClick={() => removeCta(i)} title="Remove"
                  style={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "#b91c1c", padding: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              WhatsApp sends either one “Visit website” button, or up to 3 quick-reply buttons per message.
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title"><FiPhone /> Fallback</div></div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>When the AI can’t answer from the knowledge base</label>
          <textarea rows={2} value={fallback} onChange={(e) => setFallback(e.target.value)}
            placeholder="Sorry, I couldn't find that. Let me connect you to our team."
            style={inputStyle} />
        </div>
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  FiSearch, FiMail, FiSend, FiRefreshCw, FiUser, FiPhone, FiMessageSquare, FiExternalLink,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { conversationsApi } from "../../api/conversations";
import { emailApi } from "../../api/email";
import "./Conversations.css";

const CHANNEL = {
  email:    { label: "Email",    Icon: FiMail,     color: "#7c3aed" },
  whatsapp: { label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
};

function initials(name, fallback) {
  const n = (name || fallback || "?").trim();
  return n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}
function fmtTime(d) {
  if (!d) return "";
  const date = new Date(d), today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
const textToHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
const stripHtml = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default function Conversations() {
  const navigate = useNavigate();
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  async function loadList() {
    setLoading(true);
    try { const r = await conversationsApi.list(); setConvos(r.conversations || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadList(); }, []);

  async function openConvo(c) {
    setActive(c.id); setLoadingThread(true); setReply(""); setError("");
    try {
      const r = await conversationsApi.thread(c.id);
      setThread(r);
      setConvos((cs) => cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (e) { setError(e.message); }
    finally { setLoadingThread(false); }
  }

  async function send() {
    if (!reply.trim() || !thread?.contact?.email) return;
    setSending(true); setError("");
    try {
      const lastSubj = [...(thread.messages || [])].reverse().find((m) => m.channel === "email")?.subject || "";
      const subject = lastSubj ? (/^re:/i.test(lastSubj) ? lastSubj : `Re: ${lastSubj}`) : "Message from Leadnator";
      await emailApi.sendMail({ to: thread.contact.email, subject, html: textToHtml(reply) });
      setReply("");
      await openConvo({ id: active });
      loadList();
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  }

  const filtered = convos.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [c.name, c.email, c.phone, c.preview].some((v) => String(v || "").toLowerCase().includes(s));
  });
  const contact = thread?.contact;

  return (
    <>
      <h1 className="page-title" style={{ marginBottom: 2 }}>Conversations</h1>
      <p className="page-subtitle" style={{ marginBottom: 14 }}>All your contact messages — Email &amp; WhatsApp — in one inbox.</p>
      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="conv">
        {/* LEFT — conversation list */}
        <div className="conv__list">
          <div className="conv__search">
            <FiSearch />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations…" />
            <button className="conv__refresh" onClick={loadList} title="Refresh"><FiRefreshCw /></button>
          </div>
          <div className="conv__items">
            {loading ? (
              <div className="conv__empty">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="conv__empty"><FiMessageSquare style={{ fontSize: 26, opacity: 0.4, display: "block", margin: "0 auto 8px" }} />No conversations yet.</div>
            ) : filtered.map((c) => {
              const Ch = CHANNEL[c.lastChannel] || CHANNEL.email;
              return (
                <button key={c.id} className={`conv__item${active === c.id ? " is-active" : ""}`} onClick={() => openConvo(c)}>
                  <span className="conv__avatar" style={{ background: `${Ch.color}1a`, color: Ch.color }}>{initials(c.name, c.email || c.phone)}</span>
                  <span className="conv__meta">
                    <span className="conv__row">
                      <span className="conv__name">{c.name || c.email || c.phone || "Unknown"}</span>
                      <span className="conv__time">{fmtTime(c.ts)}</span>
                    </span>
                    <span className="conv__row">
                      <span className="conv__preview">{c.preview || "—"}</span>
                      {c.unread > 0 && <span className="conv__badge">{c.unread}</span>}
                    </span>
                    <span className="conv__chips">
                      {(c.channels || []).map((ch) => { const M = CHANNEL[ch]; return M ? <span key={ch} className="conv__chip" style={{ color: M.color }}><M.Icon /></span> : null; })}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER — thread */}
        <div className="conv__main">
          {!active ? (
            <div className="conv__placeholder"><FiMessageSquare style={{ fontSize: 34, opacity: 0.35 }} /><div>Select a conversation</div></div>
          ) : (
            <>
              <div className="conv__header">
                <span className="conv__avatar" style={{ background: "#ede9fe", color: "#7c3aed" }}>{initials(contact?.name, contact?.email || contact?.phone)}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="conv__htitle">{contact?.name || contact?.email || contact?.phone || "Unknown"}</div>
                  <div className="conv__hsub">{contact?.email}{contact?.email && contact?.phone ? " · " : ""}{contact?.phone}</div>
                </div>
              </div>

              <div className="conv__thread">
                {loadingThread ? (
                  <div className="conv__empty">Loading…</div>
                ) : (thread?.messages || []).length === 0 ? (
                  <div className="conv__empty">No messages.</div>
                ) : (
                  (thread.messages).map((m) => {
                    const out = m.direction === "outbound";
                    const Ch = CHANNEL[m.channel] || CHANNEL.email;
                    return (
                      <div key={m.id} className={`conv__msgrow ${out ? "out" : "in"}`}>
                        <div className={`conv__bubble ${out ? "out" : "in"}`}>
                          <div className="conv__bmeta">
                            <span style={{ color: Ch.color, display: "inline-flex", alignItems: "center", gap: 4 }}><Ch.Icon /> {Ch.label}</span>
                            <span>{fmtTime(m.ts)}</span>
                          </div>
                          {m.subject && <div className="conv__bsubject">{m.subject}</div>}
                          {m.html ? <div className="conv__bbody" dangerouslySetInnerHTML={{ __html: m.html }} /> : <div className="conv__bbody" style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <div className="conv__composer">
                {contact?.email ? (
                  <>
                    <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply (sent via Email)…"
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }} rows={2} />
                    <button className="btn btn-primary" onClick={send} disabled={sending || !reply.trim()}><FiSend /> {sending ? "…" : "Send"}</button>
                  </>
                ) : (
                  <div className="conv__nochan">This contact has no email on file. Reply to WhatsApp from the <a onClick={() => navigate("/whatsapp/inbox")} style={{ color: "var(--primary)", cursor: "pointer" }}>WhatsApp inbox</a>.</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT — contact panel */}
        <div className="conv__panel">
          {active && contact ? (
            <>
              <div className="conv__pavatar" style={{ background: "#ede9fe", color: "#7c3aed" }}>{initials(contact.name, contact.email || contact.phone)}</div>
              <div className="conv__pname">{contact.name || "Unknown contact"}</div>
              <div className="conv__pfields">
                {contact.email && <div className="conv__pfield"><FiMail /> <span>{contact.email}</span></div>}
                {contact.phone && <div className="conv__pfield"><FiPhone /> <span>{contact.phone}</span></div>}
                <div className="conv__pfield"><FiMessageSquare /> <span>{(thread?.messages || []).length} messages</span></div>
              </div>
              {contact.leadId && (
                <button className="btn btn-outline" style={{ width: "100%", marginTop: 14 }} onClick={() => navigate(`/leads/all/${contact.leadId}`)}>
                  <FiExternalLink /> Open lead
                </button>
              )}
            </>
          ) : (
            <div className="conv__empty" style={{ marginTop: 40 }}><FiUser style={{ fontSize: 26, opacity: 0.4, display: "block", margin: "0 auto 8px" }} />Contact details</div>
          )}
        </div>
      </div>
    </>
  );
}

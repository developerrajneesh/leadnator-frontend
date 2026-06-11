import { useEffect, useRef, useState } from "react";
import {
  FiRefreshCw, FiSend, FiEdit, FiMail, FiInbox, FiCornerUpLeft, FiX, FiUser,
  FiBold, FiItalic, FiUnderline, FiList, FiLink,
} from "react-icons/fi";
import { emailApi } from "../../api/email";
import { onSocket } from "../../api/socket";
import "./Inbox.css";

function fmtTime(d) {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function textToHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}

// Visible text of an HTML string — for empty/validation checks.
function htmlText(h) {
  return String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

// Tiny contentEditable rich-text editor (bold / italic / underline / list / link).
// Uncontrolled internally; clears when `value` is reset to "".
function MiniEditor({ value, onChange, onSubmit, placeholder, minHeight }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && value === "" && ref.current.innerHTML !== "") ref.current.innerHTML = "";
  }, [value]);
  const emit = () => onChange(ref.current?.innerHTML || "");
  const exec = (cmd, arg) => { document.execCommand(cmd, false, arg); ref.current?.focus(); emit(); };
  const addLink = () => { const url = window.prompt("Link URL:"); if (url) exec("createLink", url.trim()); };
  const TB = [
    { icon: <FiBold />, cmd: "bold", title: "Bold (Ctrl+B)" },
    { icon: <FiItalic />, cmd: "italic", title: "Italic (Ctrl+I)" },
    { icon: <FiUnderline />, cmd: "underline", title: "Underline" },
    { icon: <FiList />, cmd: "insertUnorderedList", title: "Bullet list" },
  ];
  return (
    <div className="mini-editor">
      <div className="mini-editor__toolbar">
        {TB.map((b) => (
          <button key={b.cmd} type="button" title={b.title} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(b.cmd)}>{b.icon}</button>
        ))}
        <button type="button" title="Insert link" onMouseDown={(e) => e.preventDefault()} onClick={addLink}><FiLink /></button>
      </div>
      <div
        ref={ref}
        className="mini-editor__area"
        contentEditable
        data-ph={placeholder}
        style={minHeight ? { minHeight } : undefined}
        onInput={emit}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSubmit?.(); } }}
        suppressContentEditableWarning
      />
    </div>
  );
}

// Drop quoted reply history from a plain-text body ("On … wrote:" + > lines).
function stripQuotedText(text) {
  const t = String(text || "");
  const m = t.search(/\n\s*On\b[\s\S]{0,300}?\bwrote:/);
  let cut = m >= 0 ? t.slice(0, m) : t;
  cut = cut.split(/\r?\n/).filter((l) => !/^\s*>/.test(l)).join("\n");
  return cut.trim();
}

// Return only the *new* part of a message — strips Gmail/blockquote reply chains
// so each bubble shows just what was written, WhatsApp-style.
function cleanBody(m) {
  if (m.html) {
    try {
      const doc = new DOMParser().parseFromString(m.html, "text/html");
      const quotes = doc.querySelectorAll(
        ".gmail_quote, .gmail_quote_container, .gmail_extra, blockquote, .yahoo_quoted, .moz-cite-prefix, #appendonsend, #divRplyFwdMsg"
      );
      const hadQuote = quotes.length > 0;
      quotes.forEach((el) => el.remove());
      const html = (doc.body.innerHTML || "").trim();
      return { html, text: "", hadQuote: hadQuote || html !== m.html.trim(), fullHtml: m.html };
    } catch { return { html: m.html, text: "", hadQuote: false, fullHtml: m.html }; }
  }
  const clean = stripQuotedText(m.text);
  return { html: "", text: clean, hadQuote: clean !== String(m.text || "").trim(), fullText: m.text };
}

export default function Inbox() {
  const [convos, setConvos] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [active, setActive] = useState(null);      // counterparty string
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [senders, setSenders] = useState([]);
  const [senderId, setSenderId] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [compose, setCompose] = useState(null);    // { to, subject, body } or null
  const [expanded, setExpanded] = useState(() => new Set()); // message ids showing full quoted history
  const [mailbox, setMailbox] = useState("");      // selected profile email ("" = all inboxes)
  const threadEndRef = useRef(null);

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  async function loadConvos(mb = mailbox) {
    setLoadingConvos(true); setError("");
    try {
      const [r, c] = await Promise.all([emailApi.inbox(mb), emailApi.config()]);
      setConvos(r.conversations || []);
      const sl = c.config?.senders || [];
      setSenders(sl);
      // Default the reply sender to the selected mailbox's profile (else default).
      const sel = mb ? sl.find((s) => s.email === mb) : null;
      setSenderId((sel || sl.find((s) => s.isDefault) || sl[0])?._id || "");
    } catch (err) { setError(err.message); }
    finally { setLoadingConvos(false); }
  }
  useEffect(() => { loadConvos(""); }, []);

  function changeMailbox(mb) {
    setMailbox(mb);
    setActive(null);
    setMessages([]);
    loadConvos(mb);
  }

  // Refresh just the conversation list (no spinner) — used by socket events.
  async function refreshConvos(mb = mailbox) {
    try { const r = await emailApi.inbox(mb); setConvos(r.conversations || []); } catch { /* ignore */ }
  }

  // Realtime: new inbound/outbound mail pushed over Socket.IO.
  useEffect(() => {
    const handle = (p) => {
      const m = p?.message;
      if (!m) return;
      if (mailbox && m.mailbox !== mailbox) { refreshConvos(mailbox); return; }
      // If it belongs to the open conversation, append it live.
      if (active && (m.counterparty || "").toLowerCase() === active.toLowerCase()) {
        setMessages((ms) => (ms.some((x) => x.id === m.id) ? ms : [...ms, m]));
        setConvos((cs) => cs.map((c) => (c.counterparty === active ? { ...c, unread: 0 } : c)));
        setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      }
      refreshConvos(mailbox);
    };
    const offIn = onSocket("email.inbound", handle);
    const offOut = onSocket("email.outbound", handle);
    return () => { offIn(); offOut(); };
  }, [active, mailbox]);

  async function openThread(cp) {
    setActive(cp); setLoadingThread(true); setReply("");
    try {
      const r = await emailApi.thread(cp, mailbox);
      setMessages(r.messages || []);
      // mark read locally
      setConvos((cs) => cs.map((c) => (c.counterparty === cp ? { ...c, unread: 0 } : c)));
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) { setError(err.message); }
    finally { setLoadingThread(false); }
  }

  const lastSubject = messages.length ? messages[messages.length - 1].subject : "";
  const replySubject = lastSubject ? (/^re:/i.test(lastSubject) ? lastSubject : `Re: ${lastSubject}`) : "";

  async function sendReply() {
    if (!htmlText(reply) || !active) return;
    setSending(true); setError("");
    try {
      const lastInbound = [...messages].reverse().find((m) => m.direction === "inbound");
      await emailApi.sendMail({
        to: active,
        subject: replySubject || "(no subject)",
        html: reply,
        senderId,
        inReplyTo: lastInbound?.messageId || "",
      });
      setReply("");
      await openThread(active);
      loadConvos();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  async function sendCompose() {
    if (!compose?.to?.trim() || !compose?.body?.trim()) return;
    setSending(true); setError("");
    try {
      await emailApi.sendMail({
        to: compose.to.trim(),
        subject: compose.subject || "(no subject)",
        html: compose.body,
        senderId,
      });
      const to = compose.to.trim().toLowerCase();
      setCompose(null);
      await loadConvos();
      openThread(to);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Mailbox</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Send and receive email from your verified domain.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={mailbox}
            onChange={(e) => changeMailbox(e.target.value)}
            title="Filter by inbox profile"
            style={{ height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, background: "#fff", minWidth: 200 }}
          >
            <option value="">📥 All inboxes</option>
            {senders.map((s) => (
              <option key={s._id} value={s.email}>{s.name ? `${s.name} <${s.email}>` : s.email}</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={() => loadConvos()}><FiRefreshCw /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setCompose({ to: "", subject: "", body: "" })}><FiEdit /> New message</button>
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 10, margin: "14px 0", fontSize: 13 }}>{error}</div>}

      <div className="card" style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)", minHeight: 520 }}>
          {/* Conversation list */}
          <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto", maxHeight: 640 }}>
            {loadingConvos ? (
              <div style={{ padding: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <span className="skel skel-line" style={{ width: "70%", display: "block", marginBottom: 6 }} />
                    <span className="skel skel-line skel-line-sm" style={{ width: "90%", display: "block" }} />
                  </div>
                ))}
              </div>
            ) : convos.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <FiInbox style={{ fontSize: 28, opacity: 0.5, display: "block", margin: "0 auto 10px" }} />
                No emails yet. Inbound mail to your domain shows up here.
              </div>
            ) : (
              convos.map((c) => (
                <button
                  key={c.counterparty}
                  onClick={() => openThread(c.counterparty)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--border)",
                    background: active === c.counterparty ? "#f5f3ff" : "transparent",
                    padding: "12px 14px", cursor: "pointer", display: "block",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: c.unread ? 800 : 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name || c.counterparty}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{fmtTime(c.ts)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: c.unread ? 700 : 400 }}>
                    {c.lastDirection === "outbound" ? "You: " : ""}{c.lastSubject || "(no subject)"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</span>
                    {c.unread > 0 && <span className="badge qualified" style={{ fontSize: 10, flexShrink: 0 }}>{c.unread}</span>}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Thread */}
          <div style={{ display: "flex", flexDirection: "column", maxHeight: 640 }}>
            {!active ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, flexDirection: "column", gap: 8 }}>
                <FiMail style={{ fontSize: 32, opacity: 0.4 }} />
                Select a conversation to read & reply.
              </div>
            ) : (
              <>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{active}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{lastSubject}</div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", background: "#efeae2" }}>
                  {loadingThread ? (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
                  ) : (
                    messages.map((m) => {
                      const out = m.direction === "outbound";
                      const isOpen = expanded.has(m.id);
                      const cb = cleanBody(m);
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", marginBottom: 8 }}>
                          <div style={{
                            maxWidth: "75%", minWidth: 80,
                            background: out ? "#d9fdd3" : "#fff",
                            borderRadius: 10,
                            borderTopRightRadius: out ? 2 : 10,
                            borderTopLeftRadius: out ? 10 : 2,
                            padding: "6px 9px 5px",
                            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                          }}>
                            {isOpen
                              ? (m.html
                                  ? <div className="mail-body" style={{ fontSize: 14, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: m.html }} />
                                  : <div style={{ fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{m.text}</div>)
                              : (cb.html
                                  ? <div className="mail-body" style={{ fontSize: 14, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: cb.html }} />
                                  : <div style={{ fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{cb.text || <em style={{ color: "var(--text-muted)" }}>(no text)</em>}</div>)}

                            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginTop: 2 }}>
                              {cb.hadQuote && (
                                <button
                                  onClick={() => toggleExpand(m.id)}
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10.5, color: "#0b8", padding: 0, marginRight: "auto" }}
                                >
                                  {isOpen ? "Hide quoted" : "Show quoted"}
                                </button>
                              )}
                              <span style={{ fontSize: 10.5, color: "rgba(0,0,0,0.45)" }}>{fmtTime(m.ts)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={threadEndRef} />
                </div>

                {/* Reply composer */}
                <div style={{ borderTop: "1px solid var(--border)", padding: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <FiCornerUpLeft style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Reply · {replySubject || "(no subject)"}</span>
                    {senders.length > 0 && (
                      <select value={senderId} onChange={(e) => setSenderId(e.target.value)} style={{ marginLeft: "auto", fontSize: 12, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6 }}>
                        {senders.map((s) => <option key={s._id} value={s._id}>{s.name ? `${s.name} <${s.email}>` : s.email}</option>)}
                      </select>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <MiniEditor value={reply} onChange={setReply} onSubmit={sendReply} placeholder="Write a reply…  (Ctrl+Enter to send)" />
                    </div>
                    <button className="btn btn-primary" onClick={sendReply} disabled={sending || !htmlText(reply)}>
                      <FiSend /> {sending ? "…" : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compose modal */}
      {compose && (
        <div onClick={() => setCompose(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 560, maxWidth: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="card-title"><FiEdit /> New message</div>
              <button className="btn btn-ghost" onClick={() => setCompose(null)}><FiX /></button>
            </div>
            {senders.length > 0 && (
              <div className="form-group"><label><FiUser style={{ verticalAlign: "middle", marginRight: 4 }} /> From</label>
                <select value={senderId} onChange={(e) => setSenderId(e.target.value)}>
                  {senders.map((s) => <option key={s._id} value={s._id}>{s.name ? `${s.name} <${s.email}>` : s.email}</option>)}
                </select>
              </div>
            )}
            <div className="form-group"><label>To</label>
              <input type="email" value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} placeholder="someone@example.com" />
            </div>
            <div className="form-group"><label>Subject</label>
              <input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} placeholder="Subject" />
            </div>
            <div className="form-group"><label>Message</label>
              <MiniEditor value={compose.body} onChange={(html) => setCompose((c) => ({ ...c, body: html }))} placeholder="Write your message…" minHeight={120} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setCompose(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendCompose} disabled={sending || !compose.to.trim() || !htmlText(compose.body)}>
                <FiSend /> {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

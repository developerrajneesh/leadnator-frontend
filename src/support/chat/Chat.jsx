import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiShield, FiUser, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { onSocket } from "../../api/socket";

// "Live chat" in our app is a dedicated, persistent ticket per user. The
// first time the user lands here we open / reuse a ticket called
// "Live chat" so every subsequent message threads into the same room.
const LIVE_CHAT_SUBJECT = "Live chat";

export default function Chat() {
  const nav = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function ensureTicket() {
    setLoading(true);
    try {
      const r = await api.support.tickets();
      const existing = (r.tickets || []).find((t) => t.subject === LIVE_CHAT_SUBJECT && t.status !== "resolved");
      if (existing) {
        const detail = await api.support.ticket(existing.id);
        setTicket(detail.ticket);
      } else {
        const created = await api.support.createTicket({
          subject: LIVE_CHAT_SUBJECT,
          category: "Live chat",
          priority: "low",
          description: "",
        });
        setTicket(created.ticket);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { ensureTicket(); }, []);

  useEffect(() => {
    const off = onSocket("support.ticket.replied", (p) => {
      if (!ticket) return;
      if (p.ticketId === ticket.id) {
        api.support.ticket(ticket.id).then((r) => setTicket(r.ticket));
      }
    });
    return off;
  }, [ticket?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages?.length]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim() || !ticket) return;
    setSending(true);
    try {
      const r = await api.support.replyTicket(ticket.id, body.trim());
      setTicket(r.ticket);
      setBody("");
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Starting live chat…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!ticket) return null;

  return (
    <>
      <h1 className="page-title">Support — Live chat</h1>
      <p className="page-subtitle">Talk to the support team. Responses usually within minutes during business hours (10am – 8pm IST).</p>

      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", height: "70vh" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#dcfce7", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#166534" }}>
              <FiMessageCircle />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Support team</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ticket #{ticket.code}</div>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => nav(`/support/tickets/${ticket.id}`)} style={{ fontSize: 12 }}>
            Open full ticket
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "#f9fafb" }}>
          {(ticket.messages || []).length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
              <FiMessageCircle style={{ fontSize: 28, opacity: 0.4 }} />
              <div style={{ marginTop: 10, fontSize: 13 }}>Say hi to start the conversation.</div>
            </div>
          ) : (
            ticket.messages.map((m) => <Bubble key={m._id || m.createdAt} m={m} />)
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message…"
            style={{ flex: 1, padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !body.trim()}>
            <FiSend /> {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
        <span>
          Prefer async? <a onClick={() => nav("/support/new")} style={{ color: "var(--primary)", cursor: "pointer" }}><FiPlus style={{ verticalAlign: "middle" }} /> open a structured ticket</a>.
        </span>
        <span>Email: <a href="mailto:support@leadnator.app" style={{ color: "var(--primary)" }}>support@leadnator.app</a></span>
      </div>
    </>
  );
}

function Bubble({ m }) {
  const isAdmin = m.role === "admin";
  return (
    <div style={{ display: "flex", gap: 8, flexDirection: isAdmin ? "row" : "row-reverse" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14, flexShrink: 0, fontSize: 13,
        background: isAdmin ? "#ede9fe" : "#dcfce7",
        color: isAdmin ? "#6d28d9" : "#166534",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isAdmin ? <FiShield /> : <FiUser />}
      </div>
      <div style={{
        maxWidth: "72%",
        background: isAdmin ? "#fff" : "var(--primary, #7c3aed)",
        color:      isAdmin ? "#1f2937" : "#fff",
        padding: "8px 12px",
        borderRadius: 12,
        border: isAdmin ? "1px solid var(--border)" : "none",
        borderTopLeftRadius:  isAdmin ? 4 : 12,
        borderTopRightRadius: isAdmin ? 12 : 4,
      }}>
        <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{m.body}</div>
        <div style={{ fontSize: 10, opacity: 0.65, marginTop: 3, textAlign: "right" }}>
          {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

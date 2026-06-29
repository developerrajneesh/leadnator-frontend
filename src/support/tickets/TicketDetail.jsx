import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSend, FiUser, FiShield } from "react-icons/fi";
import { api } from "../../api/client";
import { onSocket } from "../../api/socket";
import { notify } from "../../globalComponents/Toast/Toast";

const STATUS_BADGE = {
  open:        { label: "Open",        cls: "hot" },
  in_progress: { label: "In progress", cls: "contacted" },
  resolved:    { label: "Resolved",    cls: "qualified" },
};
const PRIORITY_BADGE = {
  high:   { label: "High",   cls: "hot" },
  medium: { label: "Medium", cls: "contacted" },
  low:    { label: "Low",    cls: "new" },
};

export default function TicketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function load() {
    try {
      const r = await api.support.ticket(id);
      setTicket(r.ticket);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    const offReply = onSocket("support.ticket.replied", (p) => {
      if (p.ticketId === id) load();
    });
    const offUpd = onSocket("support.ticket.updated", (p) => {
      if (p.ticket?.id === id) setTicket(p.ticket);
    });
    return () => { offReply(); offUpd(); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const r = await api.support.replyTicket(id, body.trim());
      setTicket(r.ticket);
      setBody("");
    } catch (err) { notify.error(err.message || "Failed to send reply"); }
    finally { setSending(false); }
  }

  if (loading) return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>;
  if (error)   return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;
  if (!ticket) return null;

  const s = STATUS_BADGE[ticket.status] || { label: ticket.status, cls: "new" };
  const p = PRIORITY_BADGE[ticket.priority] || { label: ticket.priority, cls: "new" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <button className="btn btn-ghost" onClick={() => nav("/support/tickets")} title="Back">
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>#{ticket.code}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>{ticket.subject}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
          <Pill label="Status"   value={<span className={`badge ${s.cls}`}>{s.label}</span>} />
          <Pill label="Priority" value={<span className={`badge ${p.cls}`}>{p.label}</span>} />
          <Pill label="Category" value={ticket.category} />
          <Pill label="Opened"   value={new Date(ticket.createdAt).toLocaleString("en-IN")} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", maxHeight: "70vh" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          Conversation ({ticket.messages?.length || 0})
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {(ticket.messages || []).length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 30 }}>
              No messages yet. Type below to add a reply.
            </div>
          ) : (
            ticket.messages.map((m) => <Bubble key={m._id || m.createdAt} m={m} />)
          )}
          <div ref={bottomRef} />
        </div>

        {ticket.status === "resolved" ? (
          <div style={{ padding: 14, borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
            This ticket has been resolved. Posting a reply will re-open it.
          </div>
        ) : null}

        <form onSubmit={send} style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your reply…"
            rows={2}
            style={{ flex: 1, resize: "vertical", padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !body.trim()}>
            <FiSend /> {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}

function Pill({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Bubble({ m }) {
  const isAdmin = m.role === "admin";
  return (
    <div style={{ display: "flex", gap: 8, flexDirection: isAdmin ? "row" : "row-reverse" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 16, flexShrink: 0,
        background: isAdmin ? "#ede9fe" : "#dcfce7",
        color: isAdmin ? "#6d28d9" : "#166534",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isAdmin ? <FiShield /> : <FiUser />}
      </div>
      <div style={{
        maxWidth: "72%",
        background: isAdmin ? "#f5f3ff" : "var(--primary, #7c3aed)",
        color:      isAdmin ? "#1f2937" : "#fff",
        padding: "9px 12px",
        borderRadius: 12,
        borderTopLeftRadius:  isAdmin ? 4 : 12,
        borderTopRightRadius: isAdmin ? 12 : 4,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.75 }}>
          {m.authorName || (isAdmin ? "Support" : "You")}
        </div>
        <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.body}</div>
        <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: "right" }}>
          {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLifeBuoy, FiPlus, FiMessageSquare } from "react-icons/fi";
import { api } from "../../api/client";
import { onSocket } from "../../api/socket";

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

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Tickets() {
  const nav = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await api.support.tickets();
      setTickets(r.tickets || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const off1 = onSocket("support.ticket.replied", load);
    const off2 = onSocket("support.ticket.updated", load);
    return () => { off1(); off2(); };
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">Support — My tickets</h1>
          <p className="page-subtitle">All the support conversations you've opened.</p>
        </div>
        <button className="btn btn-primary" onClick={() => nav("/support/new")}>
          <FiPlus /> New ticket
        </button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title"><FiLifeBuoy style={{ verticalAlign: "middle" }} /> Your tickets</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{tickets.length} total</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            No tickets yet. Click <b>New ticket</b> to open your first one.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th><th></th></tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const s = STATUS_BADGE[t.status] || { label: t.status, cls: "new" };
                  const p = PRIORITY_BADGE[t.priority] || { label: t.priority, cls: "new" };
                  return (
                    <tr key={t.id} onClick={() => nav(`/support/tickets/${t.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{t.code}</td>
                      <td style={{ fontWeight: 600 }}>
                        {t.subject}
                        {t.unreadForUser > 0 && (
                          <span style={{ marginLeft: 8, background: "#ef4444", color: "white", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                            {t.unreadForUser} new
                          </span>
                        )}
                      </td>
                      <td><span className="badge" style={{ background: "#f3f4f6", color: "#4b5563" }}>{t.category}</span></td>
                      <td><span className={`badge ${p.cls}`}>{p.label}</span></td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{timeAgo(t.lastMessageAt || t.updatedAt)}</td>
                      <td><FiMessageSquare style={{ color: "var(--primary)" }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

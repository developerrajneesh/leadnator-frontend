import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiLifeBuoy, FiCheckCircle, FiClock, FiAlertCircle, FiMessageSquare,
  FiHelpCircle, FiBookOpen, FiPlus, FiTrash2, FiSend, FiX, FiEdit2, FiShield, FiUser,
} from "react-icons/fi";
import { api } from "../../api/client";
import { onSocket } from "../../api/socket";
import { notify } from "../../globalComponents/Toast/Toast";

const STATUS = ["open", "in_progress", "resolved"];
const PRIORITIES = ["low", "medium", "high"];

export default function AdminSupport() {
  const [tab, setTab] = useState("tickets");
  return (
    <>
      <h1 className="page-title">Support</h1>
      <p className="page-subtitle">Customer tickets, FAQs, and documentation.</p>

      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
        {[
          { key: "tickets", label: "Tickets",   Icon: FiLifeBuoy },
          { key: "faqs",    label: "FAQs",      Icon: FiHelpCircle },
          { key: "docs",    label: "Docs",      Icon: FiBookOpen },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: "transparent", border: "none", padding: "10px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: tab === key ? "var(--primary, #7c3aed)" : "var(--text-muted)",
              borderBottom: tab === key ? "2px solid var(--primary, #7c3aed)" : "2px solid transparent",
              marginBottom: -1, display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {tab === "tickets" && <TicketsTab />}
      {tab === "faqs"    && <FaqsTab />}
      {tab === "docs"    && <DocsTab />}
    </>
  );
}

/* ============================================================
   TICKETS
   ============================================================ */

function TicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  async function load() {
    try {
      const r = await api.admin.tickets();
      setTickets(r.tickets || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const off1 = onSocket("support.ticket.created", load);
    const off2 = onSocket("support.ticket.replied", load);
    return () => { off1(); off2(); };
  }, []);

  const open     = tickets.filter((t) => t.status === "open").length;
  const inProg   = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;
  const high     = tickets.filter((t) => t.priority === "high").length;

  return (
    <>
      <div className="stats-grid">
        <Stat icon={<FiLifeBuoy />}    color="orange" value={tickets.length} label="Total tickets"   hint="All time" />
        <Stat icon={<FiAlertCircle />} color="pink"   value={open}           label="Open tickets"    hint={`${high} high priority`} />
        <Stat icon={<FiClock />}       color="purple" value={inProg}         label="In progress"     hint="Awaiting reply" />
        <Stat icon={<FiCheckCircle />} color="green"  value={resolved}       label="Resolved"        hint="All time" />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">All tickets</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{tickets.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No tickets yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>User</th><th>Subject</th><th>Category</th>
                  <th>Priority</th><th>Status</th><th>Last activity</th><th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedId(t.id)} style={{ cursor: "pointer" }}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{t.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.user}</div>
                      {t.userEmail && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.userEmail}</div>}
                    </td>
                    <td>
                      {t.subject}
                      {t.unreadForAdmin > 0 && (
                        <span style={{ marginLeft: 8, background: "#ef4444", color: "white", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                          {t.unreadForAdmin} new
                        </span>
                      )}
                    </td>
                    <td><span className="badge" style={{ background: "#f3f4f6", color: "#4b5563" }}>{t.category}</span></td>
                    <td><span className={`priority-${t.priority}`}>{t.priority}</span></td>
                    <td><span className={`ticket-status ${t.status}`}>{t.status.replace("_", " ")}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(t.lastMessageAt || t.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td><button className="admin-action" title="Open"><FiMessageSquare /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && <AdminTicketDrawer ticketId={selectedId} onClose={() => { setSelectedId(null); load(); }} />}
    </>
  );
}

function Stat({ icon, color, value, label, hint }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-change up">{hint}</div>}
    </div>
  );
}

function AdminTicketDrawer({ ticketId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function load() {
    try {
      const r = await api.admin.ticket(ticketId);
      setTicket(r.ticket);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ticketId]);
  useEffect(() => {
    const off = onSocket("support.ticket.replied", (p) => {
      if (p.ticketId === ticketId) load();
    });
    return off;
  }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages?.length]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const r = await api.admin.replyTicket(ticketId, body.trim());
      setTicket(r.ticket);
      setBody("");
    } catch (err) { notify.error(err.message); }
    finally { setSending(false); }
  }

  async function setField(field, value) {
    try {
      const r = await api.admin.updateTicket(ticketId, { [field]: value });
      setTicket(r.ticket);
    } catch (err) { notify.error(err.message); }
  }

  async function onDelete() {
    if (!confirm(`Delete ticket #${ticket.code}? This cannot be undone.`)) return;
    try {
      await api.admin.deleteTicket(ticketId);
      notify.success("Ticket deleted");
      onClose();
    } catch (err) { notify.error(err.message); }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: "100vw", background: "white", display: "flex", flexDirection: "column", boxShadow: "-10px 0 30px rgba(0,0,0,0.2)" }}>
        {loading || !ticket ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : (
          <>
            <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>#{ticket.code}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{ticket.subject}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {ticket.user}{ticket.userEmail ? ` · ${ticket.userEmail}` : ""}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={onClose}><FiX /></button>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, fontSize: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "var(--text-muted)" }}>Status:</span>
                  <select value={ticket.status} onChange={(e) => setField("status", e.target.value)} style={{ padding: "4px 8px", fontSize: 12 }}>
                    {STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "var(--text-muted)" }}>Priority:</span>
                  <select value={ticket.priority} onChange={(e) => setField("priority", e.target.value)} style={{ padding: "4px 8px", fontSize: 12 }}>
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "var(--text-muted)" }}>Category:</span>
                  <input defaultValue={ticket.category} onBlur={(e) => e.target.value !== ticket.category && setField("category", e.target.value)} style={{ padding: "4px 8px", fontSize: 12, width: 120 }} />
                </label>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#f9fafb", display: "flex", flexDirection: "column", gap: 10 }}>
              {(ticket.messages || []).length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 30 }}>No messages yet.</div>
              ) : (
                ticket.messages.map((m) => <AdminBubble key={m._id || m.createdAt} m={m} />)
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your reply…"
                rows={2}
                style={{ flex: 1, resize: "vertical", padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !body.trim()}>
                <FiSend /> {sending ? "Sending…" : "Send"}
              </button>
            </form>

            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-danger" onClick={onDelete} style={{ fontSize: 12 }}>
                <FiTrash2 /> Delete ticket
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminBubble({ m }) {
  const isAdmin = m.role === "admin";
  return (
    <div style={{ display: "flex", gap: 8, flexDirection: isAdmin ? "row-reverse" : "row" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14, flexShrink: 0,
        background: isAdmin ? "#ede9fe" : "#dcfce7",
        color: isAdmin ? "#6d28d9" : "#166534",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isAdmin ? <FiShield /> : <FiUser />}
      </div>
      <div style={{
        maxWidth: "75%",
        background: isAdmin ? "var(--primary, #7c3aed)" : "#fff",
        color: isAdmin ? "#fff" : "#1f2937",
        padding: "8px 12px",
        borderRadius: 12,
        border: isAdmin ? "none" : "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.75 }}>
          {m.authorName || (isAdmin ? "You (admin)" : "User")}
        </div>
        <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.body}</div>
        <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: "right" }}>
          {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FAQS
   ============================================================ */

function FaqsTab() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const r = await api.admin.faqs();
      setFaqs(r.faqs || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.admin.deleteFaq(id);
      notify.success("FAQ deleted");
      load();
    } catch (err) { notify.error(err.message); }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {faqs.length} FAQ{faqs.length === 1 ? "" : "s"} — shown to users under Support → FAQs.
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}><FiPlus /> Add FAQ</button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>
      ) : faqs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No FAQs yet.</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Question</th><th>Category</th><th>Published</th><th>Order</th><th style={{ width: 120 }}></th></tr></thead>
              <tbody>
                {faqs.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.question}</td>
                    <td>{f.category}</td>
                    <td>{f.published ? "✅" : "—"}</td>
                    <td>{f.order}</td>
                    <td>
                      <button className="admin-action" onClick={() => setEditing(f)} title="Edit"><FiEdit2 /></button>
                      <button className="admin-action danger" onClick={() => onDelete(f.id)} title="Delete"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <FaqEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </>
  );
}

function FaqEditor({ initial, onClose }) {
  const [form, setForm] = useState({
    question: initial.question || "",
    answer:   initial.answer   || "",
    category: initial.category || "General",
    published: initial.published !== false,
    order:    initial.order    || 0,
  });
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (initial.id) await api.admin.updateFaq(initial.id, form);
      else            await api.admin.createFaq(form);
      notify.success("FAQ saved");
      onClose();
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: 640, maxWidth: "95vw" }}>
        <div className="card-header">
          <div className="card-title">{initial.id ? "Edit FAQ" : "Add FAQ"}</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="form-group"><label>Question *</label><input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
        <div className="form-group"><label>Answer *</label><textarea required rows="6" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
        <div className="grid-2-equal">
          <div className="form-group"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="form-group"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          <span>Published (visible to users)</span>
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save FAQ"}</button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   DOCS
   ============================================================ */

function DocsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const r = await api.admin.docs();
      setDocs(r.docs || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm("Delete this doc?")) return;
    try {
      await api.admin.deleteDoc(id);
      notify.success("Doc deleted");
      load();
    } catch (err) { notify.error(err.message); }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {docs.length} doc{docs.length === 1 ? "" : "s"} — shown to users under Support → Documentation.
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}><FiPlus /> Add doc</button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>
      ) : docs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No docs yet.</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Link</th><th>Published</th><th>Order</th><th style={{ width: 120 }}></th></tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td>{d.category}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer">{d.url.slice(0, 30)}…</a> : (d.body ? "inline" : "—")}</td>
                    <td>{d.published ? "✅" : "—"}</td>
                    <td>{d.order}</td>
                    <td>
                      <button className="admin-action" onClick={() => setEditing(d)} title="Edit"><FiEdit2 /></button>
                      <button className="admin-action danger" onClick={() => onDelete(d.id)} title="Delete"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <DocEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </>
  );
}

function DocEditor({ initial, onClose }) {
  const [form, setForm] = useState({
    title:    initial.title    || "",
    category: initial.category || "Getting Started",
    url:      initial.url      || "",
    body:     initial.body     || "",
    published: initial.published !== false,
    order:    initial.order    || 0,
  });
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (initial.id) await api.admin.updateDoc(initial.id, form);
      else            await api.admin.createDoc(form);
      notify.success("Doc saved");
      onClose();
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: 640, maxWidth: "95vw" }}>
        <div className="card-header">
          <div className="card-title">{initial.id ? "Edit doc" : "Add doc"}</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="form-group"><label>Title *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid-2-equal">
          <div className="form-group"><label>Category *</label><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="form-group"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
        </div>
        <div className="form-group">
          <label>External link (optional)</label>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://docs.example.com/..." />
        </div>
        <div className="form-group">
          <label>Inline body (optional — shown in a modal if no link)</label>
          <textarea rows="6" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          <span>Published (visible to users)</span>
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save doc"}</button>
        </div>
      </form>
    </div>
  );
}

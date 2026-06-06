import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiInbox, FiRefreshCw, FiSearch, FiSend } from "react-icons/fi";
import { igApi } from "../../api/instagram";
import { useInstagramStatus } from "../useInstagramStatus";
import { avatarColors, initials, timeShort } from "./inboxUtils";

function Avatar({ name, size = 40 }) {
  const [c1, c2] = avatarColors(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      color: "white", fontWeight: 700, fontSize: size * 0.34,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      {initials(name)}
    </div>
  );
}

export default function Inbox() {
  const { status } = useInstagramStatus();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [listError, setListError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async (keepActive = true) => {
    setLoadingList(true);
    setListError("");
    try {
      const r = await igApi.conversations();
      const list = r.conversations || [];
      setConversations(list);
      if (r.syncError && list.length === 0) {
        setListError(r.syncError);
      }
      setActive((prev) => {
        if (keepActive && prev) {
          const updated = list.find((c) => c.id === prev.id);
          return updated || prev;
        }
        return list[0] || null;
      });
    } catch (err) {
      setListError(err.message || "Failed to load conversations");
      setConversations([]);
      setActive(null);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(async (conv) => {
    if (!conv?.id) return;
    setLoadingMsgs(true);
    setMsgError("");
    try {
      const r = await igApi.messages(conv.id, {
        igUserId: conv.igUserId,
        igUsername: conv.igUsername,
      });
      setMessages(r.messages || []);
      if (r.syncError && !(r.messages || []).length) {
        setMsgError(r.syncError);
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
      );
    } catch (err) {
      setMsgError(err.message || "Failed to load messages");
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => { loadConversations(false); }, [loadConversations]);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active?.id, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, active?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.igUsername || "").toLowerCase().includes(q)
      || (c.lastText || "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !active || sending) return;
    setSending(true);
    try {
      const r = await igApi.sendMessage(active.id, {
        text: reply.trim(),
        igUserId: active.igUserId,
        igUsername: active.igUsername,
      });
      if (r.sendError) {
        alert(`Message saved locally but Instagram send failed: ${r.sendError}`);
      }
      setReply("");
      await loadMessages(active);
      await loadConversations(true);
    } catch (err) {
      alert(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const displayName = (c) => c.igUsername ? `@${c.igUsername.replace(/^@/, "")}` : "Instagram user";

  return (
    <>
      <h1 className="page-title">Instagram — DM Inbox</h1>
      <p className="page-subtitle">
        {status?.connection?.username ? `@${status.connection.username} — ` : ""}
        Live direct messages from your connected Business account.
      </p>

      {listError && (
        <div className="card" style={{ padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "#b45309", borderColor: "#fde68a", background: "#fffbeb" }}>
          {listError}. Connect Facebook (Meta) for the same page, or ensure <strong>instagram_business_manage_messages</strong> is granted.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button type="button" className="btn btn-outline" onClick={() => loadConversations(true)} disabled={loadingList}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 300px) 1fr",
          gap: 0,
          padding: 0,
          overflow: "hidden",
          minHeight: 520,
        }}
      >
        {/* Conversation list */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <FiInbox style={{ color: "#e1306c" }} /> Conversations
            </div>
            <div style={{ position: "relative" }}>
              <FiSearch style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ width: "100%", paddingLeft: 32, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 460 }}>
            {loadingList && (
              <p style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>Loading conversations…</p>
            )}
            {!loadingList && filtered.length === 0 && (
              <p style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>
                No conversations yet. DMs will appear here when customers message you on Instagram.
              </p>
            )}
            {filtered.map((c) => {
              const name = displayName(c);
              const selected = active?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(c)}
                  style={{
                    display: "flex", gap: 10, width: "100%", textAlign: "left",
                    padding: "12px 14px", border: "none",
                    borderBottom: "1px solid var(--border)",
                    background: selected ? "rgba(225, 48, 108, 0.08)" : "transparent",
                    cursor: "pointer", alignItems: "flex-start",
                  }}
                >
                  <Avatar name={name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{timeShort(c.lastAt)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.lastText || "—"}
                    </div>
                    {c.unread > 0 && (
                      <span style={{
                        fontSize: 10, background: "#e1306c", color: "white",
                        padding: "2px 7px", borderRadius: 10, marginTop: 6, display: "inline-block", fontWeight: 700,
                      }}>
                        {c.unread} new
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
          {active ? (
            <>
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 10, fontWeight: 600,
              }}>
                <Avatar name={displayName(active)} size={36} />
                {displayName(active)}
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: "auto", maxHeight: 400, background: "#fafafa" }}>
                {loadingMsgs && (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading messages…</p>
                )}
                {msgError && !loadingMsgs && (
                  <p style={{ textAlign: "center", color: "#b45309", fontSize: 13, marginBottom: 12 }}>{msgError}</p>
                )}
                {!loadingMsgs && messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: m.direction === "out" ? "flex-end" : "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{
                      maxWidth: "78%", padding: "10px 14px", borderRadius: 16, fontSize: 13, lineHeight: 1.45,
                      background: m.direction === "out"
                        ? "linear-gradient(135deg, #e1306c, #c13584)"
                        : "white",
                      color: m.direction === "out" ? "white" : "inherit",
                      border: m.direction === "out" ? "none" : "1px solid var(--border)",
                      boxShadow: m.direction === "out" ? "0 2px 8px rgba(225,48,108,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                      <div>{m.text}</div>
                      <div style={{
                        fontSize: 10, marginTop: 6, opacity: 0.75,
                        textAlign: m.direction === "out" ? "right" : "left",
                      }}>
                        {timeShort(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendReply} style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply…"
                  style={{ flex: 1 }}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !reply.trim()} style={{ background: "#e1306c", borderColor: "#e1306c" }}>
                  <FiSend /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </>
  );
}

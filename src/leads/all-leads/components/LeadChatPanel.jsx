import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiMessageCircle, FiSend, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";
import { api } from "../../../api/client";
import { emailApi } from "../../../api/email";
import { waApi } from "../../../api/whatsapp";
import { notify } from "../../../globalComponents/Toast/Toast";

const CHANNEL_STYLE = {
  email:    { bg: "#fee2e2", color: "#b91c1c", label: "Email",    Icon: FiMail },
  whatsapp: { bg: "#dcfce7", color: "#15803d", label: "WhatsApp", Icon: SiWhatsapp },
};

export default function LeadChatPanel({ lead }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [waPhone, setWaPhone] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [provider, setProvider] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const firstName = (lead?.name || "").split(" ")[0] || "there";

  const load = useCallback(async () => {
    if (!lead?.id) return;
    setLoading(true);
    setError("");
    try {
      const r = await api.leads.chat(lead.id);
      setMessages(r.messages || []);
      setProviders(r.providers || []);
      setWaPhone(r.waPhone || null);
      setMeta(r.meta || null);
      const first = r.providers?.[0]?.id || "";
      setProvider((cur) => (r.providers?.some((p) => p.id === cur) ? cur : first));
    } catch (err) {
      setError(err.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [lead?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!subject && lead?.name) {
      setSubject(`Hi ${firstName}, quick note from Leadnator`);
    }
  }, [lead?.name, firstName, subject]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!provider || !body.trim()) return;

    setSending(true);
    try {
      if (provider === "email") {
        if (!lead?.email) throw new Error("No email on this lead");
        if (!subject.trim()) throw new Error("Subject is required");
        await emailApi.quickSend({ to: lead.email, subject, html: body });
        notify.success(`Email sent to ${lead.email}`);
      } else if (provider === "whatsapp") {
        const phone = waPhone || (lead.phone || "").replace(/\D/g, "");
        if (!phone) throw new Error("No phone on this lead");
        await waApi.sendText({ to: phone, body: body.trim() });
        notify.success("WhatsApp sent");
      }
      setBody("");
      await load();
    } catch (err) {
      notify.error(err.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  const activeProvider = providers.find((p) => p.id === provider);
  const noProviders = !loading && providers.length === 0;

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="card-header">
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiMessageCircle /> Chat
        </div>
        <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{
          minHeight: 280,
          maxHeight: 420,
          overflowY: "auto",
          padding: 14,
          background: "#efeae2",
          borderRadius: 10,
          border: "1px solid var(--border)",
          marginBottom: 14,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>
            Loading conversations…
          </div>
        ) : error ? (
          <div style={{ color: "#b91c1c", fontSize: 13, padding: 20, textAlign: "center" }}>{error}</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40, fontStyle: "italic" }}>
            No messages yet. Send the first message below.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {noProviders ? (
        <div style={{
          padding: 14, background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 8, fontSize: 13, color: "#92400e", marginBottom: 0,
        }}>
          {!meta?.emailConnected && !meta?.waConnected && (
            <p style={{ margin: 0 }}>Connect <a href="/email/config">Email (SMTP)</a> or <a href="/whatsapp/settings">WhatsApp</a> to reply from here.</p>
          )}
          {meta?.emailConnected && !lead?.email && (
            <p style={{ margin: "8px 0 0" }}>Add an email address to this lead to send email.</p>
          )}
          {meta?.waConnected && !lead?.phone && (
            <p style={{ margin: "8px 0 0" }}>Add a phone number to this lead to send WhatsApp.</p>
          )}
          {!meta?.emailConnected && lead?.email && (
            <p style={{ margin: "8px 0 0" }}>Configure SMTP in <a href="/email/config">Email settings</a> to send email.</p>
          )}
          {!meta?.waConnected && lead?.phone && (
            <p style={{ margin: "8px 0 0" }}>Connect WhatsApp in <a href="/whatsapp/settings">settings</a> to message this lead.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSend}>
          <div className="grid-2-equal" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Reply via</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            {provider === "whatsapp" && waPhone && (
              <div className="form-group" style={{ marginBottom: 0, display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: "#25d366", borderColor: "#bbf7d0", width: "100%" }}
                  onClick={() => navigate(`/whatsapp/inbox?phone=${encodeURIComponent(waPhone)}`)}
                >
                  <FiExternalLink /> Open in WhatsApp inbox
                </button>
              </div>
            )}
          </div>

          {provider === "email" && (
            <div className="form-group">
              <label>Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
            </div>
          )}

          <div className="form-group">
            <label>Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={provider === "email" ? 5 : 3}
              placeholder={provider === "email" ? "HTML supported…" : "Type a WhatsApp message…"}
              style={{ fontFamily: "inherit", fontSize: 13 }}
            />
            {provider === "email" && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                To: {lead.email}
              </div>
            )}
            {provider === "whatsapp" && activeProvider?.phone && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                To: +{String(activeProvider.phone).replace(/\D/g, "")}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !body.trim()}
            style={provider === "whatsapp" ? { background: "linear-gradient(135deg, #25d366, #128c7e)", border: "none" } : undefined}
          >
            <FiSend /> {sending ? "Sending…" : `Send via ${activeProvider?.label || "channel"}`}
          </button>
        </form>
      )}
    </div>
  );
}

function ChatBubble({ message }) {
  const out = message.direction === "outbound";
  const ch = CHANNEL_STYLE[message.channel] || CHANNEL_STYLE.email;
  const ChIcon = ch.Icon;
  const ts = message.ts
    ? new Date(message.ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "82%",
        padding: "8px 12px 6px",
        background: out ? "#d9fdd3" : "white",
        borderRadius: 10,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        fontSize: 13,
        lineHeight: 1.45,
        color: "#111b21",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            padding: "2px 7px", borderRadius: 4,
            background: ch.bg, color: ch.color,
          }}>
            <ChIcon size={11} /> {ch.label}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: out ? "#166534" : "#6b7280",
            textTransform: "uppercase",
          }}>
            {out ? "Sent" : "Received"}
          </span>
          {message.status === "failed" && (
            <span style={{ fontSize: 10, color: "#b91c1c", fontWeight: 600 }}>Failed</span>
          )}
        </div>

        {message.channel === "email" && message.subject && (
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>{message.subject}</div>
        )}

        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message.text || "(empty)"}
        </div>

        <div style={{ fontSize: 10, color: "#667781", textAlign: "right", marginTop: 4 }}>{ts}</div>
      </div>
    </div>
  );
}

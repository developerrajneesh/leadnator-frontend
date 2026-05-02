import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FiX, FiMail, FiMessageCircle, FiSend, FiCheck, FiAlertCircle, FiUser,
  FiClock, FiEdit3, FiExternalLink,
} from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";
import { emailApi } from "../../../api/email";
import { waApi } from "../../../api/whatsapp";
import { waNumber } from "../../constants";
import { notify } from "../../../globalComponents/Toast/Toast";

// Modal for contacting a lead on ONE channel (email OR whatsapp).
// The channel is fixed by the `initialTab` prop set by the caller — no
// cross-channel switcher. Inside, there are two sub-tabs:
//   • Compose — write and send the message
//   • History — previous correspondence on this channel with this lead
export default function QuickContactModal({ lead, initialTab = "email", onClose }) {
  const navigate = useNavigate();
  const channel = initialTab === "whatsapp" ? "whatsapp" : "email";
  const isEmail = channel === "email";
  const brand = isEmail ? "#ea4335" : "#25d366";
  const firstName = (lead?.name || "").split(" ")[0] || "there";

  const [section, setSection] = useState("compose"); // "compose" | "history"

  const [subject, setSubject] = useState(`Hi ${firstName}, quick note from Leadnator`);
  const [emailBody, setEmailBody] = useState(
    `<p>Hi ${firstName},</p>\n<p>Thanks for connecting — following up on your recent interest.</p>\n<p>Best,<br/>Team</p>`
  );
  const [waBody, setWaBody] = useState(`Hi ${firstName}, thanks for connecting!`);

  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const phoneDigits = waNumber(lead?.phone || "");
  const historyScrollRef = useRef(null);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      if (isEmail && lead?.email) {
        const r = await emailApi.quickSendHistory(lead.email);
        setHistory(r.history || []);
      } else if (!isEmail && phoneDigits) {
        const r = await waApi.conversation(phoneDigits);
        setHistory(r.messages || []);
      } else {
        setHistory([]);
      }
    } catch { setHistory([]); }
    finally { setLoadingHistory(false); }
  }

  useEffect(() => { loadHistory(); }, []); // eslint-disable-line

  useEffect(() => {
    if (section === "history" && historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [section, history]);

  async function sendEmail() {
    if (!lead?.email) { notify.warn("This lead has no email address."); return; }
    setSending(true); setResult(null);
    const tid = notify.loading(`Sending email to ${lead.email}…`);
    try {
      await emailApi.quickSend({ to: lead.email, subject, html: emailBody });
      notify.update(tid, { render: `Email sent to ${lead.email}`, type: "success", isLoading: false, autoClose: 3500 });
      loadHistory();
    } catch (err) {
      notify.update(tid, { render: err.message || "Email failed", type: "error", isLoading: false, autoClose: 5000 });
      setResult({ ok: false, message: err.message });
    } finally { setSending(false); }
  }

  async function sendWhatsApp() {
    if (!phoneDigits) { notify.warn("This lead has no phone number."); return; }
    if (!waBody.trim()) { notify.warn("Message body is empty."); return; }
    setSending(true); setResult(null);
    const tid = notify.loading(`Sending WhatsApp to +${phoneDigits}…`);
    try {
      await waApi.sendText({ to: phoneDigits, body: waBody });
      notify.update(tid, { render: `WhatsApp sent to +${phoneDigits}`, type: "success", isLoading: false, autoClose: 3500 });
      loadHistory();
    } catch (err) {
      notify.update(tid, { render: err.message || "WhatsApp failed", type: "error", isLoading: false, autoClose: 5000 });
      setResult({ ok: false, message: err.message });
    } finally { setSending(false); }
  }

  return createPortal(
    <div
      onMouseDown={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose?.(); }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 620, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", position: "relative", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiUser /> Contact {lead?.name}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, padding: "3px 8px", borderRadius: 6,
              background: isEmail ? "#fee2e2" : "#dcfce7",
              color: brand, fontWeight: 700, letterSpacing: 0.3,
            }}>
              {isEmail ? <FiMail /> : <SiWhatsapp />} {isEmail ? "EMAIL" : "WHATSAPP"}
            </span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        {/* Lead summary */}
        <div style={{
          padding: 10, background: "var(--primary-50)", borderRadius: 8,
          fontSize: 12, marginBottom: 12, color: "var(--text-muted)",
          display: "flex", gap: 14, flexWrap: "wrap",
        }}>
          {lead?.email && <span><FiMail style={{ verticalAlign: "middle" }} /> {lead.email}</span>}
          {lead?.phone && <span><FiMessageCircle style={{ verticalAlign: "middle" }} /> {lead.phone}</span>}
        </div>

        {/* Section tabs: Compose / History */}
        <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
          <TabBtn active={section === "compose"} onClick={() => setSection("compose")} color={brand} icon={<FiEdit3 />} label="Message" />
          <TabBtn active={section === "history"} onClick={() => setSection("history")} color={brand} icon={<FiClock />}
                  label={`History${history.length ? ` (${history.length})` : ""}`} />
        </div>

        {section === "compose" ? (
          isEmail ? (
            <>
              <div className="form-group">
                <label>To</label>
                <input value={lead?.email || ""} disabled />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
              </div>
              <div className="form-group">
                <label>Message (HTML supported) *</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Write your message…"
                  style={{ fontFamily: "inherit", fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Your saved signature will be auto-appended if enabled in <a href="/email/config">/email/config</a>.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>To</label>
                <input value={phoneDigits ? `+${phoneDigits}` : "(no phone)"} disabled />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={waBody}
                  onChange={(e) => setWaBody(e.target.value)}
                  rows={6}
                  placeholder="Type a WhatsApp message…"
                  style={{ fontFamily: "inherit", fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Sent from your connected number in <a href="/whatsapp/settings">/whatsapp/settings</a>. WA requires a 24h customer service window for free-form text.
                </div>
              </div>
            </>
          )
        ) : (
          <div
            ref={historyScrollRef}
            style={{
              padding: isEmail ? 8 : 10,
              background: isEmail ? "#f9fafb" : "#efeae2",
              borderRadius: 10, maxHeight: 420, minHeight: 180, overflowY: "auto",
              border: "1px solid var(--border)", marginBottom: 14,
            }}
          >
            {loadingHistory ? (
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", padding: 20 }}>Loading history…</div>
            ) : history.length === 0 ? (
              <EmptyHistory text={
                isEmail
                  ? (lead?.email ? "No prior emails sent from Leadnator to this address." : "This lead has no email.")
                  : (phoneDigits  ? "No prior WhatsApp messages with this contact."       : "This lead has no phone.")
              } />
            ) : isEmail ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((m) => <EmailHistoryItem key={m.id} m={m} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {history.map((m) => <WaHistoryItem key={m.id} m={m} />)}
              </div>
            )}
          </div>
        )}

        {result && (
          <div style={{
            padding: 10, marginBottom: 12, borderRadius: 8, fontSize: 13,
            background: result.ok ? "#f0fdf4" : "#fef2f2",
            color:      result.ok ? "#166534" : "#b91c1c",
            border: `1px solid ${result.ok ? "#bbf7d0" : "#fecaca"}`,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            {result.ok ? <FiCheck style={{ marginTop: 2, flexShrink: 0 }} /> : <FiAlertCircle style={{ marginTop: 2, flexShrink: 0 }} />}
            <span>{result.message}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          {/* "Open in chat" only makes sense for WhatsApp with a phone number */}
          {!isEmail && phoneDigits ? (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                navigate(`/whatsapp/inbox?phone=${encodeURIComponent(phoneDigits)}`);
              }}
              style={{
                background: "transparent", border: "1px solid #bbf7d0",
                color: "#25d366", fontSize: 12, fontWeight: 600,
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <FiExternalLink /> Open in chat
            </button>
          ) : <span />}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
            {section === "compose" && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={sending}
                onClick={isEmail ? sendEmail : sendWhatsApp}
                style={!isEmail ? { background: "linear-gradient(135deg, #25d366, #128c7e)", border: "none" } : undefined}
              >
                <FiSend /> {sending ? "Sending…" : isEmail ? "Send email" : "Send WhatsApp"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EmptyHistory({ text }) {
  return (
    <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", padding: 30, fontStyle: "italic" }}>
      {text}
    </div>
  );
}

function EmailHistoryItem({ m }) {
  const ts = m.ts ? new Date(m.ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const preview = (m.html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  const failed = m.status === "failed";
  return (
    <div style={{
      padding: 10, background: failed ? "#fef2f2" : "white", borderRadius: 8,
      border: `1px solid ${failed ? "#fecaca" : "#e5e7eb"}`, fontSize: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <strong style={{ color: failed ? "#b91c1c" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {m.subject || "(no subject)"}
        </strong>
        <span style={{ color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap" }}>{ts}</span>
      </div>
      <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {failed ? `✗ ${m.error || "Failed"}` : (preview || "(empty)")}
      </div>
    </div>
  );
}

function WaHistoryItem({ m }) {
  const out = m.direction === "outbound";
  const ts = m.ts ? new Date(m.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "75%", padding: "6px 10px 4px",
        background: out ? "#d9fdd3" : "white",
        borderRadius: 8, fontSize: 12, lineHeight: 1.4, color: "#111b21",
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
        wordBreak: "break-word",
      }}>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {m.type === "template"
            ? <em style={{ color: "#374151" }}>[template] {m.templateName}</em>
            : (m.text || "(empty)")}
        </div>
        <div style={{ fontSize: 10, color: "#667781", textAlign: "right", marginTop: 2 }}>{ts}</div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 16px",
        background: "transparent",
        border: "none",
        borderBottom: `2px solid ${active ? color : "transparent"}`,
        color: active ? color : "var(--text-muted)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: -1,
      }}
    >
      {icon} {label}
    </button>
  );
}

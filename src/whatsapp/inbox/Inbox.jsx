import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FiSend, FiRefreshCw, FiSearch, FiMessageCircle,
  FiPhone, FiVideo, FiMoreVertical, FiCheck, FiSmile, FiPaperclip,
  FiImage, FiFile, FiMusic, FiMapPin, FiList, FiCornerUpRight, FiLink, FiCopy, FiCpu,
  FiClipboard, FiX, FiExternalLink, FiTag, FiTrash2, FiLayers, FiPlus, FiArrowLeft,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { waApi } from "../../api/whatsapp";
import { api } from "../../api/client";
import { invalidateLeads } from "../../api/hooks";
import { onSocket } from "../../api/socket";
import { notify } from "../../globalComponents/Toast/Toast";

// Stable color from a string (phone number) so each avatar is consistent.
const AVATAR_COLORS = [
  ["#7c3aed", "#a78bfa"], ["#10b981", "#34d399"], ["#ec4899", "#f9a8d4"],
  ["#f59e0b", "#fcd34d"], ["#0ea5e9", "#38bdf8"], ["#ef4444", "#fca5a5"],
  ["#8b5cf6", "#c4b5fd"], ["#0d9488", "#5eead4"], ["#db2777", "#f472b6"],
];
function colorFor(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name = "") {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function timeShort(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (isToday) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  if (today.getTime() - d.getTime() < 7 * 86400000) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function dateSeparator(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "TODAY";
  if (d.toDateString() === yest.toDateString()) return "YESTERDAY";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function Avatar({ name, size = 44, online = false }) {
  const [c1, c2] = colorFor(name);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        color: "white", fontWeight: 700, fontSize: size * 0.36,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      }}>{initials(name)}</div>
      {online && (
        <span style={{
          position: "absolute", right: 0, bottom: 0,
          width: 12, height: 12, borderRadius: "50%",
          background: "#10b981", border: "2px solid white",
        }} />
      )}
    </div>
  );
}

// Render a WhatsAppMessage body with its rich meta (buttons, media, list, etc.).
// For bot-sent outbound messages the meta has the full step snapshot; for inbound
// taps it has `{ tap: { kind, title } }` so we can show "User tapped: Next".
function MessageBody({ m, out, onOpenMedia }) {
  const meta = m.meta || {};

  // Inbound tap on a bot button / list row
  if (!out && meta.tap) {
    return (
      <div style={{ color: "#111b21" }}>
        <span style={{ fontSize: 10, padding: "2px 6px", background: "#ede9fe", color: "#5b21b6", borderRadius: 4, fontWeight: 700, letterSpacing: 0.3, marginRight: 6 }}>
          {meta.tap.kind === "list_row" ? "LIST" : "TAP"}
        </span>
        <strong>{meta.tap.title}</strong>
        {meta.tap.description && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{meta.tap.description}</div>}
      </div>
    );
  }

  // Inbound media
  if (!out && meta.media) {
    return (
      <div style={{ color: "#111b21" }}>
        <MediaThumb kind={meta.media.kind} id={meta.media.id} filename={meta.media.filename} onOpen={onOpenMedia} />
        {m.text && m.text !== `[${meta.media.kind}]` && <div style={{ marginTop: 4 }}>{m.text}</div>}
      </div>
    );
  }
  // Inbound location
  if (!out && meta.location) {
    return <LocationCard loc={meta.location} />;
  }

  // Template messages
  if (m.type === "template") {
    return (
      <div style={{ color: "#111b21" }}>
        <span style={{ fontSize: 10, padding: "2px 6px", background: "#fef3c7", color: "#92400e", borderRadius: 4, fontWeight: 700, marginRight: 6 }}>TEMPLATE</span>
        <em>{m.templateName}</em>
      </div>
    );
  }

  // Outbound bot message — may have media / list / buttons in meta
  return (
    <div style={{ color: "#111b21" }}>
      {meta.bot?.name && (
        <div style={{ fontSize: 10, fontWeight: 700, color: "#5b21b6", letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <FiCpu /> {meta.bot.name}
        </div>
      )}

      {meta.media && <MediaThumb kind={meta.media.kind} id={meta.media.id} url={meta.media.url} filename={meta.media.filename} onOpen={onOpenMedia} />}
      {meta.location && <LocationCard loc={meta.location} />}

      {m.text && <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>}

      {/* Flow CTA recap */}
      {meta.flow && (
        <div style={{
          marginTop: 6, padding: "8px 10px", borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontSize: 13, fontWeight: 600, color: "#7c3aed",
          background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 6,
        }}>
          <FiClipboard /> {meta.flow.cta || "Open form"}
        </div>
      )}

      {/* Buttons recap */}
      {(meta.buttons || []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          {meta.buttons.map((b) => {
            const Icon = b.kind === "quick_reply" ? FiCornerUpRight
                       : b.kind === "url"         ? FiLink
                       : b.kind === "phone"       ? FiPhone
                       : FiCopy;
            return (
              <div key={b.id} style={{
                padding: "4px 8px", fontSize: 12, fontWeight: 600,
                color: "#06b6d4", textAlign: "center",
                border: "1px solid #06b6d433", background: "#06b6d40d",
                borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Icon /> {b.label || "(no label)"}
              </div>
            );
          })}
        </div>
      )}

      {/* List recap */}
      {meta.list && (
        <div style={{
          marginTop: 6, padding: 6, borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontSize: 12, fontWeight: 600, color: "#06b6d4",
        }}>
          <FiList /> {meta.list.buttonText} · {(meta.list.sections || []).reduce((a, s) => a + (s.rows?.length || 0), 0)} options
        </div>
      )}
    </div>
  );
}

// Build an auth'd URL that proxies a Meta media id through our backend so
// <img> / <video> / <audio> tags can render it directly. We pass the JWT as
// ?token=... because browsers can't attach custom headers to <img src>.
function mediaProxyUrl(id) {
  if (!id) return null;
  const base  = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
  const token = localStorage.getItem("leadnator_token");
  return `${base}/wa/media/${id}?token=${encodeURIComponent(token || "")}`;
}

function MediaThumb({ kind, url, id, filename, onOpen }) {
  const src = url || mediaProxyUrl(id);
  const open = () => src && onOpen?.({ kind, src, filename });
  if (kind === "image") {
    return src
      ? <img src={src} alt="" onClick={open} style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 6, marginBottom: 4, display: "block", cursor: "zoom-in" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
      : <div style={thumbBox("#fce7f3", "#ec4899")}><FiImage /> Image</div>;
  }
  if (kind === "video") {
    return src
      ? (
        <div style={{ position: "relative", cursor: "zoom-in", marginBottom: 4 }} onClick={open}>
          <video src={src} style={{ width: "100%", maxHeight: 240, borderRadius: 6, background: "#000", display: "block", pointerEvents: "none" }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 32, textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}>▶</div>
        </div>
      )
      : <div style={thumbBox("#1f2937", "white")}><FiVideo /> Video</div>;
  }
  if (kind === "audio") {
    return src
      ? <audio src={src} controls style={{ width: "100%", marginBottom: 4 }} />
      : <div style={{ ...thumbBox("#ede9fe", "#7c3aed"), padding: "8px 10px", height: "auto" }}><FiMusic /> Voice note</div>;
  }
  if (kind === "document") {
    const isPdfByName = /\.pdf$/i.test(filename || "");
    return (
      <div
        onClick={() => src && onOpen?.({ kind: isPdfByName ? "pdf" : "document", src, filename })}
        style={{
          ...thumbBox("#eff6ff", "#0ea5e9"),
          padding: "10px 12px", height: "auto", justifyContent: "flex-start", gap: 10,
          cursor: src ? "pointer" : "default",
        }}
      >
        <FiFile style={{ fontSize: 22, flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {filename || "document"}
          </div>
          {src && <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>Tap to open</div>}
        </div>
      </div>
    );
  }
  if (kind === "sticker") {
    return src
      ? <img src={src} alt="sticker" onClick={open} style={{ width: 120, height: 120, objectFit: "contain", cursor: "zoom-in" }} />
      : <div style={thumbBox("#fef3c7", "#92400e")}>Sticker</div>;
  }
  return null;
}

function thumbBox(bg, color) {
  return {
    background: bg, color, height: 100, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 700, gap: 6, marginBottom: 4,
  };
}

function LocationCard({ loc }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #a7f3d0, #10b981)", height: 90, borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: 24, marginBottom: 4,
    }}>
      <FiMapPin />
      <div style={{ fontSize: 11, fontWeight: 600, marginLeft: 8 }}>
        {loc.name || `${loc.lat}, ${loc.lng}`}
      </div>
    </div>
  );
}

// Fullscreen media viewer — opens on click from any image/video/pdf bubble.
// Closes on Esc, click on backdrop, or the X button. Content fills the screen
// while preserving aspect ratio.
function MediaLightbox({ viewer, onClose }) {
  const { kind, src, filename } = viewer;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    // Lock page scroll behind the overlay.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
        zIndex: 99999, display: "flex", flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "12px 18px", display: "flex", alignItems: "center", gap: 12,
          color: "white", background: "rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {filename || (kind === "image" ? "Image" : kind === "video" ? "Video" : kind === "pdf" ? "PDF document" : "Attachment")}
        </div>
        <a href={src} download={filename || true} target="_blank" rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: "white", textDecoration: "none", fontSize: 12, padding: "6px 12px", background: "rgba(255,255,255,0.12)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}
          title="Download">
          <FiFile /> Download
        </a>
        <button
          type="button" onClick={onClose}
          style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "white", borderRadius: 6, width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          title="Close (Esc)"
        ><FiX /></button>
      </div>

      {/* Content area */}
      <div
        onClick={onClose}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflow: "auto" }}
      >
        {kind === "image" && (
          <img
            src={src} alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "default" }}
          />
        )}
        {kind === "video" && (
          <video
            src={src} controls autoPlay
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", background: "#000" }}
          />
        )}
        {kind === "audio" && (
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: 20, borderRadius: 12, minWidth: 340 }}>
            <audio src={src} controls autoPlay style={{ width: "100%" }} />
          </div>
        )}
        {kind === "pdf" && (
          <iframe
            src={src} title={filename || "pdf"}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "90vw", height: "90vh", border: "none", borderRadius: 8, background: "white" }}
          />
        )}
        {kind !== "image" && kind !== "video" && kind !== "audio" && kind !== "pdf" && (
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: 24, borderRadius: 12, textAlign: "center", maxWidth: 420 }}>
            <FiFile size={40} style={{ color: "#0ea5e9" }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>{filename || "Attachment"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Preview not available for this file type.
            </div>
            <a href={src} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: 14, display: "inline-flex" }}>
              Open / Download
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Preview panel shown after the user picks a file but before sending. Renders
// inline previews for the common rich types (image/video/audio/PDF) and a
// generic file card for everything else (zip/docx/xlsx/etc).
function FilePreviewPanel({ pending, upload, onCaptionChange, onCancel, onSend }) {
  const { file, previewUrl, caption } = pending;
  const mime = file.type || "";
  const size = file.size;
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");
  const isPdf   = mime === "application/pdf";

  function fmtSize(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }
  function ext() {
    const m = file.name.match(/\.([^.]+)$/);
    return (m ? m[1] : "file").toUpperCase();
  }

  return (
    <div style={{
      padding: 12, background: "#f9fafb", borderTop: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.3, textTransform: "uppercase" }}>
          Preview {isImage ? "· Image" : isVideo ? "· Video" : isAudio ? "· Audio" : isPdf ? "· PDF" : "· File"}
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} disabled={!!upload} title="Cancel">
          <FiX />
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Preview area */}
        <div style={{
          width: 140, minHeight: 100, borderRadius: 10, overflow: "hidden",
          background: "#111827", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isImage && (
            <img src={previewUrl} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
          )}
          {isVideo && (
            <video src={previewUrl} style={{ width: "100%", maxHeight: 160 }} controls />
          )}
          {isAudio && (
            <div style={{ width: "100%", padding: 10, background: "#1f2937", color: "white", textAlign: "center" }}>
              <FiMusic size={24} />
              <audio src={previewUrl} style={{ width: "100%", marginTop: 8 }} controls />
            </div>
          )}
          {isPdf && (
            <iframe src={previewUrl} title="pdf" style={{ width: "100%", height: 160, border: "none", background: "white" }} />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div style={{
              width: "100%", padding: 16, background: "#1f2937", color: "white",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <FiFile size={34} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>{ext()}</div>
            </div>
          )}
        </div>

        {/* File info + caption */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {fmtSize(size)} · {mime || "unknown type"}
          </div>
          {/* Caption — not supported for audio or unknown types on WA */}
          {!isAudio && (
            <input
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Add a caption (optional)"
              style={{
                padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 13, fontFamily: "inherit", background: "white",
                marginTop: 4,
              }}
              disabled={!!upload}
            />
          )}
        </div>
      </div>

      {upload && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, color: "#1e3a8a" }}>
            <span>Uploading to WhatsApp…</span>
            <strong>{upload.progress}%</strong>
          </div>
          <div style={{ height: 4, background: "#dbeafe", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${upload.progress}%`, background: "#1877f2", transition: "width 0.2s" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={!!upload} style={{ fontSize: 12, padding: "6px 14px" }}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={onSend} disabled={!!upload}
          style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", borderColor: "#128c7e", fontSize: 12, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FiSend /> {upload ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

// Lightweight emoji picker — no library dependency, ~1 kB. Covers the most
// common WhatsApp emojis across 6 tabs so users don't need to open a system picker.
const EMOJI_TABS = {
  Smileys: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠".split(" "),
  Hands:   "👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳".split(" "),
  Hearts:  "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♥️ 💌 💋 👀 👁️ 💯 💢 💥 💫 💦 💨 🕳️ 💣 💬 🗨️ 🗯️ 💭 💤".split(" "),
  Objects: "✅ ❌ ⚠️ ❗ ❓ 💯 🔥 ⭐ 🌟 ✨ 🎉 🎊 🎁 🎈 🎂 🍰 ☕ 🍵 🍺 🍷 🍕 🍔 🍟 🌮 🎯 🎮 🎲 🎵 🎶 📱 💻 ⌨️ 🖥️ 🖱️ 📸 📷 📹 🎥 📺 ☎️ 📞 📧 📨 📬 📭 📎 📌 📍 🔗".split(" "),
  People:  "👶 👧 🧒 👦 👩 🧑 👨 👵 🧓 👴 👮 🕵️ 💂 👷 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟".split(" "),
  Nature:  "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐢 🐍 🌵 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎋 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻".split(" "),
};

function EmojiPicker({ onPick, onClose }) {
  const [tab, setTab] = useState("Smileys");
  useEffect(() => {
    function onDoc(e) {
      if (!e.target.closest?.(".emoji-picker")) onClose?.();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []); // eslint-disable-line

  return (
    <div className="emoji-picker" style={{
      position: "absolute", bottom: "100%", left: 0, marginBottom: 8,
      width: 320, maxHeight: 320, background: "white",
      border: "1px solid var(--border)", borderRadius: 12,
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
      zIndex: 50, display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "4px" }}>
        {Object.keys(EMOJI_TABS).map((k) => (
          <button
            key={k} type="button" onClick={() => setTab(k)}
            style={{
              flex: 1, padding: "6px 4px", border: "none", fontSize: 11, fontWeight: 600,
              background: tab === k ? "var(--primary-50)" : "transparent",
              color: tab === k ? "var(--primary)" : "var(--text-muted)",
              borderRadius: 6, cursor: "pointer",
            }}
          >{k}</button>
        ))}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
        gap: 2, padding: 8, overflowY: "auto", maxHeight: 260,
      }}>
        {EMOJI_TABS[tab].map((e, i) => (
          <button
            key={`${tab}-${i}`} type="button"
            onClick={() => onPick(e)}
            style={{
              padding: "6px 0", border: "none", background: "transparent",
              fontSize: 20, cursor: "pointer", borderRadius: 6,
            }}
            onMouseEnter={(ev) => ev.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}
          >{e}</button>
        ))}
      </div>
    </div>
  );
}

function StatusTicks({ status }) {
  const seen = status === "read";
  const delivered = ["delivered", "read"].includes(status);
  const color = seen ? "#34b7f1" : "#9ca3af";
  return (
    <span style={{ display: "inline-flex", marginLeft: 4, color }}>
      <FiCheck size={11} />
      {delivered && <FiCheck size={11} style={{ marginLeft: -6 }} />}
    </span>
  );
}

const DOODLE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160' opacity='0.08'%3E%3Cpath fill='%2325d366' d='M80 24c8 0 12 4 12 12s-4 12-12 12-12-4-12-12 4-12 12-12zm-40 40c8 0 12 4 12 12s-4 12-12 12-12-4-12-12 4-12 12-12zm80 0c8 0 12 4 12 12s-4 12-12 12-12-4-12-12 4-12 12-12zm-40 40c8 0 12 4 12 12s-4 12-12 12-12-4-12-12 4-12 12-12z'/%3E%3C/svg%3E")`;

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activePhone, setActivePhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showFlow, setShowFlow]   = useState(false);
  const [showEmoji, setShowEmoji]   = useState(false);
  const [upload, setUpload]         = useState(null); // { progress, filename } while sending a file
  const [pendingFile, setPending]   = useState(null); // { file, previewUrl, caption } picked but not yet sent
  const [viewer, setViewer]         = useState(null); // { kind, src, filename } for the fullscreen lightbox
  const [showLabels, setShowLabels] = useState(false);
  const [showMenu, setShowMenu]     = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [lead, setLead]             = useState(null); // matched CRM Lead if phone is in /leads
  const [savingStatus, setSavingStatus] = useState(false);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const fileRef   = useRef(null);
  const connectedPhoneNumberIdRef = useRef(null);
  const [connectedDisplayPhone, setConnectedDisplayPhone] = useState("");

  async function loadConversations() {
    setLoadingConvs(true); setError("");
    try {
      const res = await waApi.conversations();
      connectedPhoneNumberIdRef.current = res.phoneNumberId || null;
      setConnectedDisplayPhone(res.displayPhone || "");
      const list = res.conversations || [];
      setConversations(list);
      setActivePhone((cur) => {
        if (cur && list.some((c) => c.phone === cur)) return cur;
        return list[0]?.phone || "";
      });
    } catch (err) { setError(err.message); }
    finally { setLoadingConvs(false); }
  }

  async function loadMessages(phone) {
    if (!phone) return;
    setLoadingMsgs(true);
    try {
      const res = await waApi.conversation(phone);
      setMessages(res.messages || []);
      setContact(res.contact);
      setLead(res.lead || null);
    } catch (err) { setError(err.message); }
    finally { setLoadingMsgs(false); }
  }

  async function refreshInbox() {
    try { await waApi.repairInboxScope(); } catch { /* non-fatal */ }
    await loadConversations();
  }

  useEffect(() => { refreshInbox(); }, []);

  // Reload when user returns after switching WhatsApp account in Settings.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") refreshInbox();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Auto-open a specific conversation if navigated here with ?phone=…
  // (e.g. from the lead-detail "Open in chat" button).
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam && phoneParam !== activePhone) {
      setActivePhone(phoneParam);
      // Clean the URL so a browser reload doesn't keep re-opening.
      searchParams.delete("phone");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]); // eslint-disable-line
  useEffect(() => {
    if (!activePhone) return;
    loadMessages(activePhone);
    // Mark this conversation read on the server + zero the local badge.
    waApi.markConversationRead(activePhone).catch(() => {});
    setConversations((list) => list.map((c) => c.phone === activePhone ? { ...c, unread: 0 } : c));
  }, [activePhone]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Update the sidebar conversation list in-place for a single message event —
  // avoids a full network refetch per event, which was causing the flicker.
  function upsertConversation(message, contact) {
    setConversations((list) => {
      const phone = message.contactPhone;
      const existing = list.find((c) => c.phone === phone);
      // Bump unread only for inbound messages on a chat that isn't currently
      // focused — otherwise the user is actively viewing them.
      const bumpUnread = message.direction === "inbound" && phone !== activePhone;
      const patched = {
        phone,
        name: contact?.name || existing?.name || phone,
        lastMessage: message.text || existing?.lastMessage || "",
        lastDirection: message.direction,
        lastTs: message.ts || new Date().toISOString(),
        count: (existing?.count || 0) + 1,
        labels: existing?.labels || [],
        unread: (existing?.unread || 0) + (bumpUnread ? 1 : 0),
      };
      const rest = list.filter((c) => c.phone !== phone);
      return [patched, ...rest];
    });
  }

  // Real-time via Socket.IO. Backend emits:
  //   wa.inbound  → new incoming message from a contact
  //   wa.outbound → message we (or the chatbot) sent
  //   wa.status   → delivery/read-tick change for a sent message
  useEffect(() => {
    const connectedId = connectedPhoneNumberIdRef.current;
    const offInbound = onSocket("wa.inbound", ({ message, contact }) => {
      if (connectedId && message.phoneNumberId && message.phoneNumberId !== connectedId) return;
      if (message.contactPhone === activePhone) {
        setMessages((cur) => (cur.some((m) => m.id === message.id) ? cur : [...cur, message]));
      }
      upsertConversation(message, contact);
    });

    const offOutbound = onSocket("wa.outbound", ({ message }) => {
      if (connectedId && message.phoneNumberId && message.phoneNumberId !== connectedId) return;
      if (message.contactPhone === activePhone) {
        setMessages((cur) => (cur.some((m) => m.id === message.id) ? cur : [...cur, message]));
      }
      upsertConversation(message);
    });

    const offStatus = onSocket("wa.status", ({ messageId, status }) => {
      setMessages((cur) => cur.map((m) => (m.messageId === messageId ? { ...m, status } : m)));
    });

    return () => { offInbound(); offOutbound(); offStatus(); };
  }, [activePhone]); // eslint-disable-line

  async function changeLeadStatus(newStatus) {
    if (!lead || newStatus === lead.status) return;
    setSavingStatus(true);
    try {
      const r = await api.leads.update(lead.id, { status: newStatus });
      setLead(r.lead || { ...lead, status: newStatus });
      invalidateLeads(); // sidebar cache (/leads/all) will refetch on next visit
      notify.success(`Status → ${newStatus}`);
    } catch (err) {
      notify.error(err.message || "Failed to update lead status");
    } finally { setSavingStatus(false); }
  }

  function insertEmoji(ch) {
    // Append the emoji at the end of the current draft. Simpler than tracking
    // cursor position and works well enough for a composer.
    setDraft((d) => d + ch);
    // Keep focus on the text input so the user can keep typing.
    inputRef.current?.focus();
  }

  // Step 1 — user picks a file → stage it as `pendingFile` with a preview URL.
  // Nothing is sent yet; they'll confirm in the preview panel.
  function stageFile(file) {
    if (!file || !activePhone) return;
    // Create a local object URL for the preview panel (works for image/video/
    // audio/pdf). Revoked when the user cancels or the send completes.
    const previewUrl = URL.createObjectURL(file);
    setPending({ file, previewUrl, caption: "" });
    if (fileRef.current) fileRef.current.value = "";
  }

  function cancelPending() {
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPending(null);
  }

  // Step 2 — user clicks Send on the preview panel.
  async function sendPending() {
    if (!pendingFile || !activePhone) return;
    const { file, caption } = pendingFile;
    setUpload({ progress: 0, filename: file.name });
    try {
      await waApi.replyMedia(activePhone, file, (caption || "").trim(), (p) => setUpload({ progress: p, filename: file.name }));
      notify.success(`Sent ${file.name}`);
      cancelPending();
    } catch (err) {
      notify.error(err.message || "Failed to send file");
    } finally {
      setUpload(null);
    }
  }

  async function sendReply(e) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !activePhone) return;
    setSending(true);
    const draftText = text;
    setDraft("");      // optimistic clear
    try {
      // The socket will deliver the persisted message via `wa.outbound` and
      // update both the chat + sidebar, so no manual refetch is needed.
      await waApi.reply(activePhone, draftText);
      inputRef.current?.focus();
    } catch (err) {
      setDraft(draftText); // restore on failure
      alert(err.message || "Send failed.");
    } finally { setSending(false); }
  }

  function onInputKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  const filteredConvs = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter((c) =>
      (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [conversations, search]);

  const activeConv = conversations.find((c) => c.phone === activePhone);
  const activeName = contact?.name || activeConv?.name || activePhone;

  // Group messages by date for separators
  const grouped = useMemo(() => {
    const groups = [];
    let lastKey = "";
    for (const m of messages) {
      const key = m.ts ? new Date(m.ts).toDateString() : "";
      if (key !== lastKey) {
        groups.push({ separator: true, label: dateSeparator(m.ts), key });
        lastKey = key;
      }
      groups.push(m);
    }
    return groups;
  }, [messages]);

  return (
    <>
      {/* Floating error banner so the chat itself still fills the viewport */}
      {error && (
        <div style={{
          position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)",
          padding: "10px 16px", background: "#fee2e2", color: "#b91c1c",
          borderRadius: 10, fontSize: 13, zIndex: 40,
          boxShadow: "0 10px 30px -10px rgba(239, 68, 68, .35)",
        }}>{error}</div>
      )}

      <div className={`card wa-inbox ${activePhone ? "wa-chat-open" : ""}`} style={{
        padding: 0, display: "grid", gridTemplateColumns: "300px 1fr",
        // Negative margins cancel .content-pad's 24px padding so the chat
        // fills the entire viewport width + height below the main header.
        margin: "-24px",
        height: "calc(100vh - 64px)",
        minHeight: 480, overflow: "hidden",
        borderRadius: 0,
        boxShadow: "none",
        borderLeft: "none", borderRight: "none", borderBottom: "none",
      }}>
        {/* ---- LEFT: Conversations ---- */}
        <div className="wa-pane-list" style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "#fafbfc", minHeight: 0, height: "100%" }}>
          {/* Sidebar header: brand + conversation count + refresh */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border)",
            background: "white",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <FaWhatsapp style={{ color: "#25d366", fontSize: 18, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Inbox</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {connectedDisplayPhone ? `${connectedDisplayPhone} · ` : ""}
                  {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <button
              className="btn btn-ghost"
              style={{ padding: 6, borderRadius: 8 }}
              onClick={() => { refreshInbox(); if (activePhone) loadMessages(activePhone); }}
              title="Refresh"
            >
              <FiRefreshCw />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", background: "white" }}>
            <div style={{ position: "relative" }}>
              <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or number…"
                style={{
                  width: "100%", padding: "10px 12px 10px 38px",
                  borderRadius: 24, border: "1px solid #e5e7eb",
                  background: "#f3f4f6", fontSize: 13, outline: "none",
                }}
              />
            </div>
          </div>

          {/* Conversations list */}
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {loadingConvs ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                {search ? `No matches for "${search}"` : "No conversations yet."}
              </div>
            ) : filteredConvs.map((c) => {
              const active = activePhone === c.phone;
              const isYou = c.lastDirection === "outbound";
              return (
                <div
                  key={c.phone}
                  onClick={() => setActivePhone(c.phone)}
                  style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "9px 12px", cursor: "pointer", position: "relative",
                    background: active ? "#eef2ff" : "white",
                    borderLeft: active ? "3px solid #7c3aed" : "3px solid transparent",
                    transition: "0.12s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "white"; }}
                >
                  <Avatar name={c.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                      </strong>
                      <span style={{
                        fontSize: 11,
                        color: (c.unread > 0 && !active) ? "#25d366" : active ? "#7c3aed" : "var(--text-muted)",
                        fontWeight: (c.unread > 0 && !active) ? 700 : 400,
                        whiteSpace: "nowrap", marginLeft: 8,
                      }}>
                        {timeShort(c.lastTs)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: (c.unread > 0 && !active) ? "var(--text)" : "var(--text-muted)",
                      fontWeight: (c.unread > 0 && !active) ? 600 : 400,
                      marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isYou && <span style={{ color: "#9ca3af", fontWeight: 400 }}>✓ </span>}
                        {c.lastMessage || <em style={{ opacity: 0.6 }}>No preview</em>}
                      </span>
                      {c.unread > 0 && !active && (
                        <span style={{
                          flexShrink: 0,
                          minWidth: 20, height: 20, padding: "0 6px",
                          borderRadius: 10, background: "#25d366", color: "white",
                          fontSize: 11, fontWeight: 700,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}>{c.unread > 99 ? "99+" : c.unread}</span>
                      )}
                    </div>

                    {/* Label chips attached to this contact */}
                    {(c.labels || []).length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                        {c.labels.slice(0, 3).map((l) => (
                          <span key={l.id} style={{
                            display: "inline-flex", alignItems: "center", gap: 3,
                            padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700,
                            background: `${l.color}1a`, color: l.color,
                            border: `1px solid ${l.color}33`,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: l.color }} />
                            {l.name}
                          </span>
                        ))}
                        {c.labels.length > 3 && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{c.labels.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- RIGHT: Chat area ---- */}
        {!activePhone ? (
          <div className="wa-pane-thread" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "#f9fafb", color: "var(--text-muted)", textAlign: "center", padding: 40,
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, color: "white", marginBottom: 18,
              boxShadow: "0 8px 24px rgba(37, 211, 102, 0.3)",
            }}>
              <FaWhatsapp />
            </div>
            <h3 style={{ marginBottom: 6, fontSize: 18, color: "#111827" }}>Pick a conversation</h3>
            <p style={{ fontSize: 13, maxWidth: 320 }}>
              Select a chat from the left to view messages and reply. Your conversations sync from WhatsApp Cloud API in real-time.
            </p>
          </div>
        ) : (
          <div className="wa-pane-thread" style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, height: "100%" }}>
            {/* Chat header */}
            <div style={{
              padding: "8px 14px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12, background: "#f9fafb",
            }}>
              <button type="button" className="wa-back-btn icon-btn" onClick={() => setActivePhone("")} title="Back" aria-label="Back to conversations">
                <FiArrowLeft />
              </button>
              <Avatar name={activeName} size={36} online />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{activeName}</div>

                  {(contact?.labels || []).slice(0, 3).map((l) => (
                    <span key={l.id || l._id || l} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                      background: `${l.color || "#7c3aed"}1a`, color: l.color || "#7c3aed",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: l.color || "#7c3aed" }} />
                      {l.name || "label"}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  online · {activePhone}
                </div>
              </div>
              {/* Lead pipeline status — sits next to the action icons so the
                  name row stays clean. Dropdown triggered on click. */}
              {lead && (
                <LeadStatusPill
                  lead={lead}
                  onChange={changeLeadStatus}
                  saving={savingStatus}
                />
              )}

              <div style={{ position: "relative" }}>
                <button
                  className="icon-btn"
                  title="Label this contact"
                  onClick={async () => {
                    setShowMenu(false);
                    if (showLabels) { setShowLabels(false); return; }
                    // Ensure a WhatsAppContact row exists — some conversations
                    // (e.g. brand-new phones) may not have one saved yet.
                    let c = contact;
                    if (!c) {
                      try {
                        const created = await waApi.createContact({ name: activeName, phone: activePhone });
                        c = created.contact;
                        setContact(c);
                      } catch (err) {
                        notify.error(err.message || "Could not create contact");
                        return;
                      }
                    }
                    setShowLabels(true);
                  }}
                  style={{ color: "#7c3aed" }}
                ><FiTag /></button>
                {showLabels && contact && (
                  <LabelsPopover
                    contact={contact}
                    onClose={() => setShowLabels(false)}
                    onUpdated={(updated) => {
                      setContact(updated);
                      // Mirror the updated labels into the sidebar list so
                      // chips refresh without a network round-trip.
                      setConversations((list) =>
                        list.map((c) =>
                          c.phone === activePhone
                            ? { ...c, labels: (updated?.labels || []).map((l) => ({ id: l._id?.toString?.() || l.id, name: l.name, color: l.color })) }
                            : c
                        )
                      );
                    }}
                  />
                )}
              </div>
              <div style={{ position: "relative" }}>
                <button
                  className="icon-btn"
                  title="More"
                  onClick={() => { setShowMenu((s) => !s); setShowLabels(false); }}
                ><FiMoreVertical /></button>
                {showMenu && (
                  <ChatMenu
                    onClose={() => setShowMenu(false)}
                    onDelete={async () => {
                      setShowMenu(false);
                      if (!confirm(`Delete the entire conversation with ${activeName}? This removes the contact and all messages.`)) return;
                      try {
                        await waApi.deleteConversation(activePhone);
                        notify.success("Lead deleted");
                        setActivePhone("");
                        setMessages([]);
                        setContact(null);
                        setConversations((list) => list.filter((c) => c.phone !== activePhone));
                      } catch (err) { notify.error(err.message); }
                    }}
                    onSendTemplate={() => { setShowMenu(false); setShowTemplate(true); }}
                  />
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1, minHeight: 0, padding: "12px 20px", overflowY: "auto",
                background: "#efeae2",
                backgroundImage: DOODLE_BG,
                backgroundRepeat: "repeat",
              }}
            >
              {loadingMsgs ? (
                <div style={{ textAlign: "center", color: "#6b7280", marginTop: 40, fontSize: 13 }}>
                  <div style={{ display: "inline-block", padding: "8px 14px", background: "white", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                    Loading messages…
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: 60, color: "#6b7280" }}>
                  <FiMessageCircle style={{ fontSize: 36, marginBottom: 10, color: "#25d366" }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>No messages yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Send the first message to start this conversation.</div>
                </div>
              ) : grouped.map((m, i) => {
                if (m.separator) {
                  return (
                    <div key={`sep-${i}`} style={{ display: "flex", justifyContent: "center", margin: "16px 0 12px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
                        background: "rgba(225, 245, 254, 0.92)",
                        color: "#0c4a6e", padding: "4px 12px", borderRadius: 8,
                        boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
                      }}>{m.label}</span>
                    </div>
                  );
                }
                const out = m.direction === "outbound";
                return (
                  <div key={m.id} style={{
                    display: "flex", justifyContent: out ? "flex-end" : "flex-start",
                    marginBottom: 6,
                  }}>
                    <div style={{
                      background: out ? "#d9fdd3" : "white",
                      padding: "8px 10px 6px",
                      borderRadius: 8,
                      borderTopRightRadius: out ? 2 : 8,
                      borderTopLeftRadius:  out ? 8 : 2,
                      maxWidth: (m.meta?.media || m.meta?.list || m.meta?.location) ? "75%" : "65%",
                      fontSize: 14, lineHeight: 1.4,
                      boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
                      position: "relative",
                    }}>
                      <MessageBody m={m} out={out} onOpenMedia={setViewer} />
                      <div style={{
                        fontSize: 10, color: "#667781", marginTop: 2, textAlign: "right",
                        display: "inline-flex", alignItems: "center", gap: 2, float: "right",
                        marginLeft: 8, marginBottom: -2,
                      }}>
                        {m.ts ? new Date(m.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        {out && <StatusTicks status={m.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* File preview panel — shown after a file is picked, before send */}
            {pendingFile && (
              <FilePreviewPanel
                pending={pendingFile}
                upload={upload}
                onCaptionChange={(v) => setPending((cur) => cur ? { ...cur, caption: v } : cur)}
                onCancel={cancelPending}
                onSend={sendPending}
              />
            )}

            {/* Upload progress bar — only while the pending panel isn't open */}
            {upload && !pendingFile && (
              <div style={{ padding: "6px 14px", background: "#eff6ff", borderTop: "1px solid #bfdbfe", fontSize: 12, color: "#1e3a8a", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Uploading {upload.filename}…</span>
                  <strong>{upload.progress}%</strong>
                </div>
                <div style={{ height: 4, background: "#dbeafe", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${upload.progress}%`, background: "#1877f2", transition: "width 0.2s" }} />
                </div>
              </div>
            )}

            {/* Composer */}
            <form onSubmit={sendReply} style={{
              padding: "8px 12px", borderTop: "1px solid var(--border)",
              display: "flex", gap: 10, alignItems: "center", background: "#f0f2f5",
              flexShrink: 0,
            }}>
              <div style={{ position: "relative" }}>
                <button type="button" className="icon-btn" title="Emoji" onClick={() => setShowEmoji((s) => !s)}>
                  <FiSmile />
                </button>
                {showEmoji && (
                  <EmojiPicker onPick={(e) => { insertEmoji(e); }} onClose={() => setShowEmoji(false)} />
                )}
              </div>
              <button type="button" className="icon-btn" title="Attach file" onClick={() => fileRef.current?.click()} disabled={!!upload}>
                <FiPaperclip />
              </button>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*,video/*,audio/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                onChange={(e) => stageFile(e.target.files?.[0])}
              />
              <button type="button" className="icon-btn" title="Send form / flow" onClick={() => setShowFlow(true)} style={{ color: "#7c3aed" }}>
                <FiClipboard />
              </button>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onInputKey}
                disabled={sending}
                placeholder="Type a message"
                style={{
                  flex: 1, padding: "10px 16px", border: "none",
                  borderRadius: 24, fontSize: 14, outline: "none",
                  background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                title="Send"
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: draft.trim() ? "linear-gradient(135deg, #25d366, #128c7e)" : "#d1d5db",
                  color: "white", border: "none", cursor: draft.trim() ? "pointer" : "not-allowed",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, transition: "0.15s", flexShrink: 0,
                  boxShadow: draft.trim() ? "0 3px 10px rgba(37, 211, 102, 0.35)" : "none",
                }}
              >
                <FiSend />
              </button>
            </form>
          </div>
        )}
      </div>

      {showFlow && (
        <SendFlowModal
          toPhone={activePhone}
          onClose={() => setShowFlow(false)}
        />
      )}

      {viewer && (
        <MediaLightbox viewer={viewer} onClose={() => setViewer(null)} />
      )}

      {showTemplate && activePhone && (
        <SendTemplateModal
          toPhone={activePhone}
          onClose={() => setShowTemplate(false)}
        />
      )}
    </>
  );
}

/* ---------- Lead pipeline status pill with dropdown ---------- */
const PIPELINE_STAGES = [
  { key: "new",       label: "New",        color: "#3b82f6" },
  { key: "contacted", label: "Contacted",  color: "#f59e0b" },
  { key: "qualified", label: "Qualified",  color: "#10b981" },
  { key: "hot",       label: "Hot",        color: "#ef4444" },
  { key: "lost",      label: "Lost",       color: "#9ca3af" },
];

function LeadStatusPill({ lead, onChange, saving }) {
  const [open, setOpen] = useState(false);
  const current = PIPELINE_STAGES.find((s) => s.key === lead.status) || PIPELINE_STAGES[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (!e.target.closest?.(".lead-status-pill")) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="lead-status-pill" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        title={`Lead in CRM — click to change stage`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
          borderRadius: 10, fontSize: 10, fontWeight: 700,
          background: `${current.color}1a`, color: current.color,
          border: `1px solid ${current.color}55`, cursor: "pointer",
          textTransform: "uppercase", letterSpacing: 0.3,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: current.color }} />
        {saving ? "Saving…" : current.label}
        <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: 4,
          background: "white", border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 160,
          overflow: "hidden",
        }}>
          <div style={{ padding: "6px 10px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3, borderBottom: "1px solid var(--border)" }}>
            Pipeline stage
          </div>
          {PIPELINE_STAGES.map((s) => (
            <button
              key={s.key} type="button"
              onClick={() => { setOpen(false); onChange(s.key); }}
              style={{
                width: "100%", padding: "8px 12px", border: "none", background: "transparent",
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                color: s.key === lead.status ? s.color : "var(--text)",
                textAlign: "left",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
              {s.label}
              {s.key === lead.status && <span style={{ marginLeft: "auto", fontSize: 10, color: s.color }}>✓</span>}
            </button>
          ))}
          <a
            href={`/leads/all/${lead.id}`}
            style={{
              display: "block", padding: "8px 12px", fontSize: 11, color: "var(--primary)",
              borderTop: "1px solid var(--border)", textDecoration: "none", fontWeight: 600,
              background: "#f9fafb",
            }}
          >Open full lead →</a>
        </div>
      )}
    </div>
  );
}

/* ---------- Labels popover (Step-3 style) ---------- */
function LabelsPopover({ contact, onClose, onUpdated }) {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(() => new Set((contact.labels || []).map((l) => typeof l === "string" ? l : l.id || l._id)));
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#7c3aed");

  useEffect(() => {
    (async () => {
      try { const r = await waApi.labels(); setLabels(r.labels || []); }
      catch (err) { notify.error(err.message); }
      finally { setLoading(false); }
    })();
    function onDoc(e) { if (!e.target.closest?.(".labels-popover")) onClose(); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []); // eslint-disable-line

  function toggle(id) {
    setPicked((cur) => {
      const n = new Set(cur);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const r = await waApi.setContactLabels(contact.id, [...picked]);
      notify.success("Labels updated");
      onUpdated?.(r.contact);
      onClose();
    } catch (err) { notify.error(err.message); }
    finally { setSaving(false); }
  }

  async function createLabel(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const r = await waApi.createLabel({ name: newName.trim(), color: newColor });
      setLabels((list) => [...list, { ...r.label, id: r.label._id?.toString?.() || r.label.id, contactCount: 0 }]);
      setPicked((cur) => new Set([...cur, r.label._id?.toString?.() || r.label.id]));
      setNewName("");
    } catch (err) { notify.error(err.message); }
  }

  async function deleteLabel(l, e) {
    e.stopPropagation();
    if (!confirm(`Delete the label "${l.name}"? It'll be removed from every contact that uses it.`)) return;
    try {
      await waApi.deleteLabel(l.id);
      setLabels((list) => list.filter((x) => x.id !== l.id));
      setPicked((cur) => { const n = new Set(cur); n.delete(l.id); return n; });
      notify.success(`Label "${l.name}" deleted`);
    } catch (err) { notify.error(err.message); }
  }

  return (
    <div className="labels-popover" style={{
      position: "absolute", top: "100%", right: 0, marginTop: 8,
      width: 300, background: "white", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15)",
      zIndex: 50, overflow: "hidden",
    }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Mark labels</strong>
        <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><FiX /></button>
      </div>

      <div style={{ maxHeight: 240, overflowY: "auto", padding: 8 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>
        ) : labels.length === 0 ? (
          <div style={{ padding: 14, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No labels yet. Create one below ↓</div>
        ) : labels.map((l) => {
          const on = picked.has(l.id);
          return (
            <div
              key={l.id}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "2px 4px", marginBottom: 2, borderRadius: 8,
                background: on ? `${l.color}1a` : "transparent",
              }}
            >
              <button
                type="button" onClick={() => toggle(l.id)}
                style={{
                  flex: 1, textAlign: "left", padding: "6px 8px", border: "none",
                  background: "transparent", borderRadius: 6, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${l.color}`, background: on ? l.color : "white", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, flexShrink: 0 }}>
                  {on && "✓"}
                </span>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600, color: on ? l.color : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
              </button>
              <button
                type="button"
                onClick={(e) => deleteLabel(l, e)}
                title={`Delete "${l.name}"`}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: 6, borderRadius: 6, color: "#b91c1c",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={createLabel} style={{ borderTop: "1px solid var(--border)", padding: 10, background: "#f9fafb" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 }}>
          <FiPlus style={{ verticalAlign: "middle" }} /> New label
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
            style={{ width: 32, height: 30, padding: 0, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "white" }}
            title="Color"
          />
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Label name"
            style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            maxLength={40}
          />
          <button type="submit" className="btn btn-primary" disabled={!newName.trim()} style={{ padding: "5px 10px", fontSize: 12 }}>Add</button>
        </div>
      </form>

      <div style={{ padding: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <button className="btn btn-outline" onClick={onClose} style={{ fontSize: 12, padding: "5px 12px" }}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: 12, padding: "5px 12px" }}>
          {saving ? "Saving…" : "Apply"}
        </button>
      </div>
    </div>
  );
}

/* ---------- 3-dot chat menu (Delete lead / Send template) ---------- */
function ChatMenu({ onClose, onDelete, onSendTemplate }) {
  useEffect(() => {
    function onDoc(e) { if (!e.target.closest?.(".chat-menu")) onClose(); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []); // eslint-disable-line

  return (
    <div className="chat-menu" style={{
      position: "absolute", top: "100%", right: 0, marginTop: 6,
      width: 200, background: "white", border: "1px solid var(--border)",
      borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      zIndex: 60, overflow: "hidden",
    }}>
      <button
        onClick={onSendTemplate}
        style={menuItemStyle("#1877f2")}
      >
        <FiLayers /> Send template
      </button>
      <button
        onClick={onDelete}
        style={menuItemStyle("#b91c1c")}
      >
        <FiTrash2 /> Delete lead
      </button>
    </div>
  );
}

function menuItemStyle(color) {
  return {
    width: "100%", padding: "10px 14px", border: "none", background: "white",
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13,
    color, fontWeight: 600, textAlign: "left",
  };
}

/* ---------- Send-Template modal ---------- */
function SendTemplateModal({ toPhone, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState("");
  const [lang, setLang] = useState("en_US");
  const [params, setParams] = useState([]); // string[] for body variables
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await waApi.templates();
        const list = (r.templates || []).filter((t) => t.status === "APPROVED");
        setTemplates(list);
      } catch (err) { setLoadError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const chosen = templates.find((t) => t.name === selected);
  const body   = chosen ? (chosen.components || []).find((c) => c.type === "BODY") : null;

  // Extract every unique variable in the body — supports both numbered
  // ({{1}}, {{2}}) and named ({{customer_name}}, {{plan_name}}) Meta styles.
  // We preserve first-seen order so inputs match the reading order of the body.
  const varNames = (() => {
    if (!body?.text) return [];
    const re = /\{\{\s*([\w.]+)\s*\}\}/g;
    const seen = new Set();
    const out = [];
    let m;
    while ((m = re.exec(body.text)) !== null) {
      if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); }
    }
    return out;
  })();

  useEffect(() => {
    // Reset values whenever the template changes.
    setParams(Array.from({ length: varNames.length }, () => ""));
    if (chosen?.language) setLang(chosen.language);
  }, [selected, varNames.length]); // eslint-disable-line

  async function submit(e) {
    e.preventDefault();
    if (!chosen) { notify.warn("Pick a template first."); return; }
    const missing = varNames.filter((_, i) => !params[i]?.trim());
    if (missing.length) {
      notify.warn(`Fill in: ${missing.join(", ")}`);
      return;
    }
    setSending(true);
    try {
      await waApi.sendTemplate({
        to: toPhone, templateName: chosen.name, language: lang,
        parameters: params,
      });
      notify.success(`Template sent to +${toPhone}`);
      onClose();
    } catch (err) { notify.error(err.message || "Template send failed"); }
    finally { setSending(false); }
  }

  // Render body preview with each variable replaced by its value (or kept
  // as-is if empty). Escape regex special chars just in case a variable name
  // contains a dot.
  let preview = body?.text || "";
  varNames.forEach((name, i) => {
    const safe = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\{\\{\\s*${safe}\\s*\\}\\}`, "g");
    preview = preview.replace(re, params[i] || `{{${name}}}`);
  });

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 560, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title"><FiLayers style={{ color: "#1877f2" }} /> Send template</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div className="form-group">
          <label>To</label>
          <input value={`+${toPhone}`} disabled />
        </div>

        <div className="form-group">
          <label>Template *</label>
          {loading ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>Loading approved templates…</div>
          ) : loadError ? (
            <div style={{ padding: 10, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 12 }}>{loadError}</div>
          ) : templates.length === 0 ? (
            <div style={{ padding: 10, background: "#fff7ed", color: "#9a3412", borderRadius: 8, fontSize: 12 }}>
              No approved templates yet. Create & submit one in <a href="/whatsapp/templates">Templates</a>.
            </div>
          ) : (
            <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
              <option value="">— Pick a template —</option>
              {templates.map((t) => (
                <option key={t.id || t.name} value={t.name}>{t.name} ({t.language})</option>
              ))}
            </select>
          )}
        </div>

        {chosen && varNames.length > 0 && (
          <div className="form-group">
            <label>Fill in values for the template variables</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {varNames.map((name, i) => (
                <div key={name}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, fontFamily: "monospace" }}>
                    {`{{${name}}}`}
                  </div>
                  <input
                    placeholder={`Value for ${name}`}
                    value={params[i] ?? ""}
                    onChange={(e) => setParams((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Meta requires every variable to have a value — empty ones will block the send.
            </div>
          </div>
        )}

        {chosen && (
          <div style={{ padding: 12, background: "#efeae2", borderRadius: 10, marginTop: 6, marginBottom: 12 }}>
            <div style={{ background: "white", padding: 10, borderRadius: 8, maxWidth: "90%", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 13, color: "#111b21", whiteSpace: "pre-wrap" }}>{preview || <em>(no body)</em>}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={sending || !selected}>
            <FiSend /> {sending ? "Sending…" : "Send template"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

/* ---------- Send-Flow (WhatsApp interactive form) modal ---------- */

function SendFlowModal({ toPhone, onClose }) {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [flowId, setFlowId]   = useState("");
  const [cta, setCta]         = useState("Open form");
  const [body, setBody]       = useState("Tap below to fill out the form.");
  const [header, setHeader]   = useState("");
  const [footer, setFooter]   = useState("");
  const [firstScreen, setFs]  = useState("");
  const [mode, setMode]       = useState("published");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await waApi.metaFlows(); setFlows(r.flows || []); }
      catch (err) { setLoadError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!flowId.trim()) { notify.warn("Pick a flow or paste a Flow ID."); return; }
    setSending(true);
    try {
      await waApi.sendFlow({
        to: toPhone, flowId: flowId.trim(), cta, body, header, footer,
        firstScreen: firstScreen.trim() || undefined, mode,
      });
      notify.success("Form sent on WhatsApp");
      onClose();
    } catch (err) { notify.error(err.message || "Failed to send flow"); }
    finally { setSending(false); }
  }

  const pickedFlow = flows.find((f) => f.id === flowId);

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 620, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto", zIndex: 10000 }}
      >
        <div className="card-header">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiClipboard style={{ color: "#7c3aed" }} /> Send WhatsApp Form
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ padding: 10, background: "#f5f3ff", color: "#5b21b6", borderRadius: 8, fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
          WhatsApp Flows are multi-screen forms (booking, lead capture, surveys) you design in <strong>Meta Business Manager → WhatsApp → Flows</strong> and publish. The CTA button below opens the form inside WhatsApp.
        </div>

        <div className="form-group">
          <label>To</label>
          <input value={toPhone ? `+${toPhone}` : "(no active chat)"} disabled />
        </div>

        {/* Flow picker */}
        <div className="form-group">
          <label>Choose a flow *</label>
          {loading ? (
            <div style={{ padding: 12, background: "#f9fafb", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)" }}>Loading flows from Meta…</div>
          ) : loadError ? (
            <div style={{ padding: 10, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 12 }}>
              {loadError} — you can still paste a Flow ID manually below.
            </div>
          ) : flows.length === 0 ? (
            <div style={{ padding: 10, background: "#fff7ed", color: "#9a3412", borderRadius: 8, fontSize: 12 }}>
              No flows found on your WABA. Create one in Meta Business Manager first, then click Refresh.
            </div>
          ) : (
            <select value={flowId} onChange={(e) => setFlowId(e.target.value)}>
              <option value="">— Select a flow —</option>
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.status}
                </option>
              ))}
            </select>
          )}
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            Or paste a Flow ID directly:
          </div>
          <input
            value={flowId}
            onChange={(e) => setFlowId(e.target.value)}
            placeholder="e.g. 1234567890"
            style={{ fontFamily: "monospace", fontSize: 12, marginTop: 4 }}
          />
        </div>

        {pickedFlow && pickedFlow.status !== "PUBLISHED" && (
          <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
            <FiExternalLink style={{ verticalAlign: "middle" }} /> This flow is <strong>{pickedFlow.status}</strong>. Switch to <strong>Draft mode</strong> below to test it before publishing.
          </div>
        )}

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Header (optional, max 60)</label>
            <input value={header} maxLength={60} onChange={(e) => setHeader(e.target.value)} placeholder="Book appointment" />
          </div>
          <div className="form-group">
            <label>Footer (optional, max 60)</label>
            <input value={footer} maxLength={60} onChange={(e) => setFooter(e.target.value)} placeholder="Powered by Leadnator" />
          </div>
        </div>

        <div className="form-group">
          <label>Body *</label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tap below to fill out the form."
            style={{ fontFamily: "inherit", fontSize: 13 }}
          />
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>CTA button label (max 20)</label>
            <input value={cta} maxLength={20} onChange={(e) => setCta(e.target.value)} placeholder="Open form" />
          </div>
          <div className="form-group">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="published">Published (live to customers)</option>
              <option value="draft">Draft (testing only)</option>
            </select>
          </div>
        </div>

        <details style={{ marginBottom: 12 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}>Advanced — open a specific screen</summary>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11 }}>First screen ID (optional — leave blank to use the flow's default start)</label>
            <input value={firstScreen} onChange={(e) => setFs(e.target.value)} placeholder="e.g. RECOMMEND" style={{ fontFamily: "monospace", fontSize: 12 }} />
          </div>
        </details>

        {/* Preview */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Preview</div>
          <div style={{
            background: "#efeae2", padding: 10, borderRadius: 10,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' opacity='0.1'%3E%3Cpath fill='%2325d366' d='M40 12a8 8 0 11.01 16A8 8 0 0140 12z'/%3E%3C/svg%3E")`,
          }}>
            <div style={{ background: "white", borderRadius: 8, padding: 10, maxWidth: "90%" }}>
              {header && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{header}</div>}
              <div style={{ fontSize: 13, color: "#111b21", whiteSpace: "pre-wrap" }}>{body}</div>
              {footer && <div style={{ color: "#667781", fontSize: 11, marginTop: 6 }}>{footer}</div>}
              <div style={{
                marginTop: 10, borderTop: "1px solid #e5e7eb", paddingTop: 8,
                textAlign: "center", fontSize: 13, fontWeight: 600, color: "#7c3aed",
                padding: "8px 10px", borderRadius: 6, background: "#f5f3ff", border: "1px solid #e9d5ff",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              }}>
                <FiClipboard /> {cta || "Open form"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={sending || !flowId || !body.trim()}>
            <FiSend /> {sending ? "Sending…" : "Send form"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

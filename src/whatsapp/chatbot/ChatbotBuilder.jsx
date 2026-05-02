import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave, FiArrowLeft, FiPlus, FiTrash2, FiPlay, FiPause,
  FiCpu, FiMessageSquare, FiLink, FiPhone, FiCopy, FiCornerUpRight,
  FiSend, FiX, FiStar, FiAlertTriangle, FiInfo,
  FiType, FiImage, FiVideo, FiFile, FiMusic, FiMapPin, FiList,
} from "react-icons/fi";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

const CTA_TYPES = [
  { kind: "quick_reply", label: "Quick reply (go to step)", Icon: FiCornerUpRight, color: "#7c3aed" },
  { kind: "url",         label: "Open URL",                 Icon: FiLink,          color: "#0ea5e9" },
  { kind: "phone",       label: "Call phone number",        Icon: FiPhone,         color: "#10b981" },
  { kind: "copy_code",   label: "Copy code / coupon",       Icon: FiCopy,          color: "#f59e0b" },
];

const BODY_TYPES = [
  { kind: "text",     label: "Text",     Icon: FiType,        color: "#6366f1", hint: "Plain message body" },
  { kind: "image",    label: "Image",    Icon: FiImage,       color: "#ec4899", hint: "Photo with optional caption" },
  { kind: "video",    label: "Video",    Icon: FiVideo,       color: "#f43f5e", hint: "Video with optional caption" },
  { kind: "document", label: "Document", Icon: FiFile,        color: "#0ea5e9", hint: "PDF, docx, etc. with filename" },
  { kind: "audio",    label: "Audio",    Icon: FiMusic,       color: "#8b5cf6", hint: "Voice note or MP3" },
  { kind: "location", label: "Location", Icon: FiMapPin,      color: "#10b981", hint: "Pin on a map" },
  { kind: "list",     label: "List",     Icon: FiList,        color: "#f59e0b", hint: "Scrollable menu (up to 10 rows)" },
];

const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

// Per-button validation for WhatsApp Cloud API free-form messages.
// `index` = position among buttons of the SAME kind on this step.
// Returns { level: "warn" | "error" | null, message }.
function validateButton(btn, { urlIndex, quickIndex }) {
  if (btn.kind === "phone") {
    return {
      level: "warn",
      message: "WhatsApp doesn't support native phone buttons in free-form messages. This number will appear as tap-to-call text in the body. For a real button you need an approved template.",
    };
  }
  if (btn.kind === "copy_code") {
    return {
      level: "warn",
      message: "Copy-code buttons require an approved template. The code will appear as monospaced text in the body — recipient will have to long-press to copy.",
    };
  }
  if (btn.kind === "url") {
    if (!btn.url) return { level: "error", message: "URL is required." };
    if (!/^https?:\/\//i.test(btn.url)) return { level: "error", message: "URL must start with http:// or https://" };
    if (urlIndex > 0) {
      return {
        level: "warn",
        message: "Only ONE URL button can be native per message (cta_url limit). This extra URL will be rendered as an inline link in the body.",
      };
    }
  }
  if (btn.kind === "quick_reply") {
    if (quickIndex >= 3) {
      return {
        level: "error",
        message: "WhatsApp allows at most 3 quick-reply buttons per message. Remove one.",
      };
    }
    if (!btn.label?.trim()) return { level: "error", message: "Button label is required." };
  }
  return null;
}

export default function ChatbotBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bot, setBot] = useState(null);
  const [loading, setLoad] = useState(true);
  const [saving, setSave] = useState(false);
  const [activeStepId, setActiveStepId] = useState(null);

  async function load() {
    setLoad(true);
    try { const r = await waApi.chatbot(id); setBot(r.chatbot); setActiveStepId(r.chatbot.steps?.[0]?.id || null); }
    catch (err) { notify.error(err.message); }
    finally { setLoad(false); }
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  // Run every button through validateButton() across every step; return error-level issues.
  function collectErrors() {
    const out = [];
    for (const s of bot.steps || []) {
      const counters = { url: 0, quick_reply: 0 };
      for (const btn of (s.buttons || [])) {
        const urlIndex   = btn.kind === "url"         ? counters.url++         : 0;
        const quickIndex = btn.kind === "quick_reply" ? counters.quick_reply++ : 0;
        const v = validateButton(btn, { urlIndex, quickIndex });
        if (v?.level === "error") {
          const name = (s.triggers || []).slice(0, 2).join(", ") || "(unnamed step)";
          out.push(`"${name}" → ${v.message}`);
        }
      }
    }
    return out;
  }

  async function save() {
    const errors = collectErrors();
    if (errors.length) {
      notify.error(`${errors.length} issue${errors.length === 1 ? "" : "s"} — fix before saving:\n• ${errors.slice(0, 3).join("\n• ")}`);
      return;
    }
    setSave(true);
    try {
      await waApi.updateChatbot(bot.id, {
        name: bot.name, description: bot.description, status: bot.status,
        fallback: bot.fallback, steps: bot.steps,
      });
      notify.success("Chatbot saved");
    } catch (err) { notify.error(err.message); }
    finally { setSave(false); }
  }

  async function toggleStatus() {
    const next = bot.status === "active" ? "paused" : "active";
    setBot({ ...bot, status: next });
    try { await waApi.updateChatbot(bot.id, { status: next }); notify.info(`Bot ${next}`); }
    catch (err) { notify.error(err.message); }
  }

  function patchStep(stepId, patch) {
    setBot((b) => ({ ...b, steps: b.steps.map((s) => s.id === stepId ? { ...s, ...patch } : s) }));
  }

  function addStep() {
    const newStep = { id: uid("s"), isStart: false, triggers: [], message: "New step reply", buttons: [] };
    setBot((b) => ({ ...b, steps: [...b.steps, newStep] }));
    setActiveStepId(newStep.id);
  }

  function deleteStep(stepId) {
    if (!confirm("Delete this step? Any buttons pointing to it will become unlinked.")) return;
    setBot((b) => ({
      ...b,
      steps: b.steps
        .filter((s) => s.id !== stepId)
        // Clear any nextStepId references to the deleted step.
        .map((s) => ({
          ...s,
          buttons: (s.buttons || []).map((btn) => btn.nextStepId === stepId ? { ...btn, nextStepId: "" } : btn),
        })),
    }));
    setActiveStepId((cur) => (cur === stepId ? null : cur));
  }

  function setStartStep(stepId) {
    setBot((b) => ({ ...b, steps: b.steps.map((s) => ({ ...s, isStart: s.id === stepId })) }));
  }

  function addButton(stepId, kind = "quick_reply") {
    const label = kind === "quick_reply" ? "Next" : kind === "url" ? "Visit site" : kind === "phone" ? "Call us" : "Get code";
    const newBtn = { id: uid("b"), kind, label };
    setBot((b) => ({
      ...b,
      steps: b.steps.map((s) => s.id === stepId ? { ...s, buttons: [...(s.buttons || []), newBtn] } : s),
    }));
  }

  function patchButton(stepId, btnId, patch) {
    setBot((b) => ({
      ...b,
      steps: b.steps.map((s) => s.id !== stepId ? s : {
        ...s, buttons: s.buttons.map((btn) => btn.id === btnId ? { ...btn, ...patch } : btn),
      }),
    }));
  }

  function removeButton(stepId, btnId) {
    setBot((b) => ({
      ...b,
      steps: b.steps.map((s) => s.id !== stepId ? s : {
        ...s, buttons: s.buttons.filter((btn) => btn.id !== btnId),
      }),
    }));
  }

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading chatbot…</div>;
  if (!bot)    return <div className="card" style={{ padding: 40 }}>Chatbot not found.</div>;

  const activeStep = bot.steps.find((s) => s.id === activeStepId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/whatsapp/chatbot")}><FiArrowLeft /> Back</button>
          <input
            value={bot.name}
            onChange={(e) => setBot({ ...bot, name: e.target.value })}
            style={{ fontSize: 18, fontWeight: 700, padding: "6px 10px", border: "1px solid transparent", borderRadius: 6, background: "transparent", minWidth: 240 }}
            onFocus={(e) => e.target.style.borderColor = "var(--border)"}
            onBlur={(e) => e.target.style.borderColor = "transparent"}
          />
          <span className={`badge ${bot.status === "active" ? "qualified" : bot.status === "paused" ? "contacted" : "lost"}`}>{bot.status}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {bot.status === "active"
            ? <button className="btn btn-outline" onClick={toggleStatus}><FiPause /> Pause</button>
            : <button className="btn btn-outline" onClick={toggleStatus}><FiPlay /> Activate</button>}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <FiSave /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 360px", gap: 12, minHeight: 0 }}>

        {/* ---- LEFT: Steps list ---- */}
        <div className="card" style={{ overflowY: "auto", padding: 12, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="card-title" style={{ fontSize: 13 }}><FiCpu /> Flow steps ({bot.steps.length})</div>
            <button className="btn btn-primary" onClick={addStep} title="Add step" style={{ padding: "4px 10px", fontSize: 12 }}>
              <FiPlus /> New
            </button>
          </div>

          {bot.steps.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
              No steps yet. Click <strong>New</strong> to add one.
            </div>
          ) : (
            bot.steps.map((s, idx) => {
              const active = activeStepId === s.id;
              const quickLinks = (s.buttons || []).filter((b) => b.kind === "quick_reply" && b.nextStepId);
              const cat = active ? "#7c3aed" : s.isStart ? "#f59e0b" : "#94a3b8";
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStepId(s.id)}
                  style={{
                    padding: "10px 12px", marginBottom: 8, borderRadius: 10, cursor: "pointer",
                    background: active ? "#f5f3ff" : "white",
                    border: `1px solid ${active ? "#7c3aed" : "var(--border)"}`,
                    boxShadow: active ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "none",
                    transition: "0.12s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: cat, color: "white",
                      fontSize: 11, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>{idx + 1}</div>
                    <strong style={{ fontSize: 13, color: active ? "#7c3aed" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {(s.triggers || []).slice(0, 2).join(", ") || (s.isStart ? "Start (catch-all)" : "Unnamed step")}
                    </strong>
                    {s.isStart && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", color: "#92400e" }}>
                        START
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: 30 }}>
                    {(() => {
                      const bt = BODY_TYPES.find((b) => b.kind === (s.bodyType || "text"));
                      const Icon = bt?.Icon || FiType;
                      return (
                        <>
                          <Icon style={{ verticalAlign: "middle", color: bt?.color, marginRight: 4 }} />
                          {s.bodyType && s.bodyType !== "text"
                            ? <em>{bt.label} · {s.message || "(no caption)"}</em>
                            : (s.message || <em>(empty reply)</em>)}
                        </>
                      );
                    })()}
                  </div>

                  {/* Flow links: show where quick replies route to */}
                  {quickLinks.length > 0 && (
                    <div style={{ marginTop: 6, marginLeft: 30, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {quickLinks.map((b) => {
                        const target = bot.steps.find((x) => x.id === b.nextStepId);
                        const targetIdx = bot.steps.findIndex((x) => x.id === b.nextStepId);
                        return (
                          <span key={b.id} style={{
                            fontSize: 10, padding: "2px 6px", borderRadius: 4,
                            background: "#eef2ff", color: "#4338ca", fontWeight: 600,
                          }}>
                            {b.label || "?"} → #{targetIdx + 1}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, marginLeft: 30, display: "flex", gap: 10 }}>
                    <span>{(s.buttons || []).length} CTA{(s.buttons || []).length === 1 ? "" : "s"}</span>
                    <span>{(s.triggers || []).length} trigger{(s.triggers || []).length === 1 ? "" : "s"}</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Help block at the bottom */}
          <div style={{
            marginTop: "auto", padding: 10, background: "#f8fafc", border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: 4 }}>💡 Tips</strong>
            • Mark one step <FiStar style={{ verticalAlign: "middle", color: "#f59e0b" }} /> <strong>Start</strong> — fires when no trigger matches.<br/>
            • Connect steps with <strong>Quick-reply</strong> buttons & set "Go to step".<br/>
            • Test flows in the <strong>Try it out</strong> panel →
          </div>
        </div>

        {/* ---- CENTER: Step editor ---- */}
        <div className="card" style={{ overflowY: "auto", padding: 16 }}>
          {!activeStep ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
              <FiCpu style={{ fontSize: 48, marginBottom: 10, color: "#7c3aed" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Pick a step on the left to edit it, or add a new one.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="card-title">Step configuration</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!activeStep.isStart && (
                    <button className="btn btn-outline" onClick={() => setStartStep(activeStep.id)}>
                      <FiStar /> Mark as start
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => deleteStep(activeStep.id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>

              {activeStep.isStart && (
                <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, marginBottom: 12, display: "flex", gap: 8 }}>
                  <FiStar /> This is the <strong>Start</strong> step. It fires when a user sends any message that doesn't match another step's triggers.
                </div>
              )}

              <div className="form-group">
                <label>Triggers (comma-separated keywords — matches if user's message contains any)</label>
                <TriggersInput
                  value={activeStep.triggers || []}
                  onChange={(arr) => patchStep(activeStep.id, { triggers: arr })}
                />
              </div>

              <div className="grid-2-equal">
                <div className="form-group">
                  <label>Header (optional, max 60 chars)</label>
                  <input value={activeStep.header || ""} maxLength={60} onChange={(e) => patchStep(activeStep.id, { header: e.target.value })} placeholder="Welcome" />
                </div>
                <div className="form-group">
                  <label>Footer (optional, max 60 chars)</label>
                  <input value={activeStep.footer || ""} maxLength={60} onChange={(e) => patchStep(activeStep.id, { footer: e.target.value })} placeholder="Reply with any option" />
                </div>
              </div>

              <BodyTypePicker
                value={activeStep.bodyType || "text"}
                onChange={(kind) => patchStep(activeStep.id, { bodyType: kind })}
              />

              <BodyEditor
                step={activeStep}
                patch={(obj) => patchStep(activeStep.id, obj)}
                steps={bot.steps}
              />

              {/* CTAs aren't supported on audio/location/list bodies */}
              {["audio", "location", "list"].includes(activeStep.bodyType || "text") && (
                <div style={{ padding: 10, background: "#f8fafc", color: "var(--text-muted)", borderRadius: 8, fontSize: 12, marginTop: 14 }}>
                  <FiInfo style={{ verticalAlign: "middle" }} /> CTA buttons aren't available for <strong>{activeStep.bodyType}</strong> messages.
                  {activeStep.bodyType === "list" ? " Use the list rows above — each row routes to its own step." : " Use a text, image, video, or document body to attach CTAs."}
                </div>
              )}

              {/* Buttons / CTAs */}
              {!["audio", "location", "list"].includes(activeStep.bodyType || "text") && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                  Call-to-action buttons <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>({(activeStep.buttons || []).length} / 10)</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                  {CTA_TYPES.map((c) => (
                    <button
                      key={c.kind}
                      onClick={() => addButton(activeStep.id, c.kind)}
                      disabled={(activeStep.buttons || []).length >= 10}
                      title={c.label}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        border: `1px dashed ${c.color}66`,
                        background: `${c.color}0d`,
                        color: c.color,
                        fontWeight: 600, fontSize: 12,
                        cursor: "pointer",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 4,
                        transition: "0.12s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${c.color}1f`; e.currentTarget.style.borderStyle = "solid"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${c.color}0d`; e.currentTarget.style.borderStyle = "dashed"; }}
                    >
                      <c.Icon style={{ fontSize: 18 }} />
                      <span style={{ fontSize: 11 }}>{c.kind.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>

                <div style={{ padding: 10, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", borderRadius: 8, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                  <FiInfo style={{ verticalAlign: "middle" }} /> <strong>WhatsApp free-form CTA rules:</strong> Native buttons ship as
                  <strong> 1 URL</strong> (cta_url) + up to <strong>3 quick replies</strong> (follow-up message).
                  <strong> Phone</strong> and <strong>copy-code</strong> only become real buttons inside <strong>approved templates</strong> — here they'll render as tappable text in the body.
                </div>

                {(activeStep.buttons || []).length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: 8, fontSize: 12 }}>
                    No CTAs yet. Add one from the buttons above — quick reply, URL, phone, or coupon code.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(() => {
                      // Pass per-kind ordinal to validator so we can flag the 4th quick_reply, 2nd URL, etc.
                      const counters = { url: 0, quick_reply: 0 };
                      return activeStep.buttons.map((btn) => {
                        const urlIndex   = btn.kind === "url"         ? counters.url++         : 0;
                        const quickIndex = btn.kind === "quick_reply" ? counters.quick_reply++ : 0;
                        const warn = validateButton(btn, { urlIndex, quickIndex });
                        return (
                          <ButtonEditor
                            key={btn.id}
                            btn={btn}
                            steps={bot.steps}
                            warning={warn}
                            onChange={(patch) => patchButton(activeStep.id, btn.id, patch)}
                            onRemove={() => removeButton(activeStep.id, btn.id)}
                          />
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
              )}
            </>
          )}
        </div>

        {/* ---- RIGHT: Preview + simulator ---- */}
        <div className="card" style={{ overflowY: "auto", padding: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }} className="card-title">
            <FiMessageSquare /> Preview
          </div>
          <Preview step={activeStep} />
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
            Fallback: <em>{bot.fallback}</em>
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 11 }}>Fallback reply (shown when no step matches)</label>
              <input value={bot.fallback || ""} onChange={(e) => setBot({ ...bot, fallback: e.target.value })} />
            </div>
          </div>
          <Simulator botId={bot.id} />
        </div>
      </div>
    </div>
  );
}

// Picks what kind of content the step's body is — text, image, video,
// document, audio, location, or a scrollable list.
function BodyTypePicker({ value, onChange }) {
  return (
    <div className="form-group">
      <label>Message type</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {BODY_TYPES.map((t) => {
          const on = t.kind === value;
          return (
            <button
              key={t.kind}
              type="button"
              onClick={() => onChange(t.kind)}
              title={t.hint}
              style={{
                padding: "10px 4px",
                borderRadius: 10,
                border: `1px solid ${on ? t.color : "var(--border)"}`,
                background: on ? `${t.color}14` : "white",
                color: on ? t.color : "var(--text-muted)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "0.12s",
              }}
            >
              <t.Icon style={{ fontSize: 18 }} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Uploads a file directly to WhatsApp via our backend and returns a reusable
// media ID. Falls back to a manual URL input for users who already host their
// media on a CDN.
function MediaUploader({ kind, step, patch }) {
  const [mode, setMode] = useState(step.mediaUrl && !step.mediaId ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [err, setErr]             = useState("");
  const inputRef = useRef(null);

  const accept = {
    image:    "image/jpeg,image/png,image/webp",
    video:    "video/mp4,video/3gpp",
    audio:    "audio/aac,audio/amr,audio/mpeg,audio/mp4,audio/ogg",
    document: "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain",
  }[kind];

  const limits = {
    image: "5 MB · JPEG/PNG/WebP",
    video: "16 MB · MP4 / 3GPP",
    audio: "16 MB · AAC / AMR / MP3 / MP4 / OGG",
    document: "100 MB · PDF / DOC / DOCX / XLS / XLSX / TXT",
  }[kind];

  async function handleFile(file) {
    if (!file) return;
    setUploading(true); setProgress(0); setErr("");
    try {
      const r = await waApi.uploadMedia(file, (p) => setProgress(p));
      patch({
        mediaId: r.id,
        mediaUrl: "",
        mediaFilename: kind === "document" ? r.filename : (step.mediaFilename || ""),
        mediaMime: r.mimeType || "",
      });
      notify.success(`${kind} uploaded to WhatsApp`);
    } catch (e) {
      setErr(e.message);
      notify.error(e.message);
    } finally { setUploading(false); }
  }

  const hasId  = !!step.mediaId;
  const hasUrl = !!step.mediaUrl;

  return (
    <div className="form-group">
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{kind.charAt(0).toUpperCase() + kind.slice(1)} file *</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
          <button
            type="button" onClick={() => setMode("upload")}
            style={{ padding: "2px 8px", background: mode === "upload" ? "var(--primary-50)" : "transparent", color: mode === "upload" ? "var(--primary)" : "var(--text-muted)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
          >Upload</button>
          <span style={{ color: "#d1d5db", margin: "0 4px" }}>|</span>
          <button
            type="button" onClick={() => setMode("url")}
            style={{ padding: "2px 8px", background: mode === "url" ? "var(--primary-50)" : "transparent", color: mode === "url" ? "var(--primary)" : "var(--text-muted)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
          >Use URL</button>
        </span>
      </label>

      {mode === "upload" ? (
        <>
          {hasId ? (
            <div style={{
              padding: 12, border: "1px solid #bbf7d0", background: "#f0fdf4",
              borderRadius: 10, display: "flex", gap: 10, alignItems: "center",
            }}>
              <div style={{ fontSize: 22, color: "#10b981" }}>✓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {step.mediaFilename || "Uploaded to WhatsApp"}
                </div>
                <div style={{ fontSize: 11, color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Media ID: {step.mediaId}
                </div>
              </div>
              <button
                className="admin-action"
                onClick={() => patch({ mediaId: "", mediaFilename: "", mediaMime: "" })}
                title="Remove"
              ><FiX /></button>
            </div>
          ) : (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                style={{
                  padding: "24px 16px", border: "2px dashed var(--border)",
                  borderRadius: 10, textAlign: "center", cursor: "pointer",
                  background: "#fafbfc", transition: "0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "var(--primary-50)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fafbfc"; }}
              >
                <FiPlus style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {uploading ? `Uploading… ${progress}%` : "Click or drop a file to upload"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Max {limits}
                </div>
                {uploading && (
                  <div style={{ marginTop: 10, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "var(--primary)", transition: "width 0.2s" }} />
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                hidden
                accept={accept}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </>
          )}
          {err && <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{err}</div>}
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            <FiInfo style={{ verticalAlign: "middle" }} /> Uploaded media is valid for 30 days. Re-upload after that.
          </div>
        </>
      ) : (
        <>
          <input
            value={step.mediaUrl || ""}
            onChange={(e) => patch({ mediaUrl: e.target.value, mediaId: "" })}
            placeholder={
              kind === "image"    ? "https://example.com/banner.jpg" :
              kind === "video"    ? "https://example.com/demo.mp4" :
              kind === "audio"    ? "https://example.com/voice.mp3" :
                                    "https://example.com/brochure.pdf"
            }
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Must be a public HTTPS URL. WhatsApp downloads it every time the bot replies.
          </div>
          {hasUrl && !hasId && (
            <div style={{ fontSize: 11, color: "#92400e", marginTop: 4, padding: 8, background: "#fef3c7", borderRadius: 6, border: "1px solid #fde68a" }}>
              <FiAlertTriangle style={{ verticalAlign: "middle" }} /> Tip: upload the file instead — it's faster and doesn't require public hosting.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Switches between the inputs needed per body type. Updates go through `patch`.
function BodyEditor({ step, patch, steps }) {
  const t = step.bodyType || "text";

  if (t === "text") {
    return (
      <div className="form-group">
        <label>Bot reply *</label>
        <textarea
          rows={4}
          value={step.message || ""}
          onChange={(e) => patch({ message: e.target.value })}
          placeholder="Hi 👋 How can we help?"
          style={{ fontFamily: "inherit", fontSize: 13 }}
        />
      </div>
    );
  }

  if (t === "image" || t === "video" || t === "audio" || t === "document") {
    const captionable = t !== "audio";
    return (
      <>
        <MediaUploader kind={t} step={step} patch={patch} />

        {t === "document" && (
          <div className="form-group">
            <label>Filename (shown in WhatsApp)</label>
            <input
              value={step.mediaFilename || ""}
              onChange={(e) => patch({ mediaFilename: e.target.value })}
              placeholder="pricing.pdf"
            />
          </div>
        )}
        {captionable && (
          <div className="form-group">
            <label>Caption (shown under the {t})</label>
            <textarea
              rows={3}
              value={step.message || ""}
              onChange={(e) => patch({ message: e.target.value })}
              placeholder={`Say something about this ${t}…`}
              style={{ fontFamily: "inherit", fontSize: 13 }}
            />
          </div>
        )}
        {t === "audio" && (
          <div style={{ padding: 10, background: "#f8fafc", color: "var(--text-muted)", borderRadius: 8, fontSize: 12 }}>
            <FiInfo style={{ verticalAlign: "middle" }} /> Audio messages can't carry a caption or buttons — WhatsApp limitation.
          </div>
        )}
      </>
    );
  }

  if (t === "location") {
    const loc = step.location || {};
    return (
      <>
        <div className="grid-2-equal">
          <div className="form-group">
            <label>Latitude *</label>
            <input
              type="number" step="any"
              value={loc.lat ?? ""}
              onChange={(e) => patch({ location: { ...loc, lat: e.target.value === "" ? null : Number(e.target.value) } })}
              placeholder="19.0760"
            />
          </div>
          <div className="form-group">
            <label>Longitude *</label>
            <input
              type="number" step="any"
              value={loc.lng ?? ""}
              onChange={(e) => patch({ location: { ...loc, lng: e.target.value === "" ? null : Number(e.target.value) } })}
              placeholder="72.8777"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Place name</label>
          <input value={loc.name || ""} onChange={(e) => patch({ location: { ...loc, name: e.target.value } })} placeholder="Leadnator HQ" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input value={loc.address || ""} onChange={(e) => patch({ location: { ...loc, address: e.target.value } })} placeholder="123 Business Park, Mumbai" />
        </div>
      </>
    );
  }

  if (t === "list") {
    return <ListEditor step={step} patch={patch} steps={steps} />;
  }

  return null;
}

// Editor for WhatsApp "list" interactive messages — the closest thing to a
// carousel/menu in free-form WA. Up to 10 rows across 1–10 sections.
function ListEditor({ step, patch, steps }) {
  const list = step.list || { buttonText: "Options", sections: [] };
  const uid2 = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

  function patchList(obj) { patch({ list: { ...list, ...obj } }); }
  function patchSections(sections) { patchList({ sections }); }

  function addSection() {
    patchSections([...(list.sections || []), { title: "Section", rows: [] }]);
  }
  function removeSection(i) { patchSections(list.sections.filter((_, j) => j !== i)); }
  function patchSection(i, obj) { patchSections(list.sections.map((s, j) => j === i ? { ...s, ...obj } : s)); }
  function addRow(sIdx) {
    patchSection(sIdx, { rows: [...(list.sections[sIdx].rows || []), { id: uid2("r"), title: "Option", description: "", nextStepId: "" }] });
  }
  function patchRow(sIdx, rIdx, obj) {
    patchSection(sIdx, { rows: list.sections[sIdx].rows.map((r, j) => j === rIdx ? { ...r, ...obj } : r) });
  }
  function removeRow(sIdx, rIdx) {
    patchSection(sIdx, { rows: list.sections[sIdx].rows.filter((_, j) => j !== rIdx) });
  }

  const totalRows = (list.sections || []).reduce((s, sec) => s + (sec.rows?.length || 0), 0);

  return (
    <>
      <div className="form-group">
        <label>Body text *</label>
        <textarea
          rows={2}
          value={step.message || ""}
          onChange={(e) => patch({ message: e.target.value })}
          placeholder="Pick an option below"
          style={{ fontFamily: "inherit", fontSize: 13 }}
        />
      </div>
      <div className="form-group">
        <label>"View options" button label (max 20 chars)</label>
        <input
          value={list.buttonText || ""}
          onChange={(e) => patchList({ buttonText: e.target.value.slice(0, 20) })}
          placeholder="See menu"
        />
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Sections & rows <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>({totalRows} / 10 rows total)</span></span>
        <button className="btn btn-outline" onClick={addSection} style={{ padding: "4px 10px", fontSize: 12 }}>
          <FiPlus /> Add section
        </button>
      </div>

      {(list.sections || []).length === 0 ? (
        <div style={{ padding: 18, textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: 8, fontSize: 12 }}>
          No sections yet. Click <strong>Add section</strong> to start building your list.
        </div>
      ) : list.sections.map((sec, sIdx) => (
        <div key={sIdx} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10, marginBottom: 10, background: "#fafbfc" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input
              value={sec.title || ""}
              onChange={(e) => patchSection(sIdx, { title: e.target.value.slice(0, 24) })}
              placeholder="Section title (optional, max 24 chars)"
              style={{ flex: 1, fontWeight: 600 }}
            />
            <button className="admin-action danger" onClick={() => removeSection(sIdx)} title="Remove section"><FiX /></button>
          </div>

          {(sec.rows || []).map((row, rIdx) => (
            <div key={row.id} style={{ border: "1px solid var(--border)", background: "white", borderRadius: 8, padding: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input
                  value={row.title || ""}
                  onChange={(e) => patchRow(sIdx, rIdx, { title: e.target.value.slice(0, 24) })}
                  placeholder="Row title * (max 24)"
                  style={{ flex: 1 }}
                />
                <button className="admin-action danger" onClick={() => removeRow(sIdx, rIdx)}><FiX /></button>
              </div>
              <input
                value={row.description || ""}
                onChange={(e) => patchRow(sIdx, rIdx, { description: e.target.value.slice(0, 72) })}
                placeholder="Description (optional, max 72)"
                style={{ marginBottom: 6, fontSize: 12 }}
              />
              <select
                value={row.nextStepId || ""}
                onChange={(e) => patchRow(sIdx, rIdx, { nextStepId: e.target.value })}
                style={{ fontSize: 12 }}
              >
                <option value="">— End conversation —</option>
                {(steps || []).map((s, idx) => {
                  const lbl = (s.triggers || [])[0] || (s.isStart ? "Start" : `Step ${idx + 1}`);
                  return <option key={s.id} value={s.id}>#{idx + 1} · {lbl}</option>;
                })}
              </select>
            </div>
          ))}

          <button className="btn btn-ghost" onClick={() => addRow(sIdx)} style={{ padding: "4px 8px", fontSize: 12 }} disabled={totalRows >= 10}>
            <FiPlus /> Add row
          </button>
        </div>
      ))}
    </>
  );
}

// Input that accepts a comma-separated list of keywords. It holds the RAW
// typed string locally so commas, trailing spaces, and partial words survive
// during editing. The parent only receives the cleaned array, updated on
// every keystroke (for validation) — but the display string is untouched.
function TriggersInput({ value, onChange }) {
  const [raw, setRaw] = useState((value || []).join(", "));

  // If the parent changes the triggers (e.g. switching to a different step),
  // reset our buffer. Compare by joined string so same content = no reset.
  const joined = (value || []).join(", ");
  useEffect(() => { if (joined !== raw.split(",").map((t) => t.trim()).filter(Boolean).join(", ")) setRaw(joined); }, [joined]); // eslint-disable-line

  function handleChange(e) {
    const v = e.target.value;
    setRaw(v);
    onChange(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
  }

  return (
    <input
      value={raw}
      onChange={handleChange}
      placeholder="hi, hello, hey"
    />
  );
}

function ButtonEditor({ btn, steps, warning, onChange, onRemove }) {
  const kindMeta = CTA_TYPES.find((c) => c.kind === btn.kind) || CTA_TYPES[0];
  const isError = warning?.level === "error";
  const isWarn  = warning?.level === "warn";
  return (
    <div style={{
      padding: 10,
      border: `1px solid ${isError ? "#fecaca" : isWarn ? "#fed7aa" : "var(--border)"}`,
      borderRadius: 10,
      background: isError ? "#fef2f2" : isWarn ? "#fffbeb" : "#fafbfc",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ color: kindMeta.color }}><kindMeta.Icon /></div>
        <select value={btn.kind} onChange={(e) => onChange({ kind: e.target.value })} style={{ flex: "0 0 auto" }}>
          {CTA_TYPES.map((c) => <option key={c.kind} value={c.kind}>{c.label}</option>)}
        </select>
        <input
          value={btn.label}
          onChange={(e) => onChange({ label: e.target.value.slice(0, 25) })}
          placeholder="Button label (max 25 chars)"
          maxLength={25}
          style={{ flex: 1 }}
        />
        <button className="admin-action danger" onClick={onRemove} title="Remove"><FiX /></button>
      </div>

      {warning && (
        <div style={{
          padding: 8, borderRadius: 6, fontSize: 11, lineHeight: 1.5,
          background: isError ? "#fef2f2" : "#fef3c7",
          color:      isError ? "#991b1b" : "#92400e",
          border: `1px solid ${isError ? "#fecaca" : "#fde68a"}`,
          marginBottom: 8,
          display: "flex", gap: 6, alignItems: "flex-start",
        }}>
          <FiAlertTriangle style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{warning.message}</span>
        </div>
      )}

      {btn.kind === "quick_reply" && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <FiCornerUpRight /> Go to step when tapped
          </label>
          <select value={btn.nextStepId || ""} onChange={(e) => onChange({ nextStepId: e.target.value })}>
            <option value="">— End conversation (no follow-up) —</option>
            {steps.map((s, idx) => {
              const label = (s.triggers || []).slice(0, 2).join(", ") || (s.isStart ? "Start" : `Step ${idx + 1}`);
              return (
                <option key={s.id} value={s.id}>
                  #{idx + 1} · {label} — {(s.message || "").slice(0, 50)}
                </option>
              );
            })}
          </select>
          {btn.nextStepId && (
            <div style={{ fontSize: 11, color: "#166534", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <FiCornerUpRight /> Routes to: <strong>{
                (() => {
                  const t = steps.find((s) => s.id === btn.nextStepId);
                  if (!t) return "(step not found)";
                  const i = steps.findIndex((s) => s.id === btn.nextStepId);
                  return `#${i + 1} · ${(t.triggers || [])[0] || "Step " + (i + 1)}`;
                })()
              }</strong>
            </div>
          )}
        </div>
      )}
      {btn.kind === "url" && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 11 }}>URL to open</label>
          <input type="url" value={btn.url || ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://example.com" />
        </div>
      )}
      {btn.kind === "phone" && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 11 }}>Phone number (E.164, e.g. +919812345678)</label>
          <input value={btn.phone || ""} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+919812345678" />
        </div>
      )}
      {btn.kind === "copy_code" && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 11 }}>Code to copy (promo / coupon)</label>
          <input value={btn.code || ""} onChange={(e) => onChange({ code: e.target.value })} placeholder="LEADNATOR50" />
        </div>
      )}
    </div>
  );
}

// Preview mirrors what the webhook actually sends. Up to 2 WhatsApp bubbles:
//   • Bubble 1: body (+ inlined phones/codes/extra-URLs) + single native URL button if present.
//                If no URL, this bubble carries the quick_reply buttons instead.
//   • Bubble 2: "Or pick an option:" + quick_reply buttons (only when ALSO a URL exists).
function Preview({ step }) {
  const bg = {
    flex: 1, padding: 14,
    background: "#efeae2",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' opacity='0.1'%3E%3Cpath fill='%2325d366' d='M40 12a8 8 0 11.01 16A8 8 0 0140 12zM20 40a8 8 0 11.01 16A8 8 0 0120 40zm40 0a8 8 0 11.01 16A8 8 0 0160 40zM40 68a8 8 0 11.01 16A8 8 0 0140 68z'/%3E%3C/svg%3E")`,
    display: "flex", flexDirection: "column", gap: 8, overflowY: "auto",
  };

  if (!step) {
    return <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Select a step to preview.</div>;
  }

  const t = step.bodyType || "text";

  // LIST — dedicated interactive. No CTAs.
  if (t === "list") {
    const totalRows = (step.list?.sections || []).reduce((a, s) => a + (s.rows?.length || 0), 0);
    return (
      <div style={bg}>
        <div style={{
          background: "white", borderRadius: 10, padding: 10, maxWidth: "92%",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}>
          {step.header && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{step.header}</div>}
          <div style={{ fontSize: 13, color: "#111b21", whiteSpace: "pre-wrap" }}>
            {step.message || <em style={{ color: "#9ca3af" }}>(empty)</em>}
          </div>
          {step.footer && <div style={{ color: "#667781", fontSize: 11, marginTop: 6 }}>{step.footer}</div>}
          <div style={{
            marginTop: 10, borderTop: "1px solid #e5e7eb", paddingTop: 8,
            textAlign: "center", fontSize: 13, fontWeight: 600, color: "#06b6d4",
            padding: "8px 10px", borderRadius: 6, background: "#06b6d40d", border: "1px solid #06b6d433",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
          }}>
            <FiList /> {step.list?.buttonText || "Options"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
            Opens a list with {totalRows} option{totalRows === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    );
  }

  // LOCATION
  if (t === "location") {
    const loc = step.location || {};
    return (
      <div style={bg}>
        <div style={{ background: "white", borderRadius: 10, padding: 10, maxWidth: "92%", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
          <div style={{
            height: 120, background: "linear-gradient(135deg, #a7f3d0, #10b981)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 32,
          }}>
            <FiMapPin />
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{loc.name || "Location"}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{loc.address || `${loc.lat ?? "?"}, ${loc.lng ?? "?"}`}</div>
        </div>
      </div>
    );
  }

  // AUDIO
  if (t === "audio") {
    return (
      <div style={bg}>
        <div style={{ background: "white", borderRadius: 10, padding: 10, maxWidth: "92%", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "#8b5cf6", color: "white",
            display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>▶</div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2 }}>
              <div style={{ height: 4, width: "0%", background: "#8b5cf6", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>0:00 · voice note</div>
          </div>
        </div>
      </div>
    );
  }

  // TEXT + IMAGE + VIDEO + DOCUMENT (can have CTAs)
  const buttons = step.buttons || [];
  const quick   = buttons.filter((b) => b.kind === "quick_reply").slice(0, 3);
  const urls    = buttons.filter((b) => b.kind === "url"       && b.url);
  const phones  = buttons.filter((b) => b.kind === "phone"     && b.phone);
  const codes   = buttons.filter((b) => b.kind === "copy_code" && b.code);

  const inlineParts = [];
  for (const c of phones) inlineParts.push({ icon: "📞", label: c.label, value: c.phone });
  for (const c of codes)  inlineParts.push({ icon: "🎟️", label: c.label, value: c.code, mono: true });
  for (const c of urls.slice(1)) inlineParts.push({ icon: "🔗", label: c.label, value: c.url });

  const primaryUrl = urls[0];
  const primaryQuick = !primaryUrl ? quick : [];
  const bubble1Buttons = primaryUrl
    ? [{ label: primaryUrl.label || "Open", kind: "url" }]
    : primaryQuick.map((b) => ({ label: b.label || "(no label)", kind: "quick_reply" }));
  const bubble2Buttons = primaryUrl && quick.length > 0
    ? quick.map((b) => ({ label: b.label || "(no label)", kind: "quick_reply" }))
    : [];

  return (
    <div style={bg}>
      <Bubble
        mediaType={t !== "text" ? t : null}
        mediaUrl={step.mediaUrl}
        mediaId={step.mediaId}
        mediaFilename={step.mediaFilename}
        header={step.header}
        message={step.message || (t === "text" ? "(empty)" : "")}
        inlineParts={inlineParts}
        footer={step.footer}
        buttons={bubble1Buttons}
      />
      {bubble2Buttons.length > 0 && (
        <Bubble message="Or pick an option:" buttons={bubble2Buttons} />
      )}
    </div>
  );
}

function Bubble({ header, message, inlineParts = [], footer, buttons = [], mediaType, mediaUrl, mediaId, mediaFilename }) {
  const hasMedia = mediaUrl || mediaId;
  return (
    <div style={{
      background: "white", borderRadius: 10, padding: 10,
      maxWidth: "92%", boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    }}>
      {/* Media header (image / video / document) */}
      {mediaType === "image" && (
        mediaUrl ? (
          <img src={mediaUrl} alt="" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, marginBottom: 6 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : mediaId ? (
          <div style={{ background: "linear-gradient(135deg, #fce7f3, #ec4899)", height: 140, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, marginBottom: 6 }}>
            <FiImage />
          </div>
        ) : (
          <div style={{ background: "#e5e7eb", height: 100, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12, marginBottom: 6 }}><FiImage /> Upload or add URL</div>
        )
      )}
      {mediaType === "video" && (
        <div style={{ background: "#111827", height: 140, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, marginBottom: 6 }}>
          <FiVideo />
        </div>
      )}
      {mediaType === "document" && (
        <div style={{ background: "#eff6ff", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <FiFile style={{ fontSize: 24, color: "#0ea5e9" }} />
          <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {mediaFilename || "document.pdf"}
          </div>
        </div>
      )}

      {header && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{header}</div>}
      <div style={{ fontSize: 13, color: "#111b21", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
        {message}
      </div>
      {inlineParts.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          {inlineParts.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#111b21" }}>
              {p.icon} {p.label}: {p.mono
                ? <code style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>{p.value}</code>
                : <span style={{ color: "#1d4ed8", textDecoration: "underline" }}>{p.value}</span>}
            </div>
          ))}
        </div>
      )}
      {footer && <div style={{ color: "#667781", fontSize: 11, marginTop: 6 }}>{footer}</div>}

      {buttons.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10, borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
          {buttons.map((b, i) => {
            const isUrl = b.kind === "url";
            return (
              <div key={i} style={{
                padding: "8px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                color: "#06b6d4", textAlign: "center",
                border: "1px solid #06b6d433", background: "#06b6d40d",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {isUrl ? <FiLink /> : <FiCornerUpRight />} {b.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Simulator({ botId }) {
  const [input, setInput] = useState("");
  const [trace, setTrace] = useState([]); // { role, text, meta }
  const [busy, setBusy] = useState(false);
  const [fromStepId, setFromStepId] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [trace]);

  async function send(text, asButton) {
    if (!text.trim()) return;
    setBusy(true);
    setTrace((t) => [...t, { role: "user", text }]);
    try {
      const r = await waApi.simulateChatbot(botId, { input: text, fromStepId: asButton ? fromStepId : "" });
      if (r.match === "fallback") {
        setTrace((t) => [...t, { role: "bot", text: r.fallback, meta: "fallback" }]);
        setFromStepId("");
      } else {
        setTrace((t) => [...t, { role: "bot", text: r.step.message, meta: r.match, step: r.step }]);
        setFromStepId(r.step.id);
      }
    } catch (err) { notify.error(err.message); }
    finally { setBusy(false); setInput(""); }
  }

  return (
    <div style={{ borderTop: "1px solid var(--border)", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.4 }}>
        Try it out
      </div>
      <div style={{ maxHeight: 220, overflowY: "auto", padding: "0 12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {trace.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 10, fontStyle: "italic" }}>
            Save first, then type a message below to simulate what the bot would reply.
          </div>
        )}
        {trace.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "6px 10px", borderRadius: 8, fontSize: 12,
              background: m.role === "user" ? "#d9fdd3" : "white",
              border: "1px solid #e5e7eb",
            }}>
              {m.text}
              {m.step && (m.step.buttons || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                  {m.step.buttons.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => send(b.label, true)}
                      disabled={busy}
                      style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #7c3aed", background: "white", color: "#7c3aed", cursor: "pointer" }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid var(--border)" }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a test message…" style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}><FiSend /></button>
      </form>
    </div>
  );
}

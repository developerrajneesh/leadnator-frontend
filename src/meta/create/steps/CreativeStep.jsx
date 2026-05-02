import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiUpload, FiImage, FiX, FiInstagram, FiInfo, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { aiApi, metaApi } from "../../../api/meta";
import { AD_TYPES } from "../config";
import { loadState, saveState } from "../state";
import { notify } from "../../../globalComponents/Toast/Toast";

const CTA_OPTIONS = [
  "LEARN_MORE","SIGN_UP","BOOK_TRAVEL","CONTACT_US","GET_QUOTE","SUBSCRIBE",
  "DOWNLOAD","APPLY_NOW","SHOP_NOW","CALL_NOW","WHATSAPP_MESSAGE","GET_OFFER",
  "MESSAGE_PAGE","INSTAGRAM_MESSAGE",
];

export default function CreativeStep({ type }) {
  const navigate = useNavigate();
  const cfg = AD_TYPES[type];
  const saved = loadState(type);

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);

  const [form, setForm] = useState(saved.creative || {
    pageId: saved.pageId || "",
    instagramAccountId: saved.instagramAccountId || "",
    headline: "",
    primaryText: "",
    description: "",
    linkUrl: type === "link" ? "" : "https://leadnator.app",
    imageHash: "",
    imageUrl: "",
    imageFilename: "",
    cta: cfg.cta,
  });

  const [instaAccounts, setInstaAccounts] = useState([]);
  const [instaLoading, setInstaLoading]   = useState(false);
  const [aiBusy, setAiBusy]               = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [progress, setProgress]           = useState(0);
  const [error, setError]                 = useState("");
  const fileRef = useRef(null);

  // Whether this ad type uses Instagram → show the IG account selector.
  const needsInstagram = ["instagramDm"].includes(type) ||
    (saved.adSet?.publisherPlatforms || []).includes("instagram");

  // Load Pages on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await metaApi.pages();
        const list = r?.pages?.data || r?.data || [];
        setPages(list);
        if (list.length === 1 && !form.pageId) setForm((f) => ({ ...f, pageId: list[0].id }));
      } catch (err) { notify.error(err.message); }
      finally { setPagesLoading(false); }
    })();
  }, []); // eslint-disable-line

  // Load Instagram account whenever a Page is picked.
  function loadInstagram() {
    if (!form.pageId) { setInstaAccounts([]); return; }
    setInstaLoading(true);
    metaApi.pageInstagram(form.pageId)
      .then((r) => {
        const list = r?.instagramAccounts || [];
        setInstaAccounts(list);
        if (list.length === 1 && !form.instagramAccountId) {
          setForm((f) => ({ ...f, instagramAccountId: list[0].id }));
        }
      })
      .catch(() => setInstaAccounts([]))
      .finally(() => setInstaLoading(false));
  }
  useEffect(() => { loadInstagram(); }, [form.pageId]); // eslint-disable-line

  // Open Meta's Page → Instagram linking dialog in a centered popup. The user
  // stays on our tab; we poll for popup close + auto-refresh the IG list when
  // they finish (Meta doesn't postMessage back to us, so polling is the trick).
  function openConnectIgPopup() {
    if (!form.pageId) { notify.warn("Pick a Page first."); return; }
    const url = `https://business.facebook.com/latest/settings/instagram_accounts?asset_id=${form.pageId}`;
    const w = 720, h = 760;
    const x = window.screenX + (window.outerWidth - w) / 2;
    const y = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      url,
      "leadnator_ig_connect",
      `width=${w},height=${h},left=${x},top=${y},menubar=no,toolbar=no,location=yes,status=no`
    );
    if (!popup) { notify.error("Popup blocked — allow popups for this site, then try again."); return; }
    notify.info("Connect your Instagram account in the popup, then close it to refresh.");
    const timer = setInterval(() => {
      if (popup.closed) { clearInterval(timer); loadInstagram(); }
    }, 800);
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify.warn("Pick a JPG / PNG / WEBP image."); return; }
    setUploading(true); setProgress(0);
    try {
      const r = await metaApi.uploadAdImage(saved.adAccountId, file, (p) => setProgress(p));
      setForm((f) => ({ ...f, imageHash: r.hash, imageUrl: r.url || "", imageFilename: r.filename || file.name }));
      notify.success("Image uploaded to Meta");
    } catch (err) { notify.error(err.message || "Upload failed"); }
    finally { setUploading(false); }
  }

  async function runAi() {
    setAiBusy(true);
    try {
      const res = await aiApi.generate({
        type: "ad",
        brief: {
          product: saved.campaignName || cfg.title,
          audience: "Indian SMB founders",
          goal: cfg.objective.replace("OUTCOME_", "").toLowerCase(),
          cta: form.cta, link: form.linkUrl,
        },
      });
      const lines = (res.content || "").split("\n").filter(Boolean);
      setForm((f) => ({ ...f, headline: lines[0] || f.headline, primaryText: res.content }));
    } catch (err) { notify.error(err.message || "AI generation failed."); }
    finally { setAiBusy(false); }
  }

  function handleNext(e) {
    e.preventDefault();
    if (!form.pageId) { setError("Pick a Facebook Page."); return; }
    if (needsInstagram && !form.instagramAccountId) {
      setError("Pick an Instagram account (or connect one to your Page in Meta Business Manager).");
      return;
    }
    if (!form.imageHash) { setError("Upload an image — Meta needs a media hash."); return; }
    saveState(type, { creative: form, pageId: form.pageId, instagramAccountId: form.instagramAccountId });
    navigate(`/meta/create/${type}/launch`);
  }

  return (
    <form onSubmit={handleNext} style={{ padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Ad creative</h2>
        <button type="button" className="btn btn-outline" onClick={runAi} disabled={aiBusy}>
          <FiZap /> {aiBusy ? "Writing…" : "AI copy"}
        </button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Headline, primary text, image and call-to-action.</p>

      {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {/* Identity — Page (and Instagram for IG-DM ads) */}
      <div className="grid-2-equal">
        <div className="form-group">
          <label>Facebook Page *</label>
          {pagesLoading ? (
            <div style={{ padding: 8, fontSize: 12, color: "var(--text-muted)" }}>Loading pages…</div>
          ) : pages.length === 0 ? (
            <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 6, fontSize: 12 }}>
              You don't manage any Facebook Pages. Connect a Page in Meta Business Manager first.
            </div>
          ) : (
            <select required value={form.pageId} onChange={(e) => setForm({ ...form, pageId: e.target.value, instagramAccountId: "" })}>
              <option value="">— Select a Page —</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
          )}
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>The Page that appears as the advertiser.</div>
        </div>

        {needsInstagram && (
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FiInstagram style={{ color: "#e1306c" }} /> Instagram account *
            </label>
            {!form.pageId ? (
              <div style={{ padding: 8, fontSize: 12, color: "var(--text-muted)" }}>Pick a Page first.</div>
            ) : instaLoading ? (
              <div style={{ padding: 8, fontSize: 12, color: "var(--text-muted)" }}>Loading Instagram accounts…</div>
            ) : instaAccounts.length === 0 ? (
              <div style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, lineHeight: 1.5, border: "1px solid #fde68a" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>No Instagram account linked to this Page.</strong>
                    <div style={{ marginTop: 4 }}>
                      Meta requires the link to be authorized on their domain — we'll open it in a popup so you can stay here:
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button type="button" onClick={openConnectIgPopup}
                    style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#e1306c", color: "white", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FiInstagram /> Connect Instagram
                  </button>
                  <button type="button" onClick={loadInstagram}
                    style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #fde68a", background: "white", color: "#92400e", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FiRefreshCw /> Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                <select required value={form.instagramAccountId} onChange={(e) => setForm({ ...form, instagramAccountId: e.target.value })}>
                  <option value="">— Select an IG account —</option>
                  {instaAccounts.map((ig) => (
                    <option key={ig.id} value={ig.id}>@{ig.username || ig.name} ({ig.id})</option>
                  ))}
                </select>
                <div style={{ marginTop: 4, fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Want to link a different Instagram?</span>
                  <button type="button" onClick={openConnectIgPopup}
                    style={{ background: "transparent", border: "none", color: "#e1306c", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
                    <FiExternalLink /> Manage on Meta
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Headline *</label>
        <input required value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength="40" placeholder="Grow your business 10× faster" />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{form.headline.length}/40 characters</div>
      </div>

      <div className="form-group">
        <label>Primary text *</label>
        <textarea required rows="5" value={form.primaryText} onChange={(e) => setForm({ ...form, primaryText: e.target.value })}
          placeholder="Tell your story in 1–2 short paragraphs…"
          style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }} />
      </div>

      <div className="grid-2-equal">
        <div className="form-group">
          <label>Description (optional)</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength="30" />
        </div>
        <div className="form-group">
          <label>Call-to-action</label>
          <select value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })}>
            {CTA_OPTIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </div>

      {type === "link" && (
        <div className="form-group">
          <label>Destination URL *</label>
          <input required type="url" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://your-site.com/offer" />
        </div>
      )}

      {/* Image upload — sends to Meta and stores image_hash */}
      <div className="form-group">
        <label>Image *</label>
        {form.imageHash ? (
          <div style={{
            padding: 12, border: "1px solid #bbf7d0", background: "#f0fdf4",
            borderRadius: 10, display: "flex", gap: 12, alignItems: "center",
          }}>
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
            ) : (
              <div style={{ width: 80, height: 80, background: "#dcfce7", color: "#166534", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><FiImage size={24} /></div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                ✓ Uploaded {form.imageFilename || "image"}
              </div>
              <div style={{ fontSize: 11, color: "#15803d", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                hash: {form.imageHash}
              </div>
            </div>
            <button type="button" className="admin-action" onClick={() => setForm({ ...form, imageHash: "", imageUrl: "", imageFilename: "" })}>
              <FiX />
            </button>
          </div>
        ) : (
          <>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              style={{
                padding: "26px 16px", border: "2px dashed var(--border)", borderRadius: 10,
                textAlign: "center", cursor: "pointer", background: "#fafbfc",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = cfg.bg; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fafbfc"; }}
            >
              <FiUpload style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {uploading ? `Uploading to Meta… ${progress}%` : "Click or drop an image to upload"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Recommended 1080 × 1080 (square) or 1200 × 628 (landscape). JPG / PNG / WEBP, max 30 MB.
              </div>
              {uploading && (
                <div style={{ marginTop: 10, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: cfg.color, transition: "width 0.2s" }} />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              <FiInfo style={{ verticalAlign: "middle" }} /> The file goes to your Meta ad account; we store only the returned <code>image_hash</code>.
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={() => navigate(`/meta/create/${type}/adset`)}>← Back</button>
        <button type="submit" className="btn btn-primary" style={{ background: cfg.color, borderColor: cfg.color }}>Next →</button>
      </div>
    </form>
  );
}

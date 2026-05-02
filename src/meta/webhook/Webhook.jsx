import { useEffect, useState } from "react";
import {
  FiLink, FiCopy, FiRefreshCw, FiShield, FiAlertCircle, FiCheckCircle,
  FiExternalLink, FiKey, FiEye, FiEyeOff, FiUsers, FiToggleRight, FiToggleLeft,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { notify } from "../../globalComponents/Toast/Toast";

export default function MetaWebhook() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [revealing, setReveal]= useState(false);
  const [busyPage, setBusyPage] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try { const r = await metaApi.webhook(); setData(r); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); notify.success(`${label} copied`); }
    catch { notify.error("Copy failed"); }
  }

  async function rotate() {
    if (!confirm("Generate a new verify token? You'll need to update it in Meta App Dashboard.")) return;
    try {
      const r = await metaApi.rotateWebhookToken();
      setData((d) => ({ ...d, verifyToken: r.verifyToken }));
      notify.success("New verify token generated");
    } catch (err) { notify.error(err.message); }
  }

  async function syncPages() {
    setSyncing(true);
    try {
      const r = await metaApi.syncWebhookPages();
      setData((d) => ({ ...d, pages: r.pages }));
      notify.success(`Synced ${r.pages.length} page${r.pages.length === 1 ? "" : "s"}`);
    } catch (err) { notify.error(err.message); }
    finally { setSyncing(false); }
  }

  async function togglePage(p) {
    setBusyPage(p.id);
    try {
      await metaApi.subscribePage(p.id, !p.subscribed);
      notify.success(p.subscribed ? `Unsubscribed ${p.name}` : `${p.name} now sends leads to your CRM`);
      load();
    } catch (err) { notify.error(err.message); }
    finally { setBusyPage(""); }
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Meta Lead webhook</h1>
        <p className="page-subtitle">Paste the URL and verify token into your Meta App's Webhook configuration.</p>
        {[0, 1].map((i) => (
          <div key={i} className="card" style={{ marginBottom: 14 }}>
            <span className="skel skel-line" style={{ width: 160, height: 16, display: "block", marginBottom: 14 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8, display: "block", marginBottom: 14 }} />
            <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 40, borderRadius: 8, display: "block" }} />
          </div>
        ))}
      </>
    );
  }
  if (error)   return (
    <div className="card" style={{ padding: 20, color: "#b91c1c" }}>
      {error} — make sure you've connected your Meta account in <a href="/meta/accounts">Ad accounts</a>.
    </div>
  );

  const masked = data.verifyToken.replace(/.(?=.{4})/g, "•");
  const subscribedCount = (data.pages || []).filter((p) => p.subscribed).length;

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiLink style={{ color: "#1877f2" }} /> Meta Lead-Ads Webhook
      </h1>
      <p className="page-subtitle">
        Auto-import leads from your Meta Lead Ads into the CRM. Set up the webhook in Meta's App Dashboard, then subscribe each Page below.
      </p>

      {/* Step 1 — URL */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiLink /> Step 1 — Callback URL</div>
          <span className="badge" style={{ background: "#dbeafe", color: "#1e40af" }}>Copy into Meta</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          Open <strong>Meta App Dashboard → Webhooks → Page</strong> and paste this URL.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={monoBox}>{data.url}</code>
          <button className="btn btn-primary" onClick={() => copy(data.url, "Webhook URL")}><FiCopy /> Copy</button>
        </div>
        {data.url.startsWith("http://localhost") && (
          <div style={{ marginTop: 10, padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, display: "flex", gap: 8 }}>
            <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              Meta cannot reach <code>localhost</code>. Use ngrok / Cloudflare Tunnel and set <code>PUBLIC_WEBHOOK_BASE</code> in <code>backend/.env</code> to your public URL.
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Verify token */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiShield /> Step 2 — Verify Token</div>
          <span className="badge" style={{ background: "#dbeafe", color: "#1e40af" }}>Copy into Meta</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          Meta sends this string in the verification handshake. Match it and the webhook goes live.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ ...monoBox, letterSpacing: revealing ? 0 : 2 }}>
            {revealing ? data.verifyToken : masked}
          </code>
          <button className="btn btn-outline" onClick={() => setReveal((r) => !r)}>
            {revealing ? <><FiEyeOff /> Hide</> : <><FiEye /> Reveal</>}
          </button>
          <button className="btn btn-primary" onClick={() => copy(data.verifyToken, "Verify token")}><FiCopy /> Copy</button>
          <button className="btn btn-outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={rotate}>
            <FiRefreshCw /> Rotate
          </button>
        </div>
      </div>

      {/* Step 3 — Subscribe field */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><FiKey /> Step 3 — Subscribe to "leadgen"</div></div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          In the App Dashboard, after Meta verifies the URL, click <strong>Manage</strong> on the Page object and subscribe to:
        </div>
        <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
          {data.recommendedFields.map((f) => <li key={f}><code>{f}</code></li>)}
        </ul>
        <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginTop: 8 }}>
          <FiExternalLink /> Open Meta App Dashboard
        </a>
      </div>

      {/* Step 4 — Per-page subscription */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title"><FiUsers /> Step 4 — Subscribe each Page</div>
          <button className="btn btn-outline" onClick={syncPages} disabled={syncing}>
            <FiRefreshCw /> {syncing ? "Syncing…" : "Sync pages from Meta"}
          </button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          Even with the App webhook active, each Page has to opt in individually. Toggle the ones you want leads from.
        </div>

        {(!data.pages || data.pages.length === 0) ? (
          <div style={{ padding: 20, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--text-muted)", fontSize: 13 }}>
            No pages yet. Click <strong>Sync pages from Meta</strong> to load the Pages you manage.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.pages.map((p) => (
              <div key={p.id} style={{
                padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10,
                background: p.subscribed ? "#f0fdf4" : "white",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{p.id}</div>
                  {p.subscribed && p.subscribedAt && (
                    <div style={{ fontSize: 11, color: "#166534", marginTop: 2 }}>
                      <FiCheckCircle style={{ verticalAlign: "middle" }} /> Subscribed {new Date(p.subscribedAt).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <button
                  className="btn"
                  disabled={busyPage === p.id}
                  onClick={() => togglePage(p)}
                  style={{
                    background: p.subscribed ? "#fef2f2" : "#10b981",
                    color: p.subscribed ? "#b91c1c" : "white",
                    border: `1px solid ${p.subscribed ? "#fecaca" : "#10b981"}`,
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {busyPage === p.id ? "…" : p.subscribed ? <><FiToggleRight /> Unsubscribe</> : <><FiToggleLeft /> Subscribe</>}
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
          {subscribedCount} of {data.pages?.length || 0} page{data.pages?.length === 1 ? "" : "s"} subscribed.
        </div>
      </div>

      <div className="card" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
        <div className="card-title" style={{ color: "#075985" }}><FiAlertCircle /> What happens once it's live</div>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: "#0c4a6e", lineHeight: 1.7, marginTop: 6 }}>
          <li>Every form submission on a subscribed Page lands in <a href="/leads/all">All leads</a> within seconds.</li>
          <li>Lead source = "Meta Ads — &lt;ad name&gt;", tag = <code>meta-lead</code>.</li>
          <li>Custom fields (anything beyond name/email/phone/company) go into the Notes field.</li>
          <li>Your <a href="/leads/automation">Lead automation flows</a> with <strong>trigger.new_lead</strong> auto-fire.</li>
          <li>Duplicate retries (Meta retries aggressively) are deduplicated by <code>leadgen_id</code>.</li>
        </ul>
      </div>
    </>
  );
}

const monoBox = {
  flex: 1,
  minWidth: 200,
  padding: "10px 14px",
  background: "#f3f4f6",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
  overflow: "auto",
  whiteSpace: "nowrap",
};

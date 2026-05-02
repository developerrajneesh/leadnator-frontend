import { useEffect, useState } from "react";
import {
  FiCheckCircle, FiCreditCard, FiExternalLink, FiAlertTriangle, FiRefreshCw,
  FiPhone, FiShield, FiSettings as FiGear,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { waApi } from "../../api/whatsapp";
import EmbeddedSignup from "./EmbeddedSignup";

const META_BILLING_HUB = "https://business.facebook.com/billing_hub";
const META_WA_SETTINGS = "https://business.facebook.com/wa/manage";

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phoneNumberId: "",
    accessToken: "",
    businessAccountId: "",
    webhookVerifyToken: "",
  });

  async function loadStatus() {
    try {
      const res = await waApi.status();
      setStatus(res);
      return res;
    } catch (err) {
      setError(err.message);
      return null;
    } finally { setLoading(false); }
  }

  async function loadInfo() {
    setInfoLoading(true);
    try { setInfo(await waApi.accountInfo()); }
    catch (err) { setError(err.message); }
    finally { setInfoLoading(false); }
  }

  useEffect(() => {
    (async () => {
      const s = await loadStatus();
      if (s?.connected) await loadInfo();
    })();
  }, []);

  async function handleConnect(e) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await waApi.connect(form);
      const s = await loadStatus();
      if (s?.connected) await loadInfo();
      setForm({ phoneNumberId: "", accessToken: "", businessAccountId: "", webhookVerifyToken: "" });
    } catch (err) {
      setError(err.message || "Connection failed.");
    } finally { setSubmitting(false); }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect WhatsApp? You'll need to re-enter credentials to send again.")) return;
    await waApi.disconnect();
    setInfo(null);
    await loadStatus();
  }

  if (loading) {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 className="page-title">WhatsApp — Settings</h1>
            <p className="page-subtitle">Your Meta WhatsApp Business Cloud API account.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="skel" style={{ width: 100, height: 36, borderRadius: 8 }} />
            <span className="skel" style={{ width: 110, height: 36, borderRadius: 8 }} />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="card" style={{ marginBottom: 14 }}>
            <span className="skel skel-line" style={{ width: 180, height: 14, display: "block", marginBottom: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
              {Array.from({ length: i === 0 ? 5 : 6 }).map((_, j) => (
                <div key={j}>
                  <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
                  <span className="skel skel-line" style={{ width: 140, height: 14, display: "block" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!status?.connected) {
    return (
      <>
        <h1 className="page-title">WhatsApp — Settings</h1>
        <p className="page-subtitle">Connect your WhatsApp Business Cloud API number.</p>

        <div className="card" style={{ maxWidth: 720 }}>
          <div className="card-header">
            <div className="card-title">
              <FaWhatsapp style={{ color: "#25d366", verticalAlign: "middle", marginRight: 6 }} />
              Connect WhatsApp Business
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            Easiest path: use Embedded Signup below. Or paste credentials manually from{" "}
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
              Meta for Developers → WhatsApp → API Setup
            </a>.
          </p>

          <EmbeddedSignup onConnected={async () => { const s = await loadStatus(); if (s?.connected) await loadInfo(); }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 12px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>or paste credentials manually</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleConnect}>
            <div className="form-group">
              <label>Phone Number ID *</label>
              <input required value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} placeholder="e.g. 123456789012345" />
            </div>
            <div className="form-group">
              <label>Access Token (permanent) *</label>
              <input required type="password" value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} placeholder="EAAG…" />
            </div>
            <div className="form-group">
              <label>WhatsApp Business Account ID (WABA) — required for Templates</label>
              <input value={form.businessAccountId} onChange={(e) => setForm({ ...form, businessAccountId: e.target.value })} placeholder="e.g. 102030405060708" />
            </div>
            <div className="form-group">
              <label>Webhook verify token (optional)</label>
              <input value={form.webhookVerifyToken} onChange={(e) => setForm({ ...form, webhookVerifyToken: e.target.value })} placeholder="any secret string" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Connecting…" : "Connect WhatsApp"}
            </button>
          </form>
        </div>
      </>
    );
  }

  const conn = status.connection || {};

  // Merge the live /account-info payload (already DB-layered on the server)
  // with the raw DB connection record, so the UI has a complete picture
  // even before the first /account-info call returns.
  const phone = {
    id:                           info?.phone?.id                            || conn.phoneNumberId,
    display_phone_number:         info?.phone?.display_phone_number          || conn.phoneNumber,
    verified_name:                info?.phone?.verified_name                 || conn.verifiedName,
    quality_rating:               info?.phone?.quality_rating                || conn.quality,
    code_verification_status:     info?.phone?.code_verification_status      || conn.phoneCodeVerification,
    name_status:                  info?.phone?.name_status                   || conn.phoneNameStatus,
    platform_type:                info?.phone?.platform_type                 || conn.phonePlatformType,
    throughput:                   info?.phone?.throughput                    || (conn.phoneThroughputLevel ? { level: conn.phoneThroughputLevel } : null),
    messaging_limit_tier:         info?.phone?.messaging_limit_tier          || conn.phoneMessagingLimitTier,
    account_mode:                 info?.phone?.account_mode                  || conn.phoneAccountMode,
    is_official_business_account: (typeof info?.phone?.is_official_business_account === "boolean")
                                    ? info.phone.is_official_business_account
                                    : conn.phoneIsOfficial,
    status:                       info?.phone?.status                        || conn.phoneStatus,
  };
  const waba = {
    id:                           info?.waba?.id                             || conn.businessAccountId,
    name:                         info?.waba?.name                           || conn.wabaName,
    currency:                     info?.waba?.currency                       || conn.wabaCurrency,
    timezone_id:                  info?.waba?.timezone_id                    || conn.wabaTimezoneId,
    business_verification_status: info?.waba?.business_verification_status   || conn.wabaBusinessVerification,
    message_template_namespace:   info?.waba?.message_template_namespace     || conn.wabaTemplateNamespace,
    businessId:                   info?.waba?.businessId                     || conn.businessId,
    businessName:                 info?.waba?.businessName                   || conn.businessName,
  };
  const numbers = info?.phoneNumbers || [];
  const warnings = info?.warnings || [];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="page-title">WhatsApp — Settings</h1>
          <p className="page-subtitle">Your Meta WhatsApp Business Cloud API account.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-outline" onClick={loadInfo} disabled={infoLoading}>
            <FiRefreshCw style={{ opacity: infoLoading ? 0.5 : 1 }} /> {infoLoading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-danger" onClick={handleDisconnect}>Disconnect</button>
        </div>
      </div>

      {warnings.length > 0 && <WarningsBanner warnings={warnings} />}

      {/* ---------- ACCOUNT SUMMARY ---------- */}
      <Section>
        <SectionTitle>Account summary</SectionTitle>
        <Grid cols={5}>
          <Field label="WhatsApp number (WABA)" value={phone?.display_phone_number || conn.phoneNumber || "—"} strong />
          <Field label="WABA ID" value={waba?.id || conn.businessAccountId || "—"} mono />
          <Field label="Phone number ID" value={phone?.id || conn.phoneNumberId} mono />
          <Field label="Business ID" value={waba?.businessId || "—"} mono />
          <Field
            label="Business verification"
            value={<VerificationPill value={waba?.business_verification_status} />}
          />
        </Grid>
        <Divider />
        <Grid cols={2}>
          <Field label="Verified name" value={phone?.verified_name || conn.verifiedName || "—"} strong />
          <Field label="Connected at" value={conn.connectedAt ? new Date(conn.connectedAt).toLocaleString("en-IN") : "—"} />
        </Grid>
      </Section>

      {/* ---------- BILLING ---------- */}
      <Section highlight>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: "1 1 420px", minWidth: 280 }}>
            <SectionTitle><FiCreditCard style={{ marginRight: 6 }} />WABA billing & balance</SectionTitle>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 10 }}>
              Remaining prepaid balance and payment methods are managed in Meta Billing. Open the
              links below to view your balance, invoices, and add a card or funds.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>Billing currency</div>
                <div style={{ fontWeight: 700 }}>{waba?.currency || "—"}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>Prepaid wallet balance</div>
                <div style={{ fontWeight: 700 }}>See Meta Billing Hub</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, maxWidth: 360 }}>
                  Meta does not return remaining wallet balance on this API — use <b>Add payment method</b> to open Meta and view your balance.
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
            <a className="btn btn-primary" href={META_BILLING_HUB} target="_blank" rel="noopener noreferrer" style={{ justifyContent: "center" }}>
              <FiCreditCard /> Add payment method <FiExternalLink />
            </a>
            <a className="btn btn-outline" href={META_BILLING_HUB} target="_blank" rel="noopener noreferrer" style={{ justifyContent: "center" }}>
              Open billing hub <FiExternalLink />
            </a>
            <a href={META_WA_SETTINGS} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#059669", textAlign: "center", textDecoration: "none" }}>
              WhatsApp account settings (Meta)
            </a>
          </div>
        </div>
      </Section>

      {/* ---------- PHONE NUMBERS TABLE ---------- */}
      <Section>
        <SectionTitle><FiPhone style={{ marginRight: 6 }} />Phone numbers</SectionTitle>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -6, marginBottom: 10 }}>Numbers linked to this WABA</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phone number</th><th>Name</th><th>Status</th>
                <th>Quality rating</th><th>Messaging limit tier</th><th>WABA ID</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(numbers.length === 0 ? [phone].filter(Boolean) : numbers).map((n) => (
                <tr key={n.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 13 }}>
                        <FiPhone size={13} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{n.display_phone_number || "—"}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--primary, #7c3aed)", fontWeight: 600 }}>{n.verified_name || "—"}</td>
                  <td><ConnectedPill value={n.status || "CONNECTED"} /></td>
                  <td><QualityPill value={n.quality_rating} /></td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {n.messaging_limit_tier || "—"}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{waba?.id || conn.businessAccountId || "—"}</td>
                  <td>
                    <a
                      className="btn btn-outline"
                      href={META_WA_SETTINGS}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Manage in Meta"
                      style={{ padding: "6px 8px" }}
                    >
                      <FiGear />
                    </a>
                  </td>
                </tr>
              ))}
              {!phone && numbers.length === 0 && (
                <tr><td colSpan="7" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No phone data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- STATUS ---------- */}
      <div className="grid-2-equal">
        <Section>
          <SectionTitle><FiShield style={{ marginRight: 6 }} />WABA account status</SectionTitle>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -6, marginBottom: 12 }}>From Meta for your business account</div>
          <Grid cols={2}>
            <Field label="Business verification" value={waba?.business_verification_status?.toLowerCase() || "—"} />
            <Field label="Account name" value={waba?.name || "—"} />
            <Field label="Timezone" value={waba?.timezone_id || "—"} />
            <Field label="Currency" value={waba?.currency || "—"} />
            <Field label="Template namespace" value={waba?.message_template_namespace || "—"} mono wrap />
          </Grid>
        </Section>

        <Section>
          <SectionTitle><FiPhone style={{ marginRight: 6 }} />Phone number status</SectionTitle>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -6, marginBottom: 12 }}>Verification, quality &amp; platform from Meta</div>
          <Grid cols={2}>
            <Field label="Code verification" value={phone?.code_verification_status?.toLowerCase() || "—"} />
            <Field label="Display name status" value={(phone?.name_status || phone?.new_name_status)?.replace?.(/_/g, " ").toLowerCase() || "—"} />
            <Field label="Quality rating" value={phone?.quality_rating?.toLowerCase() || "—"} />
            <Field label="Platform" value={phone?.platform_type?.replace?.(/_/g, " ").toLowerCase() || "—"} />
            <Field label="Messaging throughput" value={phone?.throughput?.level?.toLowerCase() || "—"} />
            <Field label="Messaging limit tier" value={phone?.messaging_limit_tier?.toLowerCase() || "—"} />
            <Field label="Account mode" value={phone?.account_mode?.toLowerCase() || "—"} />
            <Field label="Official business account" value={phone?.is_official_business_account ? "Yes" : "No"} />
            <Field label="Live display number" value={phone?.display_phone_number || "—"} />
          </Grid>
        </Section>
      </div>
    </>
  );
}

/* ---------- building blocks ---------- */

function WarningsBanner({ warnings }) {
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  async function runDiag() {
    setDiagLoading(true);
    try {
      const r = await waApi.accountDiag();
      setDiag(r);
    } catch (err) {
      setDiag({ error: err.message });
    } finally { setDiagLoading(false); }
  }

  return (
    <div style={{ padding: 14, background: "#fff7ed", color: "#9a3412", borderRadius: 10, fontSize: 13, marginBottom: 14, border: "1px solid #fed7aa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <FiAlertTriangle style={{ verticalAlign: "middle", marginRight: 6 }} />
          <b>Some Meta fields couldn't be loaded</b> — your access token likely lacks the
          &nbsp;<code style={{ background: "#fed7aa", padding: "1px 5px", borderRadius: 4 }}>whatsapp_business_management</code>&nbsp;
          scope. Reconnect via Embedded Signup and grant that permission to populate WABA status.
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-outline" onClick={() => setOpen((o) => !o)} style={{ padding: "4px 10px", fontSize: 12 }}>
            {open ? "Hide details" : "Show details"}
          </button>
          <button className="btn btn-outline" onClick={runDiag} disabled={diagLoading} style={{ padding: "4px 10px", fontSize: 12 }}>
            {diagLoading ? "Diagnosing…" : "Run diagnostic"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, background: "#fff", color: "#4b5563", padding: 10, borderRadius: 6, fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }}>
          {warnings.map((w, i) => <div key={i}><b>{w.field}</b> — {w.message}</div>)}
        </div>
      )}

      {diag && (
        <div style={{ marginTop: 10, background: "#fff", color: "#111827", padding: 12, borderRadius: 6, fontSize: 12 }}>
          <div style={{ marginBottom: 6 }}>
            <b>Token scopes:</b> {diag.scopes?.length ? diag.scopes.join(", ") : <span style={{ color: "#b91c1c" }}>none reported</span>}
          </div>
          {diag.scopes && !diag.scopes.includes("whatsapp_business_management") && (
            <div style={{ color: "#b91c1c", marginBottom: 8 }}>
              ✗ Missing <code>whatsapp_business_management</code> — this is why WABA status fields are empty.
            </div>
          )}
          {diag.wabaFields && (
            <div style={{ marginTop: 8 }}>
              <b>Per-field WABA probe:</b>
              <div style={{ marginTop: 4, fontFamily: "monospace", fontSize: 11 }}>
                {Object.entries(diag.wabaFields).map(([k, v]) => (
                  <div key={k} style={{ color: typeof v === "object" && v?.error ? "#b91c1c" : "#047857" }}>
                    {typeof v === "object" && v?.error ? "✗" : "✓"} {k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ children, highlight }) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 14,
        ...(highlight ? { background: "#fffbeb", borderColor: "#fde68a" } : {}),
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#6b7280", marginBottom: 12 }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />;
}

function Grid({ cols = 3, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(180, Math.floor(1100 / cols))}px, 1fr))`, gap: 18 }}>
      {children}
    </div>
  );
}

function Field({ label, value, mono, strong, wrap }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontWeight: strong ? 700 : 600,
          fontSize: strong ? 15 : 13,
          color: "var(--text, #111827)",
          ...(mono ? { fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" } : {}),
          ...(wrap ? { wordBreak: "break-all" } : {}),
          textTransform: mono || strong ? "none" : "capitalize",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function Pill({ bg, color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg, color }}>
      {children}
    </span>
  );
}

function VerificationPill({ value }) {
  const v = String(value || "").toLowerCase();
  if (v === "verified")            return <Pill bg="#dcfce7" color="#166534"><FiCheckCircle /> Verified</Pill>;
  if (v === "pending" || v === "pending_need_more_info") return <Pill bg="#fef3c7" color="#92400e">Pending</Pill>;
  if (v === "not_verified" || v === "")                  return <Pill bg="#fee2e2" color="#991b1b">Not verified</Pill>;
  return <Pill bg="#f3f4f6" color="#374151">{v.replace(/_/g, " ")}</Pill>;
}

function ConnectedPill({ value }) {
  const v = String(value || "").toLowerCase();
  if (v === "connected")    return <Pill bg="#dcfce7" color="#166534"><FiCheckCircle /> Connected</Pill>;
  if (v === "disconnected") return <Pill bg="#fee2e2" color="#991b1b">Disconnected</Pill>;
  if (v === "pending")      return <Pill bg="#fef3c7" color="#92400e">Pending</Pill>;
  return <Pill bg="#dcfce7" color="#166534"><FiCheckCircle /> Connected</Pill>;
}

function QualityPill({ value }) {
  const v = String(value || "").toUpperCase();
  if (v === "GREEN")  return <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 12 }}>● GREEN</span>;
  if (v === "YELLOW") return <span style={{ color: "#d97706", fontWeight: 700, fontSize: 12 }}>● YELLOW</span>;
  if (v === "RED")    return <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 12 }}>● RED</span>;
  return <span style={{ color: "#6b7280", fontSize: 12 }}>—</span>;
}

import { useEffect, useState } from "react";
import {
  FiSettings, FiCheckCircle, FiSend, FiAlertCircle, FiGlobe, FiCopy, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiMail, FiServer, FiHash, FiUser, FiLock, FiAtSign,
} from "react-icons/fi";
import { emailApi } from "../../api/email";
import "./Config.css";

function EcField({ label, required, hint, icon: Icon, children, className = "" }) {
  return (
    <div className={`ec-field ${className}`.trim()}>
      {label && (
        <label className="ec-label">
          {label}
          {required && <span className="ec-req">*</span>}
        </label>
      )}
      <div className={`ec-input-wrap${Icon ? " has-icon" : ""}`}>
        {Icon && <span className="ec-icon" aria-hidden><Icon /></span>}
        {children}
      </div>
      {hint && <p className="ec-hint">{hint}</p>}
    </div>
  );
}

const PRESETS = {
  gmail:    { host: "smtp.gmail.com",      port: 587, secure: false, hint: "Use a Google App Password (not your account password)." },
  outlook:  { host: "smtp.office365.com",  port: 587, secure: false, hint: "Use an app password if 2FA is on." },
  sendgrid: { host: "smtp.sendgrid.net",   port: 587, secure: false, hint: "Username is literally 'apikey', password is your API key." },
  ses:      { host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false, hint: "Use SMTP credentials from the SES console." },
  zoho:     { host: "smtp.zoho.in",        port: 587, secure: false, hint: "Use an app-specific password." },
  custom:   { host: "", port: 587, secure: false, hint: "Enter your provider's SMTP host & port." },
};

export default function Config() {
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [smtpTestTo, setSmtpTestTo] = useState("");
  const [testingSend, setTestingSend] = useState(false);
  const [sesTestTo, setSesTestTo] = useState("");
  const [sesTestingSend, setSesTestingSend] = useState(false);
  const [savingSesFrom, setSavingSesFrom] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sesDomain, setSesDomain] = useState("");
  const [sesBusy, setSesBusy] = useState(false);
  const [sesStatus, setSesStatus] = useState(null); // { verified, verificationStatus, dkimStatus, records }
  const [presetKey, setPresetKey] = useState("");
  const [dnsOpen, setDnsOpen] = useState(true);
  const [openDnsIdx, setOpenDnsIdx] = useState(() => new Set([0]));

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.config();
      setCfg({ ...res.config, password: "" });   // password never returned, blank field for "no change"
      setSesDomain(res.config?.sesDomain || "");
      setSesStatus(
        res.config?.sesDomain
          ? {
              domain: res.config.sesDomain,
              verified: !!res.config.sesVerified,
              statusText: res.config.sesStatus || "",
              records: res.config.sesDnsRecords || [],
              lastCheckedAt: res.config.sesLastCheckedAt || null,
            }
          : null
      );
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    setPresetKey(key);
    setCfg((c) => ({ ...c, host: p.host, port: p.port, secure: p.secure }));
  }

  async function save(e) {
    e?.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.saveConfig(cfg);
      setCfg({ ...res.config, password: "" });
      setSuccess("Saved.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function verify() {
    setTesting(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.testConfig();
      if (res.ok) {
        setSuccess(res.message || "Connection verified ✅");
        await load();
        // Let the sidebar + email-gate know the user is configured now,
        // without forcing a page reload.
        import("../useEmailStatus").then((m) => m.refreshEmailStatus()).catch(() => {});
      }
    } catch (err) { setError(err.message); }
    finally { setTesting(false); }
  }

  async function sendSmtpTest() {
    if (!smtpTestTo) return;
    setTestingSend(true); setError(""); setSuccess("");
    try {
      await emailApi.testSend(smtpTestTo);
      setSuccess(`SMTP test email sent to ${smtpTestTo} ✅`);
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) { setError(err.message); }
    finally { setTestingSend(false); }
  }

  async function saveSesFrom() {
    setSavingSesFrom(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.sesSaveFrom({
        fromEmail: cfg.sesFromEmail,
        fromName: cfg.sesFromName,
      });
      setCfg((c) => ({ ...c, ...res.config, password: "" }));
      setSuccess("SES sender saved.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) { setError(err.message); }
    finally { setSavingSesFrom(false); }
  }

  async function sendSesTest() {
    if (!sesTestTo) return;
    setSesTestingSend(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.sesTestSend({
        to: sesTestTo,
        fromEmail: cfg.sesFromEmail,
        fromName: cfg.sesFromName,
      });
      setSuccess(`SES test email sent to ${sesTestTo} from ${res.from} ✅`);
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) { setError(err.message); }
    finally { setSesTestingSend(false); }
  }

  async function attachDomain() {
    if (!sesDomain.trim()) return;
    setSesBusy(true); setError(""); setSuccess("");
    try {
      const r = await emailApi.sesAttachDomain(sesDomain.trim());
      setSesStatus({
        domain: r.domain,
        verified: false,
        statusText: "DNS records generated. Add them in your DNS, then click Verify.",
        records: r.records || [],
        lastCheckedAt: null,
      });
      setSuccess("Domain attached. Add DNS records, then verify.");
      setTimeout(() => setSuccess(""), 2500);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSesBusy(false);
    }
  }

  async function verifyDomain() {
    setSesBusy(true); setError(""); setSuccess("");
    try {
      const r = await emailApi.sesDomainStatus(sesDomain.trim());
      setSesStatus({
        domain: r.domain,
        verified: !!r.verified,
        statusText: `Identity: ${r.verificationStatus} · DKIM: ${r.dkimStatus}`,
        records: r.records || [],
        lastCheckedAt: r.lastCheckedAt || null,
      });
      setSuccess(r.verified ? "Domain verified ✅" : "Not verified yet. DNS propagation can take time.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSesBusy(false);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copied ✅");
      setTimeout(() => setSuccess(""), 900);
    } catch {
      setError("Copy failed");
    }
  }

  function toggleDnsRecord(idx) {
    setOpenDnsIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function dnsRecordLabel(r, idx, records = []) {
    if (r.type === "TXT") return "Domain verification (TXT)";
    if (r.type === "CNAME") {
      const n = records.slice(0, idx + 1).filter((x) => x.type === "CNAME").length;
      return `DKIM record ${n}`;
    }
    return `${r.type} record`;
  }

  if (loading || !cfg) {
    return (
      <div className="email-config">
        <h1 className="page-title">Email configuration</h1>
        <p className="page-subtitle">Set up SMTP and/or Amazon SES for reliable sending.</p>
        <div className="card" style={{ maxWidth: 860 }}>
          <div className="grid-2-equal" style={{ gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 6 }} />
                <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <span className="skel skel-line skel-line-sm" style={{ width: 140, display: "block", marginBottom: 6 }} />
            <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <span className="skel" style={{ width: 120, height: 38, borderRadius: 8 }} />
            <span className="skel" style={{ width: 140, height: 38, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-config">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Email configuration</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Use SMTP for campaigns or attach a domain to send via Amazon SES API.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "#fff",
              fontSize: 12,
            }}
            title="SMTP connection status"
          >
            {cfg.verified
              ? <span style={{ color: "var(--accent)" }}><FiCheckCircle style={{ verticalAlign: "middle" }} /> SMTP verified</span>
              : <span style={{ color: "#b45309" }}><FiAlertCircle style={{ verticalAlign: "middle" }} /> SMTP not verified</span>}
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "#fff",
              fontSize: 12,
            }}
            title="Amazon SES domain status"
          >
            {!sesStatus?.domain ? (
              <span style={{ color: "var(--text-muted)" }}><FiGlobe style={{ verticalAlign: "middle" }} /> SES domain not attached</span>
            ) : sesStatus?.verified ? (
              <span style={{ color: "var(--accent)" }}><FiCheckCircle style={{ verticalAlign: "middle" }} /> SES verified</span>
            ) : (
              <span style={{ color: "#b45309" }}><FiAlertCircle style={{ verticalAlign: "middle" }} /> SES pending</span>
            )}
          </div>
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 12, marginTop: 14, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 12, marginTop: 14, fontSize: 13 }}><FiCheckCircle style={{ verticalAlign: "middle", marginRight: 6 }} />{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
        <form onSubmit={save} className="card" style={{ maxWidth: "unset" }}>
          <div className="card-header">
            <div className="card-title"><FiSettings /> SMTP</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Used for campaign sending and features that rely on your SMTP provider.
          </div>

          <EcField label="Quick preset" icon={FiSettings}>
            <select className="ec-input" value={presetKey} onChange={(e) => applyPreset(e.target.value)}>
              <option value="">— Pick a preset —</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook / Office365</option>
              <option value="sendgrid">SendGrid</option>
              <option value="ses">Amazon SES (us-east-1)</option>
              <option value="zoho">Zoho Mail</option>
              <option value="custom">Custom</option>
            </select>
          </EcField>
          {!!presetKey && PRESETS[presetKey]?.hint && (
            <p className="ec-hint" style={{ marginTop: -8, marginBottom: 14 }}>Tip: {PRESETS[presetKey].hint}</p>
          )}

          <div className="grid-2-equal">
            <EcField label="SMTP host" required icon={FiServer}>
              <input className="ec-input" required value={cfg.host || ""} onChange={(e) => setCfg({ ...cfg, host: e.target.value })} placeholder="smtp.gmail.com" />
            </EcField>
            <EcField label="Port" required icon={FiHash}>
              <input className="ec-input" required type="number" value={cfg.port || 587} onChange={(e) => setCfg({ ...cfg, port: +e.target.value })} />
            </EcField>
          </div>

          <div className="grid-2-equal">
            <EcField label="Username" required icon={FiUser}>
              <input className="ec-input" required value={cfg.username || ""} onChange={(e) => setCfg({ ...cfg, username: e.target.value })} placeholder="you@example.com" />
            </EcField>
            <EcField label="Password / App password" icon={FiLock} hint="Stored server-side; never returned to the browser.">
              <input className="ec-input" type="password" value={cfg.password || ""} onChange={(e) => setCfg({ ...cfg, password: e.target.value })} placeholder={cfg.username ? "Leave blank to keep existing" : "App password"} />
            </EcField>
          </div>

          <label className="ec-check">
            <input type="checkbox" checked={!!cfg.secure} onChange={(e) => setCfg({ ...cfg, secure: e.target.checked })} />
            Use SSL/TLS (port 465)
          </label>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 6 }} />

          <div className="grid-2-equal">
            <EcField label="From name" icon={FiUser}>
              <input className="ec-input" value={cfg.fromName || ""} onChange={(e) => setCfg({ ...cfg, fromName: e.target.value })} placeholder="Leadnator" />
            </EcField>
            <EcField label="From email" required icon={FiMail}>
              <input className="ec-input" required type="email" value={cfg.fromEmail || ""} onChange={(e) => setCfg({ ...cfg, fromEmail: e.target.value })} placeholder="hello@example.com" />
            </EcField>
          </div>
          <EcField label="Reply-to email (optional)" icon={FiAtSign}>
            <input className="ec-input" type="email" value={cfg.replyTo || ""} onChange={(e) => setCfg({ ...cfg, replyTo: e.target.value })} placeholder="replies@example.com" />
          </EcField>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-outline" onClick={verify} disabled={testing}>
              {testing ? "Verifying…" : "Verify connection"}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save config"}
            </button>
          </div>

          <div className="ec-test-block">
            <div className="ec-test-block__title"><FiSend /> SMTP test email</div>
            <div className="ec-test-block__box">
              <div className="ec-inline-row">
                <EcField icon={FiMail}>
                  <input
                    className="ec-input"
                    type="email"
                    value={smtpTestTo}
                    onChange={(e) => setSmtpTestTo(e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </EcField>
                <button type="button" className="btn btn-primary" onClick={sendSmtpTest} disabled={!smtpTestTo || testingSend}>
                  <FiSend /> {testingSend ? "Sending…" : "Send SMTP test"}
                </button>
              </div>
              <p className="ec-hint">Sends via the SMTP settings above.</p>
            </div>
          </div>
        </form>

        <div className="card" style={{ maxWidth: "unset" }}>
          <div className="card-header">
            <div className="card-title"><FiGlobe /> Amazon SES</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
            Attach your domain to generate DNS records for verification + DKIM, then send via the SES API.
          </div>

          <div className="ec-domain-row">
            <EcField label="Sending domain" icon={FiGlobe}>
              <input
                className="ec-input"
                value={sesDomain}
                onChange={(e) => setSesDomain(e.target.value)}
                placeholder="yourdomain.com"
              />
            </EcField>
            <button className="btn btn-outline" type="button" onClick={attachDomain} disabled={sesBusy || !sesDomain.trim()}>
              {sesBusy ? "Working…" : "Attach"}
            </button>
            <button className="btn btn-primary" type="button" onClick={verifyDomain} disabled={sesBusy || !sesDomain.trim()}>
              <FiRefreshCw /> {sesBusy ? "Checking…" : "Verify"}
            </button>
          </div>

          {sesStatus?.domain && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13 }}>
                  <strong>Domain:</strong> <code>{sesStatus.domain}</code>
                </div>
                <div style={{ fontSize: 12, color: sesStatus.verified ? "var(--accent)" : "#b45309" }}>
                  {sesStatus.verified ? <><FiCheckCircle style={{ verticalAlign: "middle" }} /> Verified</> : <><FiAlertCircle style={{ verticalAlign: "middle" }} /> Pending</>}
                </div>
              </div>
              {!!sesStatus.statusText && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>{sesStatus.statusText}</div>
              )}

              {!!(sesStatus.records || []).length && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDnsOpen((v) => !v)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "inherit",
                    }}
                  >
                    <span>DNS records ({sesStatus.records.length})</span>
                    {dnsOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {dnsOpen && (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {(sesStatus.records || []).map((r, idx) => {
                        const isOpen = openDnsIdx.has(idx);
                        return (
                          <div
                            key={idx}
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: 12,
                              overflow: "hidden",
                              background: isOpen ? "#fafafa" : "#fff",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleDnsRecord(idx)}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                                padding: "10px 12px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "inherit",
                                textAlign: "left",
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: "rgba(124, 58, 237, 0.1)",
                                    color: "#7c3aed",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    flexShrink: 0,
                                  }}
                                >
                                  {r.type}
                                </span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {dnsRecordLabel(r, idx, sesStatus.records)}
                                </span>
                              </span>
                              {isOpen ? <FiChevronUp style={{ flexShrink: 0 }} /> : <FiChevronDown style={{ flexShrink: 0 }} />}
                            </button>

                            {isOpen && (
                              <div style={{ padding: "0 12px 12px", fontSize: 12 }}>
                                <div><strong>Name</strong>: <code style={{ wordBreak: "break-all" }}>{r.name}</code></div>
                                <div style={{ marginTop: 6 }}><strong>Value</strong>: <code style={{ wordBreak: "break-all" }}>{r.value}</code></div>
                                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                                  <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => copy(`${r.name} ${r.type} ${r.value}`)}
                                    title="Copy record"
                                  >
                                    <FiCopy /> Copy
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 4px" }}>
                        DNS propagation can take minutes to hours. SES may take up to 72 hours to mark DKIM as Success.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>SES sender</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
              Set a From address (must be on your verified domain). Then you can send test emails using the SES API.
            </div>
            <div className="grid-2-equal">
              <EcField label="From name" icon={FiUser}>
                <input
                  className="ec-input"
                  value={cfg.sesFromName || ""}
                  onChange={(e) => setCfg({ ...cfg, sesFromName: e.target.value })}
                  placeholder="Support"
                  disabled={!sesStatus?.domain}
                />
              </EcField>
              <EcField label="From email" required icon={FiMail}>
                <input
                  className="ec-input"
                  type="email"
                  value={cfg.sesFromEmail || ""}
                  onChange={(e) => setCfg({ ...cfg, sesFromEmail: e.target.value })}
                  placeholder={sesStatus?.domain ? `support@${sesStatus.domain}` : "support@yourdomain.com"}
                  disabled={!sesStatus?.domain}
                />
              </EcField>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={saveSesFrom}
                disabled={savingSesFrom || !sesStatus?.domain || !cfg.sesFromEmail?.trim()}
              >
                {savingSesFrom ? "Saving…" : "Save sender"}
              </button>
            </div>

            <div className="ec-test-block" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <div className="ec-test-block__title"><FiSend /> SES test email</div>
              <div className="ec-test-block__box">
                <div className="ec-inline-row">
                  <EcField icon={FiMail}>
                    <input
                      className="ec-input"
                      type="email"
                      value={sesTestTo}
                      onChange={(e) => setSesTestTo(e.target.value)}
                      placeholder="recipient@example.com"
                      disabled={!sesStatus?.verified}
                    />
                  </EcField>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={sendSesTest}
                    disabled={!sesTestTo || sesTestingSend || !sesStatus?.verified || !cfg.sesFromEmail?.trim()}
                  >
                    <FiSend /> {sesTestingSend ? "Sending…" : "Send SES test"}
                  </button>
                </div>
                <p className="ec-hint">
                  {!sesStatus?.domain
                    ? "Attach a domain first."
                    : !sesStatus?.verified
                      ? "Verify your domain before sending via SES API."
                      : `Sends via Amazon SES API from ${cfg.sesFromEmail || `support@${sesStatus.domain}`}.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  FiCheckCircle, FiSend, FiAlertCircle, FiGlobe, FiCopy, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiMail, FiUser, FiTrash2, FiPlus,
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

export default function Config() {
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sesTestTo, setSesTestTo] = useState("");
  const [sesTestingSend, setSesTestingSend] = useState(false);
  const [newSenderName, setNewSenderName] = useState("");
  const [newSenderEmail, setNewSenderEmail] = useState("");
  const [senderBusy, setSenderBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sesDomain, setSesDomain] = useState("");
  const [sesBusy, setSesBusy] = useState(false);
  const [sesStatus, setSesStatus] = useState(null); // { verified, statusText, records }
  const [dnsOpen, setDnsOpen] = useState(true);
  const [openDnsIdx, setOpenDnsIdx] = useState(() => new Set([0]));

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await emailApi.config();
      setCfg({ ...res.config });
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

  async function addSender() {
    const email = newSenderEmail.trim();
    if (!email) return;
    setSenderBusy(true); setError(""); setSuccess("");
    try {
      const res = await emailApi.addSender({ name: newSenderName.trim(), email });
      setCfg((c) => ({ ...c, ...res.config }));
      setNewSenderName(""); setNewSenderEmail("");
      setSuccess("Sender added.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) { setError(err.message); }
    finally { setSenderBusy(false); }
  }

  async function makeDefaultSender(sid) {
    setError(""); setSuccess("");
    try {
      const res = await emailApi.setDefaultSender(sid);
      setCfg((c) => ({ ...c, ...res.config }));
    } catch (err) { setError(err.message); }
  }

  async function removeSender(sid) {
    if (!confirm("Remove this sender profile?")) return;
    setError(""); setSuccess("");
    try {
      const res = await emailApi.deleteSender(sid);
      setCfg((c) => ({ ...c, ...res.config }));
    } catch (err) { setError(err.message); }
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
      setSuccess(`Test email sent to ${sesTestTo} from ${res.from} ✅`);
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
      // Let the sidebar + email-gate know the user is configured now.
      if (r.verified) {
        import("../useEmailStatus").then((m) => m.refreshEmailStatus()).catch(() => {});
      }
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
        <p className="page-subtitle">Attach your sending domain to start sending.</p>
        <div className="card" style={{ maxWidth: 720 }}>
          <div style={{ marginTop: 4 }}>
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
            Attach your own domain to send your marketing emails.
          </p>
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
          title="Sending domain status"
        >
          {!sesStatus?.domain ? (
            <span style={{ color: "var(--text-muted)" }}><FiGlobe style={{ verticalAlign: "middle" }} /> Domain not attached</span>
          ) : sesStatus?.verified ? (
            <span style={{ color: "var(--accent)" }}><FiCheckCircle style={{ verticalAlign: "middle" }} /> Domain verified</span>
          ) : (
            <span style={{ color: "#b45309" }}><FiAlertCircle style={{ verticalAlign: "middle" }} /> Verification pending</span>
          )}
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 12, marginTop: 14, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 12, marginTop: 14, fontSize: 13 }}><FiCheckCircle style={{ verticalAlign: "middle", marginRight: 6 }} />{success}</div>}

      <div style={{ marginTop: 16 }}>
        <div className="card" style={{ maxWidth: "unset", width: "100%" }}>
          <div className="card-header">
            <div className="card-title"><FiGlobe /> Sending domain</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            Enter your domain, add the generated DNS records (verification + DKIM) at your DNS provider,
            then click <strong>Verify</strong>. Once verified, all your campaigns, lead emails and automations
            send from your own domain.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
          <div style={{ minWidth: 0 }}>
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
                        DNS propagation can take minutes to hours. DKIM may take up to 72 hours to be marked as verified.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>{/* /left column */}

          <div style={{ minWidth: 0 }}>{/* right column */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Sender profiles</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              Add multiple From addresses on your verified domain (e.g. support@, sales@). Pick one as
              default; you can choose which profile a campaign or automation sends from.
            </div>

            {/* Existing profiles */}
            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              {(cfg.senders || []).length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 0" }}>
                  No sender profiles yet — add one below.
                </div>
              )}
              {(cfg.senders || []).map((s) => (
                <div
                  key={s._id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px",
                    background: s.isDefault ? "#f5f3ff" : "#fff",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                      {s.name || s.email.split("@")[0]}
                      {s.isDefault && <span className="badge qualified" style={{ fontSize: 10 }}>Default</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!s.isDefault && (
                      <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => makeDefaultSender(s._id)}>
                        Set default
                      </button>
                    )}
                    {(cfg.senders || []).length > 1 && (
                      <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px", color: "#b91c1c" }} onClick={() => removeSender(s._id)}>
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add a profile */}
            <div className="grid-2-equal">
              <EcField label="From name" icon={FiUser}>
                <input
                  className="ec-input"
                  value={newSenderName}
                  onChange={(e) => setNewSenderName(e.target.value)}
                  placeholder="Sales"
                  disabled={!sesStatus?.domain}
                />
              </EcField>
              <EcField label="From email" icon={FiMail}>
                <input
                  className="ec-input"
                  type="email"
                  value={newSenderEmail}
                  onChange={(e) => setNewSenderEmail(e.target.value)}
                  placeholder={sesStatus?.domain ? `sales@${sesStatus.domain}` : "sales@yourdomain.com"}
                  disabled={!sesStatus?.domain}
                />
              </EcField>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={addSender}
                disabled={senderBusy || !sesStatus?.domain || !newSenderEmail.trim()}
              >
                <FiPlus /> {senderBusy ? "Adding…" : "Add sender"}
              </button>
            </div>

            <div className="ec-test-block" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <div className="ec-test-block__title"><FiSend /> Send a test email</div>
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
                    <FiSend /> {sesTestingSend ? "Sending…" : "Send test"}
                  </button>
                </div>
                <p className="ec-hint">
                  {!sesStatus?.domain
                    ? "Attach a domain first."
                    : !sesStatus?.verified
                      ? "Verify your domain before sending."
                      : `Sends from ${cfg.sesFromEmail || `support@${sesStatus.domain}`}.`}
                </p>
              </div>
            </div>
          </div>
          </div>{/* /right column */}
          </div>{/* /grid */}
        </div>
      </div>
    </div>
  );
}

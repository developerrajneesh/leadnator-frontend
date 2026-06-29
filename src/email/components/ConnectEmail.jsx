import { useEffect, useState } from "react";
import {
  FiMail, FiSend, FiLayers, FiZap, FiUserCheck, FiPieChart, FiEdit,
  FiShield, FiCheck, FiGlobe, FiRefreshCw, FiCopy, FiCheckCircle,
  FiAlertCircle, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { emailApi } from "../../api/email";
import { refreshEmailStatus } from "../useEmailStatus";

const MAIL_GRADIENT = "linear-gradient(150deg, #ea4335 0%, #d6336c 45%, #b91c1c 100%)";

const FEATURES = [
  { icon: <FiSend />,      label: "Campaigns" },
  { icon: <FiLayers />,    label: "Templates" },
  { icon: <FiZap />,       label: "Automations" },
  { icon: <FiUserCheck />, label: "Subscribers" },
  { icon: <FiPieChart />,  label: "Analytics" },
  { icon: <FiEdit />,      label: "Signatures" },
];

function dnsRecordLabel(r, idx, records = []) {
  if (r.type === "TXT") return "Domain verification (TXT)";
  if (r.type === "CNAME") {
    const n = records.slice(0, idx + 1).filter((x) => x.type === "CNAME").length;
    return `DKIM record ${n}`;
  }
  return `${r.type} record`;
}

/**
 * Modern split-hero connect screen for Email Marketing — mirrors the Instagram /
 * WhatsApp / Meta gates. The right panel hosts the domain-verify flow
 * (attach domain → add DNS → verify). Verifying flips the email status so the
 * gate lets the user into the full module.
 */
export default function ConnectEmail() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { domain, verified, statusText, records }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openIdx, setOpenIdx] = useState(() => new Set([0]));

  useEffect(() => {
    let on = true;
    emailApi.config().then((res) => {
      if (!on) return;
      const c = res.config || {};
      setDomain(c.sesDomain || "");
      if (c.sesDomain) {
        setStatus({
          domain: c.sesDomain,
          verified: !!c.sesVerified,
          statusText: c.sesStatus || "",
          records: c.sesDnsRecords || [],
        });
      }
    }).catch(() => {});
    return () => { on = false; };
  }, []);

  async function attachDomain() {
    if (!domain.trim()) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const r = await emailApi.sesAttachDomain(domain.trim());
      setStatus({ domain: r.domain, verified: false, statusText: "DNS records generated. Add them at your DNS provider, then click Verify.", records: r.records || [] });
      setSuccess("Domain attached. Add the DNS records below, then verify.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function verifyDomain() {
    if (!domain.trim()) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const r = await emailApi.sesDomainStatus(domain.trim());
      setStatus({ domain: r.domain, verified: !!r.verified, statusText: `Identity: ${r.verificationStatus} · DKIM: ${r.dkimStatus}`, records: r.records || [] });
      if (r.verified) {
        setSuccess("Domain verified ✅ Unlocking Email Marketing…");
        await refreshEmailStatus(); // gate will now let the user through
      } else {
        setSuccess("Not verified yet — DNS propagation can take time. Try again shortly.");
        setTimeout(() => setSuccess(""), 3500);
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setSuccess("Copied ✅"); setTimeout(() => setSuccess(""), 900); }
    catch { setError("Copy failed"); }
  }

  function toggle(idx) {
    setOpenIdx((prev) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  }

  const records = status?.records || [];

  return (
    <div className="mail-gate">
      <div className="mail-gate-card">
        {/* Left — value proposition */}
        <div className="mail-gate-hero">
          <div className="mail-gate-badge"><FiMail /> Email Marketing</div>

          <h1 className="mail-gate-title">
            Send from your own<br />
            <span>verified domain</span>
          </h1>

          <p className="mail-gate-sub">
            Connect your sending domain to unlock campaigns, automations,
            and analytics — your emails, your brand, your deliverability.
          </p>

          <div className="mail-gate-features">
            {FEATURES.map((f) => (
              <div key={f.label} className="mail-gate-feature">
                <span className="mail-gate-feature-ic">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div className="mail-gate-trust">
            <span><FiShield /> Authenticated DKIM &amp; SPF</span>
            <span><FiCheck /> Secure, deliverable sending</span>
          </div>
        </div>

        {/* Right — domain verify panel */}
        <div className="mail-gate-panel">
          <div className="mail-gate-logo"><FiGlobe /></div>
          <h2 className="mail-gate-panel-title">Verify your domain</h2>
          <p className="mail-gate-panel-sub">
            Enter your domain, add the generated DNS records, then verify. No domain handy?
            You can do this anytime.
          </p>

          {error && <div className="mail-gate-msg err">{error}</div>}
          {success && <div className="mail-gate-msg ok"><FiCheckCircle /> {success}</div>}

          <div className="mail-gate-domain-row">
            <div className="mail-gate-input-wrap">
              <FiGlobe className="mail-gate-input-ic" />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
              />
            </div>
            <button className="mg-btn outline" type="button" onClick={attachDomain} disabled={busy || !domain.trim()}>
              {busy ? "…" : "Attach"}
            </button>
            <button className="mg-btn primary" type="button" onClick={verifyDomain} disabled={busy || !domain.trim()}>
              <FiRefreshCw /> {busy ? "Checking…" : "Verify"}
            </button>
          </div>

          {status?.domain && (
            <div className="mail-gate-status">
              <span className="mg-domain"><FiGlobe /> {status.domain}</span>
              {status.verified
                ? <span className="mg-pill ok"><FiCheckCircle /> Verified</span>
                : <span className="mg-pill pending"><FiAlertCircle /> Pending</span>}
            </div>
          )}

          {!!records.length && (
            <div className="mail-gate-dns">
              <div className="mail-gate-dns-head">DNS records ({records.length})</div>
              {records.map((r, idx) => {
                const open = openIdx.has(idx);
                return (
                  <div key={idx} className={`mg-dns-item ${open ? "open" : ""}`}>
                    <button type="button" className="mg-dns-row" onClick={() => toggle(idx)}>
                      <span className="mg-dns-left">
                        <span className="mg-dns-type">{r.type}</span>
                        <span className="mg-dns-label">{dnsRecordLabel(r, idx, records)}</span>
                      </span>
                      {open ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {open && (
                      <div className="mg-dns-body">
                        <div><strong>Name</strong>: <code>{r.name}</code></div>
                        <div><strong>Value</strong>: <code>{r.value}</code></div>
                        <div className="mg-dns-copy">
                          <button type="button" className="mg-btn ghost" onClick={() => copy(`${r.name} ${r.type} ${r.value}`)}>
                            <FiCopy /> Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="mail-gate-dns-note">
                DNS can take minutes to hours to propagate. DKIM may take up to 72h to be marked as verified.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mail-gate { min-height: calc(100vh - 140px); display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
        .mail-gate-card {
          width: 100%; max-width: 1000px;
          display: grid; grid-template-columns: 1fr 1fr;
          background: var(--card-bg, #fff); border: 1px solid var(--border);
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.25);
        }
        .mail-gate-hero {
          position: relative; padding: 44px 40px; color: #fff5f5;
          background:
            radial-gradient(1200px 400px at -10% -20%, rgba(255,255,255,.18), transparent 60%),
            radial-gradient(800px 500px at 120% 120%, rgba(0,0,0,.26), transparent 55%),
            ${MAIL_GRADIENT};
          overflow: hidden;
        }
        .mail-gate-hero::after {
          content: ""; position: absolute; right: -60px; bottom: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(255, 180, 160, .3); filter: blur(12px);
        }
        .mail-gate-badge {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.3); border-radius: 999px;
          font-size: 12px; font-weight: 600; backdrop-filter: blur(6px); margin-bottom: 22px;
        }
        .mail-gate-title { position: relative; margin: 0 0 14px; font-size: 32px; line-height: 1.12; font-weight: 800; letter-spacing: -0.5px; color: #fff; }
        .mail-gate-title span { background: linear-gradient(90deg, #ffe3e0, #ffd9a8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .mail-gate-sub { position: relative; margin: 0 0 26px; font-size: 14px; line-height: 1.6; color: rgba(255,245,245,.9); max-width: 380px; }
        .mail-gate-features { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        .mail-gate-feature { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.2); border-radius: 12px; font-size: 13px; font-weight: 500; }
        .mail-gate-feature-ic { display: inline-flex; width: 26px; height: 26px; align-items: center; justify-content: center; background: rgba(255,255,255,.22); border-radius: 8px; font-size: 14px; }
        .mail-gate-trust { position: relative; display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: rgba(255,245,245,.85); }
        .mail-gate-trust span { display: inline-flex; align-items: center; gap: 6px; }
        /* panel */
        .mail-gate-panel { padding: 40px 34px; display: flex; flex-direction: column; }
        .mail-gate-logo {
          width: 60px; height: 60px; border-radius: 18px;
          display: inline-flex; align-items: center; justify-content: center;
          background: ${MAIL_GRADIENT}; color: #fff; font-size: 28px;
          box-shadow: 0 14px 30px rgba(234, 67, 53, 0.32); margin-bottom: 16px;
        }
        .mail-gate-panel-title { margin: 0 0 6px; font-size: 21px; font-weight: 700; color: var(--text); }
        .mail-gate-panel-sub { margin: 0 0 18px; font-size: 13px; line-height: 1.55; color: var(--text-muted); }
        .mail-gate-msg { padding: 10px 12px; border-radius: 10px; font-size: 12.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 7px; }
        .mail-gate-msg.err { background: #fee2e2; color: #b91c1c; }
        .mail-gate-msg.ok { background: #d1fae5; color: #065f46; }
        .mail-gate-domain-row { display: flex; gap: 8px; align-items: stretch; }
        .mail-gate-input-wrap { position: relative; flex: 1; min-width: 0; }
        .mail-gate-input-ic { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 15px; }
        .mail-gate-input-wrap input {
          width: 100%; padding: 11px 12px 11px 34px; border: 1px solid var(--border);
          border-radius: 10px; font-family: inherit; font-size: 14px; box-sizing: border-box;
        }
        .mail-gate-input-wrap input:focus { outline: none; border-color: #ea4335; box-shadow: 0 0 0 3px rgba(234,67,53,.12); }
        .mg-btn { border: none; border-radius: 10px; padding: 0 16px; font-weight: 600; font-size: 13.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
        .mg-btn.primary { background: #ea4335; color: #fff; }
        .mg-btn.primary:hover:not(:disabled) { background: #d6321f; }
        .mg-btn.outline { background: #fff; color: var(--text); border: 1px solid var(--border); }
        .mg-btn.ghost { background: transparent; color: var(--text-muted); padding: 4px 8px; }
        .mg-btn:disabled { opacity: .55; cursor: not-allowed; }
        .mail-gate-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; font-size: 13px; }
        .mg-domain { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
        .mg-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .mg-pill.ok { background: #d1fae5; color: #065f46; }
        .mg-pill.pending { background: #fef3c7; color: #b45309; }
        .mail-gate-dns { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; }
        .mail-gate-dns-head { font-size: 13px; font-weight: 800; margin-bottom: 10px; }
        .mg-dns-item { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #fff; }
        .mg-dns-item.open { background: #fafafa; }
        .mg-dns-row { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: none; background: transparent; cursor: pointer; font-size: 12px; font-weight: 700; text-align: left; color: inherit; }
        .mg-dns-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .mg-dns-type { display: inline-flex; padding: 2px 8px; border-radius: 999px; background: rgba(234,67,53,.1); color: #ea4335; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .mg-dns-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mg-dns-body { padding: 0 12px 12px; font-size: 12px; }
        .mg-dns-body code { word-break: break-all; }
        .mg-dns-body > div { margin-top: 6px; }
        .mg-dns-copy { display: flex; justify-content: flex-end; margin-top: 10px; }
        .mail-gate-dns-note { font-size: 11px; color: var(--text-muted); margin: 4px 2px 0; }
        @media (max-width: 880px) {
          .mail-gate-card { grid-template-columns: 1fr; max-width: 480px; }
          .mail-gate-hero { padding: 34px 28px; }
          .mail-gate-title { font-size: 27px; }
          .mail-gate-panel { padding: 32px 26px; }
        }
        @media (max-width: 460px) {
          .mail-gate-features { grid-template-columns: 1fr; }
          .mail-gate-domain-row { flex-wrap: wrap; }
          .mail-gate-input-wrap { flex-basis: 100%; }
        }
      `}</style>
    </div>
  );
}

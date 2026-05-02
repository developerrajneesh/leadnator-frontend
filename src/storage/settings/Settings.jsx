import { useEffect, useState } from "react";
import {
  FiSave, FiCheckCircle, FiAlertCircle, FiTrash2, FiRefreshCw, FiDatabase,
} from "react-icons/fi";
import { storageApi } from "../../api/storage";
import { notify } from "../../globalComponents/Toast/Toast";
import { refreshStorageStatus } from "../useStorageStatus";

// Maps 5 .env fields (ENDPOINT_URL, ACCESS_KEY_ID, SECRET_ACCESS_KEY,
// BUCKET_NAME, REGION) to a per-user MongoDB config. The secrets live server-
// side and are never returned to the browser — the UI keeps the inputs empty
// after save and lets you paste new ones to rotate.
const PRESETS = [
  { key: "supabase", label: "Supabase Storage", placeholder: "https://<ref>.storage.supabase.co/storage/v1/s3" },
  { key: "r2",       label: "Cloudflare R2",    placeholder: "https://<acct>.r2.cloudflarestorage.com" },
  { key: "aws",      label: "AWS S3",           placeholder: "https://s3.<region>.amazonaws.com" },
  { key: "wasabi",   label: "Wasabi",           placeholder: "https://s3.<region>.wasabisys.com" },
  { key: "custom",   label: "Custom S3",        placeholder: "https://..." },
];

export default function StorageSettings({ embedded = false, onConfigured }) {
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState({
    endpointUrl: "", accessKeyId: "", secretAccessKey: "",
    bucketName: "", region: "ap-south-1",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await storageApi.config();
      setCfg(r);
      setForm((f) => ({
        ...f,
        endpointUrl: r.endpointUrl || f.endpointUrl,
        bucketName:  r.bucket      || f.bucketName,
        region:      r.region      || f.region,
      }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.endpointUrl || !form.bucketName) { notify.warn("Endpoint URL and Bucket name are required."); return; }
    setSaving(true); setError("");
    try {
      await storageApi.saveConfig({
        endpointUrl:     form.endpointUrl,
        accessKeyId:     form.accessKeyId,     // if empty backend keeps existing
        secretAccessKey: form.secretAccessKey, // if empty backend keeps existing
        bucketName:      form.bucketName,
        region:          form.region,
      });
      notify.success("Storage settings saved");
      // Clear secrets from the form state so they don't sit in memory.
      setForm((f) => ({ ...f, accessKeyId: "", secretAccessKey: "" }));
      await load();
    } catch (err) { setError(err.message); notify.error(err.message); }
    finally { setSaving(false); }
  }

  async function verify() {
    setTesting(true); setError("");
    try {
      const r = await storageApi.verifyConfig();
      if (r.ok) {
        notify.success(r.message || "Storage verified");
        await load();
        refreshStorageStatus();
        if (typeof onConfigured === "function") onConfigured();
      }
    } catch (err) { setError(err.message); notify.error(err.message); }
    finally { setTesting(false); }
  }

  async function remove() {
    if (!confirm("Disconnect storage? Your files stay in your bucket, but the CRM won't be able to reach them until you reconfigure.")) return;
    await storageApi.deleteConfig();
    setCfg(null);
    setForm({ endpointUrl: "", accessKeyId: "", secretAccessKey: "", bucketName: "", region: "ap-south-1" });
    refreshStorageStatus();
    notify.info("Storage disconnected");
  }

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <>
      {!embedded && (
        <>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiDatabase style={{ color: "#facc15" }} /> Storage — Settings
          </h1>
          <p className="page-subtitle">
            Connect your own S3-compatible bucket (Supabase, AWS, Cloudflare R2, Wasabi). Files are encrypted in transit and only your CRM account can read them.
          </p>
        </>
      )}

      <div className="card" style={{ padding: 24 }}>
        {/* Verification badge */}
        {cfg?.configured && (
          <div style={{
            padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.5,
            background: cfg.verified ? "#f0fdf4" : "#fef3c7",
            color:      cfg.verified ? "#166534" : "#92400e",
            border:    `1px solid ${cfg.verified ? "#bbf7d0" : "#fde68a"}`,
          }}>
            {cfg.verified ? <FiCheckCircle /> : <FiAlertCircle />}{" "}
            {cfg.verified
              ? <>Connected to <code>{cfg.bucket}</code> · verified {cfg.verifiedAt ? new Date(cfg.verifiedAt).toLocaleString("en-IN") : ""}</>
              : <>Saved but <strong>not verified</strong>. Click <strong>Verify connection</strong> to test.</>}
            {cfg.lastError && <div style={{ marginTop: 4, fontSize: 12 }}>Last error: {cfg.lastError}</div>}
          </div>
        )}

        {error && (
          <div style={{ padding: 10, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
        )}

        <div className="form-group">
          <label>Quick preset (optional)</label>
          <select
            onChange={(e) => {
              const p = PRESETS.find((x) => x.key === e.target.value);
              if (p && p.placeholder.startsWith("https://") && !form.endpointUrl) {
                setForm((f) => ({ ...f, endpointUrl: p.placeholder }));
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>— Pick a provider —</option>
            {PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Endpoint URL *</label>
          <input
            value={form.endpointUrl}
            onChange={(e) => setForm({ ...form, endpointUrl: e.target.value })}
            placeholder="https://<ref>.storage.supabase.co/storage/v1/s3"
            style={{ fontFamily: "monospace", fontSize: 13 }}
          />
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Access key ID *{cfg?.accessKeyIdMasked && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginLeft: 8 }}>({cfg.accessKeyIdMasked})</span>}</label>
            <input
              value={form.accessKeyId}
              onChange={(e) => setForm({ ...form, accessKeyId: e.target.value })}
              placeholder={cfg?.hasSecret ? "Leave blank to keep existing" : "Your S3 access key"}
              style={{ fontFamily: "monospace", fontSize: 13 }}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Secret access key *{cfg?.hasSecret && <span style={{ fontSize: 11, color: "#166534", fontWeight: 400, marginLeft: 8 }}>(saved)</span>}</label>
            <input
              type="password"
              value={form.secretAccessKey}
              onChange={(e) => setForm({ ...form, secretAccessKey: e.target.value })}
              placeholder={cfg?.hasSecret ? "Leave blank to keep existing" : "Your S3 secret key"}
              style={{ fontFamily: "monospace", fontSize: 13 }}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="grid-2-equal">
          <div className="form-group">
            <label>Bucket name *</label>
            <input
              value={form.bucketName}
              onChange={(e) => setForm({ ...form, bucketName: e.target.value })}
              placeholder="my_store"
              style={{ fontFamily: "monospace", fontSize: 13 }}
            />
          </div>
          <div className="form-group">
            <label>Region</label>
            <input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="ap-south-1"
              style={{ fontFamily: "monospace", fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ padding: 12, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 12, color: "#0c4a6e", lineHeight: 1.5, marginBottom: 14 }}>
          💡 Secrets are stored server-side with <code>select: false</code> — the browser never sees them again after saving. To rotate, just type a new value and Save.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div>
            {cfg?.configured && (
              <button className="btn btn-outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={remove}>
                <FiTrash2 /> Disconnect
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={verify} disabled={testing || !cfg?.configured}>
              <FiRefreshCw /> {testing ? "Verifying…" : "Verify connection"}
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

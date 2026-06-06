import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { loadWaFbSdk } from "../../api/waFbSdk";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

/**
 * Meta WhatsApp Embedded Signup (official flow):
 * 1. User clicks → FB.login({ config_id, response_type: 'code', extras: { version: 'v4' } })
 * 2. postMessage listener stores WABA / phone IDs from WA_EMBEDDED_SIGNUP
 * 3. FB.login callback stores OAuth code → backend /api/wa/embedded-connect
 *
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */
export default function EmbeddedSignup({ onConnected }) {
  const [config, setConfig] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const collected = useRef({ session: null, code: null });
  const submitting = useRef(false);

  useEffect(() => {
    let mounted = true;
    waApi.embeddedConfig()
      .then((c) => { if (mounted) setConfig(c); })
      .catch((e) => mounted && notify.error(e.message));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!config?.fbAppId) return undefined;
    const version = config.apiVersion || "v25.0";
    loadWaFbSdk(config.fbAppId, version)
      .then(() => setSdkReady(true))
      .catch((e) => notify.error(e.message));
  }, [config?.fbAppId, config?.apiVersion]);

  const submit = useCallback(async () => {
    if (submitting.current) return;
    const { session, code } = collected.current;
    if (!session?.phone_number_id || !code) return;

    submitting.current = true;
    setBusy(true);
    try {
      const res = await waApi.embeddedConnect({
        code,
        phoneNumberId: session.phone_number_id,
        wabaId: session.waba_id || "",
        businessId: session.business_id || "",
      });
      collected.current = { session: null, code: null };
      notify.success("WhatsApp connected successfully");
      if (typeof onConnected === "function") onConnected(res);
    } catch (err) {
      notify.error(err.message || "Embedded connect failed.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }, [onConnected]);

  const tryConnect = useCallback(() => {
    const { session, code } = collected.current;
    if (session?.phone_number_id && code) submit();
  }, [submit]);

  // MessageEvent — session info when user finishes embedded signup in the popup
  useEffect(() => {
    function isFbOrigin(origin) {
      try {
        const host = new URL(origin).hostname.toLowerCase();
        return host === "facebook.com" || host.endsWith(".facebook.com")
          || host === "fb.com" || host.endsWith(".fb.com");
      } catch { return false; }
    }

    function onMessage(event) {
      if (!isFbOrigin(event.origin)) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

        if (typeof data.event === "string" && /^FINISH/.test(data.event)) {
          const d = data.data || {};
          collected.current.session = {
            phone_number_id: d.phone_number_id ?? d.phoneNumberId,
            waba_id: d.waba_id ?? d.wabaId,
            business_id: d.business_id ?? d.businessId,
          };
          tryConnect();
        } else if (data.event === "CANCEL") {
          notify.warn("WhatsApp signup cancelled.");
        } else if (data.event === "ERROR") {
          notify.error(data?.data?.error_message || "WhatsApp signup error.");
        }
      } catch { /* unrelated postMessage */ }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [tryConnect]);

  const launchWhatsAppSignup = useCallback(() => {
    if (!window.FB) {
      notify.warn("Facebook SDK not loaded yet.");
      return;
    }
    if (!config?.configId) {
      notify.error("Missing WHATSAPP_FB_CONFIG_ID on server. Set 2793771500977058 in backend .env and restart.");
      return;
    }

    collected.current = { session: null, code: null };

    window.FB.login(
      (response) => {
        if (response?.authResponse?.code) {
          collected.current.code = response.authResponse.code;
          tryConnect();
        } else {
          notify.warn("You did not complete Facebook authorization for WhatsApp.");
        }
      },
      {
        config_id: config.configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { version: "v4" },
      },
    );
  }, [config?.configId, tryConnect]);

  const canRun = sdkReady && !!config?.configId && !!config?.fbAppId && !busy;

  return (
    <div style={{ marginTop: 14, padding: 16, border: "1px dashed #d1fae5", background: "#f0fdf4", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <FaWhatsapp style={{ color: "#25d366", fontSize: 20 }} />
        <strong style={{ fontSize: 14 }}>Embedded Signup (recommended)</strong>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
        WhatsApp-only flow via Meta Embedded Signup (<code>config_id</code>). Creates your WABA,
        registers your number, and returns a token — separate from Instagram connection.
      </p>

      {!config?.configId && config && (
        <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, marginBottom: 10 }}>
          ⚠ Set <code>WHATSAPP_FB_CONFIG_ID=2793771500977058</code> in backend <code>.env</code> (WhatsApp Embedded Signup config, not Instagram).
        </div>
      )}

      <button
        type="button"
        disabled={!canRun}
        onClick={launchWhatsAppSignup}
        style={{
          background: canRun ? "#1877f2" : "#9ca3af",
          color: "#fff", border: 0, borderRadius: 4,
          padding: "0 24px", height: 40, fontWeight: "bold", fontSize: 16,
          cursor: canRun ? "pointer" : "not-allowed",
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <FaWhatsapp /> {busy ? "Connecting…" : sdkReady ? "Login with Facebook" : "Loading SDK…"}
      </button>
      {config?.fbAppId && (
        <span style={{ marginLeft: 12, fontSize: 11, color: "var(--text-muted)" }}>
          App {String(config.fbAppId).slice(0, 6)}… · WA config {String(config.configId || "").slice(0, 6)}… · SDK {config.apiVersion || "v25.0"}
        </span>
      )}
    </div>
  );
}

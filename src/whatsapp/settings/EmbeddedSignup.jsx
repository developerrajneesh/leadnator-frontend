import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { loadFbSdk } from "../../api/meta";
import { waApi } from "../../api/whatsapp";
import { notify } from "../../globalComponents/Toast/Toast";

// Reusable WhatsApp Embedded Signup button.
// Listens for `WA_EMBEDDED_SIGNUP` postMessage events from facebook.com
// and FB.login auth code. Once both arrive, posts to /api/wa/embedded-connect
// which exchanges the code → access_token, verifies the phone, and saves the
// connection per user in MongoDB.
export default function EmbeddedSignup({ onConnected }) {
  const [config, setConfig] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // We collect FB auth code and the WA session info in parallel from two
  // different callbacks — refs let us coalesce them.
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
    loadFbSdk().then(() => setSdkReady(true)).catch((e) => notify.error(e.message));
  }, [config?.fbAppId]);

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

  // Capture postMessage from facebook.com → WA_EMBEDDED_SIGNUP FINISH
  useEffect(() => {
    function isFbOrigin(origin) {
      try {
        const host = new URL(origin).hostname.toLowerCase();
        return host === "facebook.com" || host.endsWith(".facebook.com")
          || host === "fb.com" || host.endsWith(".fb.com");
      } catch { return false; }
    }
    function onMessage(ev) {
      if (!isFbOrigin(ev.origin)) return;
      try {
        const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        if (typeof data.event === "string" && /^FINISH/.test(data.event)) {
          const d = data.data || {};
          collected.current.session = {
            phone_number_id: d.phone_number_id ?? d.phoneNumberId,
            waba_id:         d.waba_id         ?? d.wabaId,
            business_id:     d.business_id     ?? d.businessId,
          };
          submit();
        } else if (data.event === "CANCEL") {
          notify.warn("You cancelled the WhatsApp signup.");
        } else if (data.event === "ERROR") {
          notify.error(data?.data?.error_message || "WhatsApp signup error.");
        }
      } catch { /* non-JSON or unrelated */ }
    }
    window.addEventListener("message", onMessage, true);
    return () => window.removeEventListener("message", onMessage, true);
  }, [submit]);

  function launch() {
    if (!window.FB) { notify.warn("Facebook SDK not loaded yet."); return; }
    if (!config?.configId) {
      notify.error("Server is missing WHATSAPP_FB_CONFIG_ID. Set it in backend .env then refresh.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response?.authResponse?.code) {
          collected.current.code = response.authResponse.code;
          submit();
        } else {
          notify.warn("You did not authorize the WhatsApp signup.");
        }
      },
      {
        config_id: config.configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          version: "3",
          sessionInfoVersion: 3,
          setup: {
            business: {
              id: null, name: null, email: null,
              phone: { code: null, number: null },
              website: null,
              address: { streetAddress1: null, streetAddress2: null, city: null, state: null, zipPostal: null, country: null },
              timezone: null,
            },
            phone: { displayName: null, category: null, description: null },
            preVerifiedPhone: { ids: null },
            solutionID: null,
            whatsAppBusinessAccount: { ids: null },
          },
        },
      }
    );
  }

  const canRun = sdkReady && !!config?.fbAppId && !!config?.configId && !busy;

  return (
    <div style={{ marginTop: 14, padding: 16, border: "1px dashed #d1fae5", background: "#f0fdf4", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <FaWhatsapp style={{ color: "#25d366", fontSize: 20 }} />
        <strong style={{ fontSize: 14 }}>Embedded Signup (recommended)</strong>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
        Meta-managed flow: creates your WhatsApp Business Account, registers the phone number,
        and issues a permanent access token in one popup. No manual credentials needed.
        Use this on a desktop browser (Meta does not support phones).
      </p>

      {!config?.configId && config && (
        <div style={{ padding: 10, background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 12, marginBottom: 10 }}>
          ⚠ Backend missing <code>WHATSAPP_FB_CONFIG_ID</code> in <code>.env</code>.
          Get the config ID from Meta → Business Settings → WhatsApp → Embedded Signup config, then restart the backend.
        </div>
      )}

      <button
        type="button"
        disabled={!canRun}
        onClick={launch}
        style={{
          background: canRun ? "#1877f2" : "#9ca3af",
          color: "white", border: "none", borderRadius: 8,
          padding: "10px 18px", fontWeight: 600, fontSize: 14,
          cursor: canRun ? "pointer" : "not-allowed",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}
      >
        <FaWhatsapp /> {busy ? "Connecting…" : sdkReady ? "Login with Facebook" : "Loading SDK…"}
      </button>
      {config?.fbAppId && (
        <span style={{ marginLeft: 12, fontSize: 11, color: "var(--text-muted)" }}>
          App {String(config.fbAppId).slice(0, 6)}… · SDK {config.apiVersion}
        </span>
      )}
    </div>
  );
}

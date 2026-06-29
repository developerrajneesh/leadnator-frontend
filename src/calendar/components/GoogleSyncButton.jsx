import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiCheckCircle, FiChevronDown } from "react-icons/fi";
import { calApi } from "../../api/calendar";
import { notify } from "../../globalComponents/Toast/Toast";

/**
 * Compact Google Calendar / Meet sync control for the calendar view headers.
 * - Not connected → "Sync with Google" button (starts OAuth).
 * - Connected     → a green "Synced" chip showing the account, with a popover
 *   to disconnect.
 * Also handles the ?google=connected|error redirect that OAuth returns to.
 */
export default function GoogleSyncButton() {
  const [status, setStatus] = useState(null); // { configured, connected, email }
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);

  function load() {
    calApi.googleStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, connected: false }));
  }

  useEffect(() => {
    load();
    // Handle the OAuth redirect back to the calendar.
    const params = new URLSearchParams(window.location.search);
    const g = params.get("google");
    if (g === "connected") notify.success("Google Calendar connected!");
    else if (g === "error") notify.error(params.get("msg") || "Google connection failed");
    if (g) {
      params.delete("google"); params.delete("msg");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, []);

  async function connect() {
    setBusy(true);
    try {
      const { url } = await calApi.googleConnect();
      window.location.href = url;
    } catch (err) {
      notify.error(err.message || "Could not start Google connect");
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await calApi.googleDisconnect();
      notify.success("Google disconnected");
      setMenu(false);
      load();
    } catch (err) {
      notify.error(err.message || "Could not disconnect");
    } finally {
      setBusy(false);
    }
  }

  // Server doesn't have Google OAuth configured — hide entirely.
  if (status && !status.configured) return null;

  if (status?.connected) {
    return (
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          title={status.email || "Google connected"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46",
            borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <FcGoogle size={16} style={{ background: "#fff", borderRadius: 3 }} />
          <FiCheckCircle /> Google synced
          <FiChevronDown style={{ opacity: 0.7 }} />
        </button>
        {menu && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 41,
              background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
              boxShadow: "0 12px 30px rgba(15,23,42,.12)", padding: 12, minWidth: 230,
            }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Connected account</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, wordBreak: "break-all" }}>
                {status.email || "Google account"}
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={disconnect}
                disabled={busy}
                style={{ width: "100%", color: "#ef4444", borderColor: "#fecaca" }}
              >
                {busy ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={busy || !status}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#fff", border: "1px solid var(--border)", color: "#0f172a",
        borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600,
        cursor: busy || !status ? "not-allowed" : "pointer",
        boxShadow: "0 1px 2px rgba(15,23,42,.05)",
      }}
    >
      <FcGoogle size={18} style={{ background: "#fff", borderRadius: 3 }} />
      {busy ? "Redirecting…" : "Sync with Google"}
    </button>
  );
}

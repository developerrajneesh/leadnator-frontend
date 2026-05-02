import { useEffect, useState } from "react";
import { FiDownload, FiX, FiRefreshCw } from "react-icons/fi";
import { useRegisterSW } from "virtual:pwa-register/react";

/* ==========================================================
   PWA install + update prompt.

   Two tiny UI surfaces in one component:

   1. Install banner  — appears when the browser fires `beforeinstallprompt`.
      User can click "Install app" to drop Leadnator on their
      desktop/home-screen. "Not now" hides it for 7 days.

   2. Update banner   — appears when the service worker detects a new
      version has been deployed. User clicks "Reload" to pick it up.

   Both banners are inert until the matching event fires — nothing is
   rendered on first paint for users who have no PWA support.
   ========================================================== */

const INSTALL_DISMISS_KEY = "leadnator_pwa_install_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days

export default function PwaPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Service-worker update detector (wired through the Vite PWA plugin)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, reg) {
      // Poll every hour so long-running tabs eventually see updates.
      if (reg) setInterval(() => reg.update(), 60 * 60 * 1000);
    },
    onRegisterError(err) { console.warn("[pwa] SW register failed", err); },
  });

  // Capture install prompt event
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      const last = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
      if (Date.now() - last < DISMISS_TTL_MS) return;
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }

  function dismissInstall() {
    localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    setDeferred(null);
  }

  // Nothing to show
  if (!deferred && !needRefresh) return null;

  return (
    <>
      {/* Install banner */}
      {deferred && !installed && (
        <div className="pwa-toast pwa-install" role="dialog" aria-live="polite">
          <div className="pwa-toast-ic"><FiDownload /></div>
          <div className="pwa-toast-body">
            <strong>Install Leadnator</strong>
            <span>Works offline, opens in its own window, launches like a native app.</span>
          </div>
          <div className="pwa-toast-actions">
            <button className="pwa-btn" onClick={handleInstall}>Install</button>
            <button className="pwa-btn ghost" onClick={dismissInstall} title="Dismiss for 7 days">
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Update banner */}
      {needRefresh && (
        <div className="pwa-toast pwa-update" role="dialog" aria-live="polite">
          <div className="pwa-toast-ic"><FiRefreshCw /></div>
          <div className="pwa-toast-body">
            <strong>New version available</strong>
            <span>A newer Leadnator build is ready. Reload to use it.</span>
          </div>
          <div className="pwa-toast-actions">
            <button className="pwa-btn" onClick={() => updateServiceWorker(true)}>Reload</button>
            <button className="pwa-btn ghost" onClick={() => setNeedRefresh(false)} title="Later">
              <FiX />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

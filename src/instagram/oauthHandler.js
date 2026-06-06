import { igApi } from "../api/instagram";
import { refreshInstagramStatus } from "./useInstagramStatus";
import { getToken } from "../api/client";
import { notify } from "../globalComponents/Toast/Toast";

const CODE_KEY = "leadnator_ig_oauth_code";

/** Read ?code= from URL once, stash in sessionStorage, strip from address bar. */
export function captureInstagramOAuthCodeFromUrl() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return false;

  sessionStorage.setItem(CODE_KEY, code);
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  const next = url.pathname + url.search + (url.hash || "");
  window.history.replaceState(null, "", next || "/");
  return true;
}

/** Exchange stashed code → long-lived token on backend → save in MongoDB. */
export async function exchangePendingInstagramCode() {
  const code = sessionStorage.getItem(CODE_KEY);
  if (!code || !getToken()) return null;

  sessionStorage.removeItem(CODE_KEY);

  try {
    const result = await igApi.oauthCallback(code);
    await refreshInstagramStatus();
    notify.success(
      result?.connection?.username
        ? `Instagram @${result.connection.username} connected`
        : "Instagram connected successfully"
    );
    return result;
  } catch (err) {
    const msg = err.message || "Instagram connection failed";
    notify.error(msg);
    throw err;
  }
}

export function hasPendingInstagramCode() {
  return !!sessionStorage.getItem(CODE_KEY);
}

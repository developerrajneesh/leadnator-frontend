// Instagram Business Login — OAuth authorize URL (Meta / Instagram API).
//
// The redirect_uri must EXACTLY match a "Valid OAuth Redirect URI" configured in
// the Meta app AND be the same value used during the token exchange. We derive it
// from the CURRENT origin so the flow works on localhost and every deployed
// domain without hardcoding — just whitelist each origin (with trailing slash) in
// the Meta dashboard:  http://localhost:5173/ , https://leadnator.vercel.app/ , etc.
//
// Override the whole URL via VITE_INSTAGRAM_OAUTH_URL, or just the redirect via
// VITE_INSTAGRAM_REDIRECT_URI, in frontend/.env.

const CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || "1973429443277994";
const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
].join(",");

/** redirect_uri used for BOTH the authorize step and the token exchange. */
export function instagramRedirectUri() {
  if (import.meta.env.VITE_INSTAGRAM_REDIRECT_URI) return import.meta.env.VITE_INSTAGRAM_REDIRECT_URI;
  return typeof window !== "undefined" ? `${window.location.origin}/` : "https://leadnator.vercel.app/";
}

/** Build the Instagram Business Login authorize URL for the current environment. */
export function getInstagramOAuthUrl() {
  if (import.meta.env.VITE_INSTAGRAM_OAUTH_URL) return import.meta.env.VITE_INSTAGRAM_OAUTH_URL;
  const params = new URLSearchParams({
    force_reauth: "true",
    client_id: CLIENT_ID,
    redirect_uri: instagramRedirectUri(),
    response_type: "code",
    scope: SCOPES,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

// Back-compat constant (computed once for the current origin).
export const INSTAGRAM_OAUTH_URL = typeof window !== "undefined" ? getInstagramOAuthUrl() : "";

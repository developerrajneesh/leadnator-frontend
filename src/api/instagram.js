import { api, getToken } from "./client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/** Proxied thumbnail — works around Instagram CDN / carousel / expired URL issues. */
export function igMediaPictureUrl(mediaId) {
  if (!mediaId) return "";
  const token = getToken();
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/instagram/media/${encodeURIComponent(mediaId)}/picture${q}`;
}

const FB_APP_ID = import.meta.env.VITE_FB_APP_ID || "";
const FB_API_VERSION = import.meta.env.VITE_FB_API_VERSION || "v23.0";
const IG_SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_business_manage_comments",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "business_management",
  "public_profile",
].join(",");

export function loadFbSdkForInstagram() {
  return new Promise((resolve, reject) => {
    if (!FB_APP_ID) return reject(new Error("VITE_FB_APP_ID not set"));
    if (window.FB?.login) return resolve(window.FB);
    if (!window.fbAsyncInit) {
      window.fbAsyncInit = function () {
        window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: FB_API_VERSION });
        resolve(window.FB);
      };
    }
    if (document.getElementById("facebook-jssdk")) return;
    const s = document.createElement("script");
    s.id = "facebook-jssdk";
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Facebook SDK"));
    document.head.appendChild(s);
  });
}

export function loginFacebookForInstagram() {
  return new Promise((resolve, reject) => {
    loadFbSdkForInstagram().then((FB) => {
      FB.login(
        (res) => {
          if (res.authResponse?.accessToken) resolve(res.authResponse);
          else reject(new Error("Facebook login cancelled or permissions denied."));
        },
        { scope: IG_SCOPES }
      );
    }).catch(reject);
  });
}

export const igApi = {
  status:       () => api.get("/instagram/status"),
  pages:        () => api.get("/instagram/pages"),
  connect:      (body) => api.post("/instagram/connect", body),
  disconnect:   () => api.post("/instagram/disconnect"),
  settings:     () => api.get("/instagram/settings"),
  saveSettings: (body) => api.put("/instagram/settings", body),
  conversations: () => api.get("/instagram/conversations"),
  messages:     (id, query) => api.get(`/instagram/conversations/${encodeURIComponent(id)}/messages`, query),
  sendMessage:  (id, body) => api.post(`/instagram/conversations/${id}/messages`, body),
  seedInbox:    () => api.post("/instagram/inbox/seed-demo"),
  comments:     () => api.get("/instagram/comments"),
  replyComment: (id, text) => api.post(`/instagram/comments/${id}/reply`, { text }),
  deleteReply:  (id) => api.del(`/instagram/comments/${id}/reply`),
  flows:        () => api.get("/instagram/flows"),
  flow:         (id) => api.get(`/instagram/flows/${id}`),
  createFlow:   (body) => api.post("/instagram/flows", body),
  testFlow:     (id, body) => api.post(`/instagram/flows/${id}/test`, body),
  updateFlow:   (id, body) => api.put(`/instagram/flows/${id}`, body),
  deleteFlow:   (id) => api.del(`/instagram/flows/${id}`),
  analytics:    () => api.get("/instagram/analytics"),
  media:        (params) => api.get("/instagram/media", params),
  mediaDetail:  (mediaId) => api.get(`/instagram/media/${encodeURIComponent(mediaId)}`),
  webhook:      () => api.get("/instagram/webhook"),
  oauthCallback: (code, redirect_uri) => api.post("/instagram/oauth/callback", { code, redirect_uri }),
};

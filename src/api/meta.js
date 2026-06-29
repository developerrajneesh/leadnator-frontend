// Frontend Meta API client — talks to Leadnator backend,
// which in turn proxies the Facebook Graph API.

import { api } from "./client";

const FB_APP_ID = import.meta.env.VITE_FB_APP_ID || "";
const FB_API_VERSION = import.meta.env.VITE_FB_API_VERSION || "v23.0";
const SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_read_engagement",
  "pages_show_list",
  "pages_manage_ads",
  "pages_manage_metadata", // required to verify a Page's WhatsApp number (FB err #283)
  "leads_retrieval",
  "email",
  "public_profile",
].join(",");

let sdkReadyPromise = null;

export function loadFbSdk() {
  if (sdkReadyPromise) return sdkReadyPromise;
  sdkReadyPromise = new Promise((resolve, reject) => {
    if (!FB_APP_ID) return reject(new Error("VITE_FB_APP_ID not set"));
    if (typeof window === "undefined") return reject(new Error("No window"));

    if (window.FB && typeof window.FB.login === "function") return resolve(window.FB);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: FB_API_VERSION,
      });
      window.dispatchEvent(new Event("fb-sdk-ready"));
      resolve(window.FB);
    };

    if (document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => reject(new Error("Failed to load Facebook SDK"));
    document.head.appendChild(script);
  });
  return sdkReadyPromise;
}

export function loginWithFacebook() {
  return new Promise((resolve, reject) => {
    loadFbSdk().then((FB) => {
      FB.login(
        (response) => {
          if (response.authResponse?.accessToken) {
            resolve(response.authResponse);
          } else {
            reject(new Error("User cancelled Facebook login or did not grant permissions."));
          }
        },
        { scope: SCOPES }
      );
    }).catch(reject);
  });
}

export const metaApi = {
  status:           ()                    => api.get("/meta/status"),
  connect:          (shortLivedToken)     => api.post("/meta/connect", { shortLivedToken }),
  selectAccount:    (adAccountId)         => api.post("/meta/select-account", { adAccountId }),
  disconnect:       ()                    => api.post("/meta/disconnect"),

  adAccounts:       ()                    => api.get("/meta/ad-accounts"),
  adAccount:        (id)                  => api.get(`/meta/ad-accounts/${id}`),
  campaigns:        (adAccountId, opts)   => api.get("/meta/campaigns", { adAccountId, ...(opts || {}) }),
  campaign:         (id)                  => api.get(`/meta/campaign/${id}`),
  adset:            (id)                  => api.get(`/meta/adset/${id}`),
  ad:               (id)                  => api.get(`/meta/ad/${id}`),
  updateCampaign:   (id, body)            => api.post(`/meta/campaign/${id}`, body),
  updateAdset:      (id, body)            => api.post(`/meta/adset/${id}`, body),
  updateAd:         (id, body)            => api.post(`/meta/ad/${id}`, body),
  campaignAdsets:   (campaignId, opts)    => api.get(`/meta/campaigns/${campaignId}/adsets`, opts || undefined),
  adsetAds:         (adsetId, opts)       => api.get(`/meta/adsets/${adsetId}/ads`, opts || undefined),
  entityInsights:   (id, datePreset)      => api.get(`/meta/insights/${id}`, datePreset ? { datePreset } : undefined),
  createCampaign:   (body)                => api.post("/meta/campaigns", body),
  pauseCampaign:    (id)                  => api.post(`/meta/campaigns/${id}/pause`),
  activateCampaign: (id)                  => api.post(`/meta/campaigns/${id}/activate`),
  deleteCampaign:   (id)                  => api.del(`/meta/campaigns/${id}`),
  insights:         (adAccountId, opts)   => api.get("/meta/insights", { adAccountId, ...(opts || {}) }),
  pages:            ()                    => api.get("/meta/pages"),
  webhook:          ()                    => api.get("/meta/webhook"),
  rotateWebhookToken: ()                  => api.post("/meta/webhook/rotate-token"),
  syncWebhookPages: ()                    => api.post("/meta/webhook/sync-pages"),
  subscribePage:    (pageId, subscribe)   => api.post("/meta/webhook/subscribe-page", { pageId, subscribe }),
  pageInstagram:    (pageId)              => api.get(`/meta/pages/${pageId}/instagram`),
  // Image upload uses XHR for progress; surfaces { hash, url, filename }.
  uploadAdImage: (adAccountId, file, onProgress) => new Promise(async (resolve, reject) => {
    const { getToken } = await import("./client");
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
    const fd = new FormData();
    fd.append("adAccountId", adAccountId);
    fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/meta/ad-images/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) onProgress?.(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.error || `Upload failed (${xhr.status})`));
      } catch { reject(new Error("Invalid response")); }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  }),
  createAdSet:      (body)                => api.post("/meta/adsets", body),
  createAd:         (body)                => api.post("/meta/ads", body),
  overview:         (adAccountId)         => api.get(`/meta/overview/${adAccountId}`),
  leadFormsAll:     ()                    => api.get("/meta/lead-forms/all"),
  leadFormsByPage:  (pageId)              => api.get(`/meta/pages/${pageId}/lead-forms`),
  formLeads:        (formId, pageId)      => api.get(`/meta/lead-forms/${formId}/leads`, pageId ? { pageId } : undefined),
  leadForm:         (formId, pageId)      => api.get(`/meta/lead-forms/${formId}`, pageId ? { pageId } : undefined),
  createLeadForm:   (body)                => api.post("/meta/lead-forms", body),
  updateLeadForm:   (formId, body)        => api.post(`/meta/lead-forms/${formId}`, body),
  deleteLeadForm:   (formId, pageId)      => api.del(`/meta/lead-forms/${formId}`, pageId ? { pageId } : undefined),
  testLeadForm:     (formId, body)        => api.post(`/meta/lead-forms/${formId}/test-lead`, body),
};

export const aiApi = {
  status:   ()     => api.get("/ai/status"),
  generate: (body) => api.post("/ai/generate", body),
  text:     (body) => api.post("/ai/text", body),
};

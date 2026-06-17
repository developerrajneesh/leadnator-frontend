// API client for the ported LCM Meta-Ads create wizard. Targets Leadnator's
// /api/meta-ads/* endpoints and authenticates with Leadnator's JWT. The FB
// access token is injected server-side, so no x-fb-access-token here.
//
// Implemented with fetch but returns axios-shaped results ({ data }) and throws
// axios-shaped errors (err.response.data) so the copied wizard works unchanged.
import { getToken } from "../../api/client";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const BASE = `${API_ROOT}/meta-ads`;

async function request(method, path, { params, data } = {}) {
  let url = BASE + path;
  if (params) {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (q) url += `?${q}`;
  }
  const token = getToken();
  const isForm = data instanceof FormData;
  const res = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(data && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: data != null ? (isForm ? data : JSON.stringify(data)) : undefined,
  });
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.response = { data: body, status: res.status };
    throw err;
  }
  return { data: body, status: res.status };
}

const get = (p, cfg) => request("GET", p, cfg);
const post = (p, data) => request("POST", p, { data });
const patch = (p, data) => request("PATCH", p, { data });
const del = (p) => request("DELETE", p);

export const campaignAPI = {
  create: (data) => post("/campaigns", data),
  getAll: (adAccountId, limit, after) => {
    const params = { adAccountId };
    if (limit) params.limit = limit;
    if (after) params.after = after;
    return get("/campaigns/all", { params });
  },
  getById: (campaignId) => get(`/campaigns/${campaignId}`),
  update: (campaignId, data) => patch(`/campaigns/${campaignId}`, data),
  pause: (campaignId) => post(`/campaigns/${campaignId}/pause`),
  activate: (campaignId) => post(`/campaigns/${campaignId}/activate`),
  delete: (campaignId) => del(`/campaigns/${campaignId}`),
  getAdAccounts: () => get("/campaigns"),
  getAdAccountDetails: (adAccountId) => get(`/campaigns/account/${adAccountId}`),
  getAdAccountFunds: (adAccountId) => get(`/campaigns/account/${adAccountId}/funds`),
  getInsights: (adAccountId, options = {}) => {
    const params = {
      adAccountId,
      ...(options.datePreset ? { datePreset: options.datePreset } : {}),
      ...(options.timeIncrement ? { timeIncrement: options.timeIncrement } : {}),
      ...(options.level ? { level: options.level } : {}),
    };
    return get("/campaigns/insights", { params });
  },
};

export const adsetAPI = {
  create: (data) => post("/adsets", data),
  getAll: (campaignId) => get("/adsets/all", { params: { campaignId } }),
  getById: (adsetId) => get(`/adsets/${adsetId}`),
  update: (adsetId, data) => patch(`/adsets/${adsetId}`, data),
  pause: (adsetId) => post(`/adsets/${adsetId}/pause`),
  activate: (adsetId) => post(`/adsets/${adsetId}/activate`),
  delete: (adsetId) => del(`/adsets/${adsetId}`),
  getTargetingSearch: (params) => get("/adsets/targeting-search", { params }),
  searchAdGeolocation: (params) => get("/adsets/search-geolocation", { params }),
  getWhatsAppBusinessAccounts: () => get("/adsets/whatsapp/waba"),
  getWhatsAppPhoneNumbers: (wabaId) => get(`/adsets/whatsapp/waba/${wabaId}/phone-numbers`),
  verifyWhatsAppPhoneNumber: (data) => post("/adsets/whatsapp/waba/verify-phone", data),
};

export const adAPI = {
  create: (data) => post("/ads", data),
  getAll: (adsetId) => get("/ads/all", { params: { adsetId } }),
  getById: (adId) => get(`/ads/${adId}`),
  getInsights: (adId, datePreset = "last_30d") => get(`/ads/${adId}/insights`, { params: { datePreset } }),
  update: (adId, data) => patch(`/ads/${adId}`, data),
  pause: (adId) => post(`/ads/${adId}/pause`),
  activate: (adId) => post(`/ads/${adId}/activate`),
  delete: (adId) => del(`/ads/${adId}`),
  getPages: () => get("/ads/pages"),
  uploadImage: (data) => post("/ads/upload-image", data),
  uploadVideo: (data) => post("/ads/upload-video", data),
  getRedirectPageUrl: (imageUrl, redirectUrl, title, description) => {
    const params = new URLSearchParams({
      imageUrl,
      ...(redirectUrl && { redirectUrl }),
      ...(title && { title }),
      ...(description && { description }),
    });
    return `${BASE}/ads/redirect-page?${params.toString()}`;
  },
};

export default { campaignAPI, adsetAPI, adAPI };

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "leadnator_token";
const USER_KEY = "leadnator_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, { method = "GET", body, headers = {}, query } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const token = getToken();
  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get:  (path, query) => request(path, { query }),
  post: (path, body)  => request(path, { method: "POST", body }),
  put:  (path, body)  => request(path, { method: "PUT", body }),
  del:  (path, query) => request(path, { method: "DELETE", query }),

  auth: {
    login:  (email, password) => request("/auth/login",  { method: "POST", body: { email, password } }),
    signup: (name, email, password) => request("/auth/signup", { method: "POST", body: { name, email, password } }),
    me:     () => request("/auth/me"),
    forgotPassword:   (email)           => request("/auth/forgot-password", { method: "POST", body: { email } }),
    verifyResetToken: (token)           => request(`/auth/verify-reset-token/${encodeURIComponent(token)}`),
    resetPassword:    (token, password) => request("/auth/reset-password",  { method: "POST", body: { token, password } }),
  },
  leads: {
    list:   (query)   => request("/leads", { query }),
    get:    (id)      => request(`/leads/${id}`),
    create: (body)    => request("/leads", { method: "POST", body }),
    update: (id, body) => request(`/leads/${id}`, { method: "PUT", body }),
    remove: (id)      => request(`/leads/${id}`, { method: "DELETE" }),
    settings:     ()     => request("/lead-settings"),
    saveSettings: (body) => request("/lead-settings", { method: "PUT", body }),
  },
  campaigns: {
    list: () => request("/campaigns"),
  },
  dashboard: {
    stats:    () => request("/dashboard/stats"),
    overview: () => request("/dashboard/overview"),
    activity: () => request("/dashboard/activity"),
    exportUrl: (kind) => {
      const base  = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
      const token = localStorage.getItem("leadnator_token") || "";
      return `${base}/dashboard/export/${encodeURIComponent(kind)}?token=${encodeURIComponent(token)}`;
    },
  },
  admin: {
    users:      () => request("/admin/users"),
    updateUser: (id, body) => request(`/admin/users/${id}`, { method: "PUT", body }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
    tickets:    () => request("/support/admin/tickets"),
    ticket:     (id) => request(`/support/admin/tickets/${id}`),
    replyTicket:(id, body) => request(`/support/admin/tickets/${id}/reply`, { method: "POST", body: { body } }),
    updateTicket: (id, body) => request(`/support/admin/tickets/${id}`, { method: "PUT", body }),
    deleteTicket: (id) => request(`/support/admin/tickets/${id}`, { method: "DELETE" }),
    faqs:       () => request("/support/admin/faqs"),
    createFaq:  (body) => request("/support/admin/faqs", { method: "POST", body }),
    updateFaq:  (id, body) => request(`/support/admin/faqs/${id}`, { method: "PUT", body }),
    deleteFaq:  (id) => request(`/support/admin/faqs/${id}`, { method: "DELETE" }),
    docs:       () => request("/support/admin/docs"),
    createDoc:  (body) => request("/support/admin/docs", { method: "POST", body }),
    updateDoc:  (id, body) => request(`/support/admin/docs/${id}`, { method: "PUT", body }),
    deleteDoc:  (id) => request(`/support/admin/docs/${id}`, { method: "DELETE" }),
    stats:      () => request("/admin/stats"),
  },
  support: {
    tickets:    () => request("/support/tickets"),
    ticket:     (id) => request(`/support/tickets/${id}`),
    createTicket: (body) => request("/support/tickets", { method: "POST", body }),
    replyTicket:  (id, body) => request(`/support/tickets/${id}/reply`, { method: "POST", body: { body } }),
    faqs:       () => request("/support/faqs"),
    docs:       () => request("/support/docs"),
  },
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "leadnator_token";
const USER_KEY = "leadnator_user";
const ORG_KEY = "leadnator_org";
const LOGIN_AS_KEY = "leadnator_login_as";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** "user" = personal/owner login; "organization" = workspace email login */
export function getLoginAs() {
  return localStorage.getItem(LOGIN_AS_KEY) || "user";
}

export function isOrganizationLogin() {
  return getLoginAs() === "organization";
}

export function setAuth(token, user, organization, loginAs = "user") {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(LOGIN_AS_KEY, loginAs === "organization" ? "organization" : "user");
  if (organization) {
    localStorage.setItem(ORG_KEY, JSON.stringify(organization));
  } else {
    localStorage.removeItem(ORG_KEY);
  }
}

export function getStoredOrg() {
  try {
    const raw = localStorage.getItem(ORG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredOrg(organization) {
  if (organization) {
    localStorage.setItem(ORG_KEY, JSON.stringify(organization));
  } else {
    localStorage.removeItem(ORG_KEY);
  }
}

export function hasOrgSelected() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !!payload.orgId;
  } catch {
    return false;
  }
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
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(LOGIN_AS_KEY);
}

async function request(path, { method = "GET", body, headers = {}, query } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(url.toString(), {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
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

  orgs: {
    list:   () => request("/orgs"),
    create: (body) => request("/orgs", { method: "POST", body }),
    switch: (organizationId) => request("/orgs/switch", { method: "POST", body: { organizationId } }),
    update: (id, body) => request(`/orgs/${id}`, { method: "PUT", body }),
    remove: (id) => request(`/orgs/${id}`, { method: "DELETE" }),
  },
  auth: {
    login:  (email, password) => request("/auth/login",  { method: "POST", body: { email, password } }),
    signup: (name, email, password, phone = "") => request("/auth/signup", { method: "POST", body: { name, email, password, phone } }),
    me:     () => request("/auth/me"),
    forgotPassword:   (email)           => request("/auth/forgot-password", { method: "POST", body: { email } }),
    verifyResetToken: (token)           => request(`/auth/verify-reset-token/${encodeURIComponent(token)}`),
    resetPassword:    (token, password) => request("/auth/reset-password",  { method: "POST", body: { token, password } }),
  },
  leads: {
    list:   (query)   => request("/leads", { query }),
    get:    (id)      => request(`/leads/${id}`),
    chat:   (id)      => request(`/leads/${id}/chat`),
    create: (body)    => request("/leads", { method: "POST", body }),
    update: (id, body) => request(`/leads/${id}`, { method: "PUT", body }),
    remove: (id)      => request(`/leads/${id}`, { method: "DELETE" }),
    settings:     ()     => request("/lead-settings"),
    saveSettings: (body) => request("/lead-settings", { method: "PUT", body }),
  },
  campaigns: {
    list: () => request("/campaigns"),
  },
  notifications: {
    list:    (query) => request("/notifications", { query }),
    markRead: (key)  => request("/notifications/read", { method: "POST", body: { key } }),
    markAllRead:  () => request("/notifications/read-all", { method: "POST" }),
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
    revenue:    () => request("/admin/revenue"),
    notifications: (query) => request("/admin/notifications", { query }),
    plans:       () => request("/admin/plans"),
    createPlan:  (body) => request("/admin/plans", { method: "POST", body }),
    updatePlan:  (id, body) => request(`/admin/plans/${id}`, { method: "PUT", body }),
    deletePlan:  (id) => request(`/admin/plans/${id}`, { method: "DELETE" }),
    user:       (id) => request(`/admin/users/${id}`),
    updateUser: (id, body) => request(`/admin/users/${id}`, { method: "PUT", body }),
    logs:       (query) => request("/admin/logs", { query }),
    masterPassword:      () => request("/admin/master-password"),
    setMasterPassword:   (password) => request("/admin/master-password", { method: "PUT", body: { password } }),
    clearMasterPassword: () => request("/admin/master-password", { method: "DELETE" }),
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
  forms: {
    publish:     (body) => request("/forms", { method: "POST", body }),
    list:        () => request("/forms"),
    get:         (formId) => request(`/forms/${formId}`),
    submissions: (formId) => request(`/forms/${formId}/submissions`),
    remove:      (formId) => request(`/forms/${formId}`, { method: "DELETE" }),
    // Public (no auth) — used by the shared /form/:id page and iframe embeds.
    getPublic:   (formId) => request(`/public/form/${formId}`),
    submit:      (formId, values) => request(`/public/form/${formId}/submit`, { method: "POST", body: { values } }),
  },
  autopilot: {
    create: (body) => request("/autopilot", { method: "POST", body }),
    list:   () => request("/autopilot"),
    get:    (id) => request(`/autopilot/${id}`),
    update: (id, body) => request(`/autopilot/${id}`, { method: "PUT", body }),
    remove: (id) => request(`/autopilot/${id}`, { method: "DELETE" }),
    logs:      (id) => request(`/autopilot/${id}/logs`),
    clearLogs: (id) => request(`/autopilot/${id}/logs`, { method: "DELETE" }),
  },
};

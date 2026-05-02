import { api, getStoredUser } from "./client";

export const profileApi = {
  // user record
  updateInfo:     (body) => api.put("/profile/info", body),
  changePassword: (body) => api.put("/profile/password", body),

  // settings
  settings:       ()      => api.get("/profile/settings"),
  saveSettings:   (body)  => api.put("/profile/settings", body),
  saveNotifications: (body) => api.put("/profile/settings/notifications", body),
  saveSms:        (body)  => api.put("/profile/settings/sms", body),

  // api keys
  apiKeys:        ()      => api.get("/profile/api-keys"),
  createApiKey:   (body)  => api.post("/profile/api-keys", body),
  deleteApiKey:   (id)    => api.del(`/profile/api-keys/${id}`),

  // teams (groups)
  teams:          ()      => api.get("/profile/teams"),
  team:           (id)    => api.get(`/profile/teams/${id}`),
  createTeam:     (body)  => api.post("/profile/teams", body),
  updateTeam:     (id, b) => api.put(`/profile/teams/${id}`, b),
  deleteTeam:     (id)    => api.del(`/profile/teams/${id}`),

  // team members — pass teamId in query to filter to a single team
  members:        (teamId) => api.get("/profile/team", teamId ? { teamId } : undefined),
  inviteMember:   (body)   => api.post("/profile/team", body),
  updateMember:   (id, b)  => api.put(`/profile/team/${id}`, b),
  removeMember:   (id)     => api.del(`/profile/team/${id}`),
};

// Sync the locally stored user object after a profile update so the header
// avatar / plan chip refreshes immediately.
export function syncStoredUser(patch) {
  try {
    const cur = getStoredUser() || {};
    const next = { ...cur, ...patch };
    localStorage.setItem("leadnator_user", JSON.stringify(next));
  } catch { /* noop */ }
}

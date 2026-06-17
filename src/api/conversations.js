import { api } from "./client";

export const conversationsApi = {
  list:   ()   => api.get("/conversations"),
  thread: (id) => api.get(`/conversations/${encodeURIComponent(id)}`),
};

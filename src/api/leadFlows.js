import { api } from "./client";

export const leadFlowApi = {
  list:   ()        => api.get("/lead-flows"),
  get:    (id)      => api.get(`/lead-flows/${id}`),
  create: (body)    => api.post("/lead-flows", body),
  update: (id, body)=> api.put(`/lead-flows/${id}`, body),
  remove: (id)      => api.del(`/lead-flows/${id}`),
  test:   (id, body)=> api.post(`/lead-flows/${id}/test`, body || {}),
  logs:   (id)      => api.get(`/lead-flows/${id}/logs`),
};

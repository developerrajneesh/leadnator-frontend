import { api } from "./client";

export const emailApi = {
  // SMTP config
  config:        ()        => api.get("/email/config"),
  saveConfig:    (body)    => api.put("/email/config", body),
  testConfig:    ()        => api.post("/email/config/test"),
  testSend:      (to)      => api.post("/email/config/test-send", { to }),
  quickSend:     (body)    => api.post("/email/quick-send", body),
  quickSendHistory: (to, limit = 20) => api.get("/email/quick-send/history", { to, limit }),

  // Signature
  saveSignature: (body)    => api.put("/email/signature", body),

  // Templates
  templates:        ()        => api.get("/email/templates"),
  createTemplate:   (body)    => api.post("/email/templates", body),
  updateTemplate:   (id, body)=> api.put(`/email/templates/${id}`, body),
  deleteTemplate:   (id)      => api.del(`/email/templates/${id}`),

  // Subscribers
  subscribers:      (q)       => api.get("/email/subscribers", q || undefined),
  createSubscriber: (body)    => api.post("/email/subscribers", body),
  updateSubscriber: (id, body)=> api.put(`/email/subscribers/${id}`, body),
  deleteSubscriber: (id)      => api.del(`/email/subscribers/${id}`),
  bulkSubscribers:  (subscribers) => api.post("/email/subscribers/bulk", { subscribers }),

  // Campaigns
  campaigns:        ()        => api.get("/email/campaigns"),
  createCampaign:   (body)    => api.post("/email/campaigns", body),
  deleteCampaign:   (id)      => api.del(`/email/campaigns/${id}`),
  // sendCampaign(id, { useSignature: false }) to disable signature for this send
  sendCampaign:     (id, opts)=> api.post(`/email/campaigns/${id}/send`, opts || {}),

  // Stats
  stats:         ()        => api.get("/email/stats"),
};

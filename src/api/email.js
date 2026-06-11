import { api } from "./client";

export const emailApi = {
  // Config (sending domain lives here too)
  config:        ()        => api.get("/email/config"),
  saveConfig:    (body)    => api.put("/email/config", body),
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
  campaign:         (id)      => api.get(`/email/campaigns/${id}`),
  createCampaign:   (body)    => api.post("/email/campaigns", body),
  deleteCampaign:   (id)      => api.del(`/email/campaigns/${id}`),
  // sendCampaign(id, { useSignature: false }) to disable signature for this send
  sendCampaign:     (id, opts)=> api.post(`/email/campaigns/${id}/send`, opts || {}),

  // Stats
  stats:         ()        => api.get("/email/stats"),

  // Amazon SES: domain attach + verify
  sesAttachDomain: (domain) => api.post("/email/ses/domain/attach", { domain }),
  sesDomainStatus: (domain) => api.get("/email/ses/domain/status", domain ? { domain } : undefined),
  sesSaveFrom:     (body)    => api.put("/email/ses/from", body),
  sesTestSend:     (body)    => api.post("/email/ses/test-send", body),

  // SES sender profiles (support@, sales@, …)
  addSender:       (body)    => api.post("/email/ses/senders", body),
  setDefaultSender:(sid)     => api.put(`/email/ses/senders/${sid}/default`),
  deleteSender:    (sid)     => api.del(`/email/ses/senders/${sid}`),

  // Mailbox / inbox
  inbox:        (mailbox)   => api.get("/email/inbox", mailbox ? { mailbox } : undefined),
  thread:       (cp, mailbox) => api.get(`/email/inbox/${encodeURIComponent(cp)}`, mailbox ? { mailbox } : undefined),
  sendMail:     (body)      => api.post("/email/inbox/send", body),
  inboxUnread:  ()          => api.get("/email/inbox-unread"),
};

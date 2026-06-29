import { api } from "./client";

export const waApi = {
  status:           ()      => api.get("/wa/status"),
  accountInfo:      ()      => api.get("/wa/account-info"),
  accountDiag:      ()      => api.get("/wa/diag"),
  connect:          (body)  => api.post("/wa/connect", body),
  embeddedConfig:   ()      => api.get("/wa/embedded-config"),
  embeddedConnect:  (body)  => api.post("/wa/embedded-connect", body),
  disconnect:       ()      => api.post("/wa/disconnect"),

  // Add a phone number via the raw API flow (add → OTP → verify → register)
  addPhoneNumber:     (body)     => api.post("/wa/phone-numbers", body),
  requestPhoneCode:   (id, body) => api.post(`/wa/phone-numbers/${id}/request-code`, body),
  verifyPhoneCode:    (id, body) => api.post(`/wa/phone-numbers/${id}/verify-code`, body),
  registerPhoneNumber:(id, body) => api.post(`/wa/phone-numbers/${id}/register`, body),

  templates:     ()        => api.get("/wa/templates"),
  createTemplate:(body)    => api.post("/wa/templates", body),
  deleteTemplate:(name, id)=> api.del("/wa/templates", id ? { name, hsm_id: id } : { name }),

  contacts:      (q)       => api.get("/wa/contacts", q ? { q } : undefined),
  createContact: (body)    => api.post("/wa/contacts", body),
  updateContact: (id, body)=> api.put(`/wa/contacts/${id}`, body),
  deleteContact: (id)      => api.del(`/wa/contacts/${id}`),
  bulkContacts:  (contacts)=> api.post("/wa/contacts/bulk", { contacts }),
  verifyContact: (id, body)=> api.post(`/wa/contacts/${id}/verify`, body || {}),

  campaigns:     ()        => api.get("/wa/campaigns"),
  createCampaign:(body)    => api.post("/wa/campaigns", body),

  sendTemplate:  (body)    => api.post("/wa/send-template", body),
  sendText:      (body)    => api.post("/wa/send-text", body),
  sendFlow:      (body)    => api.post("/wa/send-flow", body),
  metaFlows:        ()        => api.get("/wa/meta-flows"),
  metaFlow:         (id)      => api.get(`/wa/meta-flows/${id}`),
  createMetaFlow:   (body)    => api.post("/wa/meta-flows", body),
  saveMetaFlowJson: (id, flowJson) => api.put(`/wa/meta-flows/${id}/asset`, { flowJson }),
  publishMetaFlow:  (id)      => api.post(`/wa/meta-flows/${id}/publish`),
  deleteMetaFlow:   (id)      => api.del(`/wa/meta-flows/${id}`),
  bulkMessages:  (body)    => api.post("/wa/bulk-messages", body),

  repairInboxScope: ()     => api.post("/wa/inbox/repair-scope"),
  conversations: ()        => api.get("/wa/conversations"),
  conversation:  (phone)   => api.get(`/wa/conversations/${encodeURIComponent(phone)}`),
  reply:         (phone, body) => api.post(`/wa/conversations/${encodeURIComponent(phone)}/reply`, { body }),
  deleteConversation: (phone)  => api.del(`/wa/conversations/${encodeURIComponent(phone)}`),
  markConversationRead: (phone) => api.post(`/wa/conversations/${encodeURIComponent(phone)}/read`),
  replyMedia: (phone, file, caption, onProgress) => new Promise(async (resolve, reject) => {
    const { getToken } = await import("./client");
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
    const fd = new FormData();
    fd.append("file", file);
    if (caption) fd.append("caption", caption);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/wa/conversations/${encodeURIComponent(phone)}/reply-media`);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) onProgress?.(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.error || `Send failed (${xhr.status})`));
      } catch { reject(new Error("Invalid response")); }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(fd);
  }),

  stats:         ()        => api.get("/wa/stats"),
  analytics:     (days)    => api.get("/wa/analytics", days ? { days } : undefined),
  reports:       (q)       => api.get("/wa/reports", q),

  labels:        ()        => api.get("/wa/labels"),
  createLabel:   (body)    => api.post("/wa/labels", body),
  updateLabel:   (id, body)=> api.put(`/wa/labels/${id}`, body),
  deleteLabel:   (id)      => api.del(`/wa/labels/${id}`),
  setContactLabels: (contactId, labelIds) => api.put(`/wa/contacts/${contactId}/labels`, { labelIds }),

  flows:         ()        => api.get("/wa/flows"),
  flow:          (id)      => api.get(`/wa/flows/${id}`),
  createFlow:    (body)    => api.post("/wa/flows", body),
  updateFlow:    (id, body)=> api.put(`/wa/flows/${id}`, body),
  deleteFlow:    (id)      => api.del(`/wa/flows/${id}`),

  // Chatbot
  chatbots:      ()        => api.get("/wa/chatbots"),
  chatbot:       (id)      => api.get(`/wa/chatbots/${id}`),
  createChatbot: (body)    => api.post("/wa/chatbots", body),
  updateChatbot: (id, body)=> api.put(`/wa/chatbots/${id}`, body),
  deleteChatbot: (id)      => api.del(`/wa/chatbots/${id}`),
  simulateChatbot: (id, body) => api.post(`/wa/chatbots/${id}/simulate`, body || {}),

  // Upload a file to Meta via our backend and get back a reusable media ID.
  // Uses XMLHttpRequest so we can surface progress to the UI.
  uploadMedia: (file, onProgress) => new Promise(async (resolve, reject) => {
    const { getToken } = await import("./client");
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/wa/media/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress?.(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.error || `Upload failed (${xhr.status})`));
      } catch { reject(new Error("Invalid response from server")); }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  }),

  // Webhook config (for pasting into Meta dashboard)
  webhook:          ()       => api.get("/wa/webhook"),
  rotateVerifyToken:()       => api.post("/wa/webhook/rotate-token"),
  setVerifyToken:   (token)  => api.put("/wa/webhook/verify-token", { token }),
};

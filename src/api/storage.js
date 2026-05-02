import { api, getToken } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const storageApi = {
  config:        ()            => api.get("/storage/config"),
  saveConfig:    (body)         => api.put("/storage/config", body),
  verifyConfig:  ()             => api.post("/storage/config/verify"),
  deleteConfig:  ()             => api.del("/storage/config"),
  stats:         ()             => api.get("/storage/stats"),

  items:     (path = "/")      => api.get("/storage/items", { path }),
  recent:    ()                => api.get("/storage/recent"),
  trash:     ()                => api.get("/storage/trash"),
  shared:    ()                => api.get("/storage/shared"),

  createFolder: (body)         => api.post("/storage/folders", body),
  softDelete:   (id)           => api.del(`/storage/items/${id}`),
  restore:      (id)           => api.post(`/storage/items/${id}/restore`),
  purge:        (id)           => api.del(`/storage/items/${id}/purge`),
  emptyTrash:   ()             => api.post("/storage/trash/empty"),
  signedUrl:    (id)           => api.get(`/storage/items/${id}/url`),
  share:        (id, body)     => api.put(`/storage/items/${id}/share`, body),

  // Multipart upload — uses raw fetch because the api client only does JSON.
  // Pass FormData with files[] field. onProgress(0..100) optional.
  upload: (formData, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/storage/upload`);
      const token = getToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = () => {
        let body = null;
        try { body = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body?.error || `Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    }),
};

// File-icon emoji map — same look as the dummy version.
export function fileGlyph(ext = "") {
  const e = String(ext || "").toLowerCase();
  if (["pdf"].includes(e)) return "📕";
  if (["doc","docx"].includes(e)) return "📘";
  if (["xls","xlsx","csv"].includes(e)) return "📗";
  if (["ppt","pptx"].includes(e)) return "📙";
  if (["txt","md"].includes(e)) return "📄";
  if (["html","htm"].includes(e)) return "🌐";
  if (["json","yaml","yml","xml"].includes(e)) return "🧾";
  if (["zip","rar","7z","tar","gz"].includes(e)) return "🗜️";
  if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(e)) return "🖼️";
  if (["mp4","mov","webm","mkv","avi"].includes(e)) return "🎬";
  if (["mp3","wav","ogg","m4a","flac"].includes(e)) return "🎵";
  return "📄";
}

export function fmtSize(bytes) {
  if (bytes == null) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return "Today, " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

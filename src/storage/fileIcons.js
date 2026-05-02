// Map file extensions → emoji glyph + colour for the explorer view.

export function fileMeta(ext = "") {
  const e = String(ext).toLowerCase();
  switch (e) {
    case "pdf":  return { glyph: "📕", color: "#ef4444" };
    case "doc":
    case "docx": return { glyph: "📘", color: "#2563eb" };
    case "xls":
    case "xlsx":
    case "csv":  return { glyph: "📗", color: "#10b981" };
    case "ppt":
    case "pptx": return { glyph: "📙", color: "#f97316" };
    case "txt":  return { glyph: "📄", color: "#6b7280" };
    case "html": return { glyph: "🌐", color: "#0ea5e9" };
    case "json": return { glyph: "🧾", color: "#7c3aed" };
    case "zip":
    case "rar":
    case "7z":   return { glyph: "🗜️", color: "#a16207" };
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":  return { glyph: "🖼️", color: "#ec4899" };
    case "mp4":
    case "mov":
    case "webm": return { glyph: "🎬", color: "#dc2626" };
    case "mp3":
    case "wav":
    case "ogg":  return { glyph: "🎵", color: "#8b5cf6" };
    default:     return { glyph: "📄", color: "#6b7280" };
  }
}

// Dummy in-memory file tree — looks like Windows Explorer.
// Each node has { id, name, type: "folder"|"file", ext?, size?, modified, children?[] }

function f(name, ext, size, daysAgo = 1) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return { id: `f-${name}`, name: `${name}.${ext}`, type: "file", ext, size, modified: d.toISOString() };
}
function dir(name, daysAgo, children = []) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return { id: `d-${name.replace(/\s+/g, "_")}`, name, type: "folder", modified: d.toISOString(), children };
}

export const ROOT = {
  id: "root", name: "Leadnator drive", type: "folder", modified: new Date().toISOString(),
  children: [
    dir("Documents", 1, [
      dir("Contracts", 2, [
        f("master_service_agreement", "pdf", 245_312, 14),
        f("nda_template",            "docx",  87_540, 30),
        f("vendor_agreement_acme",   "pdf", 198_021, 7),
      ]),
      dir("Invoices", 0, [
        f("INV-2026-042", "pdf", 89_120, 0),
        f("INV-2026-041", "pdf", 92_340, 4),
        f("INV-2026-040", "pdf", 91_002, 9),
      ]),
      f("company_profile", "pdf", 1_245_000, 60),
      f("pitch_deck_v3",   "pptx", 4_120_330, 3),
    ]),
    dir("Images", 1, [
      dir("Brand", 30, [
        f("leadnator_logo",    "png",  41_200, 30),
        f("leadnator_logo_dark","png", 39_840, 30),
        f("brand_guidelines",  "pdf", 2_340_002, 30),
      ]),
      dir("Campaigns", 1, [
        f("spring_sale_hero",   "jpg", 480_220, 1),
        f("welcome_drip_v1",    "jpg", 312_440, 5),
        f("instagram_story_01", "png", 220_181, 2),
      ]),
      f("team_offsite", "jpg", 3_120_440, 90),
    ]),
    dir("Videos", 5, [
      f("product_demo_v3",     "mp4", 41_240_120, 5),
      f("ad_creative_meta_01", "mp4",  8_240_330, 12),
      f("webinar_april",       "mp4", 220_440_120, 30),
    ]),
    dir("Lead exports", 0, [
      f("all_leads_2026-04-15", "csv", 152_340, 4),
      f("hot_leads_2026-04-12", "csv",  89_002, 7),
      f("meta_form_leads_apr",  "csv", 312_002, 1),
    ]),
    dir("Templates", 6, [
      dir("WhatsApp", 6, [
        f("welcome_offer", "json", 4_320, 2),
        f("flash_sale",    "json", 3_810, 6),
      ]),
      dir("Email", 6, [
        f("monthly_newsletter", "html", 24_120, 6),
        f("welcome_series_01",  "html", 18_240, 6),
      ]),
    ]),
    f("README", "txt", 1_240, 90),
    f("backup_2026-04-01", "zip", 14_320_440, 18),
  ],
};

// Find a folder node by path array, e.g. ["Documents", "Contracts"]
export function findByPath(path = []) {
  let node = ROOT;
  for (const segment of path) {
    if (node.type !== "folder") return null;
    const next = (node.children || []).find((c) => c.name === segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function flattenAllFiles(node = ROOT, acc = []) {
  if (node.type === "file") acc.push(node);
  else (node.children || []).forEach((c) => flattenAllFiles(c, acc));
  return acc;
}

export function fmtSize(bytes) {
  if (bytes == null) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export function fmtDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return "Today, " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Shared styling for the form generator — used by the live preview, the public
// /form/:id page, and the exported HTML so all three look identical.

export const DEFAULT_STYLE = {
  accent: "#7c3aed",      // button / focus / required colour
  buttonText: "#ffffff",
  background: "#ffffff",  // form card background
  text: "#111827",
  radius: 10,             // input + button corner radius (px)
  font: "system",
  buttonStyle: "solid",   // solid | outline
  fieldStyle: "outline",  // outline | filled | underline
  align: "left",          // left | center
};

export const FONTS = {
  system:  { label: "System",  stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  inter:   { label: "Inter",   stack: "'Inter', system-ui, sans-serif" },
  serif:   { label: "Serif",   stack: "Georgia, 'Times New Roman', serif" },
  rounded: { label: "Rounded", stack: "'Nunito', 'Segoe UI', sans-serif" },
  mono:    { label: "Mono",    stack: "'SF Mono', 'Fira Code', ui-monospace, monospace" },
};

export function fontStack(font) {
  return (FONTS[font] || FONTS.system).stack;
}

export function normalizeStyle(style) {
  return { ...DEFAULT_STYLE, ...(style || {}) };
}

/**
 * Build a scoped CSS string for a form. `scope` is a class name applied to the
 * form element. Themed properties use !important so they win over any global
 * stylesheet (preview / public page).
 */
export function buildFormCss(scope, rawStyle) {
  const s = normalizeStyle(rawStyle);
  const fieldBg = s.fieldStyle === "filled" ? "#f3f4f6" : "transparent";
  const fieldBorder =
    s.fieldStyle === "underline"
      ? "border:none;border-bottom:2px solid #d1d5db;border-radius:0"
      : `border:1px solid #d1d5db;border-radius:${s.radius}px`;
  const btn =
    s.buttonStyle === "outline"
      ? `background:transparent !important;color:${s.accent} !important;border:2px solid ${s.accent} !important`
      : `background:${s.accent} !important;color:${s.buttonText} !important;border:none !important`;

  return `
.${scope}{background:${s.background} !important;color:${s.text} !important;font-family:${fontStack(s.font)} !important;text-align:${s.align};}
.${scope} h2{color:${s.text} !important;margin:0 0 6px;}
.${scope} label{display:block;font-weight:600;font-size:14px;margin-bottom:6px;color:${s.text};}
.${scope} .form-group,.${scope} .field{margin-bottom:16px;text-align:left;}
.${scope} input,.${scope} textarea,.${scope} select{
  width:100%;padding:10px 12px;font-size:14px;color:${s.text};
  background:${fieldBg} !important;${fieldBorder} !important;box-sizing:border-box;outline:none;font-family:inherit;
}
.${scope} input[type=radio],.${scope} input[type=checkbox]{width:auto;padding:0;}
.${scope} input:focus,.${scope} textarea:focus,.${scope} select:focus{
  border-color:${s.accent} !important;box-shadow:0 0 0 3px ${s.accent}33 !important;
}
.${scope} button[type=submit]{
  width:100%;padding:12px;margin-top:8px;font-size:15px;font-weight:600;cursor:pointer;
  border-radius:${s.radius}px !important;${btn};
}
.${scope} button[type=submit]:hover{opacity:.92;}
`.trim();
}

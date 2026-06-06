export function copyText(text) {
  navigator.clipboard?.writeText(text);
}

export function downloadCanvas(canvas, filename = "export.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

import { FiEdit } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function Rewriter() {
  return (
    <AiToolShell
      title="AI Content Rewriter"
      subtitle="Rewrite any text in a different tone, length, or style — keep the meaning, change the feel."
      Icon={FiEdit}
      color="#10b981"
      initialState={{
        text: "We are pleased to announce the launch of our brand-new AI lead management platform that helps businesses convert more visitors into qualified leads through advanced automation and intelligent routing.",
        tone: "Conversational + punchy",
        length: "Make it shorter",
        audience: "Indian SMB founders",
      }}
      fields={[
        { key: "text",     label: "Original text", type: "textarea", rows: 6, required: true },
        { key: "tone",     label: "New tone", type: "select", options: ["Conversational + punchy", "Formal & professional", "Friendly & warm", "Bold & confident", "Witty & playful", "Empathetic", "Authoritative"] },
        { key: "length",   label: "Length", type: "select", options: ["Keep similar length", "Make it shorter", "Make it longer", "One-liner (under 20 words)"] },
        { key: "audience", label: "Target audience (optional)", placeholder: "e.g. Indian SMB founders" },
      ]}
      systemPrompt="You are a brilliant editor. Rewrite the text the user provides, keeping the core meaning but matching the requested tone, length, and audience. Output only the rewritten text — no preamble, no explanation, no quotes around it."
      buildPrompt={(f) => `Rewrite this text:
"""
${f.text}
"""
- New tone: ${f.tone}
- Length: ${f.length}
${f.audience ? `- Audience: ${f.audience}` : ""}`}
    />
  );
}

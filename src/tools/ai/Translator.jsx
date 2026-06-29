import { FiGlobe } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function Translator() {
  return (
    <AiToolShell
      title="AI Marketing Translator"
      subtitle="Translate marketing copy that actually feels native — not a literal translation."
      Icon={FiGlobe}
      color="#0ea5e9"
      initialState={{
        text: "Stop chasing cold leads. Leadnator's AI sends every prospect to the right pipeline in seconds — try free for 2 days.",
        target: "Hindi",
        tone: "Match the original",
        keepBrandTerms: "Yes",
      }}
      fields={[
        { key: "text",   label: "Source text (any language)", type: "textarea", rows: 5, required: true },
        { key: "target", label: "Translate to", type: "select", required: true, options: [
          "Hindi", "English", "Spanish", "French", "German", "Portuguese (Brazil)",
          "Arabic", "Indonesian", "Tagalog", "Bengali", "Punjabi", "Tamil", "Telugu",
          "Marathi", "Gujarati", "Mandarin Chinese", "Japanese", "Korean", "Vietnamese",
        ] },
        { key: "tone",   label: "Tone", type: "select", options: ["Match the original", "More formal", "More casual", "More urgent / sales-y"] },
        { key: "keepBrandTerms", label: "Keep brand / product names in English?", type: "select", options: ["Yes", "No"] },
      ]}
      systemPrompt="You are a marketing localization expert who translates copy idiomatically — not word-for-word. The translation should read like it was written natively in the target language by a marketer. Output only the translated text. If the source is already in the target language, refine it to be more natural."
      buildPrompt={(f) => `Translate this marketing copy to ${f.target}.
Tone: ${f.tone}.
${f.keepBrandTerms === "Yes" ? "Keep brand/product names in English." : "Translate brand/product names if natural."}

Source:
"""
${f.text}
"""

Output only the translation.`}
    />
  );
}

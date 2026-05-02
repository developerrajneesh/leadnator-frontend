import { FiTarget } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function AdCopy() {
  return (
    <AiToolShell
      title="AI Ad Copy Generator"
      subtitle="Generate scroll-stopping Facebook & Google ad copy from a short brief."
      Icon={FiTarget}
      color="#1877f2"
      initialState={{
        product: "Leadnator",
        audience: "Indian SMB founders",
        usp: "AI lead management with WhatsApp + Meta Ads built in",
        goal: "Sign up for a free trial",
        platform: "Meta",
        tone: "Friendly + urgent",
      }}
      fields={[
        { key: "product",  label: "Product / brand", required: true, placeholder: "Leadnator" },
        { key: "audience", label: "Target audience", required: true, placeholder: "Indian SMB founders aged 25-45" },
        { key: "usp",      label: "Main value / USP", type: "textarea", rows: 2, required: true, placeholder: "What makes it unique?" },
        { key: "goal",     label: "Conversion goal", placeholder: "Book a demo / Sign up / Buy" },
        { key: "platform", label: "Platform", type: "select", options: ["Meta", "Google", "LinkedIn", "X (Twitter)", "Instagram"] },
        { key: "tone",     label: "Tone", type: "select", options: ["Friendly + urgent", "Professional", "Bold & punchy", "Empathetic", "Witty", "Authoritative"] },
      ]}
      systemPrompt="You are a senior performance-marketing copywriter. Write 3 numbered ad-copy variants. Each variant has: Primary text (under 80 words), Headline (under 7 words), Description (under 12 words), CTA. Use emojis sparingly, real benefits not features, and include one concrete number when plausible. Format clearly with line breaks."
      buildPrompt={(f) => `Brief:
- Product: ${f.product}
- Audience: ${f.audience}
- USP: ${f.usp}
- Goal: ${f.goal}
- Platform: ${f.platform}
- Tone: ${f.tone}

Generate 3 ad-copy variants.`}
    />
  );
}

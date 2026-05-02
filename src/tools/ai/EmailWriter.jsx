import { FiMail } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function EmailWriter() {
  return (
    <AiToolShell
      title="AI Email Writer"
      subtitle="Cold outreach, follow-ups, nurture, breakup emails — generated to your spec."
      Icon={FiMail}
      color="#ec4899"
      initialState={{
        purpose: "Cold outreach",
        recipient: "VP of Marketing at a mid-size SaaS",
        sender: "Deepak from Leadnator",
        product: "Leadnator — AI lead management",
        valueProp: "Cuts lead response time from hours to seconds",
        cta: "15-min demo this week",
        tone: "Conversational",
        length: "Short (under 100 words)",
      }}
      fields={[
        { key: "purpose",   label: "Purpose", type: "select", options: ["Cold outreach", "Follow-up", "Demo invite", "Re-engagement", "Breakup email", "Thank you", "Onboarding"] },
        { key: "recipient", label: "Who you're emailing", required: true, placeholder: "VP of Marketing at a mid-size SaaS" },
        { key: "sender",    label: "Your name + role", placeholder: "Deepak from Leadnator" },
        { key: "product",   label: "Product / service", placeholder: "Leadnator — AI lead management" },
        { key: "valueProp", label: "Specific value prop", type: "textarea", rows: 2, required: true, placeholder: "What problem does it solve, in concrete terms?" },
        { key: "cta",       label: "Call-to-action", placeholder: "15-min demo this week / Reply YES / etc." },
        { key: "tone",      label: "Tone", type: "select", options: ["Conversational", "Formal", "Warm & casual", "Direct & punchy", "Humorous"] },
        { key: "length",    label: "Length", type: "select", options: ["Short (under 100 words)", "Medium (~150 words)", "Long (~250 words)"] },
      ]}
      systemPrompt="You are a B2B sales-outreach copywriter who consistently gets 25%+ reply rates. Write a complete email: 'Subject: ...' on the first line, blank line, then the body. Keep it personal, specific, and never salesy. Use 'I' and 'you' liberally. End with a simple, low-friction CTA. Never use words like 'leverage', 'synergy', 'circle back'."
      buildPrompt={(f) => `Email brief:
- Purpose: ${f.purpose}
- Recipient: ${f.recipient}
- Sender: ${f.sender}
- Product: ${f.product}
- Value prop: ${f.valueProp}
- CTA: ${f.cta}
- Tone: ${f.tone}
- Length: ${f.length}

Write the email now.`}
    />
  );
}

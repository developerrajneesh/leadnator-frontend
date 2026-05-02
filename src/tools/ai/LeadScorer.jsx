import { FiTrendingUp } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function LeadScorer() {
  return (
    <AiToolShell
      title="AI Lead Qualifier"
      subtitle="Drop in any lead's info — get a qualification score, fit reasoning, and recommended next move."
      Icon={FiTrendingUp}
      color="#f59e0b"
      initialState={{
        leadInfo: `Name: Anita Desai
Company: Acme Retail (50 employees, e-commerce)
Job title: Head of Growth
Location: Mumbai, India
Source: Meta lead form
Notes: "Need help converting our 10k monthly site visitors into leads. Currently using Mailchimp."`,
        icp: `Indian SMBs / mid-market (10–500 employees) in retail, SaaS, or services. Decision-makers in marketing, growth, or sales. Already running paid ads or have website traffic. Annual revenue ₹2 Cr+.`,
        product: "Leadnator — AI lead capture, scoring, and routing for WhatsApp + Meta Ads + email",
      }}
      fields={[
        { key: "leadInfo", label: "Lead information", type: "textarea", rows: 7, required: true, placeholder: "Paste any details: name, company, role, source, notes…" },
        { key: "icp",      label: "Your Ideal Customer Profile (ICP)", type: "textarea", rows: 4, required: true, placeholder: "Who is your perfect customer?" },
        { key: "product",  label: "Your product / service", type: "textarea", rows: 2, placeholder: "What do you sell?" },
      ]}
      systemPrompt="You are a senior B2B sales qualifier. Given a lead and an ICP, output a structured analysis with these exact sections (use markdown headings):\n\n**Score**: HOT / WARM / COLD / DISQUALIFY\n**Confidence**: 1-10\n**Why this score**: 2-3 sentences of specific reasoning citing the lead info\n**Fit signals (✓)**: bullet list of what matches the ICP\n**Risk signals (⚠️)**: bullet list of concerns or missing info\n**Next move**: ONE specific, actionable next step (e.g. 'Send 15-min demo invite for next Tuesday' or 'Ask about current ad spend before pitching')\n**Discovery questions** (3): three questions to ask on the next call\n\nBe blunt and specific — no fluff."
      buildPrompt={(f) => `Lead info:
"""
${f.leadInfo}
"""

ICP:
"""
${f.icp}
"""

Product context: ${f.product}

Qualify this lead.`}
    />
  );
}

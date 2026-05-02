import { FiHash } from "react-icons/fi";
import AiToolShell from "./AiToolShell";

export default function Hashtags() {
  return (
    <AiToolShell
      title="AI Hashtag Generator"
      subtitle="Targeted hashtags for Instagram, LinkedIn, X & TikTok — mixed reach so you actually get found."
      Icon={FiHash}
      color="#7c3aed"
      multipleResults
      resultLabel="Suggested hashtags"
      initialState={{
        topic: "Launching an AI lead-gen platform for Indian SMBs",
        platform: "Instagram",
        count: "20",
        mix: "Balanced (popular + niche)",
      }}
      fields={[
        { key: "topic",    label: "Post topic / caption", type: "textarea", rows: 3, required: true, placeholder: "What's your post about?" },
        { key: "platform", label: "Platform", type: "select", options: ["Instagram", "LinkedIn", "X (Twitter)", "TikTok", "YouTube Shorts", "Threads"] },
        { key: "count",    label: "How many", type: "select", options: ["10", "15", "20", "30"] },
        { key: "mix",      label: "Mix", type: "select", options: ["Balanced (popular + niche)", "All high-volume (popular)", "All niche (less competition)", "Branded only"] },
      ]}
      systemPrompt="You generate hashtag lists. Output ONLY the hashtags (one per line, no numbers, no commas, no explanations). Each hashtag must start with # and contain no spaces. No emoji. No banned hashtags. Vary length and specificity."
      buildPrompt={(f) => `Generate exactly ${f.count} hashtags for a ${f.platform} post.
Topic: ${f.topic}
Mix style: ${f.mix}
Output one hashtag per line, no numbering.`}
    />
  );
}

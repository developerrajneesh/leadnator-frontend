import { useMemo, useState } from "react";
import { FiActivity } from "react-icons/fi";

export default function Counter() {
  const [text, setText] = useState("Your marketing copy goes here. See live counts for SMS, tweets, Meta descriptions and more.");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const readingMin = Math.max(1, Math.round(words / 200));
    return { chars, charsNoSpace, words, sentences, paragraphs, readingMin };
  }, [text]);

  const limits = [
    { name: "SMS", max: 160 }, { name: "Tweet", max: 280 }, { name: "Meta description", max: 160 },
    { name: "SEO title", max: 60 }, { name: "Subject line", max: 50 }, { name: "Instagram caption", max: 2200 },
  ];

  return (
    <>
      <h1 className="page-title">Word counter</h1>
      <p className="page-subtitle">Count words, characters and reading time for any platform.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiActivity /> Word counter</div></div>
          <div className="form-group"><label>Paste or type your text</label><textarea rows="12" value={text} onChange={(e) => setText(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 13 }}>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.chars}</strong><div style={{ color: "#6b7280" }}>Chars</div></div>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.charsNoSpace}</strong><div style={{ color: "#6b7280" }}>No spaces</div></div>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.words}</strong><div style={{ color: "#6b7280" }}>Words</div></div>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.sentences}</strong><div style={{ color: "#6b7280" }}>Sentences</div></div>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.paragraphs}</strong><div style={{ color: "#6b7280" }}>Paragraphs</div></div>
            <div><strong style={{ fontSize: 22, color: "var(--primary)" }}>{stats.readingMin}m</strong><div style={{ color: "#6b7280" }}>Read time</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Platform limits</div></div>
          {limits.map((l) => {
            const pct = Math.min(100, (stats.chars / l.max) * 100);
            const over = stats.chars > l.max;
            return (
              <div key={l.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{l.name}</span>
                  <strong style={{ color: over ? "var(--danger)" : "var(--text)" }}>{stats.chars} / {l.max}</strong>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--danger)" : "var(--primary)", transition: "0.2s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

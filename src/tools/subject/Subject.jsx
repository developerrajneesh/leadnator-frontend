import { useMemo, useState } from "react";
import { FiMail, FiAlertCircle } from "react-icons/fi";

const SPAM_WORDS = ["free", "buy now", "click here", "winner", "cash", "guarantee", "100%", "urgent", "act now", "limited time", "offer", "!!!", "earn", "$$$"];

export default function Subject() {
  const [subject, setSubject] = useState("Quick favor — 3 minutes to shape next week's post");

  const analysis = useMemo(() => {
    const len = subject.length;
    const words = subject.trim().split(/\s+/).filter(Boolean);
    const hasEmoji = /\p{Emoji}/u.test(subject);
    const allCaps = /^[A-Z\s!?]+$/.test(subject) && subject.length > 10;
    const excl = (subject.match(/!/g) || []).length;
    const spamHits = SPAM_WORDS.filter((w) => subject.toLowerCase().includes(w));
    let score = 100;
    if (len < 20 || len > 60) score -= 15;
    if (allCaps) score -= 25;
    if (excl > 1) score -= 10;
    spamHits.forEach(() => (score -= 10));
    score = Math.max(0, score);
    return { len, words: words.length, hasEmoji, allCaps, excl, spamHits, score };
  }, [subject]);

  const scoreColor = analysis.score >= 80 ? "var(--accent)" : analysis.score >= 50 ? "var(--warn)" : "var(--danger)";

  return (
    <>
      <h1 className="page-title">Subject line tester</h1>
      <p className="page-subtitle">Check your subject for spam triggers and readability.</p>
      <div className="grid-2-equal">
        <div className="card">
          <div className="card-header"><div className="card-title"><FiMail /> Subject line tester</div></div>
          <div className="form-group"><label>Your subject line</label><input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Sweet spot: 30–50 chars, 6–8 words.</div>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>Length: <strong>{analysis.len}</strong> chars · <strong>{analysis.words}</strong> words</div>
            <div>Has emoji: <strong>{analysis.hasEmoji ? "Yes" : "No"}</strong></div>
            <div>All caps: <strong style={{ color: analysis.allCaps ? "var(--danger)" : undefined }}>{analysis.allCaps ? "Yes (avoid)" : "No"}</strong></div>
            <div>Exclamations: <strong>{analysis.excl}</strong></div>
            {analysis.spamHits.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <FiAlertCircle style={{ color: "var(--danger)", verticalAlign: "middle" }} /> Spammy words:
                {analysis.spamHits.map((w) => <span key={w} className="badge hot" style={{ marginLeft: 6 }}>{w}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Delivery score</div>
          <div style={{ fontSize: 80, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{analysis.score}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>out of 100</div>
          <div style={{ marginTop: 20, padding: "10px 16px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
            {analysis.score >= 80 && "Looks great — this should land in the inbox."}
            {analysis.score >= 50 && analysis.score < 80 && "Decent, but can be improved."}
            {analysis.score < 50 && "Likely to land in spam. Rework it."}
          </div>
        </div>
      </div>
    </>
  );
}

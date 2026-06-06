import { useEffect, useState } from "react";
import { FiMessageCircle, FiRefreshCw, FiSend } from "react-icons/fi";
import { igApi } from "../../api/instagram";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(null);
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await igApi.comments();
      setComments(r.comments || []);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function submitReply(id) {
    if (!text.trim()) return;
    try {
      await igApi.replyComment(id, text.trim());
      setReplying(null);
      setText("");
      await load();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">Instagram — Comments</h1>
      <p className="page-subtitle">View and reply to comments on your posts. Set auto-replies in Settings.</p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiMessageCircle /> Comments
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Comment</th><th>Status</th><th style={{ width: 200 }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : comments.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, color: "var(--text-muted)" }}>No comments yet.</td></tr>
              ) : comments.map((c) => (
                <tr key={c.id}>
                  <td>@{c.igUsername}</td>
                  <td>{c.text}</td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      background: c.replied ? "#d1fae5" : "#fef3c7",
                      color: c.replied ? "#065f46" : "#92400e",
                    }}>
                      {c.replied ? "Replied" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {c.replied ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.replyText}</span>
                    ) : replying === c.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply…" style={{ flex: 1, fontSize: 12 }} />
                        <button type="button" className="btn btn-primary" style={{ padding: "4px 10px" }} onClick={() => submitReply(c.id)}>
                          <FiSend />
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setReplying(null)}>×</button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => { setReplying(c.id); setText(""); }}>
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiBarChart2, FiExternalLink, FiFilm, FiHeart, FiMessageCircle,
  FiRefreshCw, FiShare2, FiBookmark, FiEye, FiUsers,
} from "react-icons/fi";
import { igApi, igMediaPictureUrl } from "../../api/instagram";
import { formatCount, formatDate, formatDateTime, mediaTypeLabel } from "./utils";
import "./Content.css";

const METRIC_LABELS = {
  reach: { label: "Reach", icon: FiUsers },
  likes: { label: "Likes", icon: FiHeart },
  comments: { label: "Comments", icon: FiMessageCircle },
  shares: { label: "Shares", icon: FiShare2 },
  saved: { label: "Saved", icon: FiBookmark },
  plays: { label: "Plays", icon: FiEye },
  total_interactions: { label: "Total interactions", icon: FiBarChart2 },
};

function StatCard({ icon: Icon, label, value, accent = "#e1306c" }) {
  return (
    <div className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
      <Icon size={22} style={{ color: accent, marginBottom: 8 }} />
      <div style={{ fontSize: 22, fontWeight: 700 }}>{formatCount(value)}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function ContentDetail() {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await igApi.mediaDetail(mediaId);
      setData(r);
    } catch (err) {
      setError(err.message || "Failed to load post");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [mediaId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        Loading post details…
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <p style={{ color: "#b91c1c", marginBottom: 14 }}>{error || "Post not found."}</p>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/instagram/content")}>
          <FiArrowLeft /> Back to content
        </button>
      </div>
    );
  }

  const { post, username, comments, insights } = data;
  const imgSrc = igMediaPictureUrl(post.id);

  const quickStats = [
    { key: "likes", icon: FiHeart, label: "Likes", value: post.likes ?? insights.metrics?.likes },
    { key: "comments", icon: FiMessageCircle, label: "Comments", value: post.comments ?? insights.metrics?.comments },
    { key: "reach", icon: FiUsers, label: "Reach", value: insights.metrics?.reach },
    { key: "shares", icon: FiShare2, label: "Shares", value: insights.metrics?.shares },
    { key: "saved", icon: FiBookmark, label: "Saved", value: insights.metrics?.saved },
    { key: "plays", icon: FiEye, label: "Plays", value: insights.metrics?.plays },
    { key: "total_interactions", icon: FiBarChart2, label: "Interactions", value: insights.metrics?.total_interactions },
  ].filter((s) => s.value != null);

  const insightCards = Object.entries(insights.metrics || {}).map(([key, value]) => {
    const meta = METRIC_LABELS[key] || { label: key.replace(/_/g, " "), icon: FiBarChart2 };
    return { key, value, ...meta };
  });

  const statsToShow = insightCards.length > 0 ? insightCards : quickStats;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/instagram/content")}>
          <FiArrowLeft /> Content
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
          {post.permalink && (
            <a className="btn btn-primary" href={post.permalink} target="_blank" rel="noopener noreferrer">
              Open on Instagram <FiExternalLink />
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="ig-post-media-wrap" style={{ height: 420 }}>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={post.caption || "Post"}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf2f8" }}>
                <FiFilm size={48} color="#e1306c" />
              </div>
            )}
            <span style={{
              position: "absolute", top: 12, left: 12, zIndex: 4, fontSize: 11, fontWeight: 700,
              padding: "5px 10px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "white",
              textTransform: "uppercase",
            }}>
              {mediaTypeLabel(post.mediaType, post.isVideo)}
            </span>
          </div>
          {post.children?.length > 1 && (
            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, overflowX: "auto" }}>
              {post.children.map((c) => (
                <img
                  key={c.id}
                  src={igMediaPictureUrl(c.id)}
                  alt=""
                  style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Post details</h1>
          <p className="page-subtitle" style={{ marginBottom: 16 }}>
            {username ? `@${username}` : "Instagram"}
            {post.timestamp ? ` · ${formatDate(post.timestamp)}` : ""}
          </p>

          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>Caption</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {post.caption || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No caption</span>}
            </p>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <FiBarChart2 style={{ color: "#e1306c" }} /> Analytics
          </h3>

          {!insights.available && insights.error && (
            <div className="card" style={{ padding: 14, marginBottom: 14, fontSize: 13, color: "var(--text-muted)" }}>
              Insights unavailable: {insights.error}. Reconnect with instagram_manage_insights or pages_read_engagement.
            </div>
          )}

          {statsToShow.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
              {statsToShow.map((s) => (
                <StatCard key={s.key} icon={s.icon} label={s.label} value={s.value} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 14, marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
              No analytics metrics available for this post.
            </div>
          )}

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <FiMessageCircle style={{ color: "#7c3aed" }} />
            Comments ({comments.totalCount ?? comments.items?.length ?? 0})
          </h3>

          <div className="card" style={{ padding: 0 }}>
            {!comments.items?.length && (comments.error || comments.totalCount > 0 || post.comments > 0) && (
              <div style={{ padding: 14, fontSize: 13, color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                {comments.error || (
                  <>Instagram reports {comments.totalCount ?? post.comments} comment(s), but comment text could not be loaded.</>
                )}
                <div style={{ marginTop: 8 }}>
                  Reconnect Instagram with <strong>instagram_business_manage_comments</strong>, or connect Facebook (Meta) for the same page in Settings.
                  {post.permalink && (
                    <>
                      {" "}
                      <a href={post.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "#e1306c" }}>
                        View on Instagram
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
            {!comments.items?.length && !(comments.totalCount > 0 || post.comments > 0) ? (
              <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No comments on this post yet.
              </div>
            ) : comments.items?.length > 0 ? (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {comments.items.map((c) => (
                  <li key={c.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <strong style={{ fontSize: 13 }}>@{c.username || "user"}</strong>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDateTime(c.timestamp)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{c.text}</p>
                    {c.likes != null && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "inline-block" }}>
                        <FiHeart style={{ marginRight: 4 }} />{formatCount(c.likes)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

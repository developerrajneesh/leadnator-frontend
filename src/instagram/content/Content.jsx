import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiExternalLink, FiFilm, FiHeart, FiImage, FiMessageCircle, FiRefreshCw,
} from "react-icons/fi";
import { igApi, igMediaPictureUrl } from "../../api/instagram";
import { formatCount, formatDate, mediaTypeLabel } from "./utils";
import "./Content.css";

const SKELETON_MIN_MS = 450;
const INITIAL_SKELETON_CARDS = 6;

function PostCardSkeleton() {
  return (
    <article className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="ig-content-skeleton ig-content-skeleton--block" style={{ height: 200 }} />
      <div style={{ padding: "14px 16px" }}>
        <span className="ig-content-skeleton ig-content-skeleton--line" style={{ width: "35%", marginBottom: 10, display: "block" }} />
        <span className="ig-content-skeleton ig-content-skeleton--line" style={{ width: "100%", marginBottom: 8, display: "block" }} />
        <span className="ig-content-skeleton ig-content-skeleton--line" style={{ width: "72%", display: "block" }} />
      </div>
    </article>
  );
}

function PostThumbnail({ post }) {
  const [showImg, setShowImg] = useState(false);
  const [failed, setFailed] = useState(false);
  const minVisibleUntil = useRef(0);
  const src = igMediaPictureUrl(post.id);

  useEffect(() => {
    setShowImg(false);
    setFailed(false);
    minVisibleUntil.current = Date.now() + SKELETON_MIN_MS;
  }, [post.id]);

  const revealImage = useCallback(() => {
    const delay = Math.max(0, minVisibleUntil.current - Date.now());
    window.setTimeout(() => setShowImg(true), delay);
  }, []);

  if (failed || !src) {
    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
      }}>
        <FiImage size={40} color="#e1306c" />
      </div>
    );
  }

  return (
    <div className="ig-post-thumb">
      <div
        className={`ig-content-skeleton ig-content-skeleton--overlay${showImg ? " is-hidden" : ""}`}
        aria-hidden
      />
      <img
        key={post.id}
        src={src}
        alt={post.caption ? post.caption.slice(0, 80) : "Instagram post"}
        className={`ig-post-thumb__img${showImg ? " is-visible" : ""}`}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={revealImage}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Content() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState(null);

  const scrollSentinelRef = useRef(null);
  const cursorRef = useRef(null);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);

  useEffect(() => { cursorRef.current = cursor; }, [cursor]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  const load = useCallback(async (after = "", append = false) => {
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setError("");
    }
    try {
      const params = after ? { after } : undefined;
      const r = await igApi.media(params);
      const next = r.posts || [];
      setUsername(r.username || "");
      setPosts((prev) => {
        const merged = append ? [...prev, ...next] : next;
        const seen = new Set();
        return merged.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      });
      setCursor(r.paging?.after || null);
    } catch (err) {
      setError(err.message || "Failed to load posts");
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const el = scrollSentinelRef.current;
    if (!el || !cursor) return undefined;

    const scrollRoot = el.closest(".content");

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingRef.current || loadingMoreRef.current || !cursorRef.current) return;
        load(cursorRef.current, true);
      },
      { root: scrollRoot, rootMargin: "320px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [load, cursor, posts.length]);

  return (
    <>
      <h1 className="page-title">Instagram — Content</h1>
      <p className="page-subtitle">
        {username ? `@${username} — ` : ""}
        Recent posts from your connected account (live from Meta Graph API).
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button type="button" className="btn btn-outline" onClick={() => load()} disabled={loading}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: "12px 16px", marginBottom: 14, borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && posts.length === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {Array.from({ length: INITIAL_SKELETON_CARDS }, (_, i) => (
            <PostCardSkeleton key={`skel-${i}`} />
          ))}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <FiImage size={32} style={{ marginBottom: 12, color: "#e1306c" }} />
          <p style={{ margin: 0 }}>No posts found yet. Publish on Instagram or reconnect with instagram_basic permission.</p>
        </div>
      )}

      {posts.length > 0 && (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {posts.map((p) => (
          <article
            key={p.id}
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/instagram/content/${p.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/instagram/content/${p.id}`); }}
            style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
          >
            <div className="ig-post-media-wrap">
              <PostThumbnail post={p} />
              <span style={{
                position: "absolute", top: 10, left: 10, zIndex: 4, fontSize: 10, fontWeight: 700,
                padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.55)", color: "white",
                textTransform: "uppercase", letterSpacing: 0.4,
              }}>
                {(p.isVideo || p.mediaType === "REELS") && <FiFilm style={{ marginRight: 4, verticalAlign: -2 }} />}
                {mediaTypeLabel(p.mediaType, p.isVideo)}
              </span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              {p.timestamp && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{formatDate(p.timestamp)}</div>
              )}
              <p style={{
                fontSize: 13, margin: "0 0 12px", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {p.caption || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No caption</span>}
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                <span title="Likes"><FiHeart style={{ marginRight: 4 }} />{formatCount(p.likes)}</span>
                <span title="Comments"><FiMessageCircle style={{ marginRight: 4 }} />{formatCount(p.comments)}</span>
                {p.permalink && (
                  <a
                    href={p.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginLeft: "auto", fontSize: 12, color: "#e1306c", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    View <FiExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      )}

      {cursor && (
        <div
          ref={scrollSentinelRef}
          style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            minHeight: 56, marginTop: 20, color: "var(--text-muted)", fontSize: 13,
          }}
        >
          {loadingMore ? "Loading more posts…" : null}
        </div>
      )}

    </>
  );
}

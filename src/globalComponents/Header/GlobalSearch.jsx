import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCornerDownLeft } from "react-icons/fi";
import { searchRoutes, getSearchIndex } from "./searchIndex";
import { useCurrentUser } from "../../api/hooks";
import { canAccess } from "../../profile/team/permissions";

// Pull the (moduleKey, subRouteKey) pair out of a route path.
// "/whatsapp/inbox" -> { mod: "whatsapp", sub: "inbox" }
function splitPath(path) {
  const parts = path.split("/").filter(Boolean);
  return { mod: parts[0] || "", sub: parts[1] || "" };
}

const RECENT_KEY = "leadnator.search.recent";
const RECENT_MAX = 5;

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeRecent(paths) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(paths.slice(0, RECENT_MAX))); }
  catch { /* storage may be unavailable; recents are non-critical */ }
}

// Highlight matched substrings of `text` against the active query tokens.
function Highlight({ text, query }) {
  if (!query) return text;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;
  const lower = text.toLowerCase();
  const ranges = [];
  for (const t of tokens) {
    let i = 0;
    while (i < lower.length) {
      const idx = lower.indexOf(t, i);
      if (idx === -1) break;
      ranges.push([idx, idx + t.length]);
      i = idx + t.length;
    }
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const parts = [];
  let cursor = 0;
  merged.forEach(([s, e], i) => {
    if (s > cursor) parts.push(<span key={`p${i}`}>{text.slice(cursor, s)}</span>);
    parts.push(<mark key={`m${i}`} className="gs-mark">{text.slice(s, e)}</mark>);
    cursor = e;
  });
  if (cursor < text.length) parts.push(<span key="rest">{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState(() => readRecent());

  // Hide routes the team member has no permission for, mirroring the
  // Sidebar's filtering. Owners (canAccess returns true) see everything.
  const allItems = useMemo(() => {
    return getSearchIndex().filter((it) => {
      const { mod, sub } = splitPath(it.path);
      if (!mod || !sub) return true;
      return canAccess(user, mod, sub);
    });
  }, [user]);
  const byPath = useMemo(() => {
    const map = new Map();
    allItems.forEach((it) => map.set(it.path, it));
    return map;
  }, [allItems]);

  // When the query is empty we surface a small set of helpful entries:
  // the user's recently-visited search results plus a stable "popular"
  // sample (one item per top module) so the dropdown is never empty.
  const results = useMemo(() => {
    if (query.trim()) return searchRoutes(query, allItems, 12);
    const recentItems = recents.map((p) => byPath.get(p)).filter(Boolean);
    const popularKeys = ["leads", "instagram", "whatsapp", "meta", "email", "integrations", "calendar"];
    const seen = new Set(recentItems.map((i) => i.path));
    const popular = [];
    for (const key of popularKeys) {
      const it = allItems.find((i) => i.moduleKey === key && i.path.endsWith("/overview"));
      if (it && !seen.has(it.path)) { popular.push(it); seen.add(it.path); }
    }
    return [...recentItems, ...popular].slice(0, 10);
  }, [query, recents, allItems, byPath]);

  // Reset highlight whenever the visible result list changes.
  useEffect(() => { setActive(0); }, [query, open]);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cmd/Ctrl-K opens & focuses the search bar from anywhere.
  useEffect(() => {
    function onKey(e) {
      const isK = (e.key === "k" || e.key === "K");
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the active result in view when the user arrows past the visible window.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  function commit(item) {
    if (!item) return;
    const next = [item.path, ...recents.filter((p) => p !== item.path)].slice(0, RECENT_MAX);
    setRecents(next);
    writeRecent(next);
    setOpen(false);
    setQuery("");
    navigate(item.path);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showResults = open && results.length > 0;
  const showEmpty   = open && query.trim() && results.length === 0;
  const headerLabel = query.trim() ? "Results" : (recents.length ? "Recent" : "Popular");

  return (
    <div className="header-search" ref={wrapRef}>
      <FiSearch className="search-icon" />
      <input
        ref={inputRef}
        value={query}
        placeholder="Search leads, campaigns, templates…"
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Global search"
        autoComplete="off"
      />
      <kbd>⌘K</kbd>

      {(showResults || showEmpty) && (
        <div className="gs-panel" role="listbox">
          <div className="gs-panel-head">
            <span>{headerLabel}</span>
            {query.trim() && <span className="gs-panel-count">{results.length} match{results.length === 1 ? "" : "es"}</span>}
          </div>

          {showEmpty ? (
            <div className="gs-empty">
              <div className="gs-empty-title">No matches</div>
              <div className="gs-empty-sub">Try a module name (whatsapp, meta, leads) or a feature (broadcasts, templates, qr)</div>
            </div>
          ) : (
            <ul className="gs-list" ref={listRef}>
              {results.map((item, idx) => {
                const Icon = item.Icon;
                const isActive = idx === active;
                return (
                  <li
                    key={item.path}
                    data-idx={idx}
                    className={`gs-item ${isActive ? "active" : ""}`}
                    onMouseEnter={() => setActive(idx)}
                    onMouseDown={(e) => { e.preventDefault(); commit(item); }}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span
                      className="gs-icon"
                      style={{ background: `${item.color}1a`, color: item.color }}
                    >
                      {Icon ? <Icon /> : <FiSearch />}
                    </span>
                    <div className="gs-text">
                      <div className="gs-title">
                        <Highlight text={item.label} query={query} />
                      </div>
                      <div className="gs-sub">
                        <span className="gs-module" style={{ color: item.color }}>
                          <Highlight text={item.module} query={query} />
                        </span>
                        <span className="gs-path">{item.path}</span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="gs-enter" title="Open">
                        <FiCornerDownLeft />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="gs-panel-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      )}
    </div>
  );
}

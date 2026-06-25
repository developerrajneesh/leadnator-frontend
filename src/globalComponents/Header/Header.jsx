import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell, FiChevronDown, FiMenu,
  FiUser, FiSettings, FiCreditCard, FiLogOut,
} from "react-icons/fi";
import { useCurrentUser } from "../../api/hooks";
import { api, getStoredOrg, isOrganizationLogin } from "../../api/client";
import { onSocket } from "../../api/socket";
import GlobalSearch from "./GlobalSearch";
import OrgSwitcher from "../OrgSwitcher/OrgSwitcher";

export default function Header({ onLogout, onMenuClick }) {
  const navigate = useNavigate();
  const CURRENT_USER = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [logoBroken, setLogoBroken] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Pull a live feed (recent leads, finished campaigns, renewal) for the bell.
  useEffect(() => {
    let alive = true;
    api.notifications.list()
      .then((res) => alive && setNotifs(res.notifications || []))
      .catch(() => alive && setNotifs([]));
    return () => { alive = false; };
  }, []);

  // Real-time: prepend any notification the server pushes over the socket.
  useEffect(() => onSocket("notification:new", (n) => {
    if (!n) return;
    setNotifs((list) => [{ ...n, read: false }, ...list].slice(0, 8));
  }), []);

  const hasUnread = notifs.some((n) => !n.read);

  function markAllRead() {
    setNotifs((list) => list.map((n) => ({ ...n, read: true })));
    api.notifications.markAllRead().catch(() => {});
  }

  function openNotif(n) {
    if (!n.read && n.key) {
      setNotifs((list) => list.map((x) => (x.key === n.key ? { ...x, read: true } : x)));
      api.notifications.markRead(n.key).catch(() => {});
    }
    if (n.link) { navigate(n.link); setNotifOpen(false); }
  }

  // Dynamic branding — show the current workspace's logo/name (white-label)
  // when set, otherwise fall back to the default Leadnator branding.
  const org = getStoredOrg();
  const orgLogo = org?.logoUrl || "";
  const orgName = org?.name || "";
  const useOrgBrand = !!orgLogo && !logoBroken;

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <button type="button" className="mobile-menu-btn" onClick={onMenuClick} title="Menu" aria-label="Menu">
          <FiMenu />
        </button>
        <div className="brand-well">
          <img
            src={useOrgBrand ? orgLogo : "/leadnator_logo.png"}
            alt={useOrgBrand ? orgName : "Leadnator"}
            onClick={() => navigate("/dashboard")}
            onError={() => setLogoBroken(true)}
            style={{
              width: 52, height: 52,
              objectFit: "contain",
              cursor: "pointer",
              userSelect: "none",
            }}
          />
        </div>
        {useOrgBrand ? (
          <div className="brand-name">
            <div className="brand-name-row">
              <span className="brand-name-lead" style={{ color: "var(--text)" }}>{orgName}</span>
            </div>
          </div>
        ) : (
          <div className="brand-name">
            <div className="brand-name-row">
              <span className="brand-name-lead">Lead</span><span className="brand-name-nator">nator</span>
            </div>
            <div className="brand-name-tag">
              <span className="brand-name-tag-line" /> AI-POWERED GROWTH PLATFORM <span className="brand-name-tag-line" />
            </div>
          </div>
        )}
      </div>

      <GlobalSearch />

      <div className="header-right">
        {isOrganizationLogin() ? (
          <span
            className="org-login-pill"
            title="Signed in as workspace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 600,
              color: "#5b21b6",
              background: "#f3e8ff",
              border: "1px solid #ddd6fe",
              borderRadius: 8,
              marginRight: 4,
            }}
          >
            {getStoredOrg()?.name || "Workspace"}
          </span>
        ) : (
          <OrgSwitcher />
        )}
        <div className="header-popover-wrap" ref={notifRef}>
          <button className="icon-btn" title="Notifications" onClick={() => setNotifOpen((o) => !o)}>
            <FiBell />
            {hasUnread && <span className="notif-dot" />}
          </button>
          {notifOpen && (
            <div className="popover">
              <div className="popover-head">
                <span>Notifications</span>
                {hasUnread && (
                  <a onClick={markAllRead} style={{ cursor: "pointer" }}>Mark all read</a>
                )}
              </div>
              {notifs.length === 0 ? (
                <div className="popover-item" style={{ color: "var(--text-muted)", fontSize: 13, cursor: "default" }}>
                  You're all caught up — no new notifications.
                </div>
              ) : (
                notifs.map((n, i) => {
                  const unread = !n.read;
                  return (
                    <div
                      className="popover-item"
                      key={i}
                      style={{ cursor: "pointer", background: unread ? "#faf9ff" : "transparent" }}
                      onClick={() => openNotif(n)}
                    >
                      <span className="popover-dot" style={{ background: unread ? "var(--primary)" : "#cbd5e1" }} />
                      <div>
                        <div className="popover-title">{n.title}</div>
                        <div className="popover-sub">{n.sub}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="popover-foot" onClick={() => { navigate("/notifications"); setNotifOpen(false); }}>View all notifications</div>
            </div>
          )}
        </div>

        <div className="header-divider" />

        <div className="header-popover-wrap" ref={menuRef}>
          <div className="header-user" onClick={() => setMenuOpen((o) => !o)}>
            <div className="header-user-avatar">{(CURRENT_USER.name?.[0] || "?")}</div>
            <div className="header-user-text">
              <div className="header-user-name">{CURRENT_USER.name}</div>
              <div className="header-user-plan"><span className="plan-dot" /> {CURRENT_USER.plan} plan</div>
            </div>
            <FiChevronDown className={`chev ${menuOpen ? "up" : ""}`} />
          </div>
          {menuOpen && (
            <div className="popover user-menu">
              <div className="popover-head user">
                <div className="header-user-avatar lg">{(CURRENT_USER.name?.[0] || "?")}</div>
                <div>
                  <div className="popover-title">{CURRENT_USER.name}</div>
                  <div className="popover-sub">{CURRENT_USER.email}</div>
                </div>
              </div>
              <div className="menu-item" onClick={() => { navigate("/settings/info"); setMenuOpen(false); }}>
                <FiUser /> My profile
              </div>
              <div className="menu-item" onClick={() => { navigate("/settings/account"); setMenuOpen(false); }}>
                <FiSettings /> Account settings
              </div>
              {!isOrganizationLogin() && (
                <div className="menu-item" onClick={() => { navigate("/pricing/plans"); setMenuOpen(false); }}>
                  <FiCreditCard /> Billing & plan
                </div>
              )}
              <div className="menu-sep" />
              <div className="menu-item danger" onClick={onLogout}>
                <FiLogOut /> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiBell, FiHelpCircle, FiChevronDown,
  FiUser, FiSettings, FiCreditCard, FiLogOut,
} from "react-icons/fi";
import { useCurrentUser } from "../../api/hooks";

export default function Header({ onLogout }) {
  const navigate = useNavigate();
  const CURRENT_USER = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

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
        <div className="brand-well">
          <img
            src="/leadnator_logo.png"
            alt="Leadnator"
            onClick={() => navigate("/dashboard")}
            style={{
              width: 52, height: 52,
              objectFit: "contain",
              cursor: "pointer",
              userSelect: "none",
            }}
          />
        </div>
        <div className="brand-name">
          <div className="brand-name-row">
            <span className="brand-name-lead">Lead</span><span className="brand-name-nator">nator</span>
          </div>
          <div className="brand-name-tag">
            <span className="brand-name-tag-line" /> AI-POWERED GROWTH PLATFORM <span className="brand-name-tag-line" />
          </div>
        </div>
      </div>

      <div className="header-search">
        <FiSearch className="search-icon" />
        <input placeholder="Search leads, campaigns, templates…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="header-right">
        <button className="icon-btn" title="Help & docs"><FiHelpCircle /></button>

        <div className="header-popover-wrap" ref={notifRef}>
          <button className="icon-btn" title="Notifications" onClick={() => setNotifOpen((o) => !o)}>
            <FiBell />
            <span className="notif-dot" />
          </button>
          {notifOpen && (
            <div className="popover">
              <div className="popover-head">
                <span>Notifications</span><a>Mark all read</a>
              </div>
              {[
                { t: "New lead from Meta Ads", d: "Aarav Sharma · 2m ago" },
                { t: "Campaign 'Spring Sale' finished", d: "2,480 sent · 1h ago" },
                { t: "Your Growth plan renews in 5 days", d: "Manage subscription" },
              ].map((n, i) => (
                <div className="popover-item" key={i}>
                  <span className="popover-dot" />
                  <div>
                    <div className="popover-title">{n.t}</div>
                    <div className="popover-sub">{n.d}</div>
                  </div>
                </div>
              ))}
              <div className="popover-foot" onClick={() => setNotifOpen(false)}>View all notifications</div>
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
              <div className="menu-item" onClick={() => { navigate("/pricing/plans"); setMenuOpen(false); }}>
                <FiCreditCard /> Billing & plan
              </div>
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

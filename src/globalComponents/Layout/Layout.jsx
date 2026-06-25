import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiChevronsRight } from "react-icons/fi";
import Header from "../Header/Header";
import MiniSidebar from "../MiniSidebar/MiniSidebar";
import Sidebar from "../Sidebar/Sidebar";
import MobileTabBar from "../MobileNav/MobileTabBar";

export default function Layout({ onLogout }) {
  // Desktop: sub-nav open. Mobile: closed by default (opened via the top menu).
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 768
  );

  return (
    <div className="app-shell">
      <Header onLogout={onLogout} onMenuClick={() => setSidebarOpen((s) => !s)} />

      <div className="layout">
        <MiniSidebar />
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((s) => !s)} />

        {/* Mobile drawer backdrop — tap to close the sub-nav. */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {!sidebarOpen && (
          <button
            className="sidebar-expand-btn"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
          >
            <FiChevronsRight />
          </button>
        )}

        <div className="content">
          <div className="content-pad">
            <Outlet />
          </div>
        </div>
      </div>

      {/* App-style bottom tab bar (mobile only — hidden by CSS on desktop). */}
      <MobileTabBar />
    </div>
  );
}

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FiChevronsRight } from "react-icons/fi";
import Header from "../Header/Header";
import MiniSidebar from "../MiniSidebar/MiniSidebar";
import Sidebar from "../Sidebar/Sidebar";

export default function Layout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      <Header onLogout={onLogout} />

      <div className="layout">
        <MiniSidebar />
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((s) => !s)} />

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
    </div>
  );
}

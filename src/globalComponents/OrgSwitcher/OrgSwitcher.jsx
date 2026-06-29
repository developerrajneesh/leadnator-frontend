import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiBriefcase, FiTrash2 } from "react-icons/fi";
import { api, getStoredOrg, getStoredUser, setAuth, setStoredOrg } from "../../api/client";
import { notify } from "../Toast/Toast";
import { invalidateLeads } from "../../api/hooks";
import { refreshPipelineStages } from "../../leads/usePipelineStages";

export default function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const current = getStoredOrg();
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    api.orgs.list()
      .then((res) => setOrgs(res.organizations || []))
      .catch(() => setOrgs([]));
  }, [open]);

  const displayedOrgs = orgs.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  async function deleteOrg(orgId) {
    if (!window.confirm("Delete this organization? This action cannot be undone.")) return;
    setBusy(true);
    try {
      await api.orgs.remove(orgId);
      setOrgs((prev) => prev.filter((x) => x.id !== orgId));
      notify.success("Organization deleted");
      if (orgId === current?.id) {
        setStoredOrg(null);
        window.location.reload();
      }
    } catch (err) {
      notify.error(err.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function switchTo(organizationId) {
    if (busy || organizationId === current?.id) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await api.orgs.switch(organizationId);
      const user = getStoredUser();
      setAuth(res.token, user, res.organization, "user");
      setStoredOrg(res.organization);
      invalidateLeads();
      refreshPipelineStages();
      notify.success(`Now in ${res.organization.name}`);
      window.location.reload();
    } catch (err) {
      notify.error(err.message || "Switch failed");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="header-popover-wrap" ref={wrapRef} style={{ marginRight: 8 }}>
      <button
        type="button"
        className="icon-btn"
        title="Switch organization"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "auto",
          padding: "6px 10px",
          fontSize: 13,
          color: "#374151",
        }}
      >
        <FiBriefcase />
        <span className="org-switch-name" style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current?.name || "Workspace"}
        </span>
        <FiChevronDown size={14} />
      </button>
      {open && (
        <div className="popover" style={{ minWidth: 220, right: 0, left: "auto" }}>
          <div className="popover-head">
            <input
              type="text"
              placeholder="Search organizations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="popover-search"
            />
          </div>
          {displayedOrgs.map((o) => (
            <button
              key={o.id}
              type="button"
              className="popover-item"
              style={{
                width: "100%",
                border: "none",
                background: o.id === current?.id ? "#f3e8ff" : "transparent",
                cursor: busy ? "wait" : "pointer",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              disabled={busy}
              onClick={() => switchTo(o.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div>
                  <div className="popover-title">{o.name}</div>
                  {o.id === current?.id && (
                    <div className="popover-sub" style={{ color: "#7c3aed" }}>Current</div>
                  )}
                </div>
              </div>
              {/* Keep at least one organization — hide delete when it's the last. */}
              {orgs.length > 1 && (
                <div style={{ marginLeft: 12 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (!busy) deleteOrg(o.id); }}
                    title="Delete organization"
                    className="icon-btn trash"
                    aria-label={`Delete ${o.name}`}
                    style={{ padding: 6, border: "none", background: "transparent", cursor: busy ? "wait" : "pointer" }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </button>
          ))}
          <div className="popover-item" style={{ borderTop: "1px solid #e5e7eb" }}>
            <a
              href="/select-org"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                window.history.pushState(null, "", "/select-org?manage=1");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              style={{ fontSize: 13 }}
            >
              Manage organizations
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

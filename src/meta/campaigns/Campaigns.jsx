import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiRefreshCw, FiPause, FiPlay, FiTrash2, FiChevronRight } from "react-icons/fi";
import { metaApi } from "../../api/meta";

export default function Campaigns() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allSelected = campaigns.length > 0 && campaigns.every((c) => selected.has(c.id));

  function toggleSelect(id) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(campaigns.map((c) => c.id)));
  }
  async function bulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} campaign${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const failed = [];
    for (const id of ids) {
      try { await metaApi.deleteCampaign(id); }
      catch { failed.push(id); }
    }
    setCampaigns((list) => list.filter((x) => !ids.includes(x.id) || failed.includes(x.id)));
    setSelected(new Set(failed));
    setBulkDeleting(false);
    if (failed.length) alert(`${failed.length} campaign(s) could not be deleted.`);
  }

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const s = await metaApi.status();
      setStatus(s);
      if (s.connected && s.selectedAdAccountId) {
        const res = await metaApi.campaigns(s.selectedAdAccountId, { limit: 50 });
        setCampaigns(res.campaigns?.data || []);
      } else {
        setCampaigns([]);
      }
      setSelected(new Set());
    } catch (err) { setError(err.message || "Failed to load campaigns."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); }, []);

  async function toggleStatus(c, e) {
    e.stopPropagation();
    setActingId(c.id);
    try {
      if (c.status === "ACTIVE") await metaApi.pauseCampaign(c.id);
      else                       await metaApi.activateCampaign(c.id);
      await loadAll();
    } catch (err) { alert(err.message || "Action failed."); }
    finally { setActingId(null); }
  }
  async function removeCampaign(c, e) {
    e.stopPropagation();
    if (!confirm(`Delete campaign "${c.name}"?`)) return;
    setActingId(c.id);
    try {
      await metaApi.deleteCampaign(c.id);
      setCampaigns((list) => list.filter((x) => x.id !== c.id));
      setSelected((prev) => { const n = new Set(prev); n.delete(c.id); return n; });
    } catch (err) { alert(err.message || "Delete failed."); }
    finally { setActingId(null); }
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Meta Campaigns</h1>
        <p className="page-subtitle">Live campaign list from your ad account.</p>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Objective</th><th>Status</th><th>Budget</th>
                  <th>Spend</th><th>Results</th><th>Created</th><th></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 200 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 110 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 50 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 90 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className="skel skel-square" />
                        <span className="skel skel-square" />
                        <span className="skel skel-square" />
                      </div>
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
  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>Connect your Facebook account to list and create campaigns.</p>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Meta Ads — Campaigns</h1>
      <p className="page-subtitle">
        Account <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{status.selectedAdAccountId}</code>
        <span style={{ marginLeft: 10, color: "var(--text-muted)", fontSize: 12 }}>Click a row to open the campaign and see its ad sets.</span>
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={loadAll}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-primary" onClick={() => navigate("/meta/create")}><FiPlus /> New campaign</button>
      </div>

      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#eef2ff", border: "1px solid #e0e7ff", borderRadius: 10, marginBottom: 12 }}>
          <strong style={{ fontSize: 13, color: "#4338ca" }}>{selected.size} selected</strong>
          <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setSelected(new Set())}>Clear</button>
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: bulkDeleting ? "wait" : "pointer", opacity: bulkDeleting ? 0.6 : 1 }}
          >
            <FiTrash2 /> {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 38 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all"
                    style={{ width: 16, height: 16, accentColor: "#7c3aed", cursor: "pointer" }} />
                </th>
                <th>Campaign</th><th>Objective</th><th>Status</th><th>Effective</th><th>Created</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const isSel = selected.has(c.id);
                return (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/meta/campaigns/${c.id}`)}
                  style={{ cursor: "pointer", background: isSel ? "#f5f3ff" : undefined }}
                  title="Open campaign"
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleSelect(c.id)} aria-label={`Select ${c.name}`}
                      style={{ width: 16, height: 16, accentColor: "#7c3aed", cursor: "pointer" }} />
                  </td>
                  <td>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{c.id}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{(c.objective || "").replace("OUTCOME_", "")}</td>
                  <td><span className={`badge ${c.status === "ACTIVE" ? "qualified" : "contacted"}`}>{c.status}</span></td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.effective_status}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {c.created_time ? new Date(c.created_time).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-action" disabled={actingId === c.id} onClick={(e) => toggleStatus(c, e)}
                        title={c.status === "ACTIVE" ? "Pause" : "Activate"}>
                        {c.status === "ACTIVE" ? <FiPause /> : <FiPlay />}
                      </button>
                      <button className="admin-action danger" disabled={actingId === c.id} onClick={(e) => removeCampaign(c, e)} title="Delete">
                        <FiTrash2 />
                      </button>
                      <button className="admin-action" onClick={() => navigate(`/meta/campaigns/${c.id}`)} title="Open"><FiChevronRight /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {campaigns.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                  No campaigns yet. Click "New campaign" to create one.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

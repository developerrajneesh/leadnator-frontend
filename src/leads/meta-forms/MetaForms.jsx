import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTarget, FiRefreshCw, FiDownload, FiFileText,
  FiUsers, FiCalendar, FiCheckCircle, FiAlertCircle,
} from "react-icons/fi";
import { SiMeta } from "react-icons/si";
import { metaApi } from "../../api/meta";

function fieldValue(lead, keys) {
  const fd = lead.field_data || [];
  for (const k of keys) {
    const row = fd.find((f) => String(f.name).toLowerCase() === k);
    if (row?.values?.[0]) return row.values[0];
  }
  return "";
}

export default function MetaForms() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [pagesWithForms, setPagesWithForms] = useState([]);
  const [pageId, setPageId] = useState("");
  const [formId, setFormId] = useState("");
  const [leads, setLeads] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  async function loadPagesAndForms() {
    setLoadingPages(true); setError("");
    try {
      const s = await metaApi.status();
      setStatus(s);
      if (s.connected) {
        const res = await metaApi.leadFormsAll();
        setPagesWithForms(res.pages || []);
      } else {
        setPagesWithForms([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load lead forms.");
    } finally { setLoadingPages(false); }
  }

  useEffect(() => { loadPagesAndForms(); }, []);

  const selectedPage = useMemo(
    () => pagesWithForms.find((p) => p.page.id === pageId),
    [pagesWithForms, pageId]
  );
  const forms = selectedPage?.forms || [];
  const selectedForm = forms.find((f) => f.id === formId);

  async function loadLeads(fid, pid) {
    setLoadingLeads(true); setError("");
    try {
      const res = await metaApi.formLeads(fid, pid);
      setLeads(res.leads?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load form leads.");
      setLeads([]);
    } finally { setLoadingLeads(false); }
  }

  function selectForm(fid) {
    setFormId(fid);
    setExpanded(null);
    if (fid) loadLeads(fid, pageId);
    else setLeads([]);
  }

  function refresh() {
    if (formId) loadLeads(formId, pageId);
    else        loadPagesAndForms();
  }

  function exportCsv() {
    if (!leads.length) return;
    const header = ["Name", "Email", "Phone", "Submitted", "Ad name", "Lead ID"];
    const rows = leads.map((l) => [
      fieldValue(l, ["full_name", "full name", "first_name"]),
      fieldValue(l, ["email"]),
      fieldValue(l, ["phone_number", "phone"]),
      l.created_time,
      l.ad_name || "",
      l.id,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedForm?.name || "leads"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingPages) {
    return (
      <>
        <h1 className="page-title">Meta Form leads</h1>
        <p className="page-subtitle">Pick a Facebook Page, then a Lead form to see the people who submitted it.</p>

        {/* Filters skeleton */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14 }}>
            <div>
              <span className="skel skel-line skel-line-sm" style={{ width: 100, display: "block", marginBottom: 8 }} />
              <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
            </div>
            <div>
              <span className="skel skel-line skel-line-sm" style={{ width: 80, display: "block", marginBottom: 8 }} />
              <span className="skel" style={{ width: "100%", height: 38, borderRadius: 8, display: "block" }} />
            </div>
            <span className="skel" style={{ width: 100, height: 38, borderRadius: 8 }} />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10, display: "block", marginBottom: 10 }} />
              <span className="skel skel-line" style={{ width: 60, height: 22, display: "block", marginBottom: 6 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: 120, display: "block" }} />
            </div>
          ))}
        </div>

        {/* Form cards skeleton */}
        <div className="grid-3" style={{ marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card form-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span className="skel skel-square" style={{ width: 40, height: 40, borderRadius: 10 }} />
                <span className="skel skel-pill" style={{ width: 60 }} />
              </div>
              <span className="skel skel-line" style={{ width: "75%", height: 16, display: "block", marginTop: 14 }} />
              <span className="skel skel-line skel-line-sm" style={{ width: "55%", display: "block", marginTop: 8 }} />
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <span className="skel skel-line skel-line-sm" style={{ width: 50 }} />
                <span className="skel skel-line" style={{ width: 40, height: 22 }} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!status?.connected) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
        <SiMeta style={{ fontSize: 42, color: "#1877f2", marginBottom: 14 }} />
        <h2 style={{ marginBottom: 8 }}>Connect Meta first</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          Login with Facebook to browse your lead forms and sync leads into Leadnator.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/meta/accounts")}>Go to Ad accounts</button>
      </div>
    );
  }

  const allForms = pagesWithForms.flatMap((p) => p.forms.map((f) => ({ ...f, _pageName: p.page.name, _pageId: p.page.id })));
  const totalLeads = allForms.reduce((s, f) => s + (f.leads_count || 0), 0);
  const activeForms = allForms.filter((f) => f.status === "ACTIVE").length;

  return (
    <>
      <h1 className="page-title">Meta Form leads</h1>
      <p className="page-subtitle">Pick a Facebook Page, then a Lead form to see the people who submitted it.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14, alignItems: "end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>
              <SiMeta style={{ verticalAlign: "middle", color: "#1877f2", marginRight: 6 }} />
              Facebook Page
            </label>
            <select value={pageId} onChange={(e) => { setPageId(e.target.value); selectForm(""); }}>
              <option value="">— Select a page —</option>
              {pagesWithForms.map((p) => (
                <option key={p.page.id} value={p.page.id}>
                  {p.page.name} ({p.forms.length} form{p.forms.length === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>
              <FiFileText style={{ verticalAlign: "middle", marginRight: 6 }} />
              Lead form
            </label>
            <select value={formId} onChange={(e) => selectForm(e.target.value)} disabled={!pageId}>
              <option value="">{pageId ? "— Select a form —" : "Pick a page first"}</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.leads_count || 0} leads)</option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline" onClick={refresh} disabled={loadingLeads} style={{ height: 40 }} title="Re-sync from Meta">
            <FiRefreshCw /> {loadingLeads ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      {!pageId && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple"><FiFileText /></div>
              <div className="stat-value">{allForms.length}</div>
              <div className="stat-label">Lead forms total</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FiUsers /></div>
              <div className="stat-value">{totalLeads}</div>
              <div className="stat-label">Total leads captured</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><FiCheckCircle /></div>
              <div className="stat-value">{activeForms}</div>
              <div className="stat-label">Active forms</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pink"><FiCalendar /></div>
              <div className="stat-value">{pagesWithForms.length}</div>
              <div className="stat-label">Pages connected</div>
            </div>
          </div>

          {allForms.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <SiMeta style={{ fontSize: 42, color: "#1877f2", marginBottom: 14 }} />
              <h3 style={{ marginBottom: 6 }}>No lead forms found</h3>
              <p style={{ color: "#6b7280", fontSize: 13 }}>
                Create a lead form on any of your Facebook Pages to see it here.
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {allForms.map((f) => (
                <div
                  key={f.id}
                  className="card form-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => { setPageId(f._pageId); selectForm(f.id); }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#1877f222", color: "#1877f2",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      <FiTarget />
                    </div>
                    <span className={`badge ${f.status === "ACTIVE" ? "qualified" : "lost"}`}>
                      {(f.status || "").toLowerCase()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, marginTop: 12 }}>{f.name}</h3>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {f._pageName} · Created {f.created_time ? new Date(f.created_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Leads</span>
                    <strong style={{ fontSize: 22, color: "var(--primary)" }}>{f.leads_count || 0}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {pageId && !formId && (
        <div className="grid-3">
          {forms.map((f) => (
            <div
              key={f.id}
              className="card form-card"
              style={{ cursor: "pointer" }}
              onClick={() => selectForm(f.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#1877f222", color: "#1877f2",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  <FiTarget />
                </div>
                <span className={`badge ${f.status === "ACTIVE" ? "qualified" : "lost"}`}>
                  {(f.status || "").toLowerCase()}
                </span>
              </div>
              <h3 style={{ fontSize: 15, marginTop: 12 }}>{f.name}</h3>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Created {f.created_time ? new Date(f.created_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Leads</span>
                <strong style={{ fontSize: 22, color: "var(--primary)" }}>{f.leads_count || 0}</strong>
              </div>
            </div>
          ))}
          {forms.length === 0 && (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
              No lead forms on this page.
            </div>
          )}
        </div>
      )}

      {formId && selectedForm && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.04 }}>
                  {selectedPage?.page.name}
                </div>
                <h3 style={{ fontSize: 18, marginTop: 2 }}>{selectedForm.name}</h3>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {leads.length} lead{leads.length === 1 ? "" : "s"} loaded · form ID <code>{selectedForm.id}</code>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" onClick={() => selectForm("")}>← Back to forms</button>
                <button className="btn btn-outline" onClick={exportCsv} disabled={!leads.length}>
                  <FiDownload /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {loadingLeads ? (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>Ad</th><th>Submitted</th><th>Lead ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="skel-row">
                        <td><span className="skel skel-line" style={{ width: 130 }} /></td>
                        <td><span className="skel skel-line" style={{ width: 170 }} /></td>
                        <td><span className="skel skel-line" style={{ width: 110 }} /></td>
                        <td><span className="skel skel-line skel-line-sm" style={{ width: 90 }} /></td>
                        <td><span className="skel skel-line skel-line-sm" style={{ width: 100 }} /></td>
                        <td><span className="skel skel-line skel-line-sm" style={{ width: 140 }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <FiAlertCircle style={{ fontSize: 32, color: "var(--text-muted)", marginBottom: 10 }} />
              <p>No leads submitted for this form yet.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>Ad</th><th>Submitted</th><th>Lead ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => {
                      const isOpen = expanded === l.id;
                      return (
                        <>
                          <tr key={l.id} onClick={() => setExpanded(isOpen ? null : l.id)} style={{ cursor: "pointer" }}>
                            <td style={{ fontWeight: 600 }}>{fieldValue(l, ["full_name", "full name", "first_name"]) || "—"}</td>
                            <td>{fieldValue(l, ["email"]) || "—"}</td>
                            <td>{fieldValue(l, ["phone_number", "phone"]) || "—"}</td>
                            <td style={{ fontSize: 12 }}>{l.ad_name || "—"}</td>
                            <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                              {l.created_time ? new Date(l.created_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td style={{ fontFamily: "monospace", fontSize: 11 }}>{l.id}</td>
                          </tr>
                          {isOpen && (
                            <tr key={`${l.id}-details`}>
                              <td colSpan="6" style={{ background: "#f9fafb", padding: 14 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>All fields</div>
                                {(l.field_data || []).map((f, i) => (
                                  <div key={i} style={{ display: "flex", gap: 12, padding: "4px 0", fontSize: 12 }}>
                                    <span style={{ minWidth: 140, color: "var(--text-muted)", textTransform: "capitalize" }}>{f.name.replace(/_/g, " ")}</span>
                                    <span style={{ fontWeight: 600 }}>{(f.values || []).join(", ")}</span>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

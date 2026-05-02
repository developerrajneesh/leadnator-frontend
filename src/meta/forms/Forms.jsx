import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText, FiPlus, FiRefreshCw, FiEye, FiEdit2, FiTrash2,
  FiArchive, FiUsers, FiInfo, FiEyeOff,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { notify } from "../../globalComponents/Toast/Toast";

export default function Forms() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [hideArchived, setHideArchived] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await metaApi.leadFormsAll();
      setPages(r.pages || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function archiveOrDelete(form, pageId) {
    const isArchived = form.status === "ARCHIVED";
    if (isArchived) {
      notify.info("This form is already archived. Meta doesn't allow further deletion — leads remain accessible for compliance.");
      return;
    }
    const message = form.leads_count
      ? `Archive "${form.name}"? It has ${form.leads_count} lead(s) so Meta won't allow hard delete — only archive (hides from active list, leads stay accessible).`
      : `Try to delete "${form.name}"? Meta may auto-convert this to an archive even though it has 0 leads.`;
    if (!confirm(message)) return;
    setBusyId(form.id);
    try {
      const r = await metaApi.deleteLeadForm(form.id, pageId);
      if (r.archived) notify.success(`Archived "${form.name}" — Meta doesn't allow hard delete on lead forms.`);
      else notify.success(`Deleted "${form.name}"`);
      load();
    } catch (err) { notify.error(err.message); }
    finally { setBusyId(""); }
  }

  const totalForms = pages.reduce((s, p) => s + (p.forms?.length || 0), 0);
  const archivedTotal = pages.reduce((s, p) => s + (p.forms?.filter((f) => f.status === "ARCHIVED").length || 0), 0);
  const visiblePages = hideArchived
    ? pages.map((p) => ({ ...p, forms: (p.forms || []).filter((f) => f.status !== "ARCHIVED") }))
    : pages;
  const visibleTotal = visiblePages.reduce((s, p) => s + (p.forms?.length || 0), 0);

  return (
    <>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FiFileText style={{ color: "#1877f2" }} /> Lead forms
      </h1>
      <p className="page-subtitle">Instant Forms attached to your Meta Pages — capture leads from your Lead Ads campaigns.</p>

      <div style={{
        padding: 12, marginBottom: 14, background: "#eff6ff", color: "#1e3a8a",
        border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <strong>Meta doesn't permanently delete lead forms</strong> — they're always archived (hidden from your active list). This is a platform policy so the lead data stays available for record-keeping & compliance. Your archived forms still hold their submitted leads.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={hideArchived} onChange={(e) => setHideArchived(e.target.checked)} />
          <FiEyeOff style={{ verticalAlign: "middle" }} /> Hide archived ({archivedTotal})
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate("/meta/forms/new")}><FiPlus /> New form</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ marginBottom: 14, padding: 0 }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <span className="skel skel-line" style={{ width: 180, height: 16 }} />
              <span className="skel skel-pill" style={{ width: 80 }} />
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Form name</th><th>Status</th><th>Locale</th><th>Created</th><th style={{ width: 150 }}></th></tr></thead>
                <tbody>
                  {Array.from({ length: 3 }).map((__, j) => (
                    <tr key={j} className="skel-row">
                      <td><span className="skel skel-line" style={{ width: 200 }} /></td>
                      <td><span className="skel skel-pill" style={{ width: 60 }} /></td>
                      <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                      <td><span className="skel skel-line skel-line-sm" style={{ width: 100 }} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
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
        ))
      ) : pages.length === 0 ? (
        <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
          You don't manage any Meta Pages. Forms can only be created on a Page.
        </div>
      ) : totalForms === 0 ? (
        <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
          No lead forms yet. Click <strong>New form</strong> to create your first one.
        </div>
      ) : visibleTotal === 0 && hideArchived ? (
        <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
          All {archivedTotal} form{archivedTotal === 1 ? " is" : "s are"} archived. Uncheck "Hide archived" to view them.
        </div>
      ) : visiblePages.map((p) => (
        <div key={p.page.id} className="card" style={{ marginBottom: 14, padding: 0 }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-title">
              <FiUsers style={{ marginRight: 6 }} /> {p.page.name}
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 400 }}>{p.page.id}</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.forms.length} form{p.forms.length === 1 ? "" : "s"}</span>
          </div>

          {p.forms.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No forms on this page.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Form</th><th>Status</th><th>Locale</th><th>Leads</th><th>Created</th>
                  <th style={{ width: 220, textAlign: "right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {p.forms.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.name}</strong>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{f.id}</div>
                      </td>
                      <td>
                        <span className={`badge ${f.status === "ACTIVE" ? "qualified" : f.status === "ARCHIVED" ? "contacted" : "lost"}`}>
                          {f.status?.toLowerCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{f.locale || "—"}</td>
                      <td><strong>{f.leads_count || 0}</strong></td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {f.created_time ? new Date(f.created_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button className="admin-action" onClick={() => navigate(`/meta/forms/${f.id}?pageId=${p.page.id}`)} title="View / preview">
                            <FiEye /> View
                          </button>
                          <button className="admin-action" onClick={() => navigate(`/meta/forms/${f.id}?pageId=${p.page.id}&edit=1`)} title="Edit">
                            <FiEdit2 />
                          </button>
                          <button
                            className="admin-action danger"
                            disabled={busyId === f.id || f.status === "ARCHIVED"}
                            onClick={() => archiveOrDelete(f, p.page.id)}
                            title={
                              f.status === "ARCHIVED"
                                ? "Already archived — Meta doesn't allow further deletion"
                                : f.leads_count
                                  ? "Archive (form has leads — Meta won't hard-delete)"
                                  : "Try to delete (Meta may auto-archive)"
                            }
                          >
                            <FiArchive />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

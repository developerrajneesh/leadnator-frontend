import { useEffect, useState } from "react";
import { FiBriefcase, FiPlus, FiArrowLeft } from "react-icons/fi";
import { api, getStoredOrg, getStoredUser, setAuth, setStoredOrg } from "../api/client";
import { notify } from "../globalComponents/Toast/Toast";
import { refreshPipelineStages } from "../leads/usePipelineStages";
import "./SelectOrganization.css";

function isManageMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("manage") === "1";
}

export default function SelectOrganization({ onSelected }) {
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({
    name: "",
    loginEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("pick");
  const manageMode = isManageMode();
  const currentOrg = getStoredOrg();

  useEffect(() => {
    let cancelled = false;
    api.orgs.list()
      .then((res) => {
        if (cancelled) return;
        const list = res.organizations || [];
        setOrgs(list);
        if (list.length === 1 && !manageMode) {
          selectOrg(list[0].id);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load organizations");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  async function selectOrg(organizationId) {
    setBusy(true);
    setError("");
    try {
      const res = await api.orgs.switch(organizationId);
      setAuth(res.token, getStoredUser(), res.organization, "user");
      setStoredOrg(res.organization);
      refreshPipelineStages();
      notify.success(`Switched to ${res.organization.name}`);
      onSelected?.(res);
    } catch (err) {
      setError(err.message || "Could not switch organization");
    } finally {
      setBusy(false);
    }
  }

  function onLogoPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2 MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function createOrg(e) {
    e.preventDefault();
    const name = form.name.trim();
    const loginEmail = form.loginEmail.trim().toLowerCase();
    const password = form.password;
    if (!name) return setError("Enter an organization name");
    if (!loginEmail) return setError("Enter a workspace login email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== form.confirmPassword) return setError("Passwords do not match");

    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("loginEmail", loginEmail);
      fd.append("password", password);
      fd.append("phone", form.phone.trim());
      if (logoFile) fd.append("logo", logoFile);

      const res = await api.orgs.create(fd);
      await selectOrg(res.organization.id);
    } catch (err) {
      setError(err.message || "Could not create organization");
      setBusy(false);
    }
  }

  function backToApp() {
    const org = currentOrg || (orgs.length === 1 ? orgs[0] : null);
    if (org?.id) {
      onSelected?.({ organization: org });
      return;
    }
    notify.warn("Select or create a workspace first.");
  }

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-loading">Loading workspaces…</div>
      </div>
    );
  }

  return (
    <div className="org-page">
      <header className="org-page-header">
        <h1>{manageMode ? "Manage workspaces" : "Choose a workspace"}</h1>
        <p>
          {manageMode
            ? "Switch to another workspace or create a new one. Integrations and leads are kept separate per organization."
            : "Each workspace has its own leads, pipeline, and integrations. Pick one to continue."}
        </p>
      </header>

      <main className="org-page-body">
        {error && <div className="org-error">{error}</div>}

        {mode === "pick" ? (
          <>
            <div className="org-grid">
              {orgs.map((o) => {
                const isCurrent = o.id === currentOrg?.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`org-card${isCurrent ? " org-card--current" : ""}`}
                    disabled={busy}
                    onClick={() => selectOrg(o.id)}
                  >
                    <div className="org-card-icon">
                      {o.logoUrl ? (
                        <img src={o.logoUrl} alt="" className="org-card-logo" />
                      ) : (
                        <FiBriefcase />
                      )}
                    </div>
                    <div className="org-card-name">{o.name}</div>
                    {o.loginEmail && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{o.loginEmail}</div>
                    )}
                    {o.phone && (
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{o.phone}</div>
                    )}
                    <div className="org-card-meta">
                      <span style={{ textTransform: "capitalize" }}>{o.role || "owner"}</span>
                      {isCurrent ? (
                        <span className="org-badge org-badge--current">Current</span>
                      ) : (
                        <span className="org-badge">Open</span>
                      )}
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                className="org-card org-card--create"
                disabled={busy}
                onClick={() => { setMode("create"); setError(""); }}
              >
                <div className="org-card-icon">
                  <FiPlus />
                </div>
                <div className="org-card-name">Create new organization</div>
                <div className="org-card-meta" style={{ justifyContent: "center" }}>
                  <span style={{ color: "#9ca3af" }}>Separate leads &amp; integrations</span>
                </div>
              </button>
            </div>

            {manageMode && (
              <div className="org-actions">
                <button type="button" className="btn btn-outline" disabled={busy} onClick={backToApp}>
                  <FiArrowLeft /> Back to dashboard
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="org-create-panel">
            <h2>New organization</h2>
            <p className="sub">
              Set workspace name, login email, and password so this organization can sign in separately.
              You can still use your personal account to manage it.
            </p>
            <form onSubmit={createOrg} className="org-create-form">
              <div className="org-create-grid">
                <div className="form-group org-create-span2">
                  <label>Organization name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Acme Marketing"
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group org-logo-upload">
                  <label>Logo (optional)</label>
                  <div className="org-logo-row">
                    <div className="org-logo-preview">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" />
                      ) : (
                        <FiBriefcase />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={onLogoPick} />
                  </div>
                </div>

                <div className="form-group org-create-span2">
                  <label>Workspace login email</label>
                  <input
                    type="email"
                    value={form.loginEmail}
                    onChange={(e) => setForm((f) => ({ ...f, loginEmail: e.target.value }))}
                    placeholder="workspace@company.com"
                    required
                  />
                  <span className="org-field-hint">Used to sign in as this organization (not your personal email).</span>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group org-create-span2">
                  <label>Phone number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
                {busy ? "Creating…" : "Create & continue"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: 12, width: "100%" }}
                onClick={() => {
                  setMode("pick");
                  setError("");
                  setLogoFile(null);
                  setLogoPreview("");
                }}
              >
                <FiArrowLeft /> Back to workspaces
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

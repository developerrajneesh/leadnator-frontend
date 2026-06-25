import { useEffect, useState } from "react";
import { FiCheck, FiX, FiUsers, FiStar, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const blank = { key: "", name: "", price: "", leadLimit: "", tagline: "", popular: false, features: "", disabled: "" };

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | plan object
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await api.admin.plans();
      setPlans(res.plans || []);
      setTotalUsers(res.totalUsers || 0);
    } catch (err) { setError(err.message || "Failed to load plans."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(blank);
    setEditing("new");
  }
  function openEdit(p) {
    setForm({
      key: p.key, name: p.name, price: p.price, leadLimit: p.leadLimit,
      tagline: p.tagline || "", popular: !!p.popular,
      features: (p.features || []).join("\n"),
      disabled: (p.disabled || []).join("\n"),
    });
    setEditing(p);
  }

  async function save(e) {
    e?.preventDefault();
    if (!form.key.trim() || !form.name.trim() || form.price === "") {
      setError("Key, name and price are required."); return;
    }
    setSaving(true); setError("");
    const body = {
      key: form.key.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      leadLimit: Number(form.leadLimit) || 0,
      tagline: form.tagline,
      popular: form.popular,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      disabled: form.disabled.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing === "new") { await api.admin.createPlan(body); notify.success("Plan created"); }
      else { await api.admin.updatePlan(editing.id, body); notify.success("Plan updated"); }
      setEditing(null);
      await load();
    } catch (err) { setError(err.message || "Failed to save plan."); }
    finally { setSaving(false); }
  }

  async function remove(p) {
    if (!confirm(`Delete the "${p.name}" plan? This can't be undone.`)) return;
    try { await api.admin.deletePlan(p.id); notify.success("Plan deleted"); await load(); }
    catch (err) { notify.error(err.message || "Failed to delete plan."); }
  }

  const totalRevenue = plans.reduce((s, p) => s + (p.revenue || 0), 0);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading plans…</div>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Plans</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Manage subscription tiers and view their performance.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><FiPlus style={{ marginRight: 6 }} /> Add plan</button>
      </div>

      {error && !editing && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div className="stats-grid">
        {plans.map((p) => (
          <div key={p.id} className="stat-card">
            <div className={`stat-icon ${p.popular ? "pink" : "purple"}`}><FiStar /></div>
            <div className="stat-value">{p.userCount}</div>
            <div className="stat-label">{p.name} users</div>
            <div className="stat-change up">{fmtINR(p.revenue)} MRR</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-icon green"><FiUsers /></div>
          <div className="stat-value">{fmtINR(totalRevenue)}</div>
          <div className="stat-label">Total MRR</div>
          <div className="stat-change up">Across {totalUsers} users</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><div className="card-title">Plan tiers</div></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Plan</th><th>Price</th><th>Lead limit</th><th>Users</th><th>Active</th><th>MRR</th><th></th></tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No plans yet. Click “Add plan”.</td></tr>
              ) : plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    {p.popular && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--primary)" }}>Popular</span>}
                    <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{p.key}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(p.price)}/mo</td>
                  <td>{p.leadLimit ? p.leadLimit.toLocaleString() : "Unlimited"}</td>
                  <td>{p.userCount}</td>
                  <td>{p.active}</td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(p.revenue)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(p)} style={{ color: "#7c3aed" }}><FiEdit2 /></button>
                      <button className="icon-btn" title="Delete" onClick={() => remove(p)} style={{ color: "#ef4444" }}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        {plans.map((p) => (
          <div key={p.id} className="card">
            <div className="card-header">
              <div className="card-title">{p.name}</div>
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>{fmtINR(p.price)}/mo</span>
            </div>
            {p.tagline && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{p.tagline}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(p.features || []).map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <FiCheck style={{ color: "#10b981", flexShrink: 0 }} /> {f}
                </div>
              ))}
              {(p.disabled || []).map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9ca3af" }}>
                  <FiX style={{ flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal */}
      {editing && (
        <div
          onClick={() => !saving && setEditing(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}
        >
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: 520, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0, marginBottom: 14 }}>{editing === "new" ? "Add plan" : `Edit ${editing.name}`}</h3>
            {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Key (slug)</label>
                <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="growth" disabled={editing !== "new"} />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Growth" />
              </div>
              <div className="form-group">
                <label>Price (₹ / month)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1499" />
              </div>
              <div className="form-group">
                <label>Lead limit (0 = unlimited)</label>
                <input type="number" value={form.leadLimit} onChange={(e) => setForm({ ...form, leadLimit: e.target.value })} placeholder="5000" />
              </div>
            </div>

            <div className="form-group">
              <label>Tagline</label>
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="For growing teams" />
            </div>

            <div className="form-group">
              <label>Features (one per line)</label>
              <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder={"Unlimited campaigns\nPriority support"} />
            </div>
            <div className="form-group">
              <label>Disabled / excluded (one per line)</label>
              <textarea rows={2} value={form.disabled} onChange={(e) => setForm({ ...form, disabled: e.target.value })} placeholder={"White-label"} />
            </div>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 14 }}>
              <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} />
              Mark as “Most popular”
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : (editing === "new" ? "Create plan" : "Save changes")}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

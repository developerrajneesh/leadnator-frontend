import { useEffect, useState } from "react";
import { FiUsers, FiPlus, FiUpload, FiTrash2, FiRefreshCw, FiCheckCircle, FiXCircle, FiHelpCircle, FiZap } from "react-icons/fi";
import { waApi } from "../../api/whatsapp";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", tags: "" });
  const [verifying, setVerifying] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await waApi.contacts(q || undefined);
      setContacts(res.contacts || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await waApi.createContact({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      setShowAdd(false);
      setForm({ name: "", phone: "", email: "", tags: "" });
      load();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this contact?")) return;
    await waApi.deleteContact(id);
    load();
  }

  async function handleVerify(c) {
    if (!confirm(`Send a "hello_world" template to ${c.phone} to verify it's on WhatsApp? This uses one message credit.`)) return;
    setVerifying(c.id);
    try {
      const r = await waApi.verifyContact(c.id);
      setContacts((list) => list.map((x) => x.id === c.id
        ? { ...x, isOnWhatsapp: r.isOnWhatsapp, waId: r.contact?.waId || "" }
        : x));
    } catch (err) { alert(err.message); }
    finally { setVerifying(null); }
  }

  async function handleCsv(file) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idxName = headers.indexOf("name");
    const idxPhone = headers.indexOf("phone");
    const idxEmail = headers.indexOf("email");
    if (idxName === -1 || idxPhone === -1) {
      alert("CSV must have at least 'name' and 'phone' columns.");
      return;
    }
    const rows = lines.slice(1).map((row) => {
      const cells = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name:  cells[idxName],
        phone: cells[idxPhone],
        email: idxEmail >= 0 ? cells[idxEmail] : "",
      };
    });
    try {
      const res = await waApi.bulkContacts(rows);
      const onWa = Number.isFinite(res.onWhatsapp) ? res.onWhatsapp : null;
      alert(
        `${res.inserted} contacts added · ${res.skipped} skipped (duplicates).` +
        (onWa != null ? `\n${onWa} verified on WhatsApp.` : "")
      );
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <h1 className="page-title">WhatsApp — Contacts</h1>
      <p className="page-subtitle">
        Opted-in WhatsApp subscribers stored in your account. Status flips to <b>On WhatsApp</b>
        &nbsp;automatically once a message flows through, or click <b>Verify</b> to send a
        &nbsp;hello_world template and confirm now.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          placeholder="Search name, phone or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          style={{ flex: 1, minWidth: 200, padding: 9, border: "1px solid var(--border)", borderRadius: 8 }}
        />
        <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        <label className="btn btn-outline" style={{ cursor: "pointer" }}>
          <FiUpload /> Import CSV
          <input type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
        </label>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiPlus /> Add contact</button>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px" }}>
            <span className="skel skel-line" style={{ width: 140, height: 16 }} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>WhatsApp</th><th>Email</th><th>Tags</th><th>Added</th><th></th></tr></thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><span className="skel skel-line" style={{ width: 130 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 120 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 95 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 150 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 80 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-square" style={{ width: 26, height: 26 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between" }}>
            <div className="card-title"><FiUsers /> {contacts.length} contact{contacts.length === 1 ? "" : "s"}</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>WhatsApp</th><th>Email</th><th>Tags</th><th>Added</th><th></th></tr></thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{c.phone}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <WaBadge value={c.isOnWhatsapp} />
                        {c.isOnWhatsapp == null && (
                          <button
                            onClick={() => handleVerify(c)}
                            disabled={verifying === c.id}
                            title="Send a hello_world template to verify"
                            style={{
                              border: "1px solid var(--border)", background: "#fff",
                              borderRadius: 6, padding: "3px 6px", fontSize: 11,
                              cursor: verifying === c.id ? "default" : "pointer",
                              color: "#4b5563", display: "inline-flex", alignItems: "center", gap: 3,
                            }}
                          >
                            <FiZap size={11} /> {verifying === c.id ? "…" : "Verify"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{c.email || "—"}</td>
                    <td style={{ fontSize: 12 }}>{(c.tags || []).join(", ") || "—"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td>
                      <button className="admin-action danger" onClick={() => handleDelete(c.id)} title="Delete"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>No contacts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleAdd} className="card" style={{ width: 480, maxWidth: "92vw" }}>
            <div className="card-header">
              <div className="card-title">Add WhatsApp contact</div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="form-group"><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Phone (E.164) *</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+919876543210" /></div>
            <div className="form-group"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, india, b2b" /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add contact</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function WaBadge({ value }) {
  if (value === true) {
    return (
      <span title="Verified on WhatsApp" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 600 }}>
        <FiCheckCircle /> On WhatsApp
      </span>
    );
  }
  if (value === false) {
    return (
      <span title="Not on WhatsApp" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 600 }}>
        <FiXCircle /> Not on WhatsApp
      </span>
    );
  }
  return (
    <span title="Status will be known after the first message" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "#f3f4f6", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>
      <FiHelpCircle /> Unknown
    </span>
  );
}

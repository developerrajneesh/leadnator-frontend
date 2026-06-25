import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiUsers, FiUserCheck, FiCalendar, FiMessageCircle, FiMail,
  FiHardDrive, FiZap, FiBriefcase, FiInstagram, FiCheckCircle, FiXCircle, FiPhone,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const TABS = [
  { key: "overview",     label: "Overview" },
  { key: "leads",        label: "Leads" },
  { key: "staff",        label: "Staff" },
  { key: "bookings",     label: "Bookings" },
  { key: "settings",     label: "Settings" },
  { key: "integrations", label: "Integrations" },
];

const initials = (s) => (s || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    let alive = true;
    api.admin.user(id)
      .then((r) => alive && setData(r))
      .catch((err) => { if (alive) { notify.error(err.message || "Failed to load user"); navigate("/admin/users"); } })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, navigate]);

  if (loading) {
    return <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading user…</div>;
  }
  if (!data) return null;

  const { user, stats, leads, team, settings, bookings, integrations, organizations } = data;

  return (
    <>
      <button className="btn btn-ghost" onClick={() => navigate("/admin/users")} style={{ marginBottom: 14, paddingLeft: 0 }}>
        <FiArrowLeft style={{ marginRight: 6 }} /> Back to users
      </button>

      {/* Header */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="avatar-sm" style={{ width: 56, height: 56, fontSize: 20, borderRadius: 14 }}>{initials(user.name || user.email)}</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>{user.name || "—"}</h1>
          <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{user.email}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
            <span className={`badge ${(user.plan || "").toLowerCase()}`}>{user.plan}</span>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              <span className={`status-dot ${user.status === "active" ? "active" : "paused"}`} style={{ marginRight: 5 }} />
              {user.status}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", textTransform: "capitalize" }}>· {user.role}</span>
            {user.phone && <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>· <FiPhone size={11} /> {user.phone}</span>}
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>· Joined {fmtDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", margin: "18px 0", flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const count = t.key === "leads" ? stats.leads : t.key === "staff" ? stats.team : t.key === "bookings" ? stats.bookings : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: "none", background: "transparent", cursor: "pointer", padding: "10px 14px",
                fontSize: 14, fontWeight: 600, color: tab === t.key ? "#047857" : "#64748b",
                borderBottom: tab === t.key ? "2px solid #047857" : "2px solid transparent", marginBottom: -1,
              }}
            >
              {t.label}{count != null && <span style={{ marginLeft: 6, fontSize: 12, color: "#94a3b8" }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <Overview stats={stats} organizations={organizations} />}
      {tab === "leads" && <LeadsTab leads={leads} total={stats.leads} />}
      {tab === "staff" && <StaffTab team={team} />}
      {tab === "bookings" && <BookingsTab bookings={bookings} />}
      {tab === "settings" && <SettingsTab user={user} settings={settings} />}
      {tab === "integrations" && <IntegrationsTab integrations={integrations} />}
    </>
  );
}

/* ------------------------------ Overview ------------------------------ */
function Kpi({ icon, label, value, color }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}1a`, color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{(value || 0).toLocaleString()}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function Overview({ stats, organizations }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
        <Kpi icon={<FiUsers size={20} />}         label="Leads"             value={stats.leads}          color="#7c3aed" />
        <Kpi icon={<FiUserCheck size={20} />}     label="Staff members"     value={stats.team}           color="#10b981" />
        <Kpi icon={<FiCalendar size={20} />}      label="Bookings"          value={stats.bookings}       color="#0ea5e9" />
        <Kpi icon={<FiMessageCircle size={20} />} label="WhatsApp contacts" value={stats.waContacts}     color="#22c55e" />
        <Kpi icon={<FiMessageCircle size={20} />} label="WhatsApp messages" value={stats.waMessages}     color="#16a34a" />
        <Kpi icon={<FiMail size={20} />}          label="Email campaigns"   value={stats.emailCampaigns} color="#f59e0b" />
        <Kpi icon={<FiHardDrive size={20} />}     label="Storage files"     value={stats.storageFiles}   color="#64748b" />
        <Kpi icon={<FiZap size={20} />}           label="Autopilots"        value={stats.autopilots}     color="#ec4899" />
      </div>

      <Workspaces organizations={organizations} />
    </>
  );
}

function Workspaces({ organizations }) {
  const [selectedId, setSelectedId] = useState(organizations[0]?.id || null);
  const selected = organizations.find((o) => o.id === selectedId) || null;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header"><div className="card-title"><FiBriefcase /> Workspaces ({organizations.length})</div></div>
      {organizations.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No workspaces.</div>
      ) : (
        <>
          {/* Selected workspace details — shown above the list */}
          {selected && (
            <div style={{ border: "1px solid #c4b5fd", background: "#faf9ff", borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: "#5b21b6", background: "#ede9fe", padding: "3px 10px", borderRadius: 999 }}>{selected.role}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                <MiniStat icon={<FiUsers size={16} />}     label="Leads"   value={selected.leads ?? 0} color="#7c3aed" />
                <MiniStat icon={<FiUserCheck size={16} />} label="Members" value={selected.members ?? 0} color="#10b981" />
                <MiniStat icon={<FiCalendar size={16} />}  label="Created" value={fmtDate(selected.createdAt)} color="#0ea5e9" />
              </div>
            </div>
          )}

          {/* Selectable list */}
          <div style={{ display: "grid", gap: 8 }}>
            {organizations.map((o) => {
              const active = o.id === selectedId;
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px",
                    border: `1px solid ${active ? "#a78bfa" : "var(--border)"}`, borderRadius: 10, cursor: "pointer",
                    background: active ? "#f5f3ff" : "transparent", transition: "0.12s",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <FiBriefcase size={14} style={{ color: active ? "#7c3aed" : "#94a3b8" }} />
                    {o.name}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{o.leads ?? 0} leads</span>
                    <span style={{ fontSize: 12, textTransform: "capitalize", color: "#64748b" }}>{o.role}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color, fontSize: 12, fontWeight: 600 }}>{icon}{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

/* ------------------------------ Leads ------------------------------ */
function LeadsTab({ leads, total }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Leads</div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing {leads.length} of {total}</span>
      </div>
      {leads.length === 0 ? (
        <Empty text="This user has no leads yet." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Status</th><th>Value</th><th>Created</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.name || "—"}</td>
                  <td>{l.email || "—"}</td>
                  <td>{l.phone || "—"}</td>
                  <td>{l.source || "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>{l.status || "—"}</td>
                  <td>{l.value ? `₹${Number(l.value).toLocaleString()}` : "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{fmtDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Staff ------------------------------ */
function StaffTab({ team }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title"><FiUserCheck /> Staff / team members ({team.length})</div></div>
      {team.length === 0 ? (
        <Empty text="This user hasn't added any staff members." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Added</th></tr></thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="avatar-sm">{initials(m.name || m.email)}</span>
                    <span style={{ fontWeight: 600 }}>{m.name || "—"}</span>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.memberRole || "Member"}</td>
                  <td>
                    <span className={`status-dot ${m.status === "active" ? "active" : "paused"}`} style={{ marginRight: 6 }} />
                    <span style={{ textTransform: "capitalize" }}>{m.status}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{fmtDate(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Bookings ------------------------------ */
function BookingsTab({ bookings }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title"><FiCalendar /> Bookings ({bookings.length})</div></div>
      {bookings.length === 0 ? (
        <Empty text="No bookings yet." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Booked by</th><th>Email</th><th>When</th><th>Status</th><th>Meet</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.bookingTypeName || "—"}</td>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td style={{ color: "var(--text-muted)" }}>{fmtDateTime(b.slot)}</td>
                  <td style={{ textTransform: "capitalize" }}>{b.status}</td>
                  <td>{b.meetLink ? <a href={b.meetLink} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>Join</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Settings ------------------------------ */
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13.5, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}
function SettingsTab({ user, settings }) {
  const n = settings?.notifications || {};
  const onoff = (b) => (b ? "On" : "Off");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
      <div className="card">
        <div className="card-header"><div className="card-title">Profile</div></div>
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        <Row label="Company" value={user.company} />
        <Row label="Website" value={settings?.website} />
        <Row label="Bio" value={settings?.bio} />
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Preferences</div></div>
        <Row label="Language" value={settings?.language} />
        <Row label="Timezone" value={settings?.timezone} />
        <Row label="Currency" value={settings?.currency} />
        <Row label="Date format" value={settings?.dateFormat} />
        <Row label="Week starts" value={settings?.weekStart} />
        <Row label="SMS / Twilio" value={settings?.sms?.enabled ? `Enabled (${settings.sms.phone || "no number"})` : "Disabled"} />
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Notifications</div></div>
        <Row label="New lead" value={onoff(n.newLead)} />
        <Row label="Campaign done" value={onoff(n.campaignDone)} />
        <Row label="Weekly report" value={onoff(n.weeklyReport)} />
        <Row label="Billing alerts" value={onoff(n.billingAlerts)} />
        <Row label="Product updates" value={onoff(n.productUpdates)} />
      </div>
    </div>
  );
}

/* ------------------------------ Integrations ------------------------------ */
function IntegrationCard({ icon, name, conn, detail }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f8fafc", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{name}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {conn ? (detail || "Connected") : "Not connected"}
        </div>
      </div>
      {conn
        ? <FiCheckCircle style={{ color: "#10b981", flexShrink: 0 }} size={20} />
        : <FiXCircle style={{ color: "#cbd5e1", flexShrink: 0 }} size={20} />}
    </div>
  );
}
function IntegrationsTab({ integrations: g }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
      <IntegrationCard icon={<FiMessageCircle size={20} color="#22c55e" />} name="WhatsApp" conn={g.whatsapp.connected} detail={g.whatsapp.number} />
      <IntegrationCard icon={<FiInstagram size={20} color="#ec4899" />} name="Instagram" conn={g.instagram.connected} />
      <IntegrationCard icon={<FiMail size={20} color="#f59e0b" />} name="Email (SMTP)" conn={g.email.connected} detail={g.email.from} />
      <IntegrationCard icon={<FiHardDrive size={20} color="#64748b" />} name="Storage" conn={g.storage.connected} detail={g.storage.provider} />
      <IntegrationCard icon={<FcGoogle size={20} />} name="Google Calendar" conn={g.google.connected} detail={g.google.email} />
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: 13.5 }}>{text}</div>;
}

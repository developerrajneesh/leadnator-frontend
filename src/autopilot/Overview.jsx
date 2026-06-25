import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGlobe, FiUserPlus, FiCheckCircle, FiTag, FiMail, FiZap, FiShuffle,
  FiGitBranch, FiClock, FiLink, FiCode, FiCopy, FiArrowRight, FiCpu, FiSend,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../api/client";

const SECTIONS = [
  {
    title: "Triggers — start a flow when…",
    color: "#7c3aed",
    items: [
      { Icon: FiGlobe, title: "Inbound webhook", desc: "Fire when a JSON payload hits your webhook URL (Postman, your site, any tool)." },
      { Icon: FiUserPlus, title: "Lead created", desc: "Run automatically whenever a new lead is added to your CRM." },
      { Icon: FiCheckCircle, title: "Form submitted", desc: "Trigger when a public form is filled — limit to a specific form if you like." },
      { Icon: FiTag, title: "Tag added", desc: "Start the flow the moment a contact gets a specific tag." },
    ],
  },
  {
    title: "Actions — make things happen",
    color: "#10b981",
    items: [
      { Icon: FiMail, title: "Send email", desc: "Send a templated email from your verified domain (Amazon SES) — pick the field that holds the recipient." },
      { Icon: FaWhatsapp, title: "Send WhatsApp", desc: "Send a WhatsApp template or text message to the contact." },
      { Icon: FiUserPlus, title: "Create / update contact", desc: "Upsert the payload into your CRM as a lead (auto-detects email/name/phone)." },
      { Icon: FiTag, title: "Add tag", desc: "Tag the contact to segment them or trigger other flows." },
      { Icon: FiZap, title: "Change lead status", desc: "Move the lead to a new pipeline stage." },
    ],
  },
  {
    title: "Logic & data — control the flow",
    color: "#f59e0b",
    items: [
      { Icon: FiShuffle, title: "Field mapper", desc: "Rename incoming webhook fields to your own field names." },
      { Icon: FiGitBranch, title: "Condition (if / else)", desc: "Branch the flow on a field value — yes/no paths." },
      { Icon: FiClock, title: "Wait / delay", desc: "Pause for minutes, hours or days before the next step." },
      { Icon: FiLink, title: "Call external webhook", desc: "POST the payload onward to any URL and capture the response." },
      { Icon: FiCode, title: "Run JS", desc: "Run a custom JavaScript snippet in a secure sandbox." },
    ],
  },
];

const STEPS = [
  { n: 1, title: "Create a webhook", desc: "Get a unique URL you can call from Postman, your website, or any app." },
  { n: 2, title: "Build the flow", desc: "Drag trigger → conditions → actions on the visual builder." },
  { n: 3, title: "It runs itself", desc: "Every payload runs your steps automatically — emails, contacts, branches and waits." },
];

export default function AutopilotOverview() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  function openCreate() {
    setName("");
    setShowCreate(true);
  }

  async function submitCreate(e) {
    e?.preventDefault();
    const n = name.trim();
    if (!n) return;
    setCreating(true);
    try {
      const res = await api.autopilot.create({ name: n });
      setShowCreate(false);
      // Straight into the flow builder for the new autopilot.
      navigate(`/autopilot/flows/${res.id}`);
    } catch (err) {
      alert(err.message || "Failed to create");
      setCreating(false);
    }
  }

  return (
    <div className="content-pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Autopilot</h1>
          <div className="page-subtitle" style={{ marginBottom: 0 }}>Webhook-driven automations you can call from Postman or embed on your site.</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>Create webhook</button>
      </div>

      {/* How it works */}
      <div className="card">
        <div className="card-header"><div className="card-title"><FiCpu /> How Autopilot works</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", color: "#7c3aed", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>{s.n}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you can do */}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "22px 0 4px" }}>What you can build</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>Mix and match these blocks on the visual builder.</p>

      {SECTIONS.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: sec.color }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{sec.title}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {sec.items.map((it) => (
              <div key={it.title} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start", margin: 0 }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: `${sec.color}1a`, color: sec.color, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
                  <it.Icon />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{it.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA footer */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "linear-gradient(90deg,#7c3aed0d,#10b9810d)" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}><FiSend style={{ verticalAlign: "middle", marginRight: 6 }} />Ready to automate?</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Create a webhook, then build your flow on the canvas.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={openCreate}>Create webhook</button>
          <Link to="/autopilot/flows" className="btn btn-primary">Open builder <FiArrowRight /></Link>
        </div>
      </div>

      {/* Create webhook — name step (not one-click) */}
      {showCreate && (
        <div
          onClick={() => !creating && setShowCreate(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}
        >
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitCreate} className="card" style={{ width: 440, maxWidth: "100%" }}>
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>Create a new autopilot</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              Give it a name so you can find it later. You'll get a webhook URL and can build the flow next.
            </p>
            <div className="form-group">
              <label>Autopilot name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New lead → welcome email"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
                {creating ? "Creating…" : "Create webhook"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

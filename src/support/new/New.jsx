import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../globalComponents/Toast/Toast";

const CATEGORIES = ["Billing", "Technical", "WhatsApp", "Meta Ads", "Email", "Storage", "Feature request", "Other"];
const PRIORITIES = [{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }];

export default function New() {
  const nav = useNavigate();
  const [form, setForm] = useState({ subject: "", category: "Billing", priority: "medium", description: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.support.createTicket({
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
      });
      notify.success(`Ticket #${r.ticket.code} opened`);
      nav(`/support/tickets/${r.ticket.id}`);
    } catch (err) {
      notify.error(err.message || "Failed to open ticket");
    } finally { setSubmitting(false); }
  }

  return (
    <>
      <h1 className="page-title">Support — New ticket</h1>
      <p className="page-subtitle">Describe your issue — the support team will reply in this thread.</p>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><div className="card-title"><FiPlus /> Open a new ticket</div></div>
        <p className="page-subtitle" style={{ marginTop: 0 }}>We typically reply within 2 hours on business days.</p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Subject *</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Short summary of the issue" />
          </div>
          <div className="grid-2-equal">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Describe your issue</label>
            <textarea rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Include any error messages, screenshots are not supported here — please describe." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || !form.subject.trim()}>
            {submitting ? "Submitting…" : "Submit ticket"}
          </button>
        </form>
      </div>
    </>
  );
}

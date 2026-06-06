import { usePipelineStages } from "../../usePipelineStages";

export default function AddLeadModal({ onAdd, onClose, initialStatus = "new" }) {
  const { stages } = usePipelineStages();
  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    onAdd({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      source: fd.get("source"),
      status: fd.get("status") || initialStatus,
      tags: [],
      notes: "",
      value: Number(fd.get("value")) || 10000,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add new lead</h3>
        <p className="sub">Capture essential info. You can enrich later.</p>
        <form onSubmit={submit}>
          <div className="form-group"><label>Name</label><input name="name" required /></div>
          <div className="grid-2-equal">
            <div className="form-group"><label>Email</label><input name="email" type="email" required /></div>
            <div className="form-group"><label>Phone</label><input name="phone" required /></div>
          </div>
          <div className="grid-2-equal">
            <div className="form-group">
              <label>Source</label>
              <select name="source" defaultValue="Manual">
                <option>Manual</option><option>Website</option><option>Meta Ads</option>
                <option>Referral</option><option>Google Ads</option><option>LinkedIn</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stage</label>
              <select name="status" defaultValue={initialStatus}>
                {stages.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Value (₹)</label><input name="value" type="number" min="0" defaultValue={10000} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

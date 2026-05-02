import { FiUpload } from "react-icons/fi";

export default function Import() {
  return (
    <>
      <h1 className="page-title">Import CSV</h1>
      <p className="page-subtitle">Bring leads in from a spreadsheet.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title"><FiUpload /> Import leads from CSV</div></div>
        <p className="page-subtitle">Supported columns: name, email, phone, source. We skip rows that exceed your plan.</p>
        <div style={{ border: "2px dashed var(--primary)", borderRadius: 12, padding: 40, textAlign: "center", background: "var(--primary-50)" }}>
          <FiUpload style={{ fontSize: 32, color: "var(--primary)", marginBottom: 10 }} />
          <p>Drag & drop your CSV here, or</p>
          <button className="btn btn-primary" style={{ marginTop: 10 }}>Browse file</button>
        </div>
      </div>
    </>
  );
}

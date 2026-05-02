import { FiUsers, FiPlus } from "react-icons/fi";
import { META_AUDIENCES } from "../constants";

export default function Audiences() {
  return (
    <>
      <h1 className="page-title">Audiences</h1>
      <p className="page-subtitle">Custom & lookalike audiences.</p>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title"><FiUsers style={{ verticalAlign: "middle", marginRight: 6 }} /> Saved audiences</div>
          <button className="btn btn-primary"><FiPlus /> New audience</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Audience</th><th>Type</th><th>Size</th><th>Action</th></tr></thead>
            <tbody>
              {META_AUDIENCES.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td><span className="badge growth">{a.type}</span></td>
                  <td>{a.size.toLocaleString()}</td>
                  <td><button className="btn btn-outline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

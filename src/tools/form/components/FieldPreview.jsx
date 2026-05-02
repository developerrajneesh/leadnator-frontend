export default function FieldPreview({ f }) {
  const common = { placeholder: f.placeholder, required: f.required };
  if (f.type === "textarea") return <textarea rows="4" {...common} />;
  if (f.type === "select") return (
    <select {...common}>
      <option value="">— Select —</option>
      {(f.options || []).map((o, i) => <option key={i}>{o}</option>)}
    </select>
  );
  if (f.type === "radio") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(f.options || []).map((o, i) => (
        <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="radio" name={f.id} /> {o}
        </label>
      ))}
    </div>
  );
  if (f.type === "checkbox") return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="checkbox" /> {f.label}
    </label>
  );
  const htmlType = f.type === "phone" ? "tel" : f.type === "email" ? "email" : f.type === "number" ? "number" : f.type === "date" ? "date" : "text";
  return <input type={htmlType} {...common} />;
}

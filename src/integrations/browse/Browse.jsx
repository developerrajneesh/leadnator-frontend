import { useState } from "react";
import { APPS, CATEGORIES } from "../constants";
import AppCard from "../components/AppCard";

export default function Browse() {
  const [apps, setApps] = useState(APPS);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = apps.filter((a) => {
    if (cat !== "All" && a.category !== cat) return false;
    if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function toggle(id) {
    setApps(apps.map((a) => a.id === id ? { ...a, connected: !a.connected } : a));
  }

  return (
    <>
      <h1 className="page-title">Browse integrations</h1>
      <p className="page-subtitle">Connect Leadnator with the tools you already use.</p>
      <div className="toolbar">
        <input placeholder="Search integrations…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid-3">
        {filtered.map((app) => <AppCard key={app.id} app={app} onToggle={toggle} />)}
      </div>
      {filtered.length === 0 && <div className="empty">No integrations match your search.</div>}
    </>
  );
}

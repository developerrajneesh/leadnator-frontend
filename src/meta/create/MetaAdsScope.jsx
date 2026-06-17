import { Outlet } from "react-router-dom";
import "../../tailwind.css";

// Wraps the ported Tailwind-based Meta Ads wizard in a `.metaads-tw` scope so
// its Tailwind border-reset (and any styling) never leaks into the rest of the
// app — the Tailwind utilities only match these pages' classes anyway.
export default function MetaAdsScope() {
  return (
    <div className="metaads-tw">
      <Outlet />
    </div>
  );
}

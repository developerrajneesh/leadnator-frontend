import { useMemo } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { useCurrentUser } from "../../api/hooks";
import {
  isTeamMember, canAccess, canAccessModule, firstAllowedRoute,
} from "../../profile/team/permissions";

/**
 * PermissionGate — wraps a route element and enforces TeamMember
 * permissions before rendering it.
 *
 *   - Owner  → always passes through (full access).
 *   - Member → checks `canAccess(user, moduleKey, subRouteKey)`:
 *       • allowed             → renders the child.
 *       • module allowed but
 *         this sub-route not  → redirects to the first allowed sub-route.
 *       • module fully denied → renders a friendly "no access" screen.
 *
 * Pass `moduleKey` + `subRouteKey` explicitly so the check is decoupled
 * from URL parsing — multiple URLs (e.g. `/leads/all` and `/leads/all/:id`)
 * can map to the same logical permission key.
 */
export default function PermissionGate({ moduleKey, subRouteKey, children }) {
  const user = useCurrentUser();
  const { pathname } = useLocation();

  const decision = useMemo(() => {
    if (!isTeamMember(user)) return { kind: "allow" };
    if (canAccess(user, moduleKey, subRouteKey)) return { kind: "allow" };
    if (canAccessModule(user, moduleKey)) {
      const first = firstAllowedRoute(user, moduleKey);
      if (first && first !== subRouteKey) {
        return { kind: "redirect", to: `/${moduleKey}/${first}` };
      }
    }
    return { kind: "deny" };
  }, [user, moduleKey, subRouteKey, pathname]);

  if (decision.kind === "allow")    return children;
  if (decision.kind === "redirect") return <Navigate to={decision.to} replace />;

  return <NoAccess moduleKey={moduleKey} subRouteKey={subRouteKey} />;
}

function NoAccess({ moduleKey, subRouteKey }) {
  return (
    <div className="card" style={{
      maxWidth: 520, margin: "60px auto", padding: 40, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#fee2e2", color: "#b91c1c",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 16,
      }}>
        <FiLock />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>No access</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
        Your team owner hasn't granted you access to{" "}
        <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
          /{moduleKey}/{subRouteKey}
        </code>. Ask them to enable it from{" "}
        <strong>Settings → Team members</strong>.
      </p>
    </div>
  );
}

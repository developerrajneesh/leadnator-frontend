import { Navigate } from "react-router-dom";
import { isOrganizationLogin } from "../api/client";

/** Redirect workspace logins away from owner-only routes (e.g. billing). */
export default function OrgLoginGuard({ children, to = "/dashboard/overview" }) {
  if (isOrganizationLogin()) {
    return <Navigate to={to} replace />;
  }
  return children;
}

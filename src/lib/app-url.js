const PRODUCTION_APP_URL = "https://leadnatorapp.codelatentlabs.com";

export function appBaseUrl() {
  const base = import.meta.env.VITE_APP_URL || PRODUCTION_APP_URL;
  return base.replace(/\/$/, "");
}

export function appPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${appBaseUrl()}${p}`;
}

export const APP_SIGNUP_URL = appPath("/signup");
export const APP_LOGIN_URL = appPath("/login");

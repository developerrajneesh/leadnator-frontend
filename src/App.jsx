import { useEffect, useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";

import Auth from "./pages/Auth/Auth";
import ResetPassword from "./pages/Auth/ResetPassword";
import { buildRouter } from "./router";
import { api, getToken, getStoredUser, setAuth, clearAuth, hasOrgSelected, setStoredOrg } from "./api/client";
import SelectOrganization from "./pages/SelectOrganization";
import { invalidateLeads } from "./api/hooks";
import { ToastHost } from "./globalComponents/Toast/Toast";
import PwaPrompt from "./globalComponents/Pwa/PwaPrompt";
import Loader from "./globalComponents/Loader/Loader";
import { getSocket, disconnectSocket } from "./api/socket";
import {
  captureInstagramOAuthCodeFromUrl,
  exchangePendingInstagramCode,
  hasPendingInstagramCode,
} from "./instagram/oauthHandler";
import { notify } from "./globalComponents/Toast/Toast";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [orgReady, setOrgReady] = useState(hasOrgSelected());
  const [role, setRole] = useState(getStoredUser()?.role || "user");
  const [booting, setBooting] = useState(!!getToken());
  const [path, setPath] = useState(typeof window !== "undefined" ? window.location.pathname : "/");

  useEffect(() => {
    const onPop = () => {
      const next = window.location.pathname;
      setPath(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Disable the browser's automatic scroll restoration — it can fight
  // our manual scroll-to-top on back/forward navigation.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll to top whenever the route changes. The app's `#root` has
  // `height: 100%` (see index.css), which on some setups makes #root
  // the scroll container instead of window. We reset every possible
  // target to be safe, and re-run after a frame so any late-mounting
  // content doesn't bounce us back.
  useEffect(() => {
    if (window.location.hash) return;

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const root = document.getElementById("root");
      if (root) root.scrollTop = 0;
    };

    resetScroll();
    // Re-assert after the browser has laid out the new page, in case
    // async content (images, fonts) shifted things.
    requestAnimationFrame(() => {
      requestAnimationFrame(resetScroll);
    });
  }, [path]);

  // Instagram redirect: ?code=… → stash code, strip from URL (codes are single-use)
  useEffect(() => {
    captureInstagramOAuthCodeFromUrl();
  }, []);

  useEffect(() => {
    if (!getToken()) {
      if (hasPendingInstagramCode()) {
        notify.info("Log in to finish connecting your Instagram account.");
      }
      setBooting(false);
      return;
    }
    api.auth.me()
      .then(async (res) => {
        setRole(res.user.role || "user");
        setAuthed(true);
        if (res.organization?.id) setStoredOrg(res.organization);
        else setStoredOrg(null);
        setOrgReady(!!res.organization?.id || hasOrgSelected());
        getSocket();
        if (hasPendingInstagramCode()) {
          await exchangePendingInstagramCode();
          window.history.replaceState(null, "", "/instagram/overview");
          setPath("/instagram/overview");
        }
      })
      .catch((err) => {
        // Only log out on a genuine auth failure (401 = invalid/expired token).
        // Transient errors — an aborted request from a hard refresh, network
        // blips, server cold-starts (5xx), or rate limits (429) — must NOT clear
        // a valid session, otherwise rapid refreshes log the user out.
        if (err?.status === 401) {
          clearAuth();
          setAuthed(false);
          setOrgReady(false);
        } else {
          // Keep the cached session and carry on with the stored user.
          const stored = getStoredUser();
          setRole(stored?.role || "user");
          setAuthed(true);
          setOrgReady(hasOrgSelected());
          getSocket();
        }
      })
      .finally(() => setBooting(false));
  }, []);

  function handleLogout() {
    disconnectSocket();
    clearAuth();
    invalidateLeads();
    setAuthed(false);
    setOrgReady(false);
    setRole("user");
    window.history.replaceState(null, "", "/");
    setPath("/");
  }

  function goto(next) {
    // Allow hash deep-links on the same page without full re-render.
    if (next.startsWith("#")) {
      const el = document.querySelector(next);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const [pathOnly, hash] = next.split("#");
    window.history.pushState(null, "", next);
    setPath(pathOnly);

    // Hash target — jump to the section after React commits the new page.
    // The useEffect on `path` handles the scroll-to-top case for us.
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  const router = useMemo(
    () => buildRouter(handleLogout, role),
    [role]
  );

  if (booting) {
    return (
      <>
        <Loader label="Loading your workspace…" />
        <ToastHost />
        <PwaPrompt />
      </>
    );
  }

  const isPublicRoute   = /^\/(book|form)\//.test(path);
  const isResetPassword = /^\/reset-password\//.test(path);
  const isSignup        = path === "/signup";

  if (isResetPassword) {
    return (
      <>
        <ResetPassword />
        <ToastHost />
        <PwaPrompt />
      </>
    );
  }

  // Unauthenticated → only the login / signup forms. The marketing site lives
  // on a separate website now; every other path falls back to the login form.
  if (!authed && !isPublicRoute) {
    return (
      <>
        <Auth
          mode={isSignup ? "signup" : "login"}
          onAuth={async (res) => {
              const { token, user, organization, organizations, needsOrgSelection } = res;
              const nextRole = user?.role || "user";
              const target = nextRole === "admin" ? "/admin/overview" : "/dashboard/overview";
              const mustPickOrg =
                needsOrgSelection ||
                (Array.isArray(organizations) && organizations.length > 1 && !organization?.id);

              if (!mustPickOrg && organization?.id) {
                setAuth(token, user, organization, res.loginAs || "user");
                setRole(nextRole);
                setAuthed(true);
                setOrgReady(true);
                window.history.replaceState(null, "", target);
                setPath(target);
                getSocket();
                return;
              }

              if (!mustPickOrg && organizations?.length === 1) {
                try {
                  const switched = await api.orgs.switch(organizations[0].id);
                  setAuth(switched.token, user, switched.organization, res.loginAs || "user");
                  setRole(nextRole);
                  setAuthed(true);
                  setOrgReady(true);
                  window.history.replaceState(null, "", target);
                  setPath(target);
                  getSocket();
                  return;
                } catch {
                  /* fall through to org picker */
                }
              }

              setAuth(token, user, null, res.loginAs || "user");
              setRole(nextRole);
              setAuthed(true);
              setOrgReady(false);
              window.history.replaceState(null, "", "/select-org");
              setPath("/select-org");
            }}
            onSwitch={(m) => goto(m === "signup" ? "/signup" : "/login")}
          />
        <ToastHost />
        <PwaPrompt />
      </>
    );
  }

  const showOrgPicker = authed && (path === "/select-org" || path.startsWith("/select-org") || !orgReady);

  if (showOrgPicker) {
    return (
      <>
        <SelectOrganization
          onSelected={({ organization }) => {
            setStoredOrg(organization);
            setOrgReady(true);
            const target = role === "admin" ? "/admin/overview" : "/dashboard/overview";
            window.history.replaceState(null, "", target);
            setPath(target);
            getSocket();
          }}
        />
        <ToastHost />
        <PwaPrompt />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastHost />
      <PwaPrompt />
    </>
  );
}

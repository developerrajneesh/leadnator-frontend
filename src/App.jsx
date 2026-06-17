import { useEffect, useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";

import Auth from "./pages/Auth/Auth";
import ResetPassword from "./pages/Auth/ResetPassword";
import Home      from "./pages/Landing/Home";
import Features  from "./pages/Landing/Features";
import Pricing   from "./pages/Landing/Pricing";
import Compare   from "./pages/Landing/Compare";
import Faq       from "./pages/Landing/Faq";
import Contact   from "./pages/Landing/Contact";
import ApiDocs   from "./pages/Landing/ApiDocs";
import Partners  from "./pages/Landing/Partners";
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

// Map every marketing URL to its page component so we can do simple
// path-based routing for unauthenticated users without React Router.
const MARKETING_PAGES = {
  "/":         Home,
  "/features": Features,
  "/pricing":  Pricing,
  "/partners": Partners,
  "/compare":  Compare,
  "/faq":      Faq,
  "/contact":  Contact,
  "/api-docs": ApiDocs,
};

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
      .catch(() => {
        clearAuth();
        setAuthed(false);
        setOrgReady(false);
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
  const isLogin         = path === "/login";
  const isSignup        = path === "/signup";
  const MarketingPage   = MARKETING_PAGES[path];

  if (isResetPassword) {
    return (
      <>
        <ResetPassword />
        <ToastHost />
        <PwaPrompt />
      </>
    );
  }

  // Unauthenticated flows:
  //   /, /features, /pricing, /compare, /faq, /contact  → marketing pages
  //   /login, /signup                                    → auth forms
  //   anything else                                      → default to Home
  if (!authed && !isPublicRoute) {
    if (MarketingPage) {
      return (
        <>
          <MarketingPage onGoto={goto} />
          <ToastHost />
          <PwaPrompt />
        </>
      );
    }

    if (isLogin || isSignup) {
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

    // Deep-linked into the app without a token — show the marketing home
    // instead of bouncing straight into a login form.
    return (
      <>
        <Home onGoto={goto} />
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

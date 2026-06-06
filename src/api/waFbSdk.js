/**
 * Facebook JS SDK for WhatsApp Embedded Signup only.
 * Do not pass Instagram/Meta Ads scopes — config_id drives the WhatsApp flow.
 */

let loadPromise = null;

export function loadWaFbSdk(appId, version = "v25.0") {
  const id = String(appId || "").trim();
  if (!id) return Promise.reject(new Error("Missing Facebook App ID for WhatsApp signup"));

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Facebook SDK requires a browser"));
      return;
    }

    const initSdk = () => {
      window.FB.init({
        appId: id,
        autoLogAppEvents: true,
        cookie: true,
        xfbml: false,
        version,
      });
      resolve(window.FB);
    };

    if (window.FB && typeof window.FB.login === "function") {
      initSdk();
      return;
    }

    const prevAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = function () {
      if (typeof prevAsyncInit === "function") prevAsyncInit();
      initSdk();
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Failed to load Facebook SDK"));
      };
      document.head.appendChild(script);
    }
  });

  return loadPromise;
}

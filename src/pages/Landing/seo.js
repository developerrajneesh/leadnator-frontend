import { useEffect } from "react";

/* ==========================================================
   useSeo — per-page SEO + Open Graph + Twitter + JSON-LD.

   Updates <title>, description, canonical, Open Graph and Twitter
   cards on route change. Optionally injects a JSON-LD structured-data
   block (WebPage, FAQPage, Product, etc.) for rich-result eligibility.

   Usage:
     useSeo({
       title:       "Pricing — Simple plans",
       description: "Transparent pricing…",
       canonical:   "https://leadnator.com/pricing",
       keywords:    "pricing, crm, whatsapp",
       ogImage:     "https://leadnator.com/hero_dashboard.png",
       jsonLd:      { "@context": "https://schema.org", "@type": "Product", … },
     });
   ========================================================== */

const SITE_NAME   = "Leadnator";
const SITE_URL    = "https://leadnator.com";
const DEFAULT_IMG = `${SITE_URL}/hero_dashboard.png`;
const JSONLD_ID   = "ldn-seo-jsonld";

export function useSeo({
  title,
  description,
  canonical,
  keywords,
  ogImage,
  ogType = "website",
  noindex = false,
  jsonLd,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — AI Growth Platform`;
    document.title = fullTitle;

    const image = ogImage || DEFAULT_IMG;
    const url   = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);

    // Upsert a meta/link tag by selector. Creates the element if missing.
    const set = (selector, attr, value) => {
      if (value == null || value === "") return;
      let el = document.head.querySelector(selector);
      if (!el) {
        if (selector.startsWith("link")) {
          el = document.createElement("link");
          const m = selector.match(/rel="([^"]+)"/);
          if (m) el.rel = m[1];
        } else {
          el = document.createElement("meta");
          const nameMatch = selector.match(/name="([^"]+)"/);
          const propMatch = selector.match(/property="([^"]+)"/);
          if (nameMatch) el.name = nameMatch[1];
          if (propMatch) el.setAttribute("property", propMatch[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // Core
    set('meta[name="description"]',      "content", description);
    set('meta[name="keywords"]',         "content", keywords);
    set('meta[name="robots"]',           "content", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    set('link[rel="canonical"]',         "href",    url);

    // Open Graph
    set('meta[property="og:title"]',       "content", fullTitle);
    set('meta[property="og:description"]', "content", description);
    set('meta[property="og:type"]',        "content", ogType);
    set('meta[property="og:url"]',         "content", url);
    set('meta[property="og:site_name"]',   "content", SITE_NAME);
    set('meta[property="og:image"]',       "content", image);
    set('meta[property="og:image:width"]', "content", "1200");
    set('meta[property="og:image:height"]',"content", "630");
    set('meta[property="og:locale"]',      "content", "en_US");

    // Twitter
    set('meta[name="twitter:card"]',        "content", "summary_large_image");
    set('meta[name="twitter:title"]',       "content", fullTitle);
    set('meta[name="twitter:description"]', "content", description);
    set('meta[name="twitter:image"]',       "content", image);

    // JSON-LD structured data (per page). Rewritten on every change so
    // switching routes can't leak a previous page's schema.
    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const stale = document.getElementById(JSONLD_ID);
      if (stale) stale.remove();
    };
  }, [title, description, canonical, keywords, ogImage, ogType, noindex, JSON.stringify(jsonLd)]);
}

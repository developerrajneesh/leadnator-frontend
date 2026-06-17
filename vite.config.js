import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind utilities for the ported Meta Ads create wizard. src/tailwind.css
    // imports only theme + utilities (NO preflight), so the rest of the app's
    // existing CSS is untouched.
    tailwindcss(),
    VitePWA({
      // autoUpdate = refresh the SW in the background whenever a new build
      // is deployed. Users pick up changes on their next reload.
      registerType: 'autoUpdate',

      // Assets that should be copied to /dist as-is (icons, logo etc.).
      includeAssets: [
        'favicon.svg',
        'leadnator_logo.png',
        'leadnator_logoh.png',
        'hero_dashboard.png',
      ],

      // Web App Manifest — controls install prompt, standalone window,
      // launcher icon and splash screen on mobile + desktop.
      manifest: {
        name: 'Leadnator — AI Growth Platform',
        short_name: 'Leadnator',
        description:
          'All-in-one AI-powered growth CRM — WhatsApp, Meta Ads, Email, leads pipeline, AI tools and more.',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['business', 'productivity', 'marketing'],
        icons: [
          { src: '/leadnator_logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/leadnator_logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/leadnator_logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/leadnator_logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Leads',
            short_name: 'Leads',
            description: 'Jump straight to the All Leads list',
            url: '/leads/all',
            icons: [{ src: '/leadnator_logo.png', sizes: '192x192' }],
          },
          {
            name: 'WhatsApp Inbox',
            short_name: 'Inbox',
            description: 'Open the WhatsApp inbox',
            url: '/whatsapp/inbox',
            icons: [{ src: '/leadnator_logo.png', sizes: '192x192' }],
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Open the main dashboard',
            url: '/dashboard/overview',
            icons: [{ src: '/leadnator_logo.png', sizes: '192x192' }],
          },
        ],
      },

      // Service-worker (Workbox) runtime caching strategy.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB — lets large JS chunks cache
        runtimeCaching: [
          // 1. Never cache API calls — always go to the network so users
          //    see live data. If the network is down, let the app's own
          //    error handling surface the failure instead of serving stale.
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            options: { cacheName: 'ldn-api-never-cache' },
          },
          // 2. Google Fonts CSS — stale-while-revalidate.
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // 3. Google Fonts webfont files — cache-first (immutable).
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // 4. App images/media — cache-first with 60-entry cap.
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ldn-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        // SPA navigation fallback — any unknown path serves index.html so
        // deep routes like /leads/all/:id still work offline.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/webhooks\//],
      },

      // Dev SW is off by default — it breaks easily when dev-dist hashes drift
      // or a stale SW is cached (importScripts workbox-* 404). Test PWA with:
      //   npm run build && npm run preview
      devOptions: { enabled: false },
    }),
  ],
})

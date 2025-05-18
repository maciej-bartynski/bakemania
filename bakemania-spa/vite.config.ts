import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import os from 'os';
import { VitePWA } from 'vite-plugin-pwa';


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return ({
    server: {
      https: {
        key: '../key.pem',
        cert: '../cert.pem',
      },
      port: 3000,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      host: getLocalIP(),

      proxy: {
        '/api': {
          target: `https://${getLocalIP()}:4040`,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: `wss://${getLocalIP()}:4040`,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      }
    },

    plugins: [react(), mkcert(), VitePWA({
      registerType: 'autoUpdate', // Autoaktualizacja service workera
      devOptions: {
        enabled: true, // Działa w dev
      },
      manifest: {
        name: env.VITE_APP_RUNTIME === 'production' ? 'bakeMAnia' : `bakeMAnia ${env.VITE_APP_RUNTIME}`,
        short_name: env.VITE_APP_RUNTIME === 'production' ? 'MAnia!' : 'MAnia! stg',
        description: 'bakeMAnia - zbieraj pieczątki, odbieraj rabaty',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            "src": "/web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/web-app-manifest-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
        ],
        "screenshots": [
          {
            "src": "/images/card-screen.png",
            "sizes": "706x1494",
            "type": "image/png",
            "form_factor": "narrow"
          },
          {
            "src": "/images/gift-screen.png",
            "sizes": "696x1486",
            "type": "image/png"
          }],

      },


      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        disableDevLogs: false,
        navigateFallbackDenylist: [/\.pdf$/],
        // Dodaj to:
        globIgnores: ['**/*.pdf'],

        // globPatterns: ['**/*.{ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css)$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /.*\.pdf$/,
            handler: 'NetworkOnly'
          },
          {
            // Dla plików HTML zawsze pobieraj świeżą wersję
            urlPattern: /.*\.html$/,
            handler: 'NetworkOnly'
          },
          {
            // Dla API zawsze pobieraj świeżą wersję
            urlPattern: /^https:\/\/api\..*/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },

    })],

    define: {
      'import.meta.env.VITE_APP_NAME': JSON.stringify(
        env.VITE_APP_RUNTIME === 'production' ? 'bakeMAnia' : `bakeMAnia ${env.VITE_APP_RUNTIME}`
      )
    },
  })
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "localhost";
}
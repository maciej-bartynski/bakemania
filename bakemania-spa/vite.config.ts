import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import os from 'os';
import { VitePWA } from 'vite-plugin-pwa';

const useLocalhost = true;

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      key: '../key.pem',
      cert: '../cert.pem',
    },
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    host: useLocalhost ? undefined : getLocalIP(),
    proxy: {
      '/api': {
        target: `https://${useLocalhost ? 'localhost' : getLocalIP()}:4040`,
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: `https://${useLocalhost ? 'localhost' : getLocalIP()}:4040`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  },
  define: process.env.NODE_ENV === 'development' ? {
    "import.meta.env.VITE_API_URL": `"https://${useLocalhost ? 'localhost' : getLocalIP()}:3000/api"`,
    "import.meta.env.VITE_WS_URL": `"https://${useLocalhost ? 'localhost' : getLocalIP()}:3000/ws"`,
  } : {
    "import.meta.env.VITE_API_URL": `"https://bakemania.ovh/api"`,
    "import.meta.env.VITE_WS_URL": `"https://bakemania.ovh/ws"`,
  },
  plugins: [react(), mkcert(), VitePWA({

    registerType: 'autoUpdate', // Autoaktualizacja service workera
    devOptions: {
      enabled: true, // Działa w dev
    },
    injectManifest: {
      // Możesz zmieniać nazwę pliku service worker w zależności od preferencji
      swSrc: './public/iniect-to-service-worker.js',

    },
    manifest: {
      name: 'bakeMAnia',
      short_name: 'MAnia!',
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
      runtimeCaching: [
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
        {
          urlPattern: 'https://bakemania.ovh/logo-rectangle.jpg', // Obrazek z public
          handler: 'CacheFirst',
          options: {
            cacheName: 'banner-images',
          },
        },
        {
          urlPattern: /^https:\/\/bakemania\.ovh\/api\/.*/i, // Twoje API
          handler: 'NetworkOnly',
        },
      ],
    },

  })],
})

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
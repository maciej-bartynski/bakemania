import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import os from 'os';

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
    host: getLocalIP(),
    proxy: {
      '/api': {
        target: `https://${getLocalIP()}:4040`,
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: `https://${getLocalIP()}:4040`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  },
  plugins: [react(), mkcert()],
  define: {
    "import.meta.env.VITE_API_URL": `"https://${getLocalIP()}:3000/api"`,
    "import.meta.env.VITE_WS_URL": `"https://${getLocalIP()}:3000/ws"`,
  },
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
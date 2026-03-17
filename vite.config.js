import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fleetcommand-demo/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'FleetCommand',
        short_name: 'FleetCommand',
        description: 'Fleet Management Dashboard',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        scope: '/fleetcommand-demo/',
        start_url: '.',
        icons: [
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',   // expose to local network for iPhone testing
    allowedHosts: ['cold-ideas-repair.loca.lt'],
    // NOTE: iOS requires HTTPS for camera access.
    // For camera to work on iPhone, either:
    //   a) Use ngrok: npx -y ngrok http 5173  (easiest)
    //   b) Or add https: true below (needs mkcert for trusted cert)
    // https: true,
  }
})


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/symptom-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Health Tracker',
        short_name: 'Tracker',
        description: 'Personal health and symptom tracker',
        theme_color: '#f5f4f0',
        background_color: '#f5f4f0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/symptom-tracker/',
        start_url: '/symptom-tracker/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'weather-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
      },
    },
  ],
},
    }),
  ],
})
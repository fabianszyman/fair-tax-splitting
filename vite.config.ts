import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fairer Steuer‑Splitting‑Rechner',
        short_name: 'Steuer',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0c0f',
        theme_color: '#0b5cff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
    }),
  ],
})

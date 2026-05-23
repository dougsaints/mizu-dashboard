import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'chart-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor'
            }
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
              return 'react-vendor'
            }
          }
          return undefined
        },
      },
    },
  },
})

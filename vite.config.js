import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend.digitalservices.adityauniversity.in',
        changeOrigin: true,
        secure: false,
      },
      '/adityaapi': {
        target: 'https://info.aec.edu.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/adityaapi': {
          target: env.VITE_EMP_URL ? new URL(env.VITE_EMP_URL).origin : 'https://info.aec.edu.in',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

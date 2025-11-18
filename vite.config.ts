import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': JSON.stringify({
        FRONTEND_URL: env.FRONTEND_URL || env.VITE_FRONTEND_URL || 'http://localhost:5173',
        BACKEND_URL: env.BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:8080/api',
        PRINTSCRIPT_SERVICE_URL: env.PRINTSCRIPT_SERVICE_URL || env.VITE_PRINTSCRIPT_SERVICE_URL || 'http://localhost:8082',
        AUTH0_USERNAME: env.AUTH0_USERNAME || env.VITE_AUTH0_USERNAME || '',
        AUTH0_PASSWORD: env.AUTH0_PASSWORD || env.VITE_AUTH0_PASSWORD || '',
      })
    },
    plugins: [react()],
  }
})

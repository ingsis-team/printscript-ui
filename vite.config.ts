import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const envVars = {
    FRONTEND_URL: env.FRONTEND_URL || env.VITE_FRONTEND_URL || 'http://localhost:5173',
    BACKEND_URL: env.BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:8080/api',
    PRINTSCRIPT_SERVICE_URL: env.PRINTSCRIPT_SERVICE_URL || env.VITE_PRINTSCRIPT_SERVICE_URL || 'http://localhost:8082',
    AUTH0_USERNAME: env.AUTH0_USERNAME || env.VITE_AUTH0_USERNAME || '',
    AUTH0_PASSWORD: env.AUTH0_PASSWORD || env.VITE_AUTH0_PASSWORD || '',
    VITE_AUTH0_DOMAIN: env.VITE_AUTH0_DOMAIN || '',
    VITE_AUTH0_CLIENT_ID: env.VITE_AUTH0_CLIENT_ID || '',
    VITE_AUTH0_AUDIENCE: env.VITE_AUTH0_AUDIENCE || env.AUTH0_AUDIENCE || '',
  };
  return {
    define: {
      'process.env': JSON.stringify(envVars),
      'process': JSON.stringify({ env: envVars }),
      global: 'globalThis',
      // Ensure Vite env vars are available
      'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(env.VITE_AUTH0_DOMAIN || ''),
      'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(env.VITE_AUTH0_CLIENT_ID || ''),
      'import.meta.env.VITE_AUTH0_AUDIENCE': JSON.stringify(env.VITE_AUTH0_AUDIENCE || env.AUTH0_AUDIENCE || ''),
    },
    plugins: [react()],
  }
})

import { defineConfig } from "cypress";
import dotenv from 'dotenv'
dotenv.config()

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.env = process.env
      return config
    },
    experimentalStudio: true,
    baseUrl: FRONTEND_URL,
  },
});

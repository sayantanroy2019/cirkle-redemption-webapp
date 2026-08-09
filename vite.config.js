import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // consumer=5173, organizer=5174, admin=5175 → redemption=5176.
    // Needs adding to the backend CORS allow-list (src/app.js origin array).
    port: 5176,
    strictPort: true,
  },
})

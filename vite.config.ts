import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ensure base ends with a trailing slash; default to root for Vercel
  base: (() => {
    const fromEnv = process.env.VITE_BASE_PATH || '/'
    return fromEnv.endsWith('/') ? fromEnv : fromEnv + '/'
  })(),
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // ✅ Importamos 'path' para usar alias
import process from 'node:process'

// ⚠️ Estamos detrás de Apache en https://todo.bycram.dev
//    - Vite escucha en 0.0.0.0:5173
//    - Permitimos el host externo "todo.bycram.dev"
//    - Forzamos HMR vía WSS hacia el dominio (puerto 443)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'), // ✅ Alias @ apunta a src/
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['todo.bycram.dev'],
    hmr: {
      protocol: 'wss',
      host: 'todo.bycram.dev',
      clientPort: 443,
    },
    proxy: {
      '/api':  { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
})

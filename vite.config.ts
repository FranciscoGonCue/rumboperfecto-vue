import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  // Reduce "Outdated Optimize Dep" / 504 al cambiar deps o reinicios raros del dev server
  optimizeDeps: {
    include: ['three', 'leaflet', 'chroma-js', 'lucide-vue-next', 'vue', 'pinia'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
  preview: {
    port: 8082,
    host: '127.0.0.1',
    allowedHosts: ['treenvite.click', 'treenvite.enriquemarin.xyz'],
  },
})

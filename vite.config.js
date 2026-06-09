import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:   resolve(__dirname, 'index.html'),
        admin:  resolve(__dirname, 'admin.html'),
        portal: resolve(__dirname, 'portal.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

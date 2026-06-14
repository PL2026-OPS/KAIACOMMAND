import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        admin:      resolve(__dirname, 'admin.html'),
        portal:     resolve(__dirname, 'portal.html'),
        privacidad: resolve(__dirname, 'privacidad.html'),
        terminos:   resolve(__dirname, 'terminos.html'),
        avisoLegal: resolve(__dirname, 'aviso-legal.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

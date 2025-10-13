import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// Certificate configuration from environment variables
const certDir =
  process.env.VITE_CERT_DIR || path.resolve(__dirname, '../infrastructure/docker/traefik/certs')
const certFile = process.env.VITE_CERT_FILE || 'localhost.crt'
const keyFile = process.env.VITE_KEY_FILE || 'localhost.key'

const keyPath = path.join(certDir, keyFile)
const certPath = path.join(certDir, certFile)
const certExists = fs.existsSync(keyPath) && fs.existsSync(certPath)

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8081,
    host: true,
    https: certExists
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
      : false,
  },
})

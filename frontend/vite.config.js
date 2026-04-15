import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, envDir, '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL || ''

  const serverConfig = proxyTarget
    ? {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
          },
          '/health': {
            target: proxyTarget,
            changeOrigin: true,
          },
        },
      }
    : undefined

  return {
    plugins: [react()],
    ...(serverConfig ? { server: serverConfig } : {}),
  }
})

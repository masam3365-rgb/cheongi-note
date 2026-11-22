import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { routeAdminApi } from './server/adminHandlers.mjs'

function adminApiPlugin() {
  return {
    name: 'dalbit-admin-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const pathname = url.split('?')[0]
        if (!pathname.startsWith('/api/admin')) return next()
        try {
          await routeAdminApi(req, res, pathname)
        } catch (cause) {
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: false, error: cause instanceof Error ? cause.message : 'server error' }))
          }
        }
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const pathname = url.split('?')[0]
        if (!pathname.startsWith('/api/admin')) return next()
        try {
          await routeAdminApi(req, res, pathname)
        } catch (cause) {
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: false, error: cause instanceof Error ? cause.message : 'server error' }))
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // .env 변경 시 이전 process.env 값을 반드시 덮어쓴다 (관리자 비밀번호 갱신 반영)
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
  }

  return {
    plugins: [react(), tailwindcss(), adminApiPlugin()],
  }
})

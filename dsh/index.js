import Schema from '@deepseek-ai/schemastery'
import { readFileSync } from 'node:fs'

export const name = 'psc-main'
export const inject = ['webServer', 'connection']
// root 由 cordis.patch.yml 的 config.root: !!js dshHomePath('psc') 注入（用户资料目录）。
// 缺这一条装机后服务会去默认目录找库，表现为 404 / 空档案。
export const Config = Schema.object({
  root: Schema.string().description('用户资料目录（由宿主 dshHomePath 注入）'),
})
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

export function apply(ctx) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/api/psc/health',
    handler(req, res) {
      const send = (status, body) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      }
      if (typeof ctx.connection?.requestRejection !== 'function') return send(503, { error: 'connection authentication capability unavailable' })
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return send(rejection, { error: 'Authentication required' })
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' })
      send(200, { ok: true, version: manifest.version, apiVersion: 'v1', capabilities: ['health'] })
    },
  }), 'psc health')
}

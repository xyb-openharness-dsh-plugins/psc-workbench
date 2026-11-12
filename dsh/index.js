import Schema from '@deepseek-ai/schemastery'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const name = 'psc-main'
export const inject = ['webServer', 'connection']
// root 由 cordis.patch.yml 的 config.root: !!js dshHomePath('psc') 注入（用户资料目录）。
// 缺这一条装机后服务会去默认目录找库，表现为 404 / 空档案。
// root 缺失不是错误——它是「还没选资料目录」的正常状态；服务端退回只读演示。
export const Config = Schema.object({
  root: Schema.string().description('用户资料目录（由宿主 dshHomePath 注入）'),
})

const manifest = { version: '0.1.0' } // M5 换成 package.json 同源读法（版本十处同源）
const API_PREFIX = '/api/psc'
const SUBJECTS_PATH = '/subjects' // 档案集合路径段（POST=新建，GET=列表）

/* 档案仓（M0 垂直切片：只做 subjects 新建/列表；化验/发作/影像等实体 M3 全量建模） */
function openStore(root) {
  if (!root) return null
  const dir = join(root, 'psc')
  mkdirSync(dir, { recursive: true })
  const db = new DatabaseSync(join(dir, 'psc.sqlite'))
  db.exec(`CREATE TABLE IF NOT EXISTS subjects (
    subject_id  TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    note        TEXT,
    is_demo     INTEGER NOT NULL DEFAULT 0,
    in_use      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT
  )`)
  return db
}

function newId() { return 'sbj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8) }

export function apply(ctx, config) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  const root = config?.root
  const db = openStore(root)

  const send = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(JSON.stringify(body))
  }

  const handler = async (req, res, next) => {
    if (typeof ctx.connection?.requestRejection === 'function') {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return send(res, rejection, { error: 'Authentication required' })
    }
    const url = req.url || '/'
    const path = url.split('?')[0]
    const body = await new Promise((resolveBody) => {
      let raw = ''
      req.on('data', (c) => { raw += c })
      req.on('end', () => { try { resolveBody(raw ? JSON.parse(raw) : {}) } catch { resolveBody({}) } })
    })

    if (path === `${API_PREFIX}/health` || path === '/api/psc/health') {
      return send(res, 200, { ok: true, version: manifest.version, apiVersion: 'v1', capabilities: ['health', 'subjects'], dataDirConfigured: Boolean(root) })
    }
    if (path === API_PREFIX + SUBJECTS_PATH && req.method === 'GET') {
      if (!db) return send(res, 200, { subjects: [], demoOnly: true, note: '未选择资料目录：只读演示模式' })
      const rows = db.prepare('SELECT subject_id, name, note, is_demo, created_at, updated_at FROM subjects WHERE in_use=1 ORDER BY rowid').all()
      return send(res, 200, { subjects: rows })
    }
    if (path === API_PREFIX + SUBJECTS_PATH && req.method === 'POST') {
      if (!db) return send(res, 503, { error: '未选择资料目录：请先在「配置资料目录」选择本机目录' })
      const name = String(body.name ?? '').trim()
      if (!name) return send(res, 400, { error: '档案名不能为空' })
      const id = newId()
      db.prepare('INSERT INTO subjects (subject_id, name, note, is_demo) VALUES (?, ?, ?, 0)').run(id, name, body.note ? String(body.note) : null)
      return send(res, 200, { ok: true, subject: { subject_id: id, name, note: null, is_demo: 0 } })
    }
    return send(res, 404, { error: 'not found' })
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: API_PREFIX, handler }), 'psc api')
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/psc', handler }), 'psc ui')
}

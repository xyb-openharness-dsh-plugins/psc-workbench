#!/usr/bin/env node
/**
 * probe-psc-write.mjs — 写入闭环探针 PR1–PR4（双形态：API 态实测 / 无 API 态如实 SKIP）
 *
 *   node scripts/probe-psc-write.mjs                # API 态（内置 Workbench + createHandler）+ 演示态
 *   node scripts/probe-psc-write.mjs --self-test   # 反向对照：拆掉「新建档案」入口后必须 FAIL
 *
 * 断言（ONESHOT §2.3）：
 *   PR1 档案级「新建档案」入口存在，点击有创建表单动作
 *   PR2 创建后 is_demo=0、自动切换、与 demo 共存（读 /subjects 与 sqlite）
 *   PR3 写一条记录（mind）→ 页面 reload → 记录仍在、备注逐字一致（持久化）
 *   PR4 私密切换 → reload → is_private 仍为 true（读 sqlite）
 *   演示态（无 API）：PR2–PR4 记 SKIP（原因：本形态无 API），不计通过。
 */
import { createServer } from 'node:http'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SELF_TEST = process.argv.includes('--self-test')

/* ---------- 服务端（真 Workbench，不是桩） ---------- */
const { Workbench } = await import(join(ROOT, 'dsh/workbench.js'))
const { createHandler } = await import(join(ROOT, 'dsh/server.js'))
const { readLabs, readEpisodes, readScreening, readImaging, readMeds, readSymptoms, readReports, readViewpoints, readDocuments } = await import(join(ROOT, 'dsh/readmodels.js'))

const tmpRoot = mkdtempSync(join(tmpdir(), 'psc-pr-'))
const wb = new Workbench({ root: tmpRoot, seedDemo: true })
wb.open()
const services = {
  bootstrap: () => wb.bootstrap(),
  profile: (k) => wb.profile(k),
  trialMatch: (kw, o) => wb.trialMatch(kw, o),
  dataRoot: () => wb.dataRoot,
  setDataRoot: (d) => wb.setDataRoot(d),
  savedTrials: () => wb.savedTrials(),
  saveTrial: (r) => wb.saveTrial(r),
  removeTrial: (i) => wb.removeTrial(i),
  listSubjects: () => wb.subjects(),
  createSubject: (i) => wb.createSubject(i),
  deleteSubject: (k) => wb.deleteSubject(k),
  addEntry: (k, kind, d) => wb.addEntry(k, kind, d),
  setPrivacy: (k, kind, id, p) => wb.setPrivacy(k, kind, id, p),
  entities: (name, key) => {
    wb.open()
    const readers = { labs: readLabs, episodes: readEpisodes, screening: readScreening, imaging: readImaging, meds: readMeds, symptoms: readSymptoms, reports: readReports, viewpoints: readViewpoints, documents: readDocuments }
    if (!readers[name]) throw new Error('未知实体：' + name)
    return readers[name](wb.db, String(key || ''))
  },
}
const handler = createHandler({ apiBase: '/api/psc', publicDir: join(ROOT, 'public'), services })
const server = createServer((req, res) => {
  if (SELF_TEST && req.url.includes('app.js')) {
    /* 反向对照：拆掉「新建档案」入口与写钩子 —— 探针必须变红 */
    const mutated = readFileSync(join(ROOT, 'public', 'app.js'), 'utf8').replaceAll('新建档案', '占位已移除')
    res.writeHead(200, { 'content-type': 'text/javascript' })
    return res.end(mutated)
  }
  return handler(req, res)
})
await new Promise((r) => server.listen(8795, '127.0.0.1', r))


/* ---------- 无头浏览器 ---------- */
const { createRequire } = await import('node:module')
const famRequire = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
const puppeteer = famRequire('puppeteer-core')
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })

const results = []
const rec = (id, verdict, detail) => { results.push({ id, verdict, detail }); console.log(`${verdict}  ${id}  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function newPage(url) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860 })
  page.on('dialog', (d) => d.accept('体检探针档案').catch(() => {}))
  for (let i = 0; i < 3; i++) {
    try { await page.goto(url, { waitUntil: 'networkidle0' }); break } catch (e) { if (i === 2) throw e; await sleep(800) }
  }
  await sleep(700)
  return page
}
const clickNav = (page, view, sub) => page.evaluate((v, s) => {
  [...document.querySelectorAll('.nav-item')].find((b) => b.dataset.view === v)?.click()
  if (s) [...document.querySelectorAll('[data-sub]')].find((b) => b.dataset.sub === s)?.click()
}, view, sub)

/* ================= API 态 ================= */
{
  const URL = 'http://127.0.0.1:8795/index.html'
  /* PR1 */
  let page = await newPage(URL)
  const hasCreate = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('新建档案')))
  rec('PR1', hasCreate ? 'PASS' : 'FAIL', hasCreate ? '顶栏存在档案级「＋ 新建档案」入口' : '找不到「新建档案」入口')

  /* PR2 创建 → is_demo=0 → 自动切换 → 与 demo 共存 */
  if (hasCreate) {
    await page.click('#app .actions button') /* 第一个 .actions 按钮就是新建档案 */
    await sleep(900)
    const footerTxt = await page.$eval('#footer-profile', (e) => e.textContent).catch(() => '')
    const subs = await (await page.evaluate(() => fetch('/api/psc/subjects').then((r) => r.json()).catch(() => null)))
    const mine = subs && subs.subjects ? subs.subjects.filter((s) => s.is_demo === 0 || s.isDemo === false && s.profile_key && s.profile_key.startsWith('local-')) : []
    const demoCount = subs && subs.subjects ? subs.subjects.filter((s) => s.is_demo === 1 || s.isDemo === true).length : 0
    const ok = footerTxt.includes('体检探针档案') && mine.length >= 1 && demoCount >= 2
    rec('PR2', ok ? 'PASS' : 'FAIL', { footer: footerTxt, mine: mine.length, demo: demoCount })
  } else rec('PR2', 'FAIL', '无创建入口，无法验证 is_demo=0')

  /* PR3 写 mind 记录 → reload → 记录仍在、备注逐字一致 */
  const NOTE = 'PR3 持久化探针备注XYZ'
  await clickNav(page, 'symptoms', 'itch')
  await sleep(400)
  await page.evaluate(() => { const el = document.getElementById('itch'); if (el) { el.value = '7'; el.dispatchEvent(new Event('input', { bubbles: true })) } })
  await page.evaluate((n) => { const el = document.getElementById('note'); if (el) el.value = n }, NOTE)
  await page.click('#save-itch')
  await sleep(1200)
  const toast1 = await page.evaluate(() => (document.getElementById('toast') || {}).textContent || '')
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(700)
  await clickNav(page, 'symptoms', 'log')
  await sleep(500)
  const logText = await page.evaluate(() => (document.querySelector('#view') || document.body).innerText)
  const persisted = logText.includes(NOTE)
  rec('PR3', persisted && toast1.includes('已保存到本机数据库') ? 'PASS' : 'FAIL', { toast: toast1.slice(0, 40), persisted })

  /* PR4 私密切换 → reload → is_private 仍为 true（读 sqlite） */
  await page.evaluate(() => { const b = document.querySelector('[data-privacy]'); if (b) b.click() })
  await sleep(1200)
  const toast2 = await page.evaluate(() => (document.getElementById('toast') || {}).textContent || '')
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(700)
  await clickNav(page, 'symptoms', 'log')
  await sleep(500)
  const privState = await page.evaluate(() => { const b = document.querySelector('[data-privacy]'); return b ? b.getAttribute('aria-pressed') : null })
  const dbPriv = wb.db.prepare('SELECT is_private FROM symptom_notes WHERE note LIKE ? ORDER BY rowid').get('%PR3 持久化探针备注XYZ%')
  const ok4 = privState === 'true' && dbPriv && dbPriv.is_private === 1 && toast2.includes('已标记私密')
  rec('PR4', ok4 ? 'PASS' : 'FAIL', { toast: toast2.slice(0, 40), aria: privState, db: dbPriv || null })
  await page.close()
}

/* ================= 演示态（无 API）：PR2–PR4 如实 SKIP ================= */
{
  /* file:// 形态（与双击打开同口径）：补丁自身在 file: 下进演示态，无需第二个端口。
     （Chrome 对第二个本机 http 端口会 HTTPS-First 升级导致 ERR_ABORTED，实测 2026-11-14。） */
  const page = await newPage('file://' + join(ROOT, 'public/index.html'))
  const hasCreate = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('新建档案')))
  rec('PR1-demo', hasCreate ? 'PASS' : 'FAIL', hasCreate ? '演示态入口也在（提示语区分演示/写库）' : '演示态缺入口')
  rec('PR2-demo', 'SKIP', '本形态无 API（file:// 同口径）：创建落库走 API 态实测')
  rec('PR3-demo', 'SKIP', '本形态无 API：持久化走 API 态实测')
  rec('PR4-demo', 'SKIP', '本形态无 API：私密落库走 API 态实测')
  await page.close()
}

/* ---------- self-test：拆掉入口必须红 ---------- */
if (SELF_TEST) {
  /* 反向对照只对 API 态生效（PR1-demo 读的是磁盘原件，不受变异影响）；
     PR1–PR4 在 API 态同时变红即证明探针有效。 */
  const broken = ['PR1', 'PR2', 'PR3', 'PR4'].every((id) => results.some((r) => r.id === id && r.verdict === 'FAIL'))
  console.log(broken ? 'self-test：反向对照已证明探针会红（PASS）' : 'self-test：反向对照没有变红（探针失效）')
  process.exitCode = broken ? 0 : 2
} else {
  const pass = results.filter((r) => r.verdict === 'PASS').length
  const skip = results.filter((r) => r.verdict === 'SKIP').length
  const fail = results.filter((r) => r.verdict === 'FAIL').length
  console.log(`SUMMARY: ${pass} pass, ${fail} fail, ${skip} skip（SKIP 不计通过）`)
  if (fail > 0) process.exitCode = 1
}

await browser.close()
server.close()
wb.close()
rmSync(tmpRoot, { recursive: true, force: true })

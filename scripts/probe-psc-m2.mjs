/* 小胆宝 DuctPal · PSC M2 项目探针：对 prototypes/v0.2 真实浏览器断言（IP/C/MT/Q/A 组）
 * 通用铁律：先证明被测对象非空，再断言具体内容；SKIP 不计覆盖；失败不放宽断言。
 * 全量路由探针：覆盖 VIEWS 全部 30 条叶子路由（与 app.js VIEWS 键一一对应）。
 * 用法：node scripts/probe-psc-m2.mjs [--port N] [--url http://...] —— 显式 --url 打本仓原型，禁 examples 假绿。
 * 依赖：puppeteer-core + 本机 Chrome（CHROME_PATH 可覆盖）。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const argOf = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(argOf('--port') || 8142)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' }

/* 全量叶子路由（与 app.js VIEWS 键一一对应；漏一条 check-probe-coverage 就会红） */
const LEAF_ROUTES = [
  'dashboard/overview', 'dashboard/next', 'dashboard/changes',
  'basics/diagnosis', 'basics/fibrosis', 'basics/comorbidity',
  'episodes/list', 'episodes/timeline',
  'treatment/current', 'treatment/pathway', 'treatment/sideeffects',
  'labs/cards', 'labs/chart', 'labs/grading',
  'symptoms/itch', 'symptoms/fatigue', 'symptoms/log', 'symptoms/impact',
  'screening/colonoscopy', 'screening/mrcp', 'screening/fibroscan', 'screening/gallbladder', 'screening/endoscopy',
  'followup/cadence', 'followup/prep', 'followup/todos',
  'records/import', 'records/files', 'records/export',
  'trials/search', 'trials/saved', 'trials/sources',
]

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ]
  return candidates.find(existsSync) || null
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return }
    const file = normalize(join(ROOT, urlPath))
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return }
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end('not found') }
})

const results = []
function t(id, desc, pass, detail) {
  results.push({ id, desc, pass: !!pass, detail: detail === undefined ? '' : String(detail) })
  console.log((pass ? 'PASS ' : 'FAIL ') + id + '  ' + desc + (detail !== undefined ? '  — ' + JSON.stringify(detail).slice(0, 220) : ''))
}

const serverReady = new Promise(r => server.listen(PORT, '127.0.0.1', r))
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
/* 与 app.js daysSince 同口径：本地日期，不走 UTC（东八区凌晨不退一天） */
function expectedDaysSince(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((today - d) / 86400000))
}
/* 与 app.js cadenceNodes 同口径：起点 +N 个月，月末夹取，本地时区 */
function expectedCadenceNode(startStr, months) {
  const d = new Date(startStr + 'T00:00:00')
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() < day) d.setDate(0)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

async function main() {
  await serverReady
  const chrome = findChrome()
  if (!chrome) { console.log('FAIL env  找不到 Chrome：设置 CHROME_PATH 后重试。'); process.exit(2) }
  let puppeteer
  try {
    const famRequire = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
    puppeteer = famRequire('puppeteer-core')
  } catch {
    puppeteer = require('puppeteer-core')
  }
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()) })
  await page.setViewport({ width: 1280, height: 860 })
  const url = argOf('--url') || `http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__PSC_APP__ && document.querySelector('#view') && document.querySelector('#view').innerText.trim().length > 0, { timeout: 5000 })
  await sleep(200)

  /* ---------- hash 路由跳转助手：先证路由生效（state 命中 + #view 非空），返回视图文本 ---------- */
  async function go(route) {
    const errBefore = errors.length
    await page.evaluate((r) => { location.hash = '#' + r }, route)
    await page.waitForFunction((r) => {
      const a = window.__PSC_APP__
      return a && (a.state.view + '/' + a.state.sub) === r
        && document.querySelector('#view') && document.querySelector('#view').innerText.trim().length > 0
    }, { timeout: 4000 }, route)
    await sleep(80)
    const since = errors.slice(errBefore)
    const view = await page.evaluate(() => ({ text: document.querySelector('#view').innerText, htmlLen: document.querySelector('#view').innerHTML.length }))
    return { ...view, routeErrors: since }
  }

  /* ---------- IP2/X1：30 条叶子路由全部经 hash 直达渲染非空，且无未捕获异常 ---------- */
  const walked = []
  for (const r of LEAF_ROUTES) {
    const v = await go(r)
    walked.push({ route: r, htmlLen: v.htmlLen, textLen: v.text.trim().length, err: v.routeErrors.length })
  }
  const orphans = walked.filter(w => w.textLen <= 0 || w.htmlLen <= 0)
  const errRoutes = walked.filter(w => w.err > 0)
  t('IP2', '30 条叶子路由全部 hash 直达渲染非空（孤儿页=0）', orphans.length === 0, { total: LEAF_ROUTES.length, orphans })
  t('X1', '全量路由渲染无未捕获异常/console error', errRoutes.length === 0, errRoutes.map(w => w.route + ': ' + w.err))

  /* ---------- X2：深链接（浏览器刷新后 hash 仍在，boot 时 applyHash 直达） ---------- */
  await go('labs/chart')
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__PSC_APP__ && document.querySelector('#view') && document.querySelector('#view').innerText.trim().length > 0, { timeout: 5000 })
  await sleep(150)
  const deep = await page.evaluate(() => ({
    hash: location.hash,
    view: window.__PSC_APP__.state.view + '/' + window.__PSC_APP__.state.sub,
    text: document.querySelector('#view').innerText
  }))
  t('X2', '刷新后 #labs/chart 深链直达（boot 时 applyHash 生效）', deep.hash === '#labs/chart' && deep.view === 'labs/chart' && deep.text.includes('一图秀'), { hash: deep.hash, view: deep.view })

  /* ---------- 抽样具体内容断言（档案 A · 刚确诊）：≥10 条路由 ---------- */
  /* dashboard/overview：随访第 N 天从 startedAt 锚点算，不手填 */
  const ov = await go('dashboard/overview')
  const dayN = expectedDaysSince('2026-10-21')
  t('OV1', 'dashboard/overview 状态卡锚点派生：随访第 N 天 = 距开始用药日天数', ov.text.includes(`随访第 ${dayN} 天`) && ov.text.includes(`D+${dayN}`) && ov.text.includes('锚点 2026-10-21'), { expectedDay: dayN })
  /* dashboard/next：参考节点 = 起点 +6 个月（只列今天之后） */
  const nx = await go('dashboard/next')
  const node6 = expectedCadenceNode('2026-10-21', 6)
  t('NX1', 'dashboard/next 列出起点+6 个月参考节点（读时推算）', nx.text.includes(node6) && nx.text.includes('个月参考节点') && nx.text.includes('天后'), { expected: node6 })
  /* dashboard/changes：ALP 首末 + 一图秀三条线 */
  const ch = await go('dashboard/changes')
  const chSvg = await page.evaluate(() => document.querySelectorAll('#view svg.chart path[fill="none"]').length)
  t('CH1', 'dashboard/changes 列 ALP 首次/最近（318→258）并画 3 条趋势线', ch.text.includes('ALP 首次') && ch.text.includes('318') && ch.text.includes('258') && chSvg === 3, { svgPaths: chSvg })
  /* basics/diagnosis：确诊要素三态 + 原文来源 */
  const dx = await go('basics/diagnosis')
  t('DX1', 'basics/diagnosis 照抄确诊日期与抗体三态（pANCA 未检测）', dx.text.includes('确诊日期') && dx.text.includes('2026-10-14') && dx.text.includes('pANCA') && dx.text.includes('未检测'), {})
  /* basics/fibrosis：档案 A 无弹性检查 → 如实空态（不画错、不空白） */
  const fb = await go('basics/fibrosis')
  t('FB1', 'basics/fibrosis 空档案如实写未记录（不判纤维化分期）', fb.text.includes('纤维化与影像') && fb.text.includes('未记录') && fb.text.includes('不判断纤维化分期') && !fb.text.includes('没能画出来'), {})
  /* basics/comorbidity（A） */
  const cbA = await go('basics/comorbidity')
  t('CB1', 'basics/comorbidity（A）显示「未见合并症记录」', cbA.text.includes('未见合并症记录') && cbA.text.includes('合并症档案'), {})
  /* episodes/list（A）：空态 + 近 90 天发作读时算 */
  const epA = await go('episodes/list')
  t('EP1', 'episodes/list（A）空态给下一步按钮，近 90 天发作 0 次（读时算）', epA.text.includes('近 90 天发作 0 次') && epA.text.includes('还没有发作记录') && epA.text.includes('记一次发作'), {})
  /* treatment/current：用药原文 + 漏服累计 */
  const tx = await go('treatment/current')
  t('TX1', 'treatment/current 列熊去氧胆酸原文与漏服累计 1 次（0+1 读时算）', tx.text.includes('熊去氧胆酸片') && tx.text.includes('获批状态未核实') && tx.text.includes('累计漏服 1 次'), {})
  /* treatment/pathway：折叠卡 + 固定五块声明 */
  const pw = await go('treatment/pathway')
  const pwFolds = await page.evaluate(() => document.querySelectorAll('#view details.phase-fold').length)
  t('PW1', 'treatment/pathway 折叠卡 ≥2 张且五块声明在场', pwFolds >= 2 && pw.text.includes('每张卡固定五块'), { folds: pwFolds })
  /* labs/cards：ALP 值、CTCAE 对照徽章、分组系列 */
  const lc = await go('labs/cards')
  const lcStats = await page.evaluate(() => ({
    mcards: document.querySelectorAll('#view .mcard').length,
    series: document.querySelectorAll('#view .metric-series').length
  }))
  t('LC1', 'labs/cards 显示 ALP 258 与 CTCAE 对照徽章（258/120 → 1 级）', lc.text.includes('碱性磷酸酶 ALP') && lc.text.includes('258') && lc.text.includes('对照 CTCAE v5.0 · 1 级'), {})
  t('LC2', 'labs/cards 按系列分组（≥5 组）且指标卡 ≥10 张', lcStats.series >= 5 && lcStats.mcards >= 10, lcStats)
  /* labs/chart：三条默认线 + 口径说明 */
  const lch = await go('labs/chart')
  const lchSvg = await page.evaluate(() => ({
    paths: document.querySelectorAll('#view svg.chart path[fill="none"]').length,
    circles: document.querySelectorAll('#view svg.chart circle').length,
    legend: [...document.querySelectorAll('#view .chart-legend .legend-item')].map(x => x.textContent.trim())
  }))
  t('LCH1', 'labs/chart 默认 ALP/GGT/TBil 三条线（path=3、点 >0、图例齐）', lchSvg.paths === 3 && lchSvg.circles >= 3 && lchSvg.legend.join(',').includes('ALP') && lch.text.includes('各自归一化'), lchSvg)
  /* labs/grading：三种徽章说明 + 本次可分级计数 */
  const lg = await go('labs/grading')
  t('LG1', 'labs/grading 三种徽章说明 + 可分级/缺上限计数在场', lg.text.includes('需参考上限') && lg.text.includes('未分级') && lg.text.includes('本次可分级项') && lg.text.includes('缺上限项'), {})
  /* symptoms/itch：滑杆真实值 */
  const si = await go('symptoms/itch')
  const siSlider = await page.evaluate(() => ({ v: document.querySelector('#itch')?.value, save: !!document.querySelector('#save-itch') }))
  t('SI1', 'symptoms/itch 滑杆 0–10 真实存在（默认 5，保存按钮在场）', siSlider.v === '5' && siSlider.save && si.text.includes('不是医学量表'), siSlider)
  /* symptoms/fatigue：三档分段 */
  const sf = await go('symptoms/fatigue')
  const sfSeg = await page.evaluate(() => document.querySelectorAll('#view [data-fatigue]').length)
  t('SF1', 'symptoms/fatigue 三档分段（能完成/勉强/做不了）', sfSeg === 3 && sf.text.includes('不是乏力分级量表'), { seg: sfSeg })
  /* symptoms/log：并列「感受 vs 同日指标」 */
  const sl = await go('symptoms/log')
  t('SL1', 'symptoms/log 列 2 条感受 + 同日 ALP 并列（痒 3/10、说不上来）', sl.text.includes('共 2 条') && sl.text.includes('痒 3/10') && sl.text.includes('说不上来，就是没劲') && sl.text.includes('同日指标'), {})
  /* symptoms/impact：读时算计数 */
  const sp = await go('symptoms/impact')
  t('SP1', 'symptoms/impact 夜间加重 0/2 条、睡眠打断 0 次（读时算）', sp.text.includes('夜间加重的记录') && sp.text.includes('0 / 2 条') && sp.text.includes('睡眠被打断累计') && sp.text.includes('0 次'), {})
  /* screening/mrcp（A）：报告原文 */
  const sm = await go('screening/mrcp')
  t('SM1', 'screening/mrcp 照抄报告原文（肝内外胆管多节段狭窄伴扩张）', sm.text.includes('MRCP（胆管成像）') && sm.text.includes('肝内外胆管多节段狭窄伴扩张'), {})
  /* screening/fibroscan（A）：无记录空态 */
  const sfb = await go('screening/fibroscan')
  t('SFB1', 'screening/fibroscan（A）无记录如实空态 + 记录表单在场', sfb.text.includes('还没有记录') && sfb.text.includes('记一次肝脏弹性（FibroScan）的结果'), {})
  /* screening/endoscopy（A）：空态；B 档有记录时另有断言（BEP1） */
  const sen = await go('screening/endoscopy')
  t('SEN1', 'screening/endoscopy（A）无记录空态', sen.text.includes('还没有记录') && sen.text.includes('胃镜'), {})
  /* followup/cadence：起点 +6/+12 个月，月末夹取口径 */
  const fc = await go('followup/cadence')
  const node12 = expectedCadenceNode('2026-10-21', 12)
  t('FC1', 'followup/cadence 两个参考节点（+6 月 ' + node6 + '、+12 月 ' + node12 + '）', fc.text.includes(node6) && fc.text.includes(node12) && fc.text.includes('±30 天为显示带宽'), {})
  /* followup/prep：问题清单 checkbox 数与档案一致 */
  const fp = await go('followup/prep')
  const fpChecks = await page.evaluate(() => document.querySelectorAll('#view input[type="checkbox"]').length)
  t('FP1', 'followup/prep 3 条待问问题（checkbox 数=3）+ 加清单入口', fpChecks === 3 && fp.text.includes('加进清单') && fp.text.includes('ALP 多少算降下来了'), { checks: fpChecks })
  /* followup/todos：待问条数与未勾选数一致 */
  const ft = await go('followup/todos')
  t('FT1', 'followup/todos 待问 3 条（读 questions undone）', ft.text.includes('待问医生的') && ft.text.includes('3 条'), {})
  /* records/import：候选逐项核对 + 零副作用声明 */
  const ri = await go('records/import')
  t('RI1', 'records/import 候选 3 项 + 确认/拒收双按钮 + 零副作用口径', ri.text.includes('候选（逐项核对）') && ri.text.includes('确认这 3 项') && ri.text.includes('全部拒收') && ri.text.includes('拒收不改变任何已存记录'), {})
  /* records/files：原件份数与解析态 */
  const rf = await go('records/files')
  t('RF1', 'records/files 列 2 份原件（1 已解析 1 未解析）', rf.text.includes('2 份') && rf.text.includes('2026-10 MRCP 报告.pdf') && rf.text.includes('已解析') && rf.text.includes('未解析'), {})
  /* records/export：私密口径在场 */
  const re = await go('records/export')
  t('RE1', 'records/export 声明「私密标记的内容不会进导出」+ 生成快照入口', re.text.includes('导出给医生') && re.text.includes('私密标记的内容不会进导出') && re.text.includes('生成快照'), {})
  /* trials/search（A）：分层卡片（符合/待确认）+ 粗筛符合度 + 口径 */
  const ts = await go('trials/search')
  const tsCards = await page.evaluate(() => document.querySelectorAll('#view .trial-card').length)
  t('TS1', 'trials/search（A）分层卡片 1 张：符合 1 / 待确认 1 / 粗筛符合度大字', tsCards === 1 && ts.text.includes('符合 1') && ts.text.includes('待确认 1') && ts.text.includes('粗筛符合度') && ts.text.includes('用来对照的病理特点'), { cards: tsCards })
  t('TS2', 'trials/search 口径：登记状态未核实 + 不产出综合分 + 硬性单列', ts.text.includes('登记状态，未核实') && ts.text.includes('硬性'), {})
  /* trials/saved / trials/sources */
  const tv = await go('trials/saved')
  t('TV1', 'trials/saved 空收藏态（收藏存本机）', tv.text.includes('还没有收藏') && tv.text.includes('存'), {})
  const tc = await go('trials/sources')
  t('TC1', 'trials/sources 列 4 个来源 + PSC 未配置诚实声明', tc.text.includes('WHO ICTRP') && tc.text.includes('ChiCTR') && tc.text.includes('未配置'), {})
  /* treatment/sideeffects：不归因不评级 */
  const se = await go('treatment/sideeffects')
  t('SE1', 'treatment/sideeffects 只记时间与原文（不归因、不评级）', se.text.includes('副作用记录') && se.text.includes('不归因、不评级'), {})

  /* ---------- C10：prefers-reduced-motion 下曲线可见（无入场动画遮挡） ---------- */
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const rm = await go('labs/chart')
  const rmChart = await page.evaluate(() => {
    const path = document.querySelector('#view svg.chart path[fill="none"]')
    if (!path) return { exists: false }
    const off = parseFloat(getComputedStyle(path).strokeDashoffset) || 0
    const bb = path.getBoundingClientRect()
    return { exists: true, dashoffset: off, len: path.getTotalLength(), visible: bb.width > 0 || path.getAttribute('d').length > 10 }
  })
  t('C10', 'prefers-reduced-motion 下曲线可见（path 存在、dashoffset=0、有真实 d）', rmChart.exists && rmChart.dashoffset === 0 && rmChart.len > 10, rmChart)
  await page.emulateMediaFeatures([])

  /* ---------- Q35 隐私三出口：注入私密症状 → 看板摘要 / 导出预览 / AI 上下文排除 ---------- */
  await page.evaluate(() => {
    const a = window.__PSC_APP__
    a.state.localSymptoms.push({
      date: '2026-11-12', itch: 9, nightWorse: true, scratch: true, sleepBreaks: 3,
      fatigue: 3, note: '【私密注入】凌晨三点痒醒', visibility: 'private',
    })
  })
  const privDash = await go('dashboard/overview')
  /* 看板「最近一次记录的感受」只列数字与日期：私密条（2026-11-12，痒 9）不进，
     回退到最近一条共享记录（2026-11-01，痒 3/10 · 累 2/3）。 */
  t('Q35a', '看板摘要排除私密记录（最近感受回退到共享条 2026-11-01，不是私密 11-12）', privDash.text.includes('痒 3/10 · 累 2/3') && privDash.text.includes('2026-11-01') && !privDash.text.includes('痒 9/10') && !privDash.text.includes('【私密注入】'), {})
  const privCtx = await page.evaluate(() => window.__PSC_APP__.draftContext('看板'))
  t('Q35c', 'AI 上下文（draftContext）排除私密感受（痒取共享最近 3/10，非私密 9/10）', privCtx.includes('痒 3/10') && !privCtx.includes('【私密注入】'), { ctx: privCtx.slice(-40) })
  const privLog = await go('symptoms/log')
  t('Q35d', '本机「我的记录」仍可见私密条（3 条），只对外出口过滤', privLog.text.includes('共 3 条') && privLog.text.includes('【私密注入】'), {})
  /* 导出预览（整页视图层）：私密排除 + 条数说明 */
  await go('records/export')
  const histBefore = await page.evaluate(() => history.length)
  await page.evaluate(() => document.querySelector('#do-export').click())
  await page.waitForSelector('.pv-overlay:not([hidden])', { timeout: 3000 })
  await sleep(100)
  const pv = await page.evaluate(() => {
    const o = document.querySelector('.pv-overlay')
    const r = o.getBoundingClientRect()
    return {
      visible: !o.hidden && r.height > window.innerHeight * 0.8,
      hasBack: !!o.querySelector('[data-pv="back"]'),
      hasClose: !!o.querySelector('[data-pv="close"]'),
      title: o.querySelector('.pv-title').textContent,
      bodyText: o.querySelector('.pv-body').innerText,
      hist: history.length,
      statePv: (history.state && history.state.pv) || null,
      hash: location.hash
    }
  })
  /* 注：Chrome 的 history.length 有 ~50 上限，30 路由走完已饱和，不能用它断言入栈；
     改断 pushState 真实写入了 {pv:1}（A2 再用 Esc→history.back 验证出栈）。 */
  t('A1', '导出预览整页层打开（高度≥80%视口、返回+关闭双入口、pushState {pv:1} 进 #page-view）', pv.visible && pv.hasBack && pv.hasClose && pv.statePv === 1 && pv.hash === '#page-view', { visible: pv.visible, statePv: pv.statePv, hash: pv.hash })
  t('Q35b', '导出预览排除私密原文并给出「已排除私密 1 条」说明（共享感受仍在）', !pv.bodyText.includes('【私密注入】') && pv.bodyText.includes('已排除私密 1 条') && pv.bodyText.includes('说不上来，就是没劲') && pv.bodyText.includes('【感受记录】'), {})
  t('A9', '导出预览标题无「未命名」且与内容一致', pv.title === '导出预览', { title: pv.title })
  await page.keyboard.press('Escape')
  await sleep(500)
  const pvClosed = await page.evaluate(() => ({ hidden: document.querySelector('.pv-overlay').hidden, hash: location.hash }))
  t('A2', 'Esc 关一层（预览层关闭、hash 回到子页路由）', pvClosed.hidden && pvClosed.hash === '#records/export', pvClosed)

  /* ---------- Q14/Q17/Q19：AI 按钮与草稿（EMBEDDED=false 独立打开：本地演示出口 + 诚实文案） ---------- */
  await page.evaluate(() => {
    window.__drafts__ = []
    window.__msgs__ = []
    document.addEventListener('pbc:agent-draft', (e) => window.__drafts__.push({ prompt: e.detail && e.detail.prompt, context: e.detail && e.detail.context, channel: e.detail && e.detail.channel }))
    window.addEventListener('message', (e) => window.__msgs__.push(e.data && e.data.type))
  })
  await go('labs/cards')
  await page.evaluate(() => document.querySelector('[data-draft]').focus())
  await page.click('[data-draft]')
  await sleep(150)
  const draft = await page.evaluate(() => ({
    toastHidden: document.querySelector('#toast').hidden,
    toastText: document.querySelector('#toast').textContent,
    drafts: window.__drafts__,
    msgs: window.__msgs__
  }))
  t('Q14', '页面「AI 帮我填」派发本地草稿事件（prompt+context 到 pbc:agent-draft）', draft.drafts.length === 1 && draft.drafts[0].prompt.includes('化验') && draft.drafts[0].context.includes('档案 A'), draft.drafts[0] ? draft.drafts[0].prompt : draft.drafts)
  t('Q17', '草稿只填不发（独立打开无 postMessage、无私密上下文泄漏）', draft.msgs.length === 0 && !draft.drafts[0].context.includes('【私密注入】'), { msgs: draft.msgs })
  t('Q19b', '独立打开时文案诚实：明说「没有会话面板」（原型态不假装已接通）', !draft.toastHidden && draft.toastText.includes('独立打开时没有会话面板'), { toast: draft.toastText })
  await page.click('#btn-ai')
  await sleep(150)
  const aiToast = await page.evaluate(() => ({ hidden: document.querySelector('#toast').hidden, text: document.querySelector('#toast').textContent }))
  t('Q19', '顶栏「对话」独立打开时明说没有会话面板（EMBEDDED=false 实际行为）', !aiToast.hidden && aiToast.text.includes('独立打开时没有会话面板'), { toast: aiToast.text })

  /* ---------- MT13：档案 A/B 切换不串档（B 特有内容出现→切回消失） ---------- */
  await page.click('#profile-btn')
  await sleep(200)
  const bLabel = await page.evaluate(() => ({ footer: document.querySelector('#footer-profile').textContent, key: window.__PSC_APP__.state.profileKey }))
  const cbB = await go('basics/comorbidity')
  t('MT13a', '切到档案 B：合并症出现 B 特有「溃疡性结肠炎」', bLabel.key === 'B' && cbB.text.includes('溃疡性结肠炎'), { footer: bLabel.footer })
  const epB = await go('episodes/list')
  const epB2 = await page.evaluate(() => {
    /* 行动计划原文在折叠 details 里：先全部展开再读 innerText（先证非空再断言） */
    document.querySelectorAll('#view details.phase-fold').forEach((d) => { d.open = true })
    return { folds: document.querySelectorAll('#view details.phase-fold').length, text: document.querySelector('#view').innerText }
  })
  t('EP2', 'episodes/list（B）3 次发作折叠卡 + 行动计划原文在场 + 近 90 天 0 次如实', epB2.folds === 3 && epB2.text.includes('近 90 天发作 0 次') && epB2.text.includes('当天联系肝胆科值班电话') && epB2.text.includes('2025-01-18 起的发作'), { folds: epB2.folds })
  const tsB = await go('trials/search')
  const tsBCards = await page.evaluate(() => document.querySelectorAll('#view .trial-card').length)
  t('TS3', 'trials/search（B）分层卡片 2 张（长期随访 + 发作频率研究）', tsBCards === 2 && tsB.text.includes('PSC 长期随访观察研究') && tsB.text.includes('PSC 胆管炎发作频率研究'), { cards: tsBCards })
  const bep = await go('screening/endoscopy')
  t('BEP1', 'screening/endoscopy（B）有记录 + 距上次月数 + 参考间隔 12–24 个月', bep.text.includes('食管下段轻度静脉曲张') && bep.text.includes('距上次') && bep.text.includes('12–24 个月'), {})
  const lcB = await go('labs/cards')
  t('LC3', 'labs/cards（B）ALP 卡与分组系列仍在（B 档最近一次化验）', lcB.text.includes('碱性磷酸酶 ALP') && lcB.text.includes('参考上限'), {})
  await page.click('#profile-btn')
  await sleep(200)
  const aBack = await page.evaluate(() => ({ footer: document.querySelector('#footer-profile').textContent, key: window.__PSC_APP__.state.profileKey }))
  const cbBack = await go('basics/comorbidity')
  const epBack = await go('episodes/list')
  t('MT13b', '切回档案 A：溃疡性结肠炎消失、发作回空态（MT13 不串档）', aBack.key === 'A' && !cbBack.text.includes('溃疡性结肠炎') && cbBack.text.includes('未见合并症记录') && epBack.text.includes('还没有发作记录') && !epBack.text.includes('当天联系肝胆科值班电话'), { footer: aBack.footer })

  /* ---------- C9：390 宽无横向溢出（CDP 设备仿真） ---------- */
  const client = await page.target().createCDPSession()
  await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await sleep(300)
  const narrow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  await client.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewport({ width: 1280, height: 860 })
  await sleep(300)
  t('C9', '390 宽无横向溢出（scrollWidth===clientWidth===390）', narrow.sw === 390 && narrow.cw === 390, narrow)

  /* ---------- 全局页面错误 ---------- */
  t('ERR', '全程无页面错误（pageerror/console.error）', errors.length === 0, errors.slice(0, 3))

  await browser.close()
  const fails = results.filter(r => !r.pass)
  const counts = { total: results.length, pass: results.length - fails.length, fail: fails.length }
  console.log(`\nSUMMARY: ${counts.pass}/${counts.total} pass, ${counts.fail} fail` + (fails.length ? ' → ' + fails.map(f => f.id).join(', ') : ''))
  console.log('SUMMARY_JSON ' + JSON.stringify({ pass: fails.length === 0, counts }))
  process.exit(fails.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })

#!/usr/bin/env node
/**
 * public/ 定点移植（小胆宝 DuctPal · PSC 版）：**复制原型 → 定点替换**，不手抄。
 *
 * 替换点（只有这些，其它与原型逐字符相同——ui-parity 口径）：
 *   1. index.html：加 noindex；状态行改开发版措辞；版本 chip 与页脚构建号
 *      走 __VERSION_DISPLAY__ 占位（server.js 注入，两种形态同一份文件）；
 *   2. app.js：VERSION 常量走占位符；boot 后追加「bootstrap 混合数据源」块——
 *      宿主形态拉 /api/psc/bootstrap（读模型还原 demo 形状，parity 由测试断言），
 *      档案列表/切换走服务端；file:// 与拉取失败一律回退演示数据并明示「未连接服务」
 *      （禁裸 throw，禁白屏）。
 *   3. style.css / demo-data.js / primer-data.js / primer.js / primer.css / bridge.js：逐字节复制。
 *
 * 用法：node scripts/migrate-public.mjs [--check]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, 'prototypes/v0.2');
const OUT = join(ROOT, 'public');
const CHECK = process.argv.includes('--check');
const FILES = ['index.html', 'app.js', 'style.css', 'demo-data.js', 'primer-data.js', 'primer.js', 'primer.css', 'bridge.js'];

const TITLE_OLD = '<title>小胆宝 DuctPal · PSC 工作台（原型）</title>';
const TITLE_NEW = '<title>小胆宝 DuctPal · PSC 工作台</title>\n<meta name="robots" content="noindex,nofollow">';
const BAR_OLD = '<p class="statusline" id="statusline">记录不是诊断 · 处置由治疗团队判断</p>';
const BAR_NEW = '<p class="statusline" id="statusline">开发版 · 本机数据 · 不上传 · AI 面板由宿主提供 · 业务数据仍为演示内容直到导入真实资料</p>';
const CHIP_OLD = '<span class="version-chip" id="version-chip">v0.1.0 · 原型</span>';
const CHIP_NEW = '<span class="version-chip" id="version-chip">__VERSION_DISPLAY__ · 开发版</span>';
const FOOT_OLD = '<span id="footer-built">原型 v0.1.0</span>';
const FOOT_NEW = '<span id="footer-built">开发版 __VERSION_DISPLAY__</span>';
const APPINFO_OLD = "const VERSION = 'v0.1.0'";
const APPINFO_NEW = "const VERSION = '__VERSION_DISPLAY__'";

const BOOT_BLOCK = `

/* ── 开发版数据源（scripts/migrate-public.mjs 注入点；原型无此块）──
   宿主形态优先 bootstrap（读模型还原 demo 形状，parity 由测试断言）；
   file:// 与拉取失败回退演示数据并明示「未连接服务」：不裸 throw、不白屏。 */
;(function () {
  var apiBase = "__API_BASE__"; /* 令牌会被宿主注入成字符串字面量；禁止把令牌挂在 window 对象上（注入后会语法错误） */
  if (location.protocol === 'file:') return; /* 独立双击打开：走演示态，未接通后端，页面已明说 */
  function offlineBanner() {
    document.body.insertAdjacentHTML('afterbegin',
      '<div role="status" style="background:#FBF1DF;color:#A8681E;padding:10px 14px;border-bottom:1px solid #E6CDA4">'
      + '未连接服务：当前显示演示数据（合成示例）。启动 DSH Desktop 工作台服务后刷新即可载入本机档案。</div>')
  }
  fetch(apiBase + '/bootstrap').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  }).then(function (b) {
    if (!b || !Array.isArray(b.profiles) || !b.profiles.length) throw new Error('bootstrap 形状不符')
    window.DEMO.profiles = b.profiles
    window.DEMO.trialMatch = b.trialMatch || {}
    var app = window.__PSC_APP__
    if (app && app.render) {
      var first = b.profiles[0]
      app.state.profileKey = first.key
      app.state.view = 'dashboard'
      app.state.sub = 'overview'
      app.state.localSymptoms = []
      app.render()
      var footer = document.getElementById('footer-profile')
      if (footer && first.label) footer.textContent = first.label
    }
    window.__PSC_API_BASE__ = apiBase
    console.info('[psc] 已切换到本机数据库数据（' + b.profiles.length + ' 个档案）')
  }).catch(function (e) {
    offlineBanner()
    console.warn('[psc] bootstrap 不可用，继续使用演示数据：', String(e && e.message || e))
  })

  /* 档案列表从服务端来（含本机新建档案，profile_key 随行）；demo 的 A/B 与本机档案并存 */
  fetch(apiBase + '/subjects').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  }).then(function (d) {
    window.__PSC_SUBJECTS__ = (d && d.subjects || []).map(function (s) { return s })
    console.info('[psc] 档案列表已从服务端载入（' + window.__PSC_SUBJECTS__.length + ' 个，含演示档案）')
  }).catch(function (e) {
    console.warn('[psc] /subjects 不可用，档案切换退回演示两档案：', String(e && e.message || e))
  })

  /* 档案切换走 API 数据：拦截 #profile-btn（捕获阶段），在服务端档案列表里轮转 */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#profile-btn')
    if (!btn) return
    e.stopPropagation()
    var list = (window.DEMO && window.DEMO.profiles) || []
    if (!list.length) return
    var app = window.__PSC_APP__
    if (!app || !app.render) return
    var cur = app.state.profileKey
    var idx = -1
    for (var i = 0; i < list.length; i++) { if (list[i].key === cur) { idx = i; break } }
    var next = list[(idx + 1) % list.length]
    app.state.profileKey = next.key
    app.state.localSymptoms = []
    app.render()
    var footer = document.getElementById('footer-profile')
    if (footer && next.label) footer.textContent = next.label
  }, true)

  /* 新建档案（真实用户数据，is_demo=0）：POST /api/psc/subjects，成功后并入档案列表 */
  function emptyProfile(key, name) {
    return {
      key: key, label: name, name: name, age: null, sex: null, diagnosedAt: null, startedAt: null,
      weightKg: null, antibodies: { panca: 'untested', ana: 'untested', note: '' },
      fibrosis: null, ibd: { type: 'untested', note: '', colonoscopyLast: null },
      comorbidity: [], meds: [], adherence: [], episodes: [], symptoms: [], screening: [],
      questions: [], documents: [], trials: [], pathway: [], labs: [],
    }
  }
  function createSubject() {
    var name = window.prompt('新建档案：给这份档案起个名字（如「自己」「替家人代记」）')
    if (!name || !name.trim()) return
    fetch(apiBase + '/subjects', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b } }) }).then(function (r) {
      if (!r.ok || !r.body || !r.body.profileKey) {
        window.alert((r.body && r.body.error) || '新建档案失败')
        return
      }
      var p = emptyProfile(r.body.profileKey, r.body.name || name.trim())
      window.DEMO.profiles.push(p)
      var app = window.__PSC_APP__
      if (app && app.render) {
        app.state.profileKey = p.key
        app.state.localSymptoms = []
        app.render()
        var footer = document.getElementById('footer-profile')
        if (footer) footer.textContent = p.label
      }
      if (window.__PSC_SUBJECTS__) {
        window.__PSC_SUBJECTS__.push({ profile_key: p.key, name: p.name, is_demo: 0 })
      }
    }).catch(function (e) {
      window.alert('新建档案请求失败：' + String(e && e.message || e))
    })
  }
  var actions = document.querySelector('.actions')
  if (actions) {
    var addBtn = document.createElement('button')
    addBtn.type = 'button'
    addBtn.className = 'btn ghost'
    addBtn.textContent = '＋ 新建档案'
    addBtn.addEventListener('click', function (e) { e.stopPropagation(); createSubject() })
    actions.insertBefore(addBtn, actions.firstChild)
  }
})();`

function migrateIndex(s) {
  return s
    .replace(TITLE_OLD, TITLE_NEW)
    .replace(BAR_OLD, BAR_NEW)
    .replace(CHIP_OLD, CHIP_NEW)
    .replace(FOOT_OLD, FOOT_NEW);
}

function migrateApp(s) {
  return s.replace(APPINFO_OLD, APPINFO_NEW) + BOOT_BLOCK;
}

function expected(name) {
  const src = readFileSync(join(SRC, name), 'utf8');
  if (name === 'index.html') return migrateIndex(src);
  if (name === 'app.js') return migrateApp(src);
  return src;
}

export { FILES, migrateIndex, migrateApp, expected, SRC, OUT };

function check() {
  const problems = [];
  for (const f of FILES) {
    let current = '';
    try { current = readFileSync(join(OUT, f), 'utf8'); } catch { problems.push(`public/${f} 缺失（跑 npm run build:public）`); continue; }
    const want = expected(f);
    if (current !== want) problems.push(`public/${f} 与原型定点移植产物不一致（跑 npm run build:public 后人工复核 diff）`);
  }
  if (problems.length) { console.error('✗ public/ 与 prototypes/v0.2 定点移植不一致：\n  ' + problems.join('\n  ')); process.exit(1); }
  console.log(`✓ public/ ${FILES.length} 件与 prototypes/v0.2 定点移植一致（index.html/app.js 仅白名单替换点，其余逐字节相同）`);
}

function build() {
  mkdirSync(OUT, { recursive: true });
  for (const f of FILES) writeFileSync(join(OUT, f), expected(f));
  console.log(`✓ public/ 已从 prototypes/v0.2 定点移植（${FILES.length} 件）`);
}

/* 仅直接执行时跑主流程（被测试/检查器 import 时只取上面的纯函数） */
const INVOKED_DIRECTLY = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
/* Windows/软链兜底：路径比较失败时退回 argv 特征判断 */
const _invoked = INVOKED_DIRECTLY || (process.argv[1] && process.argv[1].endsWith('migrate-public.mjs'));
if (_invoked) {
  if (CHECK) check();
  else build();
}

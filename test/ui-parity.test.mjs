/* ui-parity：public/ 与 prototypes/v0.2 的移植一致性断言
 * 口径（scripts/migrate-public.mjs 定点移植）：
 *   - style.css / demo-data.js / primer-data.js / primer.js / primer.css / bridge.js：与原型**逐字节相同**；
 *   - index.html / app.js：等于「原型 + 白名单替换点」（版本占位符、开发版横幅、bootstrap 数据源块），
 *     除白名单外其余字符与原型一致——业务文件不改字符。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, expected, OUT } from '../scripts/migrate-public.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BYTE_COPY = ['style.css', 'demo-data.js', 'primer-data.js', 'primer.js', 'primer.css', 'bridge.js'];

test('ui-parity: 六件纯复制文件与原型逐字节相同', () => {
  for (const f of BYTE_COPY) {
    const proto = readFileSync(join(ROOT, 'prototypes/v0.2', f));
    const pub = readFileSync(join(OUT, f));
    assert.ok(proto.equals(pub), `public/${f} 与原型逐字节不一致`);
  }
});

test('ui-parity: index.html / app.js 等于「原型 + 白名单替换点」产物', () => {
  for (const f of FILES) {
    const pub = readFileSync(join(OUT, f), 'utf8');
    assert.equal(pub, expected(f), `public/${f} 与定点移植产物不一致（白名单之外被改动）`);
  }
});

test('ui-parity: app.js 只追加不修改（原型主体是产物的前缀）', () => {
  const proto = readFileSync(join(ROOT, 'prototypes/v0.2/app.js'), 'utf8');
  const pub = readFileSync(join(OUT, 'app.js'), 'utf8');
  assert.ok(pub.startsWith(proto.replace(
    "const VERSION = 'v0.1.0'",
    "const VERSION = '__VERSION_DISPLAY__'")), 'app.js 主体不是原型前缀');
  assert.ok(pub.length > proto.length, 'app.js 追加块缺失');
  assert.ok(pub.includes('未连接服务'), '追加块必须明示「未连接服务」降级文案');
  assert.ok(pub.includes(apiBaseLiteral()), '追加块 fetch 失败必须降级回 demo 数据（apiBase 字面量注入面）');
});

function apiBaseLiteral() {
  return 'var apiBase = "__API_BASE__"';
}

test('ui-parity: index.html 替换点只允许 4 处（标题/状态行/版本 chip/页脚构建号）', () => {
  const proto = readFileSync(join(ROOT, 'prototypes/v0.2/index.html'), 'utf8');
  const pub = readFileSync(join(OUT, 'index.html'), 'utf8');
  const spots = [
    ['<title>小胆宝 DuctPal · PSC 工作台（原型）</title>', '<title>小胆宝 DuctPal · PSC 工作台</title>'],
    ['记录不是诊断 · 处置由治疗团队判断', '开发版 · 本机数据 · 不上传'],
    ['<span class="version-chip" id="version-chip">v0.1.0 · 原型</span>', '<span class="version-chip" id="version-chip">__VERSION_DISPLAY__ · 开发版</span>'],
    ['<span id="footer-built">原型 v0.1.0</span>', '<span id="footer-built">开发版 __VERSION_DISPLAY__</span>'],
  ];
  for (const [oldSeg, newSeg] of spots) {
    assert.ok(proto.includes(oldSeg), `原型缺基准段：${oldSeg.slice(0, 40)}`);
    assert.ok(pub.includes(newSeg), `public/index.html 缺替换段：${newSeg.slice(0, 40)}`);
  }
  /* 除替换点外逐行一致：把替换段换回原型写法后应与原型完全相同 */
  let reverted = pub
    .replace('<title>小胆宝 DuctPal · PSC 工作台</title>\n<meta name="robots" content="noindex,nofollow">', '<title>小胆宝 DuctPal · PSC 工作台（原型）</title>')
    .replace('<p class="statusline" id="statusline">开发版 · 本机数据 · 不上传 · AI 面板由宿主提供 · 业务数据仍为演示内容直到导入真实资料</p>', '<p class="statusline" id="statusline">记录不是诊断 · 处置由治疗团队判断</p>')
    .replace('<span class="version-chip" id="version-chip">__VERSION_DISPLAY__ · 开发版</span>', '<span class="version-chip" id="version-chip">v0.1.0 · 原型</span>')
    .replace('<span id="footer-built">开发版 __VERSION_DISPLAY__</span>', '<span id="footer-built">原型 v0.1.0</span>');
  assert.equal(reverted, proto, 'index.html 白名单之外存在字符改动');
});

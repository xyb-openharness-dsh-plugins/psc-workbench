import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* 用桩件跑 Workbench 层（Schemastery 是宿主 peer 依赖，dsh/index.js 的 Config 行不可在本仓 import；
   apply() 的 wiring 由 scripts/smoke-activate.mjs 覆盖，这里测等价的服务端行为）。 */
test('Workbench：开库→播种→bootstrap→关闭 幂等', async () => {
  const { Workbench } = await import('../dsh/workbench.js');
  const root = mkdtempSync(join(tmpdir(), 'psc-apply-'));
  const wb = new Workbench({ root });
  wb.open();
  wb.open(); // 幂等
  const b1 = wb.bootstrap();
  const b2 = wb.bootstrap();
  if (JSON.stringify(b1) !== JSON.stringify(b2)) throw new Error('bootstrap 不稳定');
  if (wb.stats.hasDemo !== true) throw new Error('演示数据未播种');
  const st = wb.status();
  if (!st.capabilities.includes('health')) throw new Error('capabilities 缺 health');
  wb.close();
  wb.close(); // 幂等
});

test('root 缺失时给出可读错误，不裸 throw 白屏', async () => {
  const { Workbench } = await import('../dsh/workbench.js');
  let msg = '';
  try { new Workbench({}); } catch (e) { msg = e.message; }
  if (!/root/.test(msg)) throw new Error('错误信息未指向 root：' + msg);
});

test('静态服务：路径穿越被拒、SPA 兜底回 index.html', async () => {
  const { resolveStatic } = await import('../dsh/server.js');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const pub = join(ROOT, 'public');
  if (resolveStatic(pub, '/../etc/passwd') !== null) throw new Error('路径穿越未被拒');
  if (resolveStatic(pub, 'a/../../package.json') !== null) throw new Error('.. 穿越未被拒');
  if (!resolveStatic(pub, '/index.html')) throw new Error('index.html 应可解析');
  if (resolveStatic(pub, '/nope.js') !== null) throw new Error('不存在文件应返回 null（走 SPA 兜底）');
});

test('服务时注入：__API_BASE__/__VERSION_DISPLAY__ 两种形态同一份 public', async () => {
  const { injectTokens } = await import('../dsh/server.js');
  const html = '<b>__VERSION_DISPLAY__</b><i>__API_BASE__</i>';
  const hosted = injectTokens(html, { apiBase: '/api/psc', version: '0.2.0', displayVersion: 'v0.2.0' });
  if (hosted !== '<b>v0.2.0</b><i>/api/psc</i>') throw new Error('宿主形态注入不对：' + hosted);
  const standalone = injectTokens(html, { apiBase: '', version: '0.2.0', displayVersion: 'v0.2.0' });
  if (standalone !== '<b>v0.2.0</b><i></i>') throw new Error('独立形态注入不对：' + standalone);
});

test('档案管理：新建（is_demo=0）/ 列表 / 删除（demo A/B 不可删）', async () => {
  const { Workbench } = await import('../dsh/workbench.js');
  const { rmSync } = await import('node:fs');
  const root = mkdtempSync(join(tmpdir(), 'psc-subjects-'));
  const wb = new Workbench({ root });
  wb.open();
  try {
    const created = wb.createSubject({ name: '替家人代记' });
    assert.ok(created.profileKey.startsWith('local-'), '本机档案键 local- 前缀（不与 demo 撞键）');
    const list = wb.subjects();
    assert.equal(list.length, 3, 'demo A/B + 新建 1 个');
    const mine = list.find((s) => s.profileKey === created.profileKey);
    assert.equal(mine.isDemo, false, '新建档案不是 demo');
    assert.equal(list.find((s) => s.profileKey === 'A').isDemo, true, 'demo 档案带 is_demo 标记');
    assert.throws(() => wb.deleteSubject('A'), 'demo 档案不删除');
    assert.equal(wb.deleteSubject(created.profileKey).deleted, created.profileKey, '本机档案可删');
    assert.throws(() => wb.createSubject({ name: '' }), '空档案名拒绝');
  } finally { wb.close(); rmSync(root, { recursive: true, force: true }); }
});

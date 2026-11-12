/* 读模型测试：派生值读时算不落库、私密三出口过滤、ORDER BY rowid 稳定读序 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function freshDb() {
  const db = new DatabaseSync(':memory:');
  for (const f of readdirSync(join(ROOT, 'schema')).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()) {
    db.exec(readFileSync(join(ROOT, 'schema', f), 'utf-8'));
  }
  return db;
}

async function seeded() {
  const db = freshDb();
  const demo = await import(join(ROOT, 'dsh/demo.js'));
  demo.seedDemoData(db);
  const rm = await import(join(ROOT, 'dsh/readmodels.js'));
  return { db, rm };
}

test('派生值读时算：缓解中第 N 天 / 距上次发作 N 天 / 近 90 天发作次数（以 2026-11-13 复算）', async () => {
  const { db, rm } = await seeded();
  const a = rm.readDerivedStatus(db, 'A', '2026-11-13');
  /* A 档案刚确诊、无发作记录 → 缓解中但没有锚点（dayN/sinceLast 都是 null，不编数） */
  assert.equal(a.mode, '缓解中');
  assert.equal(a.dayN, null);
  assert.equal(a.nearCount, 0);
  assert.equal(a.privateEpisodes, 0);
  assert.equal(a.followupDayN, 23, '随访第 N 天 = 距开始用药日 2026-10-21 的天数（读时算）');

  const b = rm.readDerivedStatus(db, 'B', '2026-11-13');
  /* B 档案 3 次发作全部已记缓解：最近一次 2026-05-12 → 缓解中第 186 天、距上次发作 185 天 */
  assert.equal(b.mode, '缓解中');
  assert.equal(b.dayN, 186);
  assert.equal(b.sinceLast, 185);
  assert.equal(b.nearCount, 0, '近 90 天窗口（自 2026-08-15 起）内无发作');
  assert.equal(b.sinceLastColonoscopyMonths, 17, '距上次肠镜 2025-06-18 满 17 个月（读时算，无排程列）');
});

test('派生值：发作中形态（end IS NULL）与私密发作不进聚合', async () => {
  const { db, rm } = await seeded();
  db.prepare("INSERT INTO episode_events (profile_key, start_date, end_date, signs_text, is_private, ver) VALUES ('A', '2026-11-01', NULL, '测试发热', 0, 1)").run();
  const st = rm.readDerivedStatus(db, 'A', '2026-11-13');
  assert.equal(st.mode, '发作中');
  assert.equal(st.dayN, 13, '发作中第 N 天 = 距 start +1');
  assert.equal(st.nearCount, 1, '共享未结束行计入近 90 天');
  db.prepare("INSERT INTO episode_events (profile_key, start_date, end_date, is_private, ver) VALUES ('A', '2026-11-10', NULL, 1, 1)").run();
  const st2 = rm.readDerivedStatus(db, 'A', '2026-11-13');
  assert.equal(st2.privateEpisodes, 1, '私密发作只计条数');
  assert.equal(st2.nearCount, 1, '私密发作不进聚合（共享口径）');
});

test('派生值：无排程列（screening_records 无 next_due，复发/缓解判定列不存在）', async () => {
  const { db } = await seeded();
  const cols = db.prepare('PRAGMA table_info(screening_records)').all().map((c) => c.name);
  assert.ok(!cols.includes('next_due'), '无排程列 next_due');
  const epiCols = db.prepare('PRAGMA table_info(episode_events)').all().map((c) => c.name);
  for (const banned of ['diagnosis', 'risk_level', 'stage', 'remission_flag', 'flare_flag']) {
    assert.ok(!epiCols.includes(banned), `无判读列 ${banned}`);
  }
});

test('三出口：export/ai 出口在读模型层剥掉私密行；dashboard 返回全量含标记', async () => {
  const { db, rm } = await seeded();
  db.prepare("INSERT INTO symptom_notes (profile_key, recorded_on, itch_level, note, is_private, ver) VALUES ('B', '2026-11-12', 9, '【私密注入】', 1, 1)").run();
  for (const exit of ['export', 'ai']) {
    const b = rm.bootstrapForExit(db, exit);
    for (const p of b.profiles) {
      for (const x of [...p.episodes, ...p.symptoms, ...p.screening, ...p.questions, ...p.documents, ...p.comorbidity]) {
        assert.notEqual(x.visibility, 'private', `${exit} 出口存在私密行：${p.key}`);
        assert.notEqual(x.private, true, `${exit} 出口存在私密行：${p.key}`);
      }
    }
    const bb = b.profiles.find((p) => p.key === 'B');
    assert.ok(!JSON.stringify(bb.symptoms).includes('私密注入'), `${exit} 出口不含私密原文`);
  }
  const full = rm.bootstrapForExit(db, 'dashboard');
  const fb = full.profiles.find((p) => p.key === 'B');
  assert.ok(fb.symptoms.some((s) => s.note.includes('私密注入')), 'dashboard 全量（页面显示私密标记）');
});

test('读序稳定：两次 readBootstrap 输出逐字节一致（ORDER BY rowid）', async () => {
  const { db, rm } = await seeded();
  const a = JSON.stringify(rm.readBootstrap(db));
  const b = JSON.stringify(rm.readBootstrap(db));
  assert.equal(a, b);
  /* 反向插入一行后，旧行序不变、新行在尾部 */
  db.prepare("INSERT INTO lab_results (profile_key, metric_key, measured_on, value, unit, method, org, is_private, ver) VALUES ('A', 'Hb', '2026-11-05', 5, 'g/L', '血常规 五分类', '示例市第一医院', 0, 1)").run();
  const again = rm.readBootstrap(db);
  const labs = again.profiles.find((p) => p.key === 'A').labs;
  assert.equal(labs[labs.length - 1].date, '2026-11-05');
  assert.equal(labs[0].date, '2026-10-08');
});

test('section_titles / metric_defs 读出（分节标题进表，不用 subjects 平铺列）', async () => {
  const { db, rm } = await seeded();
  db.prepare("INSERT INTO section_titles (profile_key, key, title, ord) VALUES ('A', 'screening', '筛查随访', 0)").run();
  const titles = rm.readSectionTitles(db, 'A');
  assert.equal(titles.length, 1);
  assert.equal(titles[0].title, '筛查随访');
  const defs = rm.readMetricDefs(db);
  assert.deepEqual(defs.map((m) => m.key), ['ALP', 'GGT', 'TBil', 'ALT', 'AST', 'ALB', 'PLT', 'Hb', 'WBC', 'ANC', 'Cr']);
});

test('单实体读法：labs 带可比组（method+org）、episodes id 确定性合成、documents parse 状态', async () => {
  const { db, rm } = await seeded();
  const labs = rm.readLabs(db, 'B');
  assert.ok(labs.length >= 60, 'B 档案 6 个月 × 11 项化验');
  assert.ok(labs.every((l) => typeof l.org === 'string'), '可比组 org 随行');
  const eps = rm.readEpisodes(db, 'B');
  assert.deepEqual(eps.map((e) => e.id), ['e1', 'e2', 'e3'], '发作 id 按 rowid 序合成（与 demo-data 一致）');
  const docs = rm.readDocuments(db, 'A');
  assert.deepEqual(docs.map((d) => d.parsed), [false, true], 'parse_state 直出（unparsed/parsed，无判读）');
  const scr = rm.readScreening(db, 'A');
  const colo = scr.find((s) => s.kind === 'colonoscopy');
  assert.equal(colo.doneOn, null, '肠镜「已安排未做」= done_on 显式 NULL');
  assert.ok(scr.find((s) => s.kind === 'mrcp').result.includes('节段狭窄'), '筛查结果照录报告原文');
});

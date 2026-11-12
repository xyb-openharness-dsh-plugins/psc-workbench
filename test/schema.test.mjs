/* M5 schema 测试：内存全建（0001+0002 共 20 表）+ 判读列 0 + freeze sha256 一致 + 演示数据可装载 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCHEMA_DIR = join(ROOT, 'schema')

function schemaFiles() {
  return readdirSync(SCHEMA_DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()
}

function build() {
  const db = new DatabaseSync(':memory:')
  for (const f of schemaFiles()) db.exec(readFileSync(join(SCHEMA_DIR, f), 'utf8'))
  return db
}

const SQL1 = readFileSync(join(SCHEMA_DIR, '0001_initial.sql'), 'utf8')
/* 0001 冻结 19 表 + 0002 补 profile_facts = 20 表 */
const EXPECTED_TABLES = ['subjects', 'section_titles', 'metric_defs', 'lab_results', 'metric_group_titles', 'reports', 'hospitals', 'visit_questions', 'symptom_notes', 'viewpoints', 'documents', 'meds', 'episode_events', 'imaging_events', 'screening_records', 'import_batches', 'import_candidates', 'import_conflicts', 'saved_trials', 'profile_facts', 'app_setting']

test('schema：内存全建（0001 冻结 19 表 + 0002 补 2 表，共 21 表）', () => {
  const db = build()
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").all()
  assert.equal(rows.length, 21, `建表数 ${rows.length} != 21`)
  for (const t of EXPECTED_TABLES) assert.ok(rows.some(r => r.name === t), `缺表 ${t}`)
})

test('schema：判读列 0（diagnosis/risk_level/stage/grade/score/next_due 类派生判定不入库）', () => {
  const db = build()
  const banned = ['diagnosis', 'risk_level', 'stage', 'grade', 'score', 'activity', 'severity_level', 'is_conclusion', 'next_due', 'eligible', 'suitability']
  const hits = []
  for (const t of EXPECTED_TABLES) {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name.toLowerCase())
    for (const c of cols) {
      if (banned.some(b => c === b || c.endsWith('_' + b))) hits.push(`${t}.${c}`)
    }
  }
  assert.deepEqual(hits, [], `判读列命中：${hits.join(', ')}`)
})

test('schema：ORDER BY rowid 稳定读序 + 显式 null（episode end NULL=发作未记缓解）', () => {
  const db = build()
  db.prepare("INSERT INTO episode_events (profile_key, start_date, end_date, note) VALUES ('p1', '2026-11-01', NULL, '发作中'), ('p1', '2026-09-01', '2026-09-20', '已缓解')").run()
  const rows = db.prepare("SELECT id, end_date FROM episode_events WHERE profile_key='p1' ORDER BY rowid").all()
  assert.equal(rows[0].end_date, null, '发作中必须显式 NULL（不用空串）')
  assert.equal(rows[1].end_date, '2026-09-20')
  const open = db.prepare("SELECT count(*) AS n FROM episode_events WHERE profile_key='p1' AND end_date IS NULL").get()
  assert.equal(open.n, 1, 'end IS NULL = 发作未记缓解，可据此派生状态卡')
})

test('schema：更正链（ver + superseded_by）与 in_use 候选语义', () => {
  const db = build()
  db.prepare("INSERT INTO metric_defs (key, title, category, unit) VALUES ('ALP', '碱性磷酸酶 ALP', 'cholestasis', 'U/L')").run()
  db.prepare("INSERT INTO lab_results (profile_key, metric_key, value, ver) VALUES ('p1', 'ALP', 318, 1)").run()
  db.prepare("INSERT INTO lab_results (profile_key, metric_key, value, ver, superseded_by) VALUES ('p1', 'ALP', 258, 2, 1)").run()
  const vers = db.prepare("SELECT ver, superseded_by FROM lab_results WHERE profile_key='p1' ORDER BY ver").all()
  assert.deepEqual(vers.map(r => r.ver), [1, 2], '更正=新增版本，历史保留')
  assert.equal(vers[1].superseded_by, 1, 'superseded_by 可链（v2 指向 v1）')
  db.prepare("INSERT INTO import_batches (id, profile_key, imported_on) VALUES ('b1', 'p1', '2026-11-01')").run()
  db.prepare("INSERT INTO import_candidates (batch_id, target_table, payload_json) VALUES ('b1', 'lab_results', '{}')").run()
  const cand = db.prepare('SELECT status FROM import_candidates').get()
  assert.equal(cand.status, 'pending', '候选缺省 pending，不进事实层')
})

test('schema：freeze-contract sha256 与 0001 文件一致', () => {
  const contract = readFileSync(join(ROOT, 'schema/freeze-contract.md'), 'utf8')
  const sha = createHash('sha256').update(SQL1).digest('hex')
  assert.ok(contract.includes(sha), 'freeze-contract 里的 sha256 必须与 0001_initial.sql 实际 hash 一致')
})

test('schema：0002 补充（profile_facts 结构化档案字段 + symptom_notes.scratch 档位事实）', () => {
  const db = build()
  const cols = db.prepare('PRAGMA table_info(symptom_notes)').all().map(c => c.name)
  assert.ok(cols.includes('scratch'), 'symptom_notes.scratch 存在（0002 ALTER ADD）')
  db.prepare("INSERT INTO profile_facts (profile_key, fact_key, fact_value, ver) VALUES ('p1', 'age', '47', 1)").run()
  db.prepare("INSERT INTO profile_facts (profile_key, fact_key, fact_value, ver) VALUES ('p1', 'age', '48', 2)").run()
  const rows = db.prepare("SELECT fact_value FROM profile_facts WHERE profile_key='p1' AND fact_key='age' ORDER BY ver").all()
  assert.deepEqual(rows.map(r => r.fact_value), ['47', '48'], '更正=新 ver，历史行保留')
  db.prepare("INSERT INTO symptom_notes (profile_key, recorded_on, itch_level, scratch) VALUES ('p1', '2026-11-01', 3, 1)").run()
  assert.equal(db.prepare('SELECT scratch FROM symptom_notes').get().scratch, 1, '抓痕档位事实可写')
})

test('演示数据（唯一源）可整体装载且两套档案字段齐备', () => {
  const src = readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf8')
  new Function(src)()
  const data = globalThis.DEMO
  assert.ok(data.profiles.length === 2, '两套档案（A/B）')
  const required = ['meds', 'episodes', 'symptoms', 'screening', 'questions', 'documents', 'trials', 'pathway', 'labs']
  for (const p of data.profiles) {
    for (const k of required) assert.ok(p[k] !== undefined, `${p.key} 缺 ${k}`)
  }
  assert.ok(data.profiles[1].episodes.length >= 3, 'B 档发作 3 次')
  assert.ok(data.profiles[1].labs.length >= 6, 'B 档化验 6 个月')
  assert.equal(data.profiles[0].episodes.length, 0, 'A 档刚确诊：发作空态示例')
  const a = data.profiles[0], b = data.profiles[1]
  assert.ok(a.screening.some(s => s.date == null), 'A 档「已安排未做」筛查条目（显式 NULL）')
  assert.ok(b.episodes.every(e => e.end != null), 'B 档发作都已记缓解')
})

test('metric_defs 与 PSC 指标语境一致（五组系列、无阈值列）', async () => {
  const db = build()
  const demo = await import(join(ROOT, 'dsh/demo.js'))
  demo.seedDemo(db, [])
  const defs = db.prepare('SELECT * FROM metric_defs ORDER BY ord').all()
  const cats = new Set(defs.map(d => d.category))
  assert.deepEqual([...cats], ['cholestasis', 'hepatocell', 'synthesis', 'blood', 'renal'], 'PSC 五组系列')
  for (const d of defs) {
    assert.ok(d.unit, `${d.key} 有单位`)
    assert.ok(!/threshold|cutoff|limit_judg/i.test(Object.keys(d).join(',')), '无阈值判定列')
  }
})

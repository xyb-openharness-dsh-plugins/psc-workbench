/**
 * write-api.test.mjs — 写入闭环四组断言（AHA 0.3.0 合同 · PSC 语义映射）
 *
 * ① 共存：demo（A/B）+ 本机新建档案并存，is_demo 标记随行
 * ② 八类写库与同形回读：addEntry 八个 kind 落表，readSubject 形状与 demo-data 同构
 * ③ 私密两种寻址：数字 rowid 与合成 id（e1/q1/d1）都落到 is_private，且导出口径过滤
 * ④ 错误路径可读：非法 kind / 不存在档案 / 非法日期 / 越界合成 id 都给可读错误，不裸崩
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { Workbench } from '../dsh/workbench.js'

function freshWb() {
  const root = mkdtempSync(join(tmpdir(), 'psc-write-'))
  const wb = new Workbench({ root, seedDemo: true })
  wb.open()
  return { wb, root }
}

test('写链 ① demo 与本机档案共存（demo + 自建 = 3），is_demo 标记随行', () => {
  const { wb, root } = freshWb()
  try {
    assert.equal(wb.subjects().length, 2, '种子 demo 应为 A/B 两份')
    const made = wb.createSubject({ name: '我自己' })
    assert.ok(made.profileKey.startsWith('local-'), '本机档案键以 local- 开头')
    const list = wb.subjects()
    assert.equal(list.length, 3)
    const demo = list.filter((s) => s.isDemo)
    const mine = list.filter((s) => !s.isDemo)
    assert.equal(demo.length, 2)
    assert.equal(mine.length, 1)
    assert.equal(mine[0].name, '我自己')
    /* demo 不可删 */
    assert.throws(() => wb.deleteSubject('A'), /演示档案不删除/)
    wb.deleteSubject(mine[0].profileKey)
    assert.equal(wb.subjects().length, 2)
  } finally { wb.close(); rmSync(root, { recursive: true, force: true }) }
})

test('写链 ② 八个 kind 落库并同形回读（读模型形状与 demo 同构）', () => {
  const { wb, root } = freshWb()
  try {
    const key = wb.createSubject({ name: '写入闭环' }).profileKey
    const rEp = wb.addEntry(key, 'episode', { start: '2026-11-01', signs: '右上腹不适、皮肤发黄（原话）', actionPlan: '医生原话：出现发热就医' })
    assert.ok(rEp.synthId === 'e1', '发作合成 id 与读模型同规则，收到 ' + rEp.synthId)
    const rLab = wb.addEntry(key, 'lab', { metricKey: 'ALP', value: 312, unit: 'U/L', refHigh: 130, measuredOn: '2026-11-10', org: '示例医院' })
    assert.ok(Number.isInteger(rLab.id))
    wb.addEntry(key, 'treatment', { name: '熊去氧胆酸', doseText: '250mg（医嘱原文）', freq: '每日三次', startOn: '2026-11-11' })
    const rQ = wb.addEntry(key, 'question', { question: '这次 ALP 比上次高意味着什么？' })
    assert.equal(rQ.synthId, 'q1')
    const rH = wb.addEntry(key, 'hospital', { name: '示例医院', city: '北京' })
    assert.match(rH.id, /^h/)
    const rR = wb.addEntry(key, 'report', { title: '肝功能化验单 11 月', kind: 'lab', reportDate: '2026-11-10' })
    assert.match(rR.id, /^r/)
    const rD = wb.addEntry(key, 'doc', { name: '出院小结照片', docDate: '2026-11-01' })
    assert.match(rD.id, /^doc/)
    wb.addEntry(key, 'mind', { kind: 'itch', itch: 6, nightWorse: 1, note: '小腿外侧，夜里最痒' })
    /* PSC 专有 kind 也可写 */
    wb.addEntry(key, 'screening', { kind: 'mrcp', doneOn: '2026-11-12', result: '狭窄较前相仿（照录）' })
    wb.addEntry(key, 'imaging', { kind: 'fibroscan', examDate: '2026-11-12', finding: '8.4 kPa（照录，不判肝硬化）' })

    const p = wb.profile(key)
    assert.equal(p.episodes.length, 1)
    assert.equal(p.episodes[0].id, 'e1')
    assert.equal(p.episodes[0].signs, '右上腹不适、皮肤发黄（原话）')
    assert.equal(p.labs.length, 1)
    assert.equal(p.labs[0].items[0].code, 'ALP')
    assert.equal(p.labs[0].items[0].value, 312)
    assert.equal(p.meds.length, 1)
    assert.equal(p.meds[0].name, '熊去氧胆酸')
    assert.equal(p.questions.length, 1)
    assert.equal(p.questions[0].id, 'q1')
    assert.equal(p.documents.length, 1)
    assert.equal(p.symptoms.length, 1)
    assert.equal(p.symptoms[0].itch, 6)
    assert.equal(p.screening.length, 1)
    /* 落库验证：行真的在 sqlite（按本档案 profile_key 计数，demo 种子行不混入），不是内存 */
    const cnt = (t) => wb.db.prepare('SELECT COUNT(*) c FROM ' + t + ' WHERE profile_key = ?').get(key).c
    assert.equal(cnt('episode_events'), 1)
    assert.equal(cnt('lab_results'), 1)
    assert.equal(cnt('meds'), 1)
    assert.equal(cnt('visit_questions'), 1)
    assert.equal(cnt('symptom_notes'), 1)
    assert.equal(cnt('screening_records'), 1)
    assert.equal(cnt('imaging_events'), 1)
    assert.ok(wb.db.prepare('SELECT 1 c FROM hospitals WHERE id = ?').get(rH.id), 'hospital 行在库')
  } finally { wb.close(); rmSync(root, { recursive: true, force: true }) }
})

test('写链 ③ 私密两种寻址都落库，读模型 visibility 随行（导出过滤同源）', () => {
  const { wb, root } = freshWb()
  try {
    const key = wb.createSubject({ name: '私密寻址' }).profileKey
    wb.addEntry(key, 'episode', { start: '2026-11-01', signs: '第一条' })
    wb.addEntry(key, 'episode', { start: '2026-11-05', signs: '第二条' })
    /* 合成 id 寻址 */
    const bySynth = wb.setPrivacy(key, 'episode', 'e1', true)
    assert.equal(bySynth.isPrivate, true)
    /* 数字 rowid 寻址 */
    const rowid = wb.db.prepare('SELECT rowid AS rid FROM episode_events WHERE profile_key=? ORDER BY rowid').all(key)[1].rid
    const byRowid = wb.setPrivacy(key, 'episode', rowid, true)
    assert.equal(byRowid.isPrivate, true)
    const rows = wb.db.prepare('SELECT start_date, is_private FROM episode_events WHERE profile_key=? ORDER BY rowid').all(key)
    assert.deepEqual(rows.map((r) => r.is_private), [1, 1])
    /* 读模型 visibility 同步 */
    const p = wb.profile(key)
    assert.deepEqual(p.episodes.map((e) => e.visibility), ['private', 'private'])
    /* 越界合成 id 可读报错 */
    assert.throws(() => wb.setPrivacy(key, 'episode', 'e9', true), /越界/)
    /* hospitals 无私密列 → 明确拒收 */
    assert.throws(() => wb.setPrivacy(key, 'hospital', 'h1', true), /私密列/)
    /* 私密行不进派生聚合（私密发作不进 shared 计数） */
    wb.addEntry(key, 'episode', { start: '2026-11-10', signs: '第三条，保持共享' })
    const p2 = wb.profile(key)
    assert.equal(p2.episodes.filter((e) => e.visibility === 'shared').length, 1)
  } finally { wb.close(); rmSync(root, { recursive: true, force: true }) }
})

test('写链 ④ 错误路径可读（不裸崩、不静默成功）', () => {
  const { wb, root } = freshWb()
  try {
    const key = wb.createSubject({ name: '错误路径' }).profileKey
    assert.throws(() => wb.addEntry(key, 'foo', {}), /不支持的记录类型/)
    assert.throws(() => wb.addEntry('local-not-exist', 'mind', { note: 'x' }), /档案不存在/)
    assert.throws(() => wb.addEntry(key, 'episode', { start: '11月1日' }), /YYYY-MM-DD/)
    assert.throws(() => wb.addEntry(key, 'lab', { metricKey: 'NOPE', value: 1 }), /未知指标/)
    assert.throws(() => wb.addEntry(key, 'mind', { itch: 99 }), /0–10/)
    assert.throws(() => wb.addEntry(key, 'question', {}), /缺内容/)
    /* routes 层由 server 集成探针覆盖；这里断言服务层错误都带人话 */
  } finally { wb.close(); rmSync(root, { recursive: true, force: true }) }
})

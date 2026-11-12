/* 演示唯一源 parity 测试：readBootstrap（db）与 demo/build-demo-data.mjs → prototypes/v0.2/demo-data.js 形状一致
 * 口径：canonical JSON（递归删除 null/undefined 键后逐字段比对）——demo-data 手写数据
 * 允许可选键缺省与显式 null 两种写法，读模型输出固定键集（null 显式），两边语义等价。
 * 两套档案：A 刚确诊（化验 2 个月、无发作记录）、B 长期随访（化验 6 个月、发作 3 次）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical).filter((x) => x !== undefined)
  if (v && typeof v === 'object') {
    const out = {}
    for (const k of Object.keys(v)) {
      const c = canonical(v[k])
      if (c !== null && c !== undefined) out[k] = c
    }
    return out
  }
  return v
}

function loadDemo() {
  const src = readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf-8')
  return new Function(src + '; return globalThis.DEMO;')()
}

function bootFromDb() {
  const db = new DatabaseSync(':memory:')
  const dir = join(ROOT, 'schema')
  for (const f of readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()) {
    db.exec(readFileSync(join(dir, f), 'utf-8'))
  }
  return import(join(ROOT, 'dsh/readmodels.js')).then(async (rm) => {
    const demo = await import(join(ROOT, 'dsh/demo.js'))
    demo.seedDemoData(db)
    return rm.readBootstrap(db)
  })
}

test('parity: 档案数量与 generatedAt 键存在（读模型与 demo-data 同构形状）', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  assert.ok(b.generatedAt != null, 'generatedAt 键存在（形状与 demo-data 同构）')
  assert.equal(b.profiles.length, demo.profiles.length)
  assert.deepEqual(b.profiles.map((p) => p.key), demo.profiles.map((p) => p.key))
})

test('parity: A/B 档案全部字段 canonical 一致（先证两边非空）', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  for (const expected of demo.profiles) {
    const a = b.profiles.find((p) => p.key === expected.key)
    assert.ok(a, `档案 ${expected.key} 数据库侧存在`)
    const fields = Object.keys(expected)
    assert.ok(fields.length >= 10, `档案 ${expected.key} 参照字段数 ${fields.length}`)
    const diffs = []
    for (const f of fields) {
      if (JSON.stringify(canonical(a[f])) !== JSON.stringify(canonical(expected[f]))) diffs.push(f)
    }
    assert.deepEqual(diffs, [], `档案 ${expected.key} 字段差异：${diffs.join(', ')}`)
  }
})

test('parity: 化验可比组随行返回（org 原样陈列，不合并跨机构）', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  const bb = b.profiles.find((p) => p.key === 'B')
  assert.equal(bb.labs.length, 6, 'B 档案 6 个月化验行')
  const orgs = new Set(bb.labs.flatMap((r) => r.items.map((i) => i.lab)))
  assert.ok(orgs.has('区中心医院'), 'B 档案含区中心医院化验（可比组按机构陈列）')
  /* 第一张 A 档化验单刻意缺 ALP 上限（单据没印上限 → ref_high NULL，不用通用值补） */
  const aFirst = b.profiles.find((p) => p.key === 'A').labs[0]
  const alp = aFirst.items.find((i) => i.code === 'ALP')
  assert.equal(alp.refHigh, null, 'A 档首张 ALP 上限显式 null')
  assert.ok(alp.lab.includes('外院'), '外院单子来源随行')
})

test('parity: trialMatch 与 demo-data 同一份 lib/trial-match 口径（B 档 2 张卡）', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  assert.equal(b.trialMatch.B.length, 2, 'B 档案 2 条试验')
  assert.deepEqual(
    b.trialMatch.B.map((t) => [t.band, t.counts]),
    demo.trialMatch.B.map((t) => [t.band, t.counts]),
    '三档结果与 demo-data 预计算一致',
  )
})

test('parity: 空库与有库行为（播种幂等）', async () => {
  const db = new DatabaseSync(':memory:')
  const { readdirSync } = await import('node:fs')
  const dir = join(ROOT, 'schema')
  for (const f of readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()) {
    db.exec(readFileSync(join(dir, f), 'utf-8'))
  }
  const demo = await import(join(ROOT, 'dsh/demo.js'))
  const r1 = demo.seedDemoData(db)
  const r2 = demo.seedDemoData(db)
  assert.equal(r1.skipped, false)
  assert.equal(r2.skipped, true)
  assert.equal(r2.profiles, 2)
})

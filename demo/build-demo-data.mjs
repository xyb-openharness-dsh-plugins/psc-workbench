#!/usr/bin/env node
/**
 * 演示数据唯一来源（psc-workbench PSC 版）。
 *
 * 一个文件同时产出两件产物，两者必须同构：
 *   1) prototypes/v0.2/demo-data.js   —— 原型 `file://` 直接引用（纯数据，挂全局）
 *   2) demo/demo-data.sqlite          —— schema/00*.sql + dsh/demo.js 播种（M3 起接入；
 *                                        dsh/demo.js 缺席时本产物跳过，如实记录）
 *
 * 纪律：
 * - 被 import 时只导出 `buildDemoProfiles()` 纯数据，**不碰磁盘**（`import.meta.main` 才写文件）。
 * - 不使用 Math.random：用固定种子的 LCG，重跑逐字节可复现。
 * - 演示人名与数值全部虚构，页面必须显著标「合成示例」。
 * - PSC 边界：无分期/线序/疗效判读；发作—缓解区间带；阈值待核不入库；胆管癌风险只作筛查条目。
 */
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

import { screeningTitle } from '../lib/screening-titles.js'
import { criteriaOf, factsOf, matchAll } from '../lib/trial-match.js'

/** 固定种子线性同余：保证重跑一致。 */
function lcg(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

/* 档案 A：刚确诊，化验少、多处未知；档案 B：多年随访，化验与发作都多。 */
const MONTHS_A = ['2026-10', '2026-11']
const MONTHS_B = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']

// 参考区间取"演示化验单自带的"值，刻意让两家实验室的上限不同（ALP 120 vs 135），
// 用来证明"不同方法不合并"：跨实验室、跨方法不做差、不连线。
const LAB_DEFS = {
  A: { name: '市一院检验科', refs: { ALP: [35, 120], GGT: [7, 45], ALT: [7, 40], AST: [13, 35], TBil: [0, 21], ALB: [40, 55], PLT: [125, 350], Hb: [115, 150], WBC: [3.5, 9.5], ANC: [1.8, 6.3], Cr: [41, 81] } },
  B: { name: '区中心医院', refs: { ALP: [40, 135], GGT: [8, 50], ALT: [8, 45], AST: [14, 40], TBil: [0, 23], ALB: [39, 54], PLT: [120, 340], Hb: [112, 148], WBC: [3.4, 9.2], ANC: [1.7, 6.0], Cr: [40, 84] } },
}

/** 一条化验：items 里缺 refHigh 的那条刻意留 null，用来演示「单据没印上限」如实留空。 */
function makeLabs(profileKey, seed, trend, months) {
  const rnd = lcg(seed)
  const def = LAB_DEFS[profileKey]
  return months.map((m, i) => {
    const jitter = () => 1 + (rnd() - 0.5) * 0.08
    const base = {
      ALP: trend.alp[i] * jitter(),
      GGT: trend.ggt[i] * jitter(),
      ALT: trend.alt[i] * jitter(),
      AST: trend.ast[i] * jitter(),
      TBil: trend.tbil[i] * jitter(),
      ALB: trend.alb[i] * jitter(),
      PLT: trend.plt[i] * jitter(),
      Hb: trend.hb[i] * jitter(),
      WBC: trend.wbc[i] * jitter(),
      ANC: trend.anc[i] * jitter(),
      Cr: trend.cr[i] * jitter(),
    }
    const items = Object.entries(base).map(([code, value]) => {
      const ref = def.refs[code]
      // 第一张：模拟"外院单子没印上限"——只给下限，上限 null（不许用通用值补）
      const missingHigh = i === 0 && code === 'ALP'
      return {
        code,
        value: Number(value.toFixed(code === 'ALB' ? 1 : 0)),
        unit: { ALP: 'U/L', GGT: 'U/L', ALT: 'U/L', AST: 'U/L', TBil: 'µmol/L', ALB: 'g/L', PLT: '10⁹/L', Hb: 'g/L', WBC: '10⁹/L', ANC: '10⁹/L', Cr: 'µmol/L' }[code],
        refLow: ref[0],
        refHigh: missingHigh ? null : ref[1],
        lab: missingHigh ? '外院报告（未印上限）' : def.name,
      }
    })
    return { date: `${m}-08`, items }
  })
}

/* A 档案：刚确诊 1 个月，记录少、多处未知、无发作记录。 */
function buildProfileA() {
  return {
    key: 'A',
    /* label 是"档案名"，不是结论。档案名只描述"这是哪一份"，不描述"结果好不好"。 */
    label: '档案 A · 刚确诊',
    name: '虚构患者甲',
    age: 47,
    sex: '男',
    diagnosedAt: '2026-10-14',
    startedAt: '2026-10-21',
    weightKg: 72,
    antibodies: { panca: 'untested', ana: 'negative', note: '2026-10 首诊报告抄录；pANCA 未查' },
    fibrosis: null, // 刚确诊还没做 FibroScan：空态示例
    ibd: { type: 'untested', note: '肠镜尚未做，医生已安排', colonoscopyLast: null }, // IBD 共病：未知态
    comorbidity: [{ name: '未见合并症记录', since: null, note: '刚确诊，还没排查完' }],
    meds: [{ name: '熊去氧胆酸片', doseText: '250 mg × 4 片/日（医生医嘱原文抄录）', freq: '每日 2 次', startDate: '2026-10-21', approval: 'unverified', inUse: true }],
    adherence: [{ month: '2026-10', missed: 0 }, { month: '2026-11', missed: 1 }],
    episodes: [], // 刚确诊，还没有发作记录：空态示例
    symptoms: [
      { date: '2026-11-01', itch: 3, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 2, note: '说不上来，就是没劲' },
      { date: '2026-10-25', itch: 2, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 1, note: '' },
    ],
    screening: [
      { type: 'mrcp', date: '2026-10-14', result: 'MRCP：肝内外胆管多节段狭窄伴扩张（报告原文抄录）', detail: '确诊依据之一' },
      { type: 'gallbladder', date: '2026-10-14', result: '超声：胆囊壁稍毛糙，未见结石', detail: '' },
      { type: 'colonoscopy', date: null, result: null, detail: '医生已安排，待做' }, // 未知值/待办示例
    ],
    questions: [
      { id: 'q1', text: 'ALP 多少算降下来了？我的目标值是什么？', done: false },
      { id: 'q2', text: '肠镜什么时候做？要提前准备什么？', done: false },
      { id: 'q3', text: '如果发烧寒战，我应该怎么处理？', done: false },
    ],
    documents: [
      { id: 'd1', name: '2026-10 MRCP 报告.pdf', date: '2026-10-14', parsed: false },
      { id: 'd2', name: '2026-11 肝功能.pdf', date: '2026-11-08', parsed: true },
    ],
    trials: [
      { id: 't1', title: '【虚构示例】PSC 瘙痒症状管理登记研究', source: 'ctgov', phase: '登记', status: '登记状态，未核实', area: '上海' },
    ],
    pathway: [
      {
        d: '2026-10-14', phase: '确诊', text: '体检 ALP 升高，MRCP 见胆管多节段狭窄后确诊',
        detail: {
          regimen: { summary: '尚未开始用药', items: [['方案', '无'], ['说明', '确诊当次未开药']] },
          metrics: { summary: 'ALP 312 U/L（单据未印上限）', items: [['ALP', '312 U/L'], ['GGT', '224 U/L']] },
          imaging: { summary: 'MRCP：肝内外胆管多节段狭窄伴扩张', items: [['报告原文', '肝内外胆管多发节段性狭窄，狭窄上游胆管扩张']] },
          ae: { summary: '无记录', items: [['说明', '此阶段未开始用药，未记副作用']] },
          support: { summary: '无记录', items: [['说明', '未记录支持措施']] },
        },
      },
      {
        d: '2026-10-21', phase: '开始 UDCA', text: '医生开了熊去氧胆酸，医嘱原文如记录',
        detail: {
          regimen: { summary: '熊去氧胆酸 250 mg × 4 片/日', items: [['药名', '熊去氧胆酸片'], ['剂量原文', '250 mg × 4 片/日'], ['频次', '每日 2 次'], ['获批状态', '未核实']] },
          metrics: { summary: '2026-11 复查 ALP 268 U/L', items: [['2026-11 ALP', '268 U/L'], ['2026-11 GGT', '196 U/L']] },
          imaging: { summary: '本阶段未复查影像', items: [['说明', '无记录，不等于没做']] },
          ae: { summary: '无记录', items: [['说明', '未记录']] },
          support: { summary: '"这个病我第一次听说"', items: [['患者原话', '这个病我第一次听说，医生说的名字我都记不住']] },
        },
      },
    ],
  }
}

/* B 档案：8 年随访，发作 3 次、化验 6 个月、用药与共病都多。 */
function buildProfileB() {
  return {
    key: 'B',
    label: '档案 B · 长期随访',
    name: '虚构患者乙',
    age: 55,
    sex: '女',
    diagnosedAt: '2018-09-05',
    startedAt: '2018-09-18',
    weightKg: 64,
    antibodies: { panca: 'positive', ana: 'positive', note: '2018 年报告抄录' },
    fibrosis: { method: 'FibroScan（瞬时弹性成像）', value: '12.6 kPa', date: '2026-03-11', note: '报告原文抄录，未判读' },
    ibd: { type: 'ulcerative-colitis', note: '溃疡性结肠炎，消化科随访中', colonoscopyLast: '2025-06-18' },
    comorbidity: [
      { name: '溃疡性结肠炎', since: '2019', note: '消化科，美沙拉嗪维持' },
      { name: '甲状腺功能减退', since: '2021', note: '内分泌科，左甲状腺素 50 µg' },
    ],
    meds: [
      { name: '熊去氧胆酸胶囊', doseText: '250 mg × 6 粒/日', freq: '每日 3 次', startDate: '2018-09-18', approval: 'unverified', inUse: true },
      { name: '美沙拉嗪缓释片', doseText: '1 g 每日 2 次（消化科医嘱）', freq: '每日 2 次', startDate: '2019-04-02', approval: 'unverified', inUse: true },
      { name: '左甲状腺素钠片', doseText: '50 µg 每日 1 次', freq: '每日 1 次（另一科开）', startDate: '2021-05-01', approval: 'unverified', inUse: true },
    ],
    adherence: [{ month: '2026-05', missed: 0 }, { month: '2026-06', missed: 1 }, { month: '2026-07', missed: 0 }, { month: '2026-08', missed: 3 }, { month: '2026-09', missed: 0 }, { month: '2026-10', missed: 1 }],
    episodes: [
      {
        id: 'e1', start: '2023-02-10', end: '2023-02-24', hospital: '市一院',
        signs: '发热 38.6℃、寒战、尿色加深', labsNote: '胆红素升高（当时化验原件未存）',
        treatment: '住院抗感染治疗 10 天（医生处置原文大意）', actionPlan: null,
        note: '第一次发作，当时不知道这就是胆管炎', visibility: 'shared',
      },
      {
        id: 'e2', start: '2025-01-18', end: '2025-01-27', hospital: '区中心医院',
        signs: '发热、右上腹痛', labsNote: '白细胞与胆红素升高',
        treatment: '住院抗感染；出院后医生安排 ERCP 球囊扩张（2025-02-20）', actionPlan: '医生给的计划原文：若再次出现发热寒战或尿色明显加深，当天联系肝胆科值班电话，不要等到复诊',
        note: '这次记住了先打电话', visibility: 'shared',
      },
      {
        id: 'e3', start: '2026-04-30', end: '2026-05-12', hospital: '市一院',
        signs: '低热、乏力加重', labsNote: '胆红素 38 µmol/L',
        treatment: '门诊抗感染后好转；医生调了复查节奏', actionPlan: '同上次医生计划（2025-01 记录）',
        note: '', visibility: 'shared',
      },
    ],
    symptoms: [
      { date: '2026-10-05', itch: 3, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 3, note: '下午就没劲了' },
      { date: '2026-09-18', itch: 2, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 3, note: '' },
      { date: '2026-08-22', itch: 4, nightWorse: true, scratch: false, sleepBreaks: 1, fatigue: 2, note: '' },
      { date: '2026-07-11', itch: 2, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 2, note: '' },
      { date: '2026-06-09', itch: 5, nightWorse: true, scratch: true, sleepBreaks: 2, fatigue: 3, note: '天热更痒' },
      { date: '2026-05-16', itch: 3, nightWorse: false, scratch: false, sleepBreaks: 0, fatigue: 2, note: '' },
    ],
    screening: [
      { type: 'colonoscopy', date: '2025-06-18', result: '肠镜：横结肠可见一段轻度炎性改变（报告原文）', detail: '消化科：病理未见异型，按医嘱 1–2 年复查【待核：具体间隔以医生安排为准】' },
      { type: 'mrcp', date: '2025-02-20', result: 'MRCP：肝外胆管狭窄段较前对照，上游扩张（报告原文）', detail: 'ERCP 扩张前评估' },
      { type: 'fibroscan', date: '2026-03-11', result: 'FibroScan 12.6 kPa（报告原文）', detail: '未判读' },
      { type: 'gallbladder', date: '2025-11-07', result: '超声：胆囊息肉 3 mm，未见结石（报告原文）', detail: '医生说按他的节奏复查' },
      { type: 'endoscopy', date: '2024-11-20', result: '胃镜：食管下段轻度静脉曲张（报告原文）', detail: '医生建议定期复查' },
    ],
    questions: [
      { id: 'q1', text: '下次肠镜该什么时候做？间隔是按年算吗？', done: false },
      { id: 'q2', text: '胆囊息肉 3 mm 要紧吗？', done: false },
      { id: 'q3', text: '甲减的药和肝的药一起吃要注意什么？', done: false },
      { id: 'q4', text: 'ERCP 之后这次 MRCP 结果说明什么？', done: true },
    ],
    documents: [
      { id: 'd1', name: '2026-03 FibroScan.pdf', date: '2026-03-11', parsed: true },
      { id: 'd2', name: '2025-06 肠镜.pdf', date: '2025-06-18', parsed: true },
      { id: 'd3', name: '2025-02 MRCP.pdf', date: '2025-02-20', parsed: false },
    ],
    trials: [
      { id: 't1', title: '【虚构示例】PSC 长期随访观察研究', source: 'ictrp', phase: '观察性', status: '登记状态，未核实', area: '广州' },
      { id: 't2', title: '【虚构示例】PSC 胆管炎发作频率研究', source: 'ctgov', phase: '登记', status: '登记状态，未核实', area: '北京' },
    ],
    pathway: [
      {
        d: '2018-09-18', phase: '确诊并开始 UDCA', text: 'MRCP 提示胆管多节段狭窄，确诊后开始单药',
        detail: {
          regimen: { summary: '熊去氧胆酸 250 mg × 6 粒/日', items: [['药名', '熊去氧胆酸胶囊'], ['剂量原文', '250 mg × 6 粒/日'], ['获批状态', '未核实']] },
          metrics: { summary: '确诊时 ALP 310 U/L', items: [['2018-09 ALP', '310 U/L'], ['2018-09 TBil', '21 µmol/L']] },
          imaging: { summary: 'MRCP：肝内外胆管多节段狭窄', items: [['报告原文', '肝内外胆管多发节段性狭窄伴上游扩张']] },
          ae: { summary: '无记录', items: [['说明', '无记录']] },
          support: { summary: '无记录', items: [['说明', '无记录']] },
        },
      },
      {
        d: '2023-02-10', phase: '第一次发作', text: '发热寒战住院，才知道这叫胆管炎',
        detail: {
          regimen: { summary: '维持原用药', items: [['方案', '未变更']] },
          metrics: { summary: '胆红素升高（原件未存）', items: [['说明', '当时化验原件未留存，只有口头转述']] },
          imaging: { summary: '住院期间超声', items: [['说明', '报告未存档']] },
          ae: { summary: '无新增', items: [['说明', '无记录']] },
          support: { summary: '"根本不知道这两个病是一伙的"', items: [['患者原话', '根本不知道胆管炎和肠子的病是一伙的']] },
        },
      },
      {
        d: '2025-02-20', phase: 'ERCP 球囊扩张', text: '发作后医生安排 ERCP 球囊扩张狭窄段',
        detail: {
          regimen: { summary: '维持原用药', items: [['方案', '未变更']] },
          metrics: { summary: '术前胆红素 42 µmol/L，术后 1 个月 24 µmol/L', items: [['术前 TBil', '42 µmol/L'], ['术后 TBil', '24 µmol/L']] },
          imaging: { summary: 'ERCP 术中造影 + 术后 MRCP', items: [['报告原文', '肝外胆管狭窄段扩张后通畅，上游扩张减轻']] },
          ae: { summary: '术后轻度腹胀', items: [['记录', '术后两天腹胀，自行缓解']] },
          support: { summary: '"医生给了发作时的电话"', items: [['患者原话', '这次医生给了值班电话，心里踏实多了']] },
        },
      },
      {
        d: '2026-03-11', phase: '弹性成像复查', text: '按医生节奏做 FibroScan 与化验',
        detail: {
          regimen: { summary: '维持原用药', items: [['方案', '未变更']] },
          metrics: { summary: 'ALP 179 U/L，胆红素 18 µmol/L', items: [['2026-03 ALP', '179 U/L'], ['2026-03 TBil', '18 µmol/L']] },
          imaging: { summary: 'FibroScan 12.6 kPa', items: [['报告原文', '12.6 kPa（未判读）']] },
          ae: { summary: '无新增', items: [['说明', '无记录']] },
          support: { summary: '"记下来就不慌"', items: [['患者原话', '把每次的数记下来，去医院就不慌了']] },
        },
      },
    ],
  }
}

/** 纯函数：被 import 时只返回数据，不写盘。 */
export function buildDemoProfiles() {
  const A = buildProfileA()
  const B = buildProfileB()
  A.labs = makeLabs('A', 20241101, {
    alp: [312, 268], ggt: [224, 196], alt: [66, 52], ast: [48, 40],
    tbil: [16, 14], alb: [44, 44], plt: [210, 206], hb: [142, 141],
    wbc: [6.0, 5.8], anc: [3.2, 3.1], cr: [68, 69],
  }, MONTHS_A)
  B.labs = makeLabs('B', 20241102, {
    alp: [310, 245, 198, 188, 179, 178], ggt: [220, 186, 160, 151, 143, 146],
    alt: [52, 46, 41, 38, 36, 40], ast: [48, 43, 39, 36, 34, 37],
    tbil: [21, 19, 18, 17, 17, 18], alb: [40, 40, 39, 40, 39, 39],
    plt: [118, 110, 101, 96, 94, 92], hb: [119, 117, 115, 116, 114, 115],
    wbc: [4.1, 3.9, 4.0, 3.8, 4.0, 3.9], anc: [2.2, 2.1, 2.2, 2.0, 2.1, 2.1],
    cr: [70, 71, 69, 72, 70, 71],
  }, MONTHS_B)
  /* 补齐读模型会返回、而上面手写数据里想省掉的列（形状由 demo-data 决定）。 */
  for (const p of [A, B]) {
    p.comorbidity = p.comorbidity.map((c) => ({ ...c, dept: c.dept ?? null, visibility: c.visibility ?? 'shared' }))
    p.meds = p.meds.map((m) => ({ ...m, inUse: m.inUse ?? true }))
    p.symptoms = p.symptoms.map((x) => ({ ...x, visibility: x.visibility ?? 'shared' }))
    p.episodes = (p.episodes ?? []).map((x) => ({ ...x, end: x.end ?? null, actionPlan: x.actionPlan ?? null, visibility: x.visibility ?? 'shared' }))
    p.screening = p.screening.map((x) => ({ ...x, sectionTitle: x.sectionTitle ?? screeningTitle(x.type) }))
    p.documents = p.documents.map((d) => ({ ...d, parseState: d.parseState ?? (d.parsed ? 'parsed' : 'unparsed') }))
  }
  return [A, B]
}

/* ------------------------------- 产物 1：ESM ------------------------------- */
const HEADER = `/* 由 demo/build-demo-data.mjs 生成，勿手改。重跑：npm run demo:data */\n`

export function renderDemoModule(profiles) {
  const trialMatch = Object.fromEntries(profiles.map((p) => [
    p.key,
    matchAll((p.trials ?? []).map((t) => ({ ...t, criteria: criteriaOf(t) })), factsOf(p)),
  ]))
  const payload = JSON.stringify({ generatedAt: 'fixed-for-reproducibility', profiles, trialMatch }, null, 2)
  return `${HEADER}(function (root) {\n  const DEMO = ${payload}\n  root.DEMO = DEMO\n})(typeof window !== 'undefined' ? window : globalThis)\n`
}

/* ------------------------------ 产物 2：SQLite ----------------------------- */
/* 用真实 schema + 真实播种器。dsh/demo.js 在 M3 接入；缺席时跳过并如实输出 skipped。 */
export async function buildDemoDatabase(file, profiles) {
  if (!existsSync(join(ROOT, 'dsh/demo.js'))) {
    return { skipped: 'dsh/demo.js 未就绪（M3 接入后产出演示库）' }
  }
  const { DatabaseSync } = await import('node:sqlite')
  const { readdirSync, readFileSync } = await import('node:fs')
  const { seedDemo } = await import('../dsh/demo.js')
  mkdirSync(dirname(file), { recursive: true })
  try { rmSync(file, { force: true }) } catch { /* 首次构建 */ }
  const db = new DatabaseSync(file)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA journal_mode = WAL')
  const dir = join(ROOT, 'schema')
  for (const name of readdirSync(dir).filter((x) => /^\d{4}_[a-z0-9_]+\.sql$/.test(x)).sort()) {
    db.exec(readFileSync(join(dir, name), 'utf8'))
  }
  try {
    seedDemo(db, profiles)
  } finally {
    db.close()
  }
  return { ok: true }
}

async function main() {
  const profiles = buildDemoProfiles()
  const jsOut = join(ROOT, 'prototypes/v0.2/demo-data.js')
  const dbOut = join(ROOT, 'demo/demo-data.sqlite')
  mkdirSync(dirname(jsOut), { recursive: true })
  writeFileSync(jsOut, renderDemoModule(profiles))
  const dbResult = await buildDemoDatabase(dbOut, profiles)
  console.log(JSON.stringify({ ok: true, js: jsOut, db: dbOut, dbResult, profiles: profiles.length }, null, 2))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()

/**
 * 演示数据播种（真·唯一源 = demo/build-demo-data.mjs 的 buildDemoProfiles()；装包后读 public/demo-data.js 同字节副本）。
 * 首次开库（空库）把 A/B 两套合成档案灌进冻结 schema；幂等：非空库跳过（force 可重灌）。
 *
 * 两层接口（与家族其他仓的差别写清楚，免得下一个人照抄错）：
 *   - seedDemo(db, profiles)：核心播种函数，**吃现成的档案数组**。
 *     demo/build-demo-data.mjs 构建演示库时直接 import 它（数据源是 buildDemoProfiles()）；
 *   - seedDemoData(db, { force })：Workbench 首开用的包装——从唯一源加载档案数组再调 seedDemo。
 *     加载顺序：public/demo-data.js（随包发出，装包后可用）→ prototypes/v0.2/demo-data.js（开发仓）。
 *
 * 对应关系（schema/0001_initial.sql + 0002_psc_m5.sql）：
 *   subjects（meta=档案名 label）+ profile_facts（0002：age/sex/确诊日/开始用药日/体重/
 *   抗体/纤维化/IBD/共病/依从/病程阶段/试验清单，值 JSON 编码）
 *   episode_events（发作—缓解第一实体，end IS NULL=发作未记缓解）
 *   lab_results（可比组=method+org，demo 的 lab=机构 org；单据没印上限 refHigh=NULL）
 *   symptom_notes（0002 补 scratch 列）/ screening_records（只存医生安排原话，无排程列）/
 *   visit_questions / documents / meds / metric_defs
 * 演示字符串 id（e1/q1/d1/t1）不落库，读模型按 rowid 序确定性合成（见 readmodels.js）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** PSC 指标目录：与原型 app.js 的 LABELS / METRIC_SERIES / CHART_COLORS 同一口径。
 *  分类只作分组展示键，不进趋势；库内不做任何参考范围判定。 */
export const PSC_METRIC_DEFS = [
  { key: 'ALP', title: '碱性磷酸酶 ALP', category: 'cholestasis', unit: 'U/L', color: '#5C6B3C', ord: 1 },
  { key: 'GGT', title: 'γ-谷氨酰转肽酶 GGT', category: 'cholestasis', unit: 'U/L', color: '#A8681E', ord: 2 },
  { key: 'TBil', title: '总胆红素 TBil', category: 'cholestasis', unit: 'µmol/L', color: '#3C5A6B', ord: 3 },
  { key: 'ALT', title: '丙氨酸氨基转移酶 ALT', category: 'hepatocell', unit: 'U/L', color: '#8A4B6B', ord: 4 },
  { key: 'AST', title: '天门冬氨酸氨基转移酶 AST', category: 'hepatocell', unit: 'U/L', color: '#4B6B8A', ord: 5 },
  { key: 'ALB', title: '白蛋白 ALB', category: 'synthesis', unit: 'g/L', color: '#6B8A4B', ord: 6 },
  { key: 'PLT', title: '血小板 PLT', category: 'synthesis', unit: '10⁹/L', color: '#8A6B4B', ord: 7 },
  { key: 'Hb', title: '血红蛋白 Hb', category: 'blood', unit: 'g/L', color: '#B0563C', ord: 8 },
  { key: 'WBC', title: '白细胞 WBC', category: 'blood', unit: '10⁹/L', color: '#5B7C99', ord: 9 },
  { key: 'ANC', title: '中性粒细胞 ANC', category: 'blood', unit: '10⁹/L', color: '#997C5B', ord: 10 },
  { key: 'Cr', title: '肌酐 Cr', category: 'renal', unit: 'µmol/L', color: '#7C5B99', ord: 11 },
];

/** 唯一源加载：public/demo-data.js（随包发出）优先，prototypes/v0.2/demo-data.js 兜底（开发仓）。 */
function loadDemoData() {
  for (const rel of ['../public/demo-data.js', '../prototypes/v0.2/demo-data.js']) {
    try {
      const src = readFileSync(join(HERE, rel), 'utf8');
      /* demo-data.js 是自执行 IIFE：浏览器挂 window，Node 里挂 globalThis */
      return new Function(src + '; return globalThis.DEMO;')();
    } catch { /* 尝试下一个候选 */ }
  }
  throw new Error('demo-data.js 不可读（public 与 prototypes 都缺失）');
}

/** 档案级非表列事实 → profile_facts（0002）。值 JSON 编码；null 值不入库（读模型按缺省 null 还原）。 */
const FACT_KEYS = ['age', 'sex', 'diagnosedAt', 'startedAt', 'weightKg', 'antibodies',
  'fibrosis', 'ibd', 'comorbidity', 'adherence', 'pathway', 'trials'];

/**
 * 核心播种：把 profiles（buildDemoProfiles() 形状）灌进已建表的库。
 * 只写库，不判断空库/重灌——那是 seedDemoData 与调用方的职责。
 */
export function seedDemo(db, profiles) {
  const mdIns = db.prepare('INSERT INTO metric_defs (key, title, category, unit, color, ord) VALUES (?,?,?,?,?,?)');
  for (const d of PSC_METRIC_DEFS) mdIns.run(d.key, d.title, d.category, d.unit, d.color, d.ord);

  const subIns = db.prepare('INSERT INTO subjects (profile_key, name, meta, headline, action_plan, dash_keys, created_on, is_demo) VALUES (?,?,?,?,?,?,?,?)');
  const factIns = db.prepare('INSERT INTO profile_facts (profile_key, fact_key, fact_value, ver) VALUES (?,?,?,1)');
  const epiIns = db.prepare('INSERT INTO episode_events (profile_key, start_date, end_date, hospital, signs_text, labs_note, treatment_text, action_plan, note, is_private, ver) VALUES (?,?,?,?,?,?,?,?,?,?,1)');
  const labIns = db.prepare('INSERT INTO lab_results (profile_key, metric_key, measured_on, value, value_text, unit, ref_low, ref_high, method, org, is_private, note, ver) VALUES (?,?,?,?,?,?,?,?,?,?,0,NULL,1)');
  const symIns = db.prepare('INSERT INTO symptom_notes (profile_key, recorded_on, kind, itch_level, fatigue_level, night_worse, sleep_breaks, scratch, note, is_private, ver) VALUES (?,?,?,?,?,?,?,?,?,?,1)');
  const scrIns = db.prepare('INSERT INTO screening_records (profile_key, kind, done_on, result_text, plan_text, org, is_private, ver) VALUES (?,?,?,?,?,?,0,1)');
  const qIns = db.prepare('INSERT INTO visit_questions (profile_key, question, done, created_on, is_private, ver) VALUES (?,?,?,?,0,1)');
  const docIns = db.prepare('INSERT INTO documents (id, profile_key, name, doc_date, parse_state, is_private) VALUES (?,?,?,?,?,0)');
  const medIns = db.prepare('INSERT INTO meds (profile_key, name, dose_text, freq, start_on, approval, in_use, is_private, ver, created_on) VALUES (?,?,?,?,?,?,?,0,1,NULL)');

  const knownMetrics = new Set(PSC_METRIC_DEFS.map((d) => d.key));

  for (const p of profiles ?? []) {
    const key = String(p.key || '');
    if (!key) continue;
    subIns.run(key, p.name ?? null, p.label ?? null, null, null, null, null, 1);
    for (const k of FACT_KEYS) {
      if (p[k] === null || p[k] === undefined) continue; /* 显式缺省：读模型还原为 null */
      factIns.run(key, k, JSON.stringify(p[k]));
    }
    for (const e of p.episodes ?? []) {
      epiIns.run(key, e.start ?? null, e.end ?? null, e.hospital ?? null, e.signs ?? '', e.labsNote ?? '',
        e.treatment ?? '', e.actionPlan ?? null, e.note ?? '', e.visibility === 'private' ? 1 : 0);
    }
    for (const row of p.labs ?? []) {
      for (const it of row.items ?? []) {
        if (!knownMetrics.has(it.code)) continue; /* metric_defs 外的键会破坏外键口径 */
        const isNumeric = typeof it.value === 'number' || /^\d+(\.\d+)?$/.test(String(it.value ?? ''));
        labIns.run(key, it.code, row.date ?? null, isNumeric ? Number(it.value) : null,
          isNumeric ? null : String(it.value ?? ''), it.unit ?? null,
          it.refLow ?? null, it.refHigh ?? null, null, it.lab ?? null);
      }
    }
    for (const s of p.symptoms ?? []) {
      symIns.run(key, s.date ?? null, null, s.itch ?? null, s.fatigue ?? null,
        s.nightWorse ? 1 : 0, s.sleepBreaks ?? null, s.scratch ? 1 : 0, s.note ?? '',
        s.visibility === 'private' ? 1 : 0);
    }
    for (const s of p.screening ?? []) {
      scrIns.run(key, s.type ?? null, s.date ?? null, s.result ?? null, s.detail ?? null, null);
    }
    for (const q of p.questions ?? []) {
      qIns.run(key, q.text ?? '', q.done ? 1 : 0, null);
    }
    (p.documents ?? []).forEach((d, i) => {
      docIns.run(`${key}-d${i + 1}`, key, d.name ?? null, d.date ?? null, d.parseState ?? (d.parsed ? 'parsed' : 'unparsed'));
    });
    for (const m of p.meds ?? []) {
      medIns.run(key, m.name ?? null, m.doseText ?? null, m.freq ?? null, m.startDate ?? null,
        m.approval ?? 'unverified', m.inUse === false ? 0 : 1);
    }
  }

  return db.prepare('SELECT COUNT(*) c FROM subjects').get().c;
}

/** Workbench 首开播种：空库才灌（force 清空重播）。返回 { skipped, profiles }。 */
export function seedDemoData(db, { force = false } = {}) {
  const existing = db.prepare('SELECT COUNT(*) c FROM subjects').get().c;
  if (existing > 0 && !force) return { skipped: true, profiles: existing };
  if (force) {
    for (const t of ['import_conflicts', 'import_candidates', 'import_batches', 'profile_facts',
      'screening_records', 'imaging_events', 'episode_events', 'meds', 'documents', 'viewpoints',
      'symptom_notes', 'visit_questions', 'hospitals', 'reports', 'lab_results',
      'metric_group_titles', 'section_titles', 'metric_defs', 'subjects']) {
      db.prepare(`DELETE FROM ${t}`).run();
    }
  }
  const D = loadDemoData();
  const n = seedDemo(db, D.profiles ?? []);
  return { skipped: false, profiles: n };
}

export function hasDemoData(db) {
  return db.prepare('SELECT COUNT(*) c FROM subjects').get().c > 0;
}

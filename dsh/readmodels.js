/**
 * 读模型：把 SQLite 的行还原成 demo/build-demo-data.mjs → prototypes/v0.2/demo-data.js 的同一形状
 * （parity 唯一验收标准：test/demo-parity.test.mjs 逐字段断言）。
 *
 * 规则：
 *   - 裸 SELECT 一律 ORDER BY rowid（家族契约）；输出顺序=种子写入顺序，parity 才成立；
 *   - 私密在 bootstrap 默认不过滤——返回全量、私密标记随行返回（episodes/symptoms 的 visibility），
 *     页面按原型口径显示；导出与 AI 两个出口走 bootstrapForExit，在读模型层剥掉私密行
 *     （三出口过滤中的两出口在服务层强制生效，看板摘要聚合只算共享行）；
 *   - 派生值（随访第 N 天 / 距上次发作 N 天 / 近 90 天发作次数 / 距上次肠镜 N 月）读时算
 *     （readDerivedStatus），不落库、无判读列；
 *   - 化验可比组 = method + org：读模型按机构（demo 的 lab 字段）原样陈列，不合并画线；
 *   - id 还原：演示字符串 id（e1/q1/d1/t1）不落库，读时按 rowid 序确定性合成；
 *   - trialMatch 与 demo-data.js 同一份 lib/trial-match.js 口径（三档对照，不产出推荐）。
 */
import { screeningTitle } from '../lib/screening-titles.js';
import { factsOf, criteriaOf, matchAll } from '../lib/trial-match.js';

const asText = (v) => (v === null || v === undefined ? null : String(v));
const dayBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : null);

export function readMetricDefs(db) {
  return db.prepare('SELECT * FROM metric_defs ORDER BY ord, rowid').all();
}

export function readSectionTitles(db, profileKey) {
  return db.prepare('SELECT * FROM section_titles WHERE profile_key = ? ORDER BY ord, rowid').all(profileKey);
}

/** profile_facts（0002）→ 对象；同键多 ver 时取最新 ver，值 JSON 还原。 */
function readFacts(db, key) {
  const facts = {};
  for (const f of db.prepare('SELECT fact_key, fact_value FROM profile_facts WHERE profile_key = ? AND in_use=1 ORDER BY ver, rowid').all(key)) {
    try { facts[f.fact_key] = f.fact_value == null ? null : JSON.parse(f.fact_value); } catch { facts[f.fact_key] = f.fact_value; }
  }
  return facts;
}

export function readBootstrap(db) {
  const rows = db.prepare('SELECT * FROM subjects ORDER BY rowid').all();
  const profiles = rows.map((pr) => readSubject(db, pr));
  const trialMatch = Object.fromEntries(profiles.map((p) => [
    p.key,
    matchAll((p.trials ?? []).map((t) => ({ ...t, criteria: criteriaOf(t) })), factsOf(p)),
  ]));
  /* 形状与 demo-data.js 同构：{ generatedAt, profiles, trialMatch } */
  return { generatedAt: 'fixed-for-reproducibility', profiles, trialMatch };
}

export function readSubject(db, pr) {
  const key = pr.profile_key;
  const facts = readFacts(db, key);

  /* 发作—缓解（第一实体）：end IS NULL=发作未记缓解 */
  const episodes = db.prepare('SELECT * FROM episode_events WHERE profile_key = ? ORDER BY rowid').all(key).map((e, i) => ({
    id: 'e' + (i + 1), start: e.start_date, end: e.end_date ?? null, hospital: e.hospital ?? '',
    signs: e.signs_text ?? '', labsNote: e.labs_note ?? '', treatment: e.treatment_text ?? '',
    actionPlan: e.action_plan ?? null, note: e.note ?? '',
    visibility: e.is_private ? 'private' : 'shared',
  }));

  /* 化验：按 measured_on 分组成行（与 demo-data 的 labs 行形状一致）；
     items 内保留 code/unit/refLow/refHigh/lab（=机构 org），不合并可比组 */
  const labs = [];
  const labIndex = new Map();
  for (const l of db.prepare('SELECT * FROM lab_results WHERE profile_key = ? ORDER BY rowid').all(key)) {
    const date = l.measured_on ?? null;
    if (!labIndex.has(date)) {
      const row = { date, items: [] };
      labIndex.set(date, row);
      labs.push(row);
    }
    labIndex.get(date).items.push({
      code: l.metric_key, value: l.value ?? l.value_text ?? null, unit: l.unit ?? '',
      refLow: l.ref_low, refHigh: l.ref_high, lab: l.org || '',
    });
  }

  const symptoms = db.prepare('SELECT * FROM symptom_notes WHERE profile_key = ? ORDER BY rowid').all(key).map((s) => ({
    date: s.recorded_on ?? null, itch: s.itch_level, nightWorse: !!s.night_worse,
    scratch: !!s.scratch, sleepBreaks: s.sleep_breaks, fatigue: s.fatigue_level,
    note: s.note ?? '', visibility: s.is_private ? 'private' : 'shared',
  }));

  const screening = db.prepare('SELECT * FROM screening_records WHERE profile_key = ? ORDER BY rowid').all(key).map((s) => ({
    type: s.kind ?? '', date: s.done_on ?? null, result: s.result_text ?? null,
    detail: s.plan_text ?? null, sectionTitle: screeningTitle(s.kind ?? ''),
  }));

  const questions = db.prepare('SELECT * FROM visit_questions WHERE profile_key = ? ORDER BY rowid').all(key).map((q, i) => ({
    id: 'q' + (i + 1), text: q.question, done: !!q.done,
  }));

  const documents = db.prepare('SELECT * FROM documents WHERE profile_key = ? ORDER BY rowid').all(key).map((d, i) => ({
    id: 'd' + (i + 1), name: d.name, date: d.doc_date ?? null,
    parsed: d.parse_state === 'parsed', parseState: d.parse_state ?? 'unparsed',
  }));

  const meds = db.prepare('SELECT * FROM meds WHERE profile_key = ? ORDER BY rowid').all(key).map((m) => ({
    name: m.name, doseText: m.dose_text ?? '', freq: m.freq ?? '', startDate: m.start_on ?? null,
    approval: m.approval ?? 'unverified', inUse: !!m.in_use,
  }));

  return {
    key, label: pr.meta ?? '', name: pr.name ?? '',
    age: facts.age ?? null, sex: facts.sex ?? null,
    diagnosedAt: facts.diagnosedAt ?? null, startedAt: facts.startedAt ?? null,
    weightKg: facts.weightKg ?? null, antibodies: facts.antibodies ?? null,
    fibrosis: facts.fibrosis ?? null, ibd: facts.ibd ?? null,
    comorbidity: facts.comorbidity ?? [],
    meds, adherence: facts.adherence ?? [],
    episodes, symptoms, screening, questions, documents,
    trials: facts.trials ?? [], pathway: facts.pathway ?? [],
    labs,
  };
}

/**
 * 派生状态（读时算，不落库）：缓解/发作中第 N 天、距上次发作 N 天、近 90 天发作次数、
 * 随访第 N 天（距开始用药日）、距上次肠镜 N 月（最近一次已做肠镜）。
 * 只统计共享行（私密发作不进聚合），私密条数单独返回。
 * @param {string} today YYYY-MM-DD（读模型不写死"今天"）
 */
export function readDerivedStatus(db, profileKey, today) {
  const all = db.prepare('SELECT * FROM episode_events WHERE profile_key = ? ORDER BY rowid').all(profileKey);
  const shared = all.filter((e) => !e.is_private);
  const out = {};
  const act = shared.find((e) => e.end_date == null);
  if (act) {
    out.mode = '发作中';
    out.dayN = dayBetween(act.start_date, today) + 1;
    const lastEnd = shared.filter((e) => e.end_date != null && e.end_date < act.start_date).map((e) => e.end_date).sort().pop();
    out.sinceLast = lastEnd ? dayBetween(lastEnd, act.start_date) : null;
  } else {
    const ends = shared.map((e) => e.end_date).filter(Boolean).sort();
    const last = ends[ends.length - 1];
    out.mode = '缓解中';
    out.dayN = last ? dayBetween(last, today) + 1 : null;
    out.sinceLast = last ? dayBetween(last, today) : null;
  }
  const cutoff = (() => { const d = new Date(today); d.setDate(d.getDate() - 90); return d; })();
  out.nearCount = shared.filter((e) => e.start_date && new Date(e.start_date) >= cutoff).length;
  out.privateEpisodes = all.length - shared.length;
  /* 随访第 N 天：锚点=开始用药日（没记用确诊日），与原型 daysSince 同口径（不 +1，负数取 0） */
  const facts = readFacts(db, profileKey);
  const anchor = facts.startedAt || facts.diagnosedAt || null;
  const since = dayBetween(anchor, today);
  out.followupDayN = anchor && since != null ? Math.max(0, since) : null;
  /* 距上次肠镜 N 月：只报「医生已做」的事实间隔（screening_records 无排程列） */
  const cols = db.prepare("SELECT done_on FROM screening_records WHERE profile_key = ? AND kind='colonoscopy' AND done_on IS NOT NULL ORDER BY rowid").all(profileKey)
    .map((r) => r.done_on).sort();
  const lastColo = cols[cols.length - 1] || null;
  if (lastColo) {
    const d1 = new Date(lastColo + 'T00:00:00');
    const d2 = new Date(today + 'T00:00:00');
    out.sinceLastColonoscopyMonths = Math.max(0, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
  } else {
    out.sinceLastColonoscopyMonths = null;
  }
  return out;
}

/** 私密行剥离（深拷贝）：导出与 AI 上下文出口在读模型层强制过滤私密行。 */
function stripPrivate(data) {
  const clone = JSON.parse(JSON.stringify(data));
  for (const p of clone.profiles || []) {
    p.episodes = (p.episodes || []).filter((x) => x.visibility !== 'private');
    p.symptoms = (p.symptoms || []).filter((x) => x.visibility !== 'private');
    p.screening = (p.screening || []).filter((x) => !x.private);
    p.questions = (p.questions || []).filter((x) => !x.private);
    p.documents = (p.documents || []).filter((x) => !x.private);
    p.comorbidity = (p.comorbidity || []).filter((x) => x.visibility !== 'private');
  }
  return clone;
}

/**
 * 三出口读法：
 *   - 'dashboard'：页面渲染需要私密标记，返回全量；看板摘要聚合只算共享行（readDerivedStatus）。
 *   - 'export' / 'ai'：读模型层剥掉私密行，调用方拿到的数据里不存在私密内容。
 */
export function bootstrapForExit(db, exit = 'dashboard') {
  const full = readBootstrap(db);
  if (exit === 'export' || exit === 'ai') return stripPrivate(full);
  return full;
}

/* ---------- 单实体读法（/api/psc/{labs,episodes,...} 路由用；同样 ORDER BY rowid） ---------- */

export function readLabs(db, key) {
  return db.prepare('SELECT * FROM lab_results WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((l) => ({ id: l.id, code: l.metric_key, date: l.measured_on ?? null, value: l.value ?? l.value_text ?? null,
      unit: l.unit ?? '', refLow: l.ref_low, refHigh: l.ref_high, method: l.method ?? '', org: l.org ?? '',
      private: !!l.is_private }));
}

export function readEpisodes(db, key) {
  return db.prepare('SELECT * FROM episode_events WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((e, i) => ({ id: 'e' + (i + 1), start: e.start_date, end: e.end_date ?? null, hospital: e.hospital ?? '',
      signs: e.signs_text ?? '', labsNote: e.labs_note ?? '', treatment: e.treatment_text ?? '',
      actionPlan: e.action_plan ?? null, note: e.note ?? '', private: !!e.is_private }));
}

export function readScreening(db, key) {
  return db.prepare('SELECT * FROM screening_records WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((s) => ({ id: s.id, kind: s.kind ?? '', doneOn: s.done_on ?? null, result: s.result_text ?? null,
      plan: s.plan_text ?? null, org: s.org ?? '', private: !!s.is_private }));
}

export function readImaging(db, key) {
  return db.prepare('SELECT * FROM imaging_events WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((x) => ({ id: x.id, kind: x.kind ?? '', date: x.exam_date ?? null, org: x.org ?? '',
      finding: x.finding_text ?? '', private: !!x.is_private }));
}

export function readMeds(db, key) {
  return db.prepare('SELECT * FROM meds WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((m) => ({ id: m.id, name: m.name, doseText: m.dose_text ?? '', freq: m.freq ?? '',
      startDate: m.start_on ?? null, endDate: m.end_on ?? null, approval: m.approval ?? 'unverified', inUse: !!m.in_use }));
}

export function readSymptoms(db, key) {
  return db.prepare('SELECT * FROM symptom_notes WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((s) => ({ id: s.id, date: s.recorded_on ?? null, itch: s.itch_level, fatigue: s.fatigue_level,
      nightWorse: !!s.night_worse, scratch: !!s.scratch, sleepBreaks: s.sleep_breaks,
      note: s.note ?? '', private: !!s.is_private }));
}

export function readReports(db, key) {
  return db.prepare('SELECT * FROM reports WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((r) => ({ id: r.id, title: r.title, kind: r.kind ?? '', date: r.report_date ?? null,
      source: r.source ?? '', keyDesc: r.key_desc ?? '', private: !!r.is_private }));
}

export function readViewpoints(db, key) {
  return db.prepare('SELECT * FROM viewpoints WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((v) => ({ id: v.id, subject: v.subject ?? '', body: v.body ?? '', createdOn: v.created_on ?? null,
      private: !!v.is_private }));
}

export function readDocuments(db, key) {
  return db.prepare('SELECT * FROM documents WHERE profile_key = ? ORDER BY rowid').all(key)
    .map((d) => ({ id: d.id, name: d.name, date: d.doc_date ?? null, parsed: d.parse_state === 'parsed',
      parseState: d.parse_state ?? 'unparsed', parsedRef: d.parsed_ref ?? null, private: !!d.is_private }));
}

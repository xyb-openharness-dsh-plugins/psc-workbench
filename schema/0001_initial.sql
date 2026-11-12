/* PSC（原发性硬化性胆管炎）工作台 · 初始数据模型（0001）
 *
 * 家族四条契约（与家族各仓同源）：
 *   1. 看法恒不为结论（viewpoints 只是记录，无 is_conclusion 列）；
 *   2. 显式 null ≠ 0：未知日期、缺失值一律 NULL，不用空串冒充；
 *   3. 更正只新增版本，不覆盖（各事实表带 ver 与 superseded_by，历史行保留）；
 *   4. 事实四层不合并（文档 / 候选 / 记录 / 指标分表存放）。
 *
 * 非肿瘤数据层红线（PSC 语境）：
 *   A. 无判读列：全库不设 diagnosis / risk_level / stage / 线序 / 疗效 / 狭窄进展判定 /
 *      CA19-9 阈值判定 类列。胆管相关肿瘤监测只以「医生已安排的筛查随访」条目存在
 *      screening_records，不存风险量化值。「随访第 N 天 / 距上次发作 N 天 / 近 90 天发作
 *      次数 / 距上次肠镜 N 月」等派生值读时计算，不落库。
 *   B. 发作—缓解是第一实体：episode_events 一行=一次发作（start_date 到 end_date，
 *      end IS NULL 表示发作未记缓解）；action_plan 只存医生行动计划【原话照录】，
 *      界面不生成；trigger/signs 只照录患者与医生原话，不做因果与定性判定。
 *   C. 化验可比组 = method + org：lab_results 不做跨组合并，分类不进趋势；
 *      影像（MRCP/ERCP/FibroScan）跨机构按 org 分组陈列（imaging_events），不合并画线。
 *
 * 筛查红线：screening_records 只登记「医生已安排/已做」的事实与原话，无 next_due 排程列——
 * 「下次复查」只能以医生原话存在 subjects.action_plan 或条目 plan_text 里，本库不生成排程。
 *
 * 迁移只增不改：本文件冻结后（sha256 见 freeze-contract.md），
 * 要加结构只能新增 0002_*.sql，改这里会被 check 拦下。
 *
 * 约定：ORDER BY rowid 为稳定读序；in_use 标记候选/记录是否被采用；分节标题进 section_titles；
 * is_private 缺省 0，三出口（看板摘要/导出/AI 上下文）必须显式过滤 is_private=1。
 */

/* ---------- 档案级（2） ---------- */

CREATE TABLE subjects (
  profile_key   TEXT PRIMARY KEY,
  name          TEXT,
  meta          TEXT,            -- 侧栏第二行（标签 · 随访节律描述），无判读
  headline      TEXT,            -- 看板顶部一句事实摘要
  action_plan   TEXT,            -- 医生求助行动计划【原话照录】，无则 NULL
  dash_keys     TEXT,            -- JSON 数组：看板快捷卡顺序
  created_on    TEXT,
  is_demo       INTEGER DEFAULT 0
);

/* 分节标题：key 与读模型 section 键一一对应 */
CREATE TABLE section_titles (
  profile_key TEXT,
  key         TEXT,
  title       TEXT,
  ord         INTEGER,
  PRIMARY KEY (profile_key, key)
);

/* ---------- 指标（3） ---------- */

/* 指标目录：分类只作分组展示键，不进趋势
 * cholestasis=胆汁淤积（ALP/GGT） / hepatocell=肝细胞（ALT/AST） / bili=胆红素 /
 * synth=合成功能（ALB/PLT） / other=其他 */
CREATE TABLE metric_defs (
  key         TEXT PRIMARY KEY,  -- ALP / GGT / TBil / ALT / AST / ALB / PLT …
  title       TEXT,
  category    TEXT,
  unit        TEXT,              -- U/L / µmol/L / g/L / ×10⁹/L
  color       TEXT,
  ord         INTEGER
);

/* 化验结果：可比组 = method + org；不做跨组合并；只存原始值，不做高低判定 */
CREATE TABLE lab_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL,
  metric_key    TEXT NOT NULL REFERENCES metric_defs(key),
  measured_on   TEXT,            -- 未知则 NULL
  value         REAL,
  value_text    TEXT,            -- 文本型结果，与 value 二选一
  unit          TEXT,
  ref_low       REAL,
  ref_high      REAL,            -- 单据没印上限就是 NULL，不许用通用值补
  method        TEXT,
  org           TEXT,
  report_id     TEXT,            -- 同一报告的多次修订同 ID（最近报告表口径）
  is_private    INTEGER DEFAULT 0,
  note          TEXT,
  ver           INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use        INTEGER DEFAULT 1
);

/* 指标分组标题（分节进表，不用 *_title 列） */
CREATE TABLE metric_group_titles (
  profile_key TEXT,
  group_key   TEXT,
  title       TEXT,
  hint        TEXT,
  ord         INTEGER,
  PRIMARY KEY (profile_key, group_key)
);

/* ---------- 通用（7） ---------- */

/* 报告原件登记：原件文件不进库（存资料目录），库里只有登记条目与解析状态 */
CREATE TABLE reports (
  id          TEXT PRIMARY KEY,
  profile_key TEXT NOT NULL,
  title       TEXT,
  kind        TEXT,              -- lab / imaging / endoscopy / other（原文照录）
  report_date TEXT,
  source      TEXT,              -- 原件状态：「原件在资料目录」/「只有复印件」/「口头转述」
  key_desc    TEXT,              -- 关键描述【照录】
  file_ref    TEXT,              -- 资料目录相对路径；未知 NULL
  parse_state TEXT DEFAULT 'unparsed',  -- unparsed / parsed / failed（MinerU 接入后生效）
  is_private  INTEGER DEFAULT 0,
  ver         INTEGER DEFAULT 1,
  superseded_by TEXT,
  in_use      INTEGER DEFAULT 1
);

CREATE TABLE hospitals (
  id   TEXT PRIMARY KEY,
  name TEXT,
  city TEXT
);

/* 就诊问题清单（复诊准备） */
CREATE TABLE visit_questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key TEXT NOT NULL,
  question    TEXT,
  done        INTEGER DEFAULT 0,
  is_private  INTEGER DEFAULT 0,
  created_on  TEXT,
  ver         INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use      INTEGER DEFAULT 1
);

/* 症状与生活影响（痒/累/其他）：强度只存患者自录原文与档位事实，不换算量表结论 */
CREATE TABLE symptom_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key TEXT NOT NULL,
  recorded_on TEXT,              -- 未知则 NULL
  kind        TEXT,              -- itch / fatigue / other
  itch_level  INTEGER,           -- 0–10 自评档位【患者自录】，缺 NULL；不判级
  fatigue_level INTEGER,
  night_worse INTEGER,
  sleep_breaks INTEGER,
  note        TEXT,              -- 患者原话
  is_private  INTEGER DEFAULT 0,
  ver         INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use      INTEGER DEFAULT 1
);

/* 看法与补充（患者/家属随手记，恒不为结论） */
CREATE TABLE viewpoints (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key TEXT NOT NULL,
  subject     TEXT,
  body        TEXT,
  created_on  TEXT,
  is_private  INTEGER DEFAULT 1,
  in_use      INTEGER DEFAULT 1
);

/* 文档原件与解析（MinerU 六部件接入后 parse_* 生效） */
CREATE TABLE documents (
  id          TEXT PRIMARY KEY,
  profile_key TEXT NOT NULL,
  name        TEXT,
  doc_date    TEXT,
  parse_state TEXT DEFAULT 'unparsed',
  parsed_ref  TEXT,              -- 解析产物在资料目录的相对路径
  is_private  INTEGER DEFAULT 0,
  in_use      INTEGER DEFAULT 1
);

/* 用药：只登记医生医嘱事实，更正=新版本；无 in_use 语义外的排程列 */
CREATE TABLE meds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key TEXT NOT NULL,
  name        TEXT,
  dose_text   TEXT,              -- 剂量【医嘱原文照录】
  freq        TEXT,
  start_on    TEXT,
  end_on      TEXT,              -- NULL=在用
  approval    TEXT DEFAULT 'unverified',
  in_use      INTEGER DEFAULT 1,
  is_private  INTEGER DEFAULT 0,
  ver         INTEGER DEFAULT 1,
  superseded_by INTEGER,
  created_on  TEXT
);

/* ---------- PSC 专属（3） ---------- */

/* 发作—缓解（第一实体）：一行=一次发作；end_date IS NULL=发作中（缓解日期未记录）
 * signs/labs_note/treatment 只照录原话；action_plan 只存医生行动计划原文，不生成。 */
CREATE TABLE episode_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL,
  start_date    TEXT,
  end_date      TEXT,            -- NULL=缓解未记录
  hospital      TEXT,
  signs_text    TEXT,            -- 表现【原话照录】
  labs_note     TEXT,            -- 化验变化【照录】
  treatment_text TEXT,           -- 医生处置【照录】
  action_plan   TEXT,            -- 行动计划【医生原话照录】
  is_private    INTEGER DEFAULT 0,
  note          TEXT,
  ver           INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use        INTEGER DEFAULT 1
);

/* 影像与弹性检查：MRCP / ERCP / FibroScan；跨机构按 org 陈列不合并画线 */
CREATE TABLE imaging_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL,
  kind          TEXT,            -- mrcp / ercp / fibroscan（原文照录）
  exam_date     TEXT,
  org           TEXT,
  finding_text  TEXT,            -- 发现【报告原文照录】，不判狭窄进展
  report_id     TEXT,
  is_private    INTEGER DEFAULT 0,
  ver           INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use        INTEGER DEFAULT 1
);

/* 筛查随访条目：医生已安排/已做的事实；无 next_due 排程列，「下次复查」只存医生原话 */
CREATE TABLE screening_records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL,
  kind          TEXT,            -- colonoscopy / mrcp / fibroscan / gallbladder / endoscopy
  done_on       TEXT,            -- NULL=已安排未做
  result_text   TEXT,            -- 结果【报告原文照录】
  plan_text     TEXT,            -- 医生安排原话（含复查节奏原话）
  org           TEXT,
  is_private    INTEGER DEFAULT 0,
  ver           INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use        INTEGER DEFAULT 1
);

/* ---------- 导入（3） ---------- */

CREATE TABLE import_batches (
  id          TEXT PRIMARY KEY,
  profile_key TEXT NOT NULL,
  imported_on TEXT,
  source_desc TEXT,
  file_count  INTEGER
);

CREATE TABLE import_candidates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id    TEXT REFERENCES import_batches(id),
  target_table TEXT,             -- lab_results / imaging_events / reports …
  payload_json TEXT,
  status      TEXT DEFAULT 'pending',  -- pending / accepted / rejected
  decided_on  TEXT
);

CREATE TABLE import_conflicts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER REFERENCES import_candidates(id),
  kind        TEXT,              -- duplicate / value_mismatch / unknown_field
  detail      TEXT
);

/* ---------- 试验收藏（35 号四段链路 · 0004 前置于 0001 一并冻结） ---------- */

CREATE TABLE saved_trials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL,
  trial_ref     TEXT,            -- 来源库标识（nctId 等）
  title         TEXT,
  source        TEXT,            -- ctgov / chictr_online / ictrp …
  saved_on      TEXT,
  note          TEXT,
  is_private    INTEGER DEFAULT 0,
  in_use        INTEGER DEFAULT 1
);

-- 0001_initial.sql · psc-workbench 初始 schema（M0 垂直切片：subjects 起步，M3 全量并冻结）
-- 纪律：ORDER BY rowid；显式 null；in_use；分节 *_title；分类不进趋势；无判定列（无 diagnosis/risk_level）。
CREATE TABLE IF NOT EXISTS subjects (
  subject_id  TEXT PRIMARY KEY,          -- 档案主键（family: subject/profile）
  name        TEXT NOT NULL,             -- 档案名（患者可读，非诊断）
  note        TEXT,                      -- 备注原文，无判读
  is_demo     INTEGER NOT NULL DEFAULT 0,-- 1=演示档案（合成示例），0=真实档案
  in_use      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT
);
CREATE TABLE IF NOT EXISTS app_setting (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

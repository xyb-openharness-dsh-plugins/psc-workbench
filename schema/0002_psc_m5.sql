-- PSC 工作台 · M5 服务端补充迁移（0002）。
-- 0001 已冻结（sha256 见 freeze-contract.md）：本文件只增不改——
--   ① profile_facts：档案级非表列事实（年龄/确诊日/抗体/共病/随访依从/病程阶段/试验清单等）。
--      0001 没有"档案字段"表，演示档案与真实档案的结构化字段都落在这一张表；
--      值一律 JSON 编码（标量也走 JSON.stringify），读时还原类型，显式 null 不用空串冒充。
--   ② symptom_notes.scratch：演示与患者记录里有「是否有抓痕」这一档位事实（患者自录），
--      0001 建表时漏了这一列；ALTER ADD COLUMN 只增不改既有列。
-- 红线不变：无判读列（fact_key 只是键名，键值不做判定）；更正=新 ver；裸 SELECT ORDER BY rowid。

CREATE TABLE profile_facts (
  profile_key   TEXT NOT NULL,
  fact_key      TEXT NOT NULL,
  fact_value    TEXT,            -- JSON 编码（"男"、47、"[{...}]"），读时 JSON.parse 还原
  ver           INTEGER DEFAULT 1,
  superseded_by INTEGER,
  in_use        INTEGER DEFAULT 1,
  PRIMARY KEY (profile_key, fact_key, ver)
);

ALTER TABLE symptom_notes ADD COLUMN scratch INTEGER;

--   ③ app_setting：键值设置（资料目录 data_root 的落盘记忆；面板「配置目录」选完
--      重开 Desktop 才不会回到默认位置——家族实测教训，cidp 0003 同款表前置于本仓 0002）。
CREATE TABLE app_setting (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT
);

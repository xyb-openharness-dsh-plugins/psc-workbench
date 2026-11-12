# freeze-contract · psc-workbench

- 冻结文件：schema/0001_initial.sql
- sha256：`12de9eb6d7c33ffd9a960f7e52ed46ceb336d9623304e26b32be65958c217868`
- 冻结时间：2026-11-13 01:50（M3 · 夜间无人值守）
- 纪律：G3 后结构变更只能新增 000N_*.sql；改冻结文件会被 check 拦下。判读列断言（check-schema-words）已入 check 链。
- 表清单（15）：档案级 2（subjects / section_titles）· 指标 3（metric_defs / lab_results / metric_group_titles）· 通用 7（reports / hospitals / visit_questions / symptom_notes / viewpoints / documents / meds）· 专属 3（episode_events / imaging_events / screening_records）· 导入 3（import_batches / import_candidates / import_conflicts）· 试验收藏 1（saved_trials，35 号四段链路）
- 语境要点：episode_events.end_date IS NULL=发作未记缓解；action_plan/treatment_text/plan_text 全部【原话照录】不生成；screening_records 无 next_due 排程列；imaging_events.finding_text 只存原文不判狭窄进展；lab_results.ref_high NULL=单据未印上限不许补通用值；全部派生值（随访第 N 天/距上次发作 N 天/近 90 天发作次数/距上次肠镜 N 月）读时计算不落库。

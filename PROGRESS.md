# PROGRESS · psc-workbench（原发性硬化性胆管炎 PSC）

当前里程碑：M0 完成 → M1 进行中
认领记录：2026-11-12 23:10 夜班代理无人值守认领，issue #73（claimed 标签已挂），仓 xyb-openharness-dsh-plugins/psc-workbench（私有）
已完成：BACKLOG 快照落盘（night-shift-20261113/BACKLOG-snapshot-20261112.md）· starter init（246 文件，config psc.config.json）· cordis.patch.yml config.root 接线 · dsh/index.js 补 root 声明 · 包检查 staticPass=true
下一步：M0 文档九件（SPEC / DEV-REQUIREMENTS / DIFF-MATRIX / PATIENT-FLOW / SCENARIOS / USER-RESEARCH / INTERACTION-DESIGN / CLINICAL-DATA / DEV-PLAN）+ 基线 npm run check
阻塞：无（GitHub 直连 443 间歇抖动，git 走本地 19444 中继代理，已解决）
闸口结论：无（未到闸口）

## 2026-11-13 00:20 · M0 完成

已完成：文档九件落盘（SPEC/DEV-REQUIREMENTS/DIFF-MATRIX/PATIENT-FLOW/SCENARIOS/USER-RESEARCH/INTERACTION-DESIGN/CLINICAL-DATA/DEV-PLAN，全部 PSC 原创）· 资料目录闸门接通（pickDataDir 真入口+拒绝清单）· 患者档案闸门垂直切片（schema/0001 subjects + POST /api/psc/subjects + 新建档案 UI，is_demo=0）· dsh/index.js 补 root 声明
实测：npm run check exit=0 全绿（静态包合同 staticPass=true）；npm test 4/4 pass
下一步：M1 三路并行（医学约束 10 主题 / 用户研究二手检索 / 家族结构对比 DIFF-MATRIX 实测重名率）→ G1 自动签认
阻塞：无
闸口结论：无（未到闸口；G1 预计 M1 完成后自动签认待晨审）

## 2026-11-13 03:10 · M2/M3/M4 完成，M5 进行中

- M2：三探针全绿（page-view 13/13、primer 10/10、psc-m2 54/54）+ 独立评审 P0=0（P1 命名空间已修复复跑）+ G2 自动签认（docs/signoffs/G2-自动签认.md，C4/C8/MT14 如实跳过）
- M3：schema 19 表冻结（sha256 12de9eb6）+ 判读列断言过 + G3 自动签认
- M4：fetch-psc-trials-2026 真实采集 220 条，manifest=jsonl=sqlite 三处对账一致（含 hash）；chictr_online failed / pancreatic_archive unconfigured 如实记录（research/psc/FAILED.md）；ClinicalTrials.gov 独立口径 159 条另记
- README：7 张实渲截图墙 v0.1.0
- M5：开发版七步移植子代理进行中（dsh 栈/src→build→lib/public/test 十套/版本 0.2.0）
- 下一步：M5 验收（check/test/audit/探针）→ V1 签认 → M6 装机尝试

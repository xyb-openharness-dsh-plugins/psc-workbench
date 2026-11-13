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

## 2026-11-13 06:20 · 夜班收班状态

当前里程碑：M0–M6 完成；M7/M8 冻结草稿已备；M9 回流已推 starter（L101–L105）
已完成：G1/G2/G3/V1/V2 自动签认（docs/signoffs/，全部待晨审追认）；V3 真机走查待人工
实测数字：check exit=0 · test 44/44 · audit 44/44 · 探针 54/54+13/13+10/10 · 试验快照 220 条三处对账一致 · tgz 57 文件
阻塞：V3 待人工（宿主 a11y/HTTP 均不可驱动）；M5 子代理配额中断一次已由主代理收尾
下一步（晨审）：① 追认六项默认值 ② 换品牌名（DuctPal 撞 PBC）③ 执行 M7 tag/release ④ M8 BACKLOG PR ⑤ V3 人眼走查

## 2026-11-14 · 验收加固轮（0.2.0 → 0.2.1，夜班无人值守）

当前里程碑：M0–M6 + M9 已完成之上，按 D1–D4 交付流水线完成验收加固轮
已完成：三条不可让步全过（§2 五件门禁 exit 0 + self-test 全部能红）· 记录写入闭环补齐（addEntry 八 kind + setPrivacy 双寻址 + POST 路由 + 前端双通道，write-api 4/4 · probe PR1–PR4 API 态 4/4）· check-trial-matching 入链（trialMatch 别名 + starter 模板触发面升级回流 L111）· check-trial-snapshot 去 --if-present · 设置三 tab 弹层补齐 · 修复筛查保存无事件 / 刷新丢当前档案 / readJson 吞错 · 0.2.1 装入 Desktop live profile（sha256 c0737dc6…，bundles 76）
实测：check exit=0（48/48）· audit 44/44 · m2 探针 54/54 · DP 10/10 · page-view 13/13 · PR 探针 5过/0红/3如实SKIP
下一步（晨审）：① 用户完整退出重开 Desktop 后实机走查三条（AI 对话 / 配置目录 / ＋新建档案）+ verify-desktop-load ② 追认六项默认值与品牌名 ③ M7 tag/release、M8 BACKLOG PR（草稿在 docs/release-draft/，无授权不执行）④ F 组页面级录入表单补齐
阻塞：无（V3 真机待人工为流程属性，非阻塞）
闸口结论：V2 复验通过（装机 0.2.1）；V3 待人工

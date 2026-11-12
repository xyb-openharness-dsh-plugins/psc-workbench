# DEV-PLAN · psc-workbench（原发性硬化性胆管炎 PSC）

版本：v0.1（M0/M1 草案）· 认领模式：无人值守夜班（晨审追认）

## 一、认领记录

- 病种：原发性硬化性胆管炎（PSC, Primary Sclerosing Cholangitis）
- BACKLOG 定位：罕见病目录 #68 · R2 非肿瘤慢性病型（FSHD 形态）· T2
- 认领 issue：xyb-openharness-dsh-plugins/.github #73（2026-11-12 23:15 提交，/claim 后 claimed 标签已挂；机器人首答缺 claim 标签，实为发帖时未带标签，补挂后重试即通过——已记入 LESSONS 待回流）
- 仓：xyb-openharness-dsh-plugins/psc-workbench（私有，2026-11-12 建仓）
- BACKLOG 快照：本机 night-shift-20261113/BACKLOG-snapshot-20261112.md（快照时点 2026-11-12 23:09，快照明显滞后于实际进度，认领前已与本地仓 + 组织仓列表 + 开放 issue 三方对账）

## 二、选择理由（BACKLOG §4 口径）

1. **优先级**：剩余未认领池中 R2 慢性病族最充裕；PSC 在《86 个罕见病诊疗指南（2025 年版）》内（401 页，T2），指南体量为剩余候选最大。
2. **随访天然结构化**：肝功能化验（ALP/胆红素/转氨酶）按周期复查、MRCP/FibroScan 影像随访、胆管炎发作—缓解区间、IBD 共病肠镜监测——与 R2「确诊档案 + 功能与日常 + 并发症筛查 + 医保与资源」四块形态直接吻合。
3. **差异化明显**：组织内肝胆家族既有仓均为肿瘤语义（biliary-tract-workbench、liver-cancer-workbench）；pbc-workbench 是免疫性胆管炎（AMA+、UDCA 应答评估），PSC 为胆管纤维化狭窄（MRCP 狭窄、ERCP、IBD 共病），监测路径与患者日常语言不重叠。差异化矩阵见 DIFF-MATRIX.md。

## 三、里程碑推进

按家族 M0–M9 里程碑推进；夜班时间盒 2026-11-12 23:00 → 2026-11-13 08:00。每个里程碑本地 commit 并更新 PROGRESS.md；闸口按 G1/G2/G3/V1/V2/V3 逐项实测。

## 四、无人值守边界

允许：认领 issue 与 /claim、建私有仓、本地 commit、push 本仓、项目内文件与脚本、装本机 DSH Desktop profile。
冻结备稿：M7 的 tag 与 GitHub release、M8 的 BACKLOG 回填 PR——只备草稿存 docs/release-draft/，不发布。
禁止：公开发布、向他人仓库推送、删除既有仓库或 issue。

## 五、可回退默认值（无人值守模式，晨审追认）

| # | 决策点 | 夜班默认值 | 追认时替换为 |
| --- | --- | --- | --- |
| 1 | 服务主体 | PSC 患者本人为记录主体；家属照护协助为次级视角 | 用户访谈后定 |
| 2 | 病程覆盖 | 确诊后全病程：确诊依据 → 长期随访 → 发作与并发症 → 共病监测；不含移植后（移植评估材料整理含，移植后管理不含，属另一阶段） | 用户确认 |
| 3 | 品牌名 | 小胆宝 DuctPal（占位，DuctPal 与 pbc 小管宝撞形） | 用户定名后全局替换 |
| 4 | MinerU | 未接入（M5 六部件做接口契约与降级路径，真实解析待接入后验证） | 接入后补验证 |
| 5 | 模型 | glm-3.5-flash（免费档，夜班唯一可用模型） | — |
| 6 | 试验线 | 保留：ClinicalTrials.gov 实测 159 条（query.cond=primary sclerosing cholangitis，快照 2026-11-12） | — |

## 六、已知风险

1. **PSC 与「肿瘤语义红线」的边界**：PSC 患者胆管癌与结直肠癌风险升高，随访含肿瘤监测——但工作台按非肿瘤病种组织：以「医生已安排的筛查随访」口径呈现筛查条目，全站禁用分期/线序/疗效排序词；判读归医生。
2. **PBC 撞形**：pbc-workbench 先行且同为胆管疾病，文档与界面文案全部 PSC 原创，差异化矩阵逐条列清。
3. **0 患者访谈、0 临床审核**：如实标注；阈值与求助短语全部【待核】占位。

# 验收加固轮报告 · 2026-11-14（夜班无人值守 · 0.2.0 → 0.2.1）

> 轮次性质：续跑 2026-11-13 夜班（M0–M6+M9 完成、G1–V2 自动签认待追认）之后的验收加固轮。
> 按 FULL-CYCLE-KICKOFF §5/§6、FAMILY-INSPECTOR（D2 独立体检）、USER-ACCEPTANCE-AUTOFIX（D3）执行。
> 结论词只用：通过 / 失败 / 跳过（原因）/ 待人工（缺什么证据）。

## 0. 一句话总评

上一轮交付的「看」是完整的，这轮把「写」补齐了：八 kind 记录写入 + 私密切换落库 + 双通道前端；
试验匹配闸门入链；设置三 tab 补齐；修复 2 个真实缺陷（筛查保存无事件、刷新丢当前档案）。

## 1. 三条不可让步（逐条带命令与数字）

| # | 项 | 结论 | 证据 |
| --- | --- | --- | --- |
| ① | 配置目录真入口 | 通过 | `lib/client.js` `pickDataDir()`（宿主选择器优先，拒绝主目录/桌面/下载根/tmp，服务端二次校验 `/root` 路由 + 回显 + app_setting 落盘）；`check-data-dir` exit=0，`--self-test` 红证 |
| ② | 临床试验四段完整 | 通过 | `check-trial-chain` exit=0（建档/检索/匹配/呈现收藏齐）；快照 220 条三处对账一致（`check-trial-snapshot` exit=0，已去 `--if-present`）；`check-trial-matching` 本轮补入链后 exit=0（0.2.0 期间该闸门缺失——见 §3 修复①）；卡头口径「已载 220 / 相关 148 / 不是全库扫描 · 快照 2026-11-13」；通道终态原样（chictr_online failed / pancreatic_archive unconfigured / ictrp truncated 如实展示于设置·临床数据库与 trials/sources 两处同源） |
| ③ | demo 之外可新建患者并写 sqlite | 通过（本轮补齐记录写入） | 档案级：0.2.0 已有（POST /api/psc/subjects → is_demo=0，PR2 实测 mine=1/demo=2）；记录级：本轮新增 `Workbench.addEntry`（8 kind + screening/imaging/viewpoint）与 `setPrivacy`（rowid 与 e1/q1/d1/mind3 双寻址）；`test/write-api.test.mjs` 4/4；`probe-psc-write` PR1–PR4 API 态 4/4 PASS（reload 持久化：档案 ✓ 记录 ✓ 私密 ✓），无 API 形态 PR2–PR4 记 SKIP（原因注明） |

## 2. 五件门禁（§2 逐件）

| 门禁 | 结果 | self-test |
| --- | --- | --- |
| check-data-dir | exit=0 | 能红（内置反例断言通过） |
| check-trial-chain | exit=0 | 能红（bad 样本 fail 列表齐全） |
| check-patient-create | exit=0 | 能红 |
| check-trial-snapshot | exit=0（--if-present 已移除） | 能红 |
| check-trial-matching | exit=0（本轮新增入链） | 11/11 反例全红 |
| 附：check-agent-pane-contract | exit=0 | 能红 |

## 3. D2 独立体检（FAMILY-INSPECTOR A–H 四态摘要）

| 组 | 结论 | 证据 / 缺口 |
| --- | --- | --- |
| A UI 风格 | 通过（抽查） | 运行态巡检截图 12 张（/tmp/psc-inspect/），三档断点探针 C9 PASS（390 无溢出）；A 组逐项与基准仓逐屏比对为待人工（本轮以探针 + 上轮 HVT 证据替代，未重新逐屏人眼比对） |
| B 菜单完整性 | 通过 | 10 条一级导航逐页渲染非空（巡检 text>100 字）；临床线落点=「临床研究」一级 + 设置·临床数据库 tab（本轮补） |
| C 设置三 tab | 通过（本轮补齐） | 0.2.0 缺设置弹层 → 本轮补工作区/MinerU/临床数据库三 tab（tablist + aria-selected + 返回/✕ 双入口 + Esc）；MinerU tab 明示「未接入：勾选与保存不联网」 |
| D 一图秀 | 通过 | probe-psc-m2 C 组断言 + page-view 13/13 |
| E 临床试验 | 通过（本轮加固） | 见 §1②；修复闸门失明（§3①）；来源说明页与设置 tab 共用同一份 snapshotMeta（220/148/终态原样） |
| F 录入窗口 | 部分通过 | 有：痒累、筛查（本轮修复无事件缺陷）、就诊问题、导出；薄弱待人工：发作/化验/用药/就医信息（多家医院）页仍为只读回顾 + API 写入通道已有但页面无表单入口 |
| G 数据层 | 通过 | 19 表冻结 sha256 不变（本轮未动 schema）；新增写入不落判读列（check-schema-words 过） |
| H 红线复扫 | 通过 | check-wording / check-schema-words / probe Q35a–d（私密三出口）/ H3 非肿瘤语义探针全过 |

## 4. D3 修复清单（同类最多 2 轮，全部 1 轮修复）

1. **试验匹配闸门失明**（P0）：`check-trial-matching` 模板缺失 + 触发面只认符号名 → 模板入链 + `trial-match.js` 加 `export { matchTrial as trialMatch }` 别名 + starter 模板触发面升级（回流 L111）。
2. **记录写入链缺失**（P0，不可让步③）：§1③ 全套补齐。
3. **筛查「记一次结果」按钮无事件**（P1）：原型加 demo 态处理器 + 双通道接管。
4. **刷新后档案跳回第一份**（P1）：当前档案 localStorage 持久化（新建/切换都记住）。
5. **`check-trial-snapshot` 带被禁 `--if-present`**（P1）：移除。
6. **readJson 静默吞 JSON 解析错**（P2）：改为 400 可读错误。
7. **设置弹层缺失**（P1）：本轮补齐（§C）。
8. **demo file:// 形态缺新建档案入口**（P2）：入口保留 + 明说「演示态不能落库」。

## 5. 修后全量复跑（D3→D1 复跑）

- `npm run check` exit=0（48/48，含新增写链 4 条）
- `npm test` exit=0（48/48）
- `npm run audit` exit=0（44/44 · 0 失败 · 0 待人工）
- probe-psc-m2 54/54 · probe-page-view 13/13 · probe-disease-primer 10/10（URL：http://127.0.0.1:8791/prototypes/v0.2/index.html）· probe-psc-write 5 pass / 0 fail / 3 skip（SKIP 已注明）
- 版本 0.2.1：VERSION = package.json = lib/version.js = 页面注入（check-version-literal 过）

## 6. D4 装机（V2）

- `release/xyb-community-psc-workbench-0.2.1.tgz`（58 文件 · sha256 `c0737dc6a063e0bcef3d01d6448b4b1bc01aa814ace1670c62616e318d71014b`）
- 装入 DSH Desktop 唯一目标 profile（harness/profiles/web）：依赖 file:…0.2.1.tgz，bundles 76 登记，`node_modules/@xyb-community/psc-workbench/package.json` version=0.2.1
- `check-install.mjs`：✓ 已登记到 Desktop 实际加载的 profile（0.2.1）
- **未验证（待用户）**：完整退出并重开 DSH Desktop 后，点「AI 对话」「配置目录」「＋ 新建档案」三条实机路径；`verify-desktop-load` 需重启后跑。夜班代理不自行重启 Desktop。

## 7. 待人工 / 未验证清单

1. V3 真机走查（重启 Desktop 后实机三条 + 截图刷新 README）
2. F 组薄弱：发作/化验/用药/就医信息页的页面级录入表单（写入 API 已通，缺 UI 入口）
3. 就医信息多家医院 UI（F6）：hospitals 表与写入 API 就绪，页面未列医院卡片
4. README 截图仍为 0.1.0/0.2.0 版本；0.2.1 新增面（设置弹层/私密按钮）未补实渲截图
5. episodes（发作）行的私密切换按钮未加（symptom/mind 已通；episode 私密可经 API setPrivacy，无 UI）

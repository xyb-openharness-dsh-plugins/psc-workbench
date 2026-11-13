## 0.2.1 — 2026-11-14（写入闭环 + 体检加固轮 · 夜班无人值守）

- 记录写入闭环（不可让步③）：`Workbench.addEntry` 八个 kind（episode/bleed・lab・treatment・question・hospital・report・doc・mind，另支持 PSC 专有 screening/imaging/viewpoint）+ `setPrivacy`（rowid 与 e1/q1/d1/mind3 两种寻址）落 sqlite；`POST /subjects/{key}/{kind}` 与 `POST /privacy` 路由；capabilities 加 `write`/`privacy`
- 前端双通道：痒累保存 / 筛查随访记一次 / 就诊问题 / 私密切换在 API 态走库并重载（toast 逐字「已保存到本机数据库」），演示态明说「不落库」；修复筛查「记一次结果」按钮无事件、刷新后档案跳回第一份（当前档案 localStorage 保持）两个真实缺陷
- 试验匹配闸门：starter 模板 `check-trial-matching.mjs` 入 check 链；`trial-match.js` 补 `trialMatch` 导出别名（闸门识别匹配模块本体）；`check-trial-snapshot` 去掉被禁的 `--if-present`
- 设置弹层三 tab（工作区 / 文档解析 MinerU / 临床数据库）进原型；来源说明与设置 tab 共用同一份快照口径（220 条 / 相关 148 / 逐通道终态原样，failed 不算查过）
- 新增 `test/write-api.test.mjs` 四组与 `scripts/probe-psc-write.mjs` PR1–PR4（双形态，SKIP 如实注明；self-test 红证）

## 0.2.0 — 2026-11-13（M5 开发版移植）

- dsh 服务栈（workbench/server/store/readmodels/demo/mineru）PSC 化移植；19 表 schema + 0002 补充迁移
- public/ 定点移植（原型 + 白名单替换点），ui-parity 断言入 test
- src/client.js → build → lib/client.js 真客户端链路；版本 0.1.0 → 0.2.0
- test 44 条全过；check 全绿；三探针复跑 54/54、13/13、10/10
- 临床试验检索页接入真实关键词检索；试验快照 220 条（manifest/jsonl/sqlite 三处对账一致）

# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

## 0.1.0 — 2026-11-12

- 由社区脚手架 dsh-wb-cli@1.10.0-rc.46 (9061c5c) 初始化，仅有注册骨架与健康接口，无业务功能。

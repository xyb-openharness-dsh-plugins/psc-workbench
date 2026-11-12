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

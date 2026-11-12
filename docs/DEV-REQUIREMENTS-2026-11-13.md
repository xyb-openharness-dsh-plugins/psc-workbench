# DEV-REQUIREMENTS · 2026-11-13 夜班硬约束执行清单

每条硬约束附可执行验收命令（或截图路径）。只列本夜班新增/易错的；家族通用纪律见 DEV-REQUIREMENTS.md。

| # | 约束 | 验收命令 / 证据 |
| --- | --- | --- |
| 1 | 资料目录闸门：真选择 + 拒绝清单 + dsh 读 config.root | `node scripts/check-data-dir.mjs .` 全 ✓ |
| 2 | 患者档案：新建/列表/切换/is_demo | `node scripts/check-patient-create.mjs .` 四判据过 |
| 3 | 试验线四段齐（建档/检索/匹配/呈现收藏） | `node scripts/check-trial-chain.mjs .` ✓ |
| 4 | 判读列：无 diagnosis/risk_level | `node scripts/check-schema-words.mjs .` pass=true |
| 5 | 原型与开发版 ui-parity | `npm test` 的 ui-parity 三条 |
| 6 | 版本同源（VERSION/package.json/CHANGELOG/README） | `node scripts/check-version-literal.mjs` |
| 7 | 私密三出口过滤（看板/导出/AI） | `node scripts/probe-psc-m2.mjs` 私密注入断言 |
| 8 | 两套合成档案不串档 | 同上 MT13 断言 |
| 9 | 禁词扫描（PBC/AMA/换线/线序/疗效应答） | `grep -rn "PBC\|胆汁性\|AMA\|换线\|线序" prototypes/ public/ lib/ dsh/ src/ docs/` 0 命中（否定式自述除外） |
| 10 | 消息命名空间 psc:（禁 pbc: 残留） | `grep -rn "pbc:" prototypes/ public/ lib/ dsh/ src/` 0 命中 |

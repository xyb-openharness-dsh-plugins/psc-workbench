# FAILED · psc-workbench 试验采集（快照 2026-11-13）

## 真查过、真的失败
| 来源 | 终态 | 说明 |
| --- | --- | --- |
| chictr_online | failed（upstream FAILED，queried=0） | 平台侧失败，**未查过**；不得写成"已查、没有试验"。修复后重跑 fetch-psc-trials-2026.mjs 补采。 |

## 未配置
| 来源 | 终态 |
| --- | --- |
| chictr_pancreatic_archive | unconfigured（NEEDS_SETUP；胰腺癌离线语料，对 PSC 无覆盖） |

## 已查且入库（220 条，manifest=jsonl=sqlite 三处对账一致）
| 来源 | 条数 | 终态 |
| --- | --- | --- |
| ictrp（WHO ICTRP） | 213 | truncated（SUCCESS 但命中超单次上限，只含前 N 条，不得当作全部命中） |
| chinadrugtrials（药物临床试验登记平台） | 5 | ready |
| ctv（国际公开聚合） | 2 | ready |
| xyb_chinadrugtrials_archive | 0 | ready（NO_RESULTS：真查过、真没有） |

## 另一独立实测口径
- ClinicalTrials.gov api/v2（query.cond=primary sclerosing cholangitis，countTotal）= **159 条**（2026-11-12 实测）；该通道不在本轮 unified-trial-mcp 通道内，单独记录，不计入 220 条。
- 界面呈现纪律：候选线索分层呈现；登记研究≠干预试验；truncated 来源不得标"已查全"。

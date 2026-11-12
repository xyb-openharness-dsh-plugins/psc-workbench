# M2 独立评审 · prototypes/v0.2（2026-11-13）

评审人：M2 只读评审子代理。对象：prototypes/v0.2/{index.html,app.js,style.css,demo-data.js,primer-data.js,primer.js,bridge.js}。语法检查：`node --check` 全部 6 个 js OK。

## 1. 禁词全站扫描

命令：`grep -n -E 'PBC|胆汁性|AMA|amaM2|换线|线序|小管宝|预后|生存期|GLOBE|UK-PBC' *.js *.html *.css` → **3 命中，0 红线命中**：
- app.js:490 「非肿瘤不套疗程/线序语义」— 否定式声明，判 **P2**（合法上下文）。
- app.js:791 「不生成疾病活动度或预后评分……界面也不写"好转/恶化"」— 否定式红线自我声明，判 **P2**。
- primer-data.js:168 「不生成疾病活动度或预后评分（Mayo/MELD 等模型是医生的判定工具）」— 否定式，判 **P2**。

扩展扫描（应答|疗效|分期|病期|UDCA）：全部为否定式/图例语义（"单点不连线""不代表疗效" app.js:746、"不判纤维化分期" app.js:194/475、primer-data.js:26）。**病期/线序/疗效/预后/生存期/应答判读 = 0 命中；PBC/胆汁性/AMA/amaM2/UDCA应答/换线/小管宝/GLOBE/UK-PBC = 0 命中**。判读归医生、阈值【待核】语义在场（demo-data.js:661、primer-data.js:147/157、app.js:507）。

## 2. 跨仓语义残留

- demo-data.js antibodies：A=panca:untested/ana:negative（L15）、B=panca:positive/ana:positive（L472）——PSC 参考口径，**无 amaM2 残留**；app.js:453 标注「PSC 只作参考，不作诊断依据」。
- fibrosis：A=null、B=FibroScan 12.6 kPa「报告原文抄录，未判读」（L477）；app.js:475 「不判断纤维化分期」。语义无错位。
- screening types 实测：`["mrcp","gallbladder","colonoscopy","fibroscan","endoscopy","untested"]`——**无 bone/thyroid 残留**（demo-data.js:497「甲状腺功能减退」在 comorbidity，PSC 常见合并症，合法）。
- UDCA 出现于治疗节点（demo-data.js:207/759，药名"熊去氧胆酸"）：PSC 患者实际可能用药、记医嘱原文合法；primer-data.js:147 明写「UDCA 在 PSC 的有效性存在国际争议【待核：不进界面】」——判 **P2**（建议保持现状）。
- 字段对账：`node` 脚本提取 app.js 全部 `p.*` 访问（21 个字段）vs demo-data 顶层键 → **缺失 0**，渲染不引用不存在字段。
- **P1 ×1**：bridge.js:11/22、app.js:6/1546 的消息命名空间仍为 `pbc:agent-draft` / `pbc:ui-ready` / `pbc:agent-open`——前病种命名残留（用户不可见，但属跨仓语义残留；改名需与 DSH Desktop 外框 lib/client.js 同步，单侧改会断联）。

## 3. demo 唯一源抽查（≥5 处）

抽查 5 处，页面数字全部派生自 demo-data.js，**无 P0**：
1. 近 90 天发作次数：app.js:498 `episodesIn90(eps)` 读时算；来源 demo-data.js:559/571/583（2023-02-10/2025-01-18/2026-04-30 → 今日 0 次）。probe EP2 实测 PASS「近 90 天 0 次如实」。
2. ALP 值：A=312（demo-data.js:164）/268（:232），B=310（:780）/179（:944）；`grep '\b(312|268|310|179|12.6)\b' app.js primer*.js index.html` → **0 命中**（无写死）。
3. 随访第 N 天：app.js:334 由 startedAt 派生（A=2026-10-21），probe expectedDaysSince 同口径 PASS；app.js:270 注释明说弃用写死日期。
4. 肠镜距上次月数：B colonoscopy 2025-06-18（demo-data.js:659），app.js:884 `monthsSince()` 动态；probe BEP1 PASS。
5. 指标卡/系列计数：app.js:656 起由 `p.labs` 派生，无「共 N 项」写死（grep 0 命中）；primer-data.js:173「实测 159 条」与 docs/CLINICAL-DATA.md:10「实测 159 条，快照 2026-11-12」一致。

## 4. 页面清单对账

`node` 四方提取 + set diff 实测：**NAV 叶子 32、VIEWS 32、ROUTES 32、probe-psc-m2.mjs LEAF_ROUTES 32，四方 set 完全一致**（NAV-only / ROUTES-only / LEAF-only / VIEWS-only 全为空）。`node scripts/probe-psc-m2.mjs` 实测 **54/54 PASS（0 fail）**，含 IP2「30 条叶子路由全部 hash 直达渲染非空（孤儿页=0）」与导航漏项检查 → **孤儿页=0、导航漏项=0**。

## 结论

**P0 计数：0**（P1 ×1：`pbc:` 消息命名空间残留；P2 ×5：3 条否定式禁词自述 + UDCA 节点 + 医嘱原文类提示）。

总体结论：**可过 G2**。红线零命中、demo 唯一源成立、四方路由一致、54 项探针全过；建议下一迭代把 `pbc:agent-*` 命名空间随外框协议一并改为 `psc:`（P1，需双侧同步）。

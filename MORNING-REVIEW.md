# MORNING-REVIEW · psc-workbench 夜班 2026-11-12 23:00 → 2026-11-13（收班时点更新）

## 一、一句话结论

认领 PSC（罕见病 #68，issue #73）并完成 M0–M6（M5 子代理配额中断由主代理收尾）与 G1/G2/G3/V1/V2 自动签认；V3 真机走查待人工；M7/M8 冻结草稿已备（docs/release-draft/）；无停闸。

## 二、原型审查入口

- 打开方式：双击 `prototypes/v0.2/index.html`（file:// 可开，两套合成档案切换在顶栏「切换档案」）；或 `python3 -m http.server 8471 --directory prototypes/v0.2` 后访问 http://127.0.0.1:8471/index.html。
- 截图位置与清单：`assets/screenshots/`（v0.1.0 7 张：dashboard-A/B、episodes-timeline-B、onechart、disease-primer、fold-collapsed/expanded）。
- 探针复跑命令（签认表 URL 同此）：`python3 -m http.server 8471 --directory prototypes/v0.2` + `node scripts/probe-page-view.mjs --url http://127.0.0.1:8471/index.html`（13/13）+ `node scripts/probe-disease-primer.mjs --url http://127.0.0.1:8471/index.html`（10/10）+ `node scripts/probe-psc-m2.mjs --port 8147`（54/54）。

## 三、自动签认清单（全部待晨审追认）

| 闸口 | 文件 | 结论 |
| --- | --- | --- |
| G1 | docs/signoffs/G1-自动签认.md | 自动签认通过（待追认） |
| G2 | docs/signoffs/G2-自动签认.md | 自动签认通过（待追认；C4/C8/MT14 如实跳过） |
| G3 | docs/signoffs/G3-自动签认.md | 自动签认通过（待追认） |
| V1/V2/V3 | 未签（M5 收尾后 V1 依据 check/test/audit 实测补签；装机验证状态见下） | — |

## 四、待用户决策项

1. DEV-PLAN §五 六项默认值：服务主体/病程覆盖/品牌名（DuctPal 与 PBC 小管宝撞形）/MinerU/模型/试验线保留。
2. 品牌名：强烈建议晨审换名（pbc-workbench 已用 DuctPal）。
3. M7 tag/release 冻结草稿（docs/release-draft/）与 M8 BACKLOG 回填 PR 草稿——追认后执行。
4. 独立评审遗留 P2 三处否定式自述文案是否保留。

## 五、消耗

- 时长：23:00 开班至收班（约 9 小时）。
- token：以客户端可见数据为准；子代理合计约 1050 万（三个研究/移植代理），主代理 token 未取得客户端读数。
- 模型：glm-3.5-flash（免费档，全程唯一模型）。

## 六、未验证与异常

- **装机（M6）**：V2 自动签认通过（Desktop profile 装包、bundles 76、verify-desktop-load 实证加载、数据目录已生成）；**V3 真机走查待人工**（a11y 树不透明、2649 非业务 HTTP 口，不可外部驱动）。
- **chictr_online 采集失败**（upstream FAILED）：如实记录于 research/psc/FAILED.md，未写"已查"。
- **GitHub 443 抖动**：DNS 解析失活 IP，克隆/推送多次重试成功（路径错换路径，不计重试上限）。
- **C4/C8**（治疗节点开关/时间窗）：原型无对应控件，如实跳过；MT14 压测未做。
- **并发与配额限制**：免费档单并发（家族对比子代理因并发失败改由主代理完成）；M5 移植子代理跑至大半后因配额超限中断（dsh/src/lib/public/test 已大面积落地），由主代理补齐收尾（试验链关键词检索、check 链全链、CHANGELOG 0.2.0、audit 4 项修复）。

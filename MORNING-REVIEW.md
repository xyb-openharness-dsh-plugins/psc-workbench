# MORNING-REVIEW · psc-workbench 夜班 2026-11-12 23:00 → 2026-11-13（收班时点更新）

## 一、一句话结论

认领 PSC（罕见病 #68，issue #73）并完成 M0–M4 + M5 移植（进行中收尾）与 G1/G2/G3 自动签认；V1/V2/V3 与 M7/M8 全部只备稿未执行，无停闸。

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
- token：以客户端可见数据为准；本轮未取得精确读数（子代理合计约 1050 万，供参考）。
- 模型：glm-3.5-flash（免费档，全程唯一模型）。

## 六、未验证与异常

- **装机（M6/V2/V3）**：DSH Desktop.app 已检出（doctor: appDetected=true），pack/装机因 M5 收尾时间未走完——最终状态以 PROGRESS.md 尾部与 docs/signoffs/ 为准。
- **chictr_online 采集失败**（upstream FAILED）：如实记录于 research/psc/FAILED.md，未写"已查"。
- **GitHub 443 抖动**：DNS 解析失活 IP，克隆/推送多次重试成功（路径错换路径，不计重试上限）。
- **C4/C8**（治疗节点开关/时间窗）：原型无对应控件，如实跳过；MT14 压测未做。
- **并发限制**：免费档同时只跑一个子代理，家族对比子代理因并发失败改由主代理完成。

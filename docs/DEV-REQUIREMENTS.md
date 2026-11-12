# DEV-REQUIREMENTS · psc-workbench 开发需求与纪律

版本：v0.1 · 夜班无人值守模式 · 默认值见 DEV-PLAN §五

## 一、四条总原则

1. 原型是唯一视觉与交互基准，开发版逐项对齐（ui-parity 逐字符）。
2. 事实与演示数据各有唯一来源（demo 两套合成档案为演示唯一源）。
3. 没有实测不写通过（闸口逐项实测；SKIP 不计覆盖）。
4. 每项约定写清适用语境、反例与可执行验收。

## 二、患者视角红线

- 功能按患者关心的信息维度组织；医生任务冒充患者需求属独立评审一票否决。
- 每条功能线挂证据层级；0 访谈如实声明。
- 0 临床审核必须标注；阈值一律【待核】。

## 三、非肿瘤语义红线

- 全站禁词：分期 / 线序 / 疗效 / 预后 / 生存期 / 病期 / D+N / day_index。
- 发作—缓解区间带替代症状色块；「较上次」替代下降级箭头。
- 胆管癌相关只以筛查随访条目呈现，无风险判读。

## 四、数据层纪律

- ORDER BY rowid；显式 null（不用空串冒充）；in_use 字段；分节 *_title；分类不进趋势。
- 无 diagnosis / risk_level / activity_score 类判定列。
- 演示数据唯一源；切换整页联动不串档；界面上标注「合成示例 / 仅演示 / 未连接宿主」。

## 五、可回退默认值（无人值守，晨审追认）

见 DEV-PLAN §五（服务主体 / 病程覆盖 / 品牌名 / MinerU / 模型 / 试验线）。

## 六、错误来源登记（夜班实测）

| # | 错误 | 来源 | 处置 | 回流 |
| --- | --- | --- | --- | --- |
| 1 | git 直连 github.com:443 全挂（DNS 解析到失活 IP） | 本机网络 | 换路径：本地 Node CONNECT 中继 → 仍不稳 → 直连重试循环成功（克隆第 5 次、push 第 2 次）；git 配置 http.version=HTTP/1.1 备用 | starter LESSONS 待回流：网络抖动属路径错不计重试上限 |
| 2 | /claim 机器人拒答：issue 缺 claim 标签 | .github 机器人 | 用 gh issue edit --add-label 补挂后重发 /claim 即过 | 认领流程文档应写「issue 创建时须带 claim 标签」 |
| 3 | starter init 生成的 cordis.patch.yml 无 config.root、dsh/index.js 不读 config.root | starter 模板 | 手工补齐；check-data-dir ③ 才绿 | starter 模板应内置（M9 回流） |
| 4 | 生成版 dsh/index.js health 路径 /api/psc/health 与家族 DATA_ROOT_URL 口径不一致 | starter | M5 统一为 /api/psc/root + health | 待回流 |

## 七、验收链

npm run check 全绿（基线 staticPass=true）；npm test 全过；audit 数字照抄；dsh-wb-cli audit fail 不交付；版本号四处同源（package/VERSION/CHANGELOG/README）。

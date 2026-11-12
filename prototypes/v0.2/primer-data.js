/* 36 号 · 疾病概要数据（window.DISEASE_PRIMER）—— psc-workbench PSC 版
 *
 * 内容口径：
 *   - 四段固定顺序 definition → evidence → landscape → trend，缺段不删；
 *   - 病种内容只写本仓 README 与 docs/（含 docs/research/medical-topics.md）已写明的说法，
 *     不写判定、不复制指南条文；非肿瘤固定出口「按受累器官与病情轻重排列」；
 *   - 指南链接按「官方指南页 / 期刊全文页 / 未取得原件」三态如实标注；
 *   - 本版链接由夜班研究轮给出 URL，尚未跑 verify-links 脚本逐条验活——如实标注「待验活」。
 * 数据来源：docs/research/medical-topics.md（2026-11-13）、docs/CLINICAL-DATA.md、README.md。
 */
window.DISEASE_PRIMER = {
  brand: '小胆宝 DuctPal（品牌占位）',
  name: '原发性硬化性胆管炎',
  en: 'Primary Sclerosing Cholangitis（PSC）',
  updated: '2026-11-13',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '原发性硬化性胆管炎（PSC）是一种慢性胆汁淤积性肝病，特征是肝内外胆管多发狭窄与扩张、呈纤维化进程，常合并炎症性肠病（IBD）；已列入中国第二批罕见病目录（2023-09，序号 68）。本工作台围绕化验、发作与缓解、影像复查、症状与共病监测整理病程记录。',
      points: [
        '本台面向已确诊 PSC 的成人患者本人，家属照护者可选用同一套记录（含代记）。',
        '化验按每张化验单自带的方法、单位与机构分组——不同方法/机构不合并、不连线、不做差。',
        '发作与缓解作为独立功能线记录区间事实；瘙痒与乏力按天记录，与同日化验只并列、不推断。',
        'PSC 与胆管癌风险的监测条目，只以「医生已安排的筛查随访」口径呈现；本台不做风险判读。',
        '本段只写仓内已写明的疾病事实；不复制指南条文、不做定义或分期判定。',
      ],
      sources: [
        { org: '本仓 README', doc: '疾病概要 · 定义', version: '0.1.0', nolink: true, note: '仓内文档，无公开 URL' },
        { org: '本仓 docs/research/medical-topics.md', doc: '医学约束研究 T1（2026-11-13）', nolink: true, note: '仓内文档；目录序号 68 见《第二批罕见病目录》' },
      ],
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '本台把可公开点开的指南页 / 期刊全文页与「未取得原件」分开标注；不写页码、不复制条文，也不把栏目页冒充原件。',
      table: {
        head: ['机构', '文件', '版本 / 年份', '原件', '本台用途'],
        rows: [
          [
            '中华医学会肝病学分会',
            '原发性硬化性胆管炎诊断及治疗指南（2021）',
            '2021',
            {
              text: '期刊全文页（2021）',
              kind: 'fulltext',
              url: 'https://www.lcgdbzz.org/cn/article/doi/10.3760/cma.j.cn112138-20211109-00786',
              note: '临床肝胆病杂志；公开全文页，本仓未存 PDF（待验活）',
            },
            '中文指南版本事实与条目背景',
          ],
          [
            '中华医学会肝病学分会（续）',
            '原发性硬化性胆管炎诊疗指南（2025年版）',
            '2025 年版',
            {
              text: '期刊全文页（2025）',
              kind: 'fulltext',
              url: 'https://www.lcgdbzz.com/cn/article/doi/10.12449/JCH250806',
              note: '临床肝胆病杂志 2025；公开全文页，本仓未存 PDF（待验活）',
            },
            '最新版版本事实',
          ],
          [
            '国家卫生健康委员会等 6 部门',
            '第二批罕见病目录（收录 PSC，序号 68）',
            '2023-09',
            {
              text: '目录转载页（待验活）',
              kind: 'hub',
              url: 'https://www.yifahui.com/13412.html',
              note: '转载页非官方原件；官方原件未取得，据二次来源',
            },
            '罕见病目录收录事实',
          ],
          [
            'AASLD（美国肝病研究学会）',
            'PSC and Cholangiocarcinoma Practice Guidance',
            '2022',
            {
              text: '官方指南页',
              kind: 'hub',
              url: 'https://www.aasld.org/practice-guidelines/primary-sclerosing-cholangitis-and-cholangiocarcinoma',
              note: 'AASLD 官方页；本仓未取得原件（国际口径，待验活）',
            },
            '国际口径的监测手段并列引用（不引页码、不采频率数字进界面）',
          ],
          [
            'EASL（欧洲肝病学会）',
            'EASL CPG on sclerosing cholangitis',
            '2022',
            {
              text: '期刊全文页（待验活）',
              kind: 'fulltext',
              url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(22)00326-9/fulltext',
              note: 'Journal of Hepatology；本仓未取得原件',
            },
            '国际口径并列引用',
          ],
          [
            '美国国家癌症研究所（NCI）',
            'CTCAE v5.0 Quick Reference（5x7）',
            'v5.0（2017）',
            {
              text: '官方 CTCAE 文档页（HTML）',
              kind: 'hub',
              url: 'https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm',
              note: 'NCI CTEP 官方页；Quick Reference PDF/XLSX 在页内下载',
            },
            '化验分级对照（仅启用有绝对数值界限的项）',
          ],
        ],
      },
      sources: [
        { org: '中华医学会肝病学分会', doc: '原发性硬化性胆管炎诊断及治疗指南（2021）', original: true, kind: 'fulltext', url: 'https://www.lcgdbzz.org/cn/article/doi/10.3760/cma.j.cn112138-20211109-00786' },
        { org: '中华医学会肝病学分会', doc: '原发性硬化性胆管炎诊疗指南（2025年版）', original: true, kind: 'fulltext', url: 'https://www.lcgdbzz.com/cn/article/doi/10.12449/JCH250806' },
        { org: '国家卫生健康委员会等 6 部门', doc: '第二批罕见病目录（2023-09）', nolink: true, note: '官方原件未取得；转载页见本段表格，据二次来源' },
        { org: 'AASLD', doc: 'PSC and Cholangiocarcinoma Practice Guidance 2022', original: false, secondaryUrl: 'https://www.aasld.org/practice-guidelines/primary-sclerosing-cholangitis-and-cholangiocarcinoma', note: '官方指南页（hub），原件未取得' },
        { org: 'EASL', doc: 'EASL CPG on sclerosing cholangitis 2022', original: false, secondaryUrl: 'https://www.journal-of-hepatology.eu/article/S0168-8278(22)00326-9/fulltext', note: '期刊全文页，原件未取得' },
        { org: '美国国家癌症研究所（NCI）', doc: 'CTCAE v5.0 Quick Reference（5x7）', version: '2017', nolink: true, note: '官方 HTML 文档页见本段表格' },
      ],
    },
    {
      id: 'landscape',
      title: '目前治疗全景概要',
      intro: '以下只写本仓文档里已经写明的手段与记录范围，按受累器官与病情轻重排列；不排序、不比优劣。',
      groups: [
        {
          label: '随访与监测（本仓文档已写明）',
          points: [
            '肝功能化验定期复查（常用 ALP、胆红素等）；复查节奏由主诊医生确定，本台只按起点与间隔显示参考节点，不排计划、不发提醒。',
            '影像复查（MRCP 等胆管成像）按医生安排记录；本台不做狭窄进展判读。',
            '合并 IBD 者的肠镜监测按消化科安排记录；本台不做异型增生判读。',
            '胆管相关肿瘤筛查条目只呈现「医生已安排的筛查随访」，不呈现频率数字或风险数值。',
          ],
        },
        {
          label: '症状与日常记录',
          points: [
            '瘙痒与乏力没有客观指标可替代，本台按天记录强度与影响，不换算成评分结论。',
            '发作（发热寒战、黄疸等）只记录已发生事实与医生行动计划原文；发作判定与处理归医生。',
          ],
        },
        {
          label: '用药与治疗手段',
          points: [
            '用药只留医生医嘱原文（药名、剂量、频次、起止）；UDCA 在 PSC 的有效性存在国际争议【待核：不进界面】，本台不给用药建议。',
            'ERCP 球囊扩张、肝移植评估等手段属医生决策，本台只整理医生要求的事实材料，不做指征判断。',
          ],
        },
      ],
      points: [
        '以上是文献与指南里列出的手段与记录范围，按受累器官与病情轻重排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。',
      ],
      sources: [
        { org: '本仓 docs/SPEC.md', doc: '项目规格 §问题、用户与最小闭环', nolink: true, note: '仓内文档，无公开 URL' },
        { org: '本仓 docs/CLINICAL-DATA.md', doc: '医学约束与临床数据台账 · 随访与筛查条目', nolink: true, note: '仓内文档；节律数字一律【待核】' },
        { org: '本仓 docs/research/medical-topics.md', doc: '医学约束研究 T5–T9（2026-11-13）', nolink: true, note: '仓内文档，无公开 URL' },
      ],
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '只记已发生的事实与日期，不预测、不评价。',
      points: [
        '截至 2026-11-12，ClinicalTrials.gov 以 query.cond=primary sclerosing cholangitis 实测 159 条（api/v2 countTotal，快照 2026-11-12）；其余来源通道未查过。',
        '截至 2026-11-13，已接入中华医学会 2021/2025、AASLD 2022、EASL 2022、CTCAE v5.0 的可点入口；链接逐条验活脚本尚未跑，标注「待验活」。',
        '本台当前化验分级只对照 CTCAE v5.0；不生成疾病活动度或预后评分（Mayo/MELD 等模型是医生的判定工具）。',
        '药物研发进展（norUDCA、FXR/IBAT 抑制剂等）见 ClinicalTrials.gov 公开检索入口（国际口径）；本台不判断哪些适合你。',
        '公开二次核验入口：ClinicalTrials.gov 的 PSC 检索页（检索于 2026-11-13）；本台试验库快照（159 条）另行落库对账。',
      ],
      sources: [
        { org: '本仓 docs/CLINICAL-DATA.md', doc: '临床试验线 · 实测 159 条（快照 2026-11-12）', nolink: true, note: '仓内文档，无公开 URL' },
        { org: 'ClinicalTrials.gov', doc: 'Primary Sclerosing Cholangitis 检索页', original: false, secondaryUrl: 'https://clinicaltrials.gov/search?cond=Primary%20Sclerosing%20Cholangitis', note: '公开检索入口；与上述快照计数口径一致（countTotal 实测）' },
        { org: '本仓 docs/research/medical-topics.md', doc: '医学约束研究 T9–T10（2026-11-13）', nolink: true, note: '仓内文档，无公开 URL' },
      ],
    },
  ],
}

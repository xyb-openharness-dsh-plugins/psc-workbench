/* 由 demo/build-demo-data.mjs 生成，勿手改。重跑：npm run demo:data */
(function (root) {
  const DEMO = {
  "generatedAt": "fixed-for-reproducibility",
  "profiles": [
    {
      "key": "A",
      "label": "档案 A · 刚确诊",
      "name": "虚构患者甲",
      "age": 47,
      "sex": "男",
      "diagnosedAt": "2026-10-14",
      "startedAt": "2026-10-21",
      "weightKg": 72,
      "antibodies": {
        "panca": "untested",
        "ana": "negative",
        "note": "2026-10 首诊报告抄录；pANCA 未查"
      },
      "fibrosis": null,
      "ibd": {
        "type": "untested",
        "note": "肠镜尚未做，医生已安排",
        "colonoscopyLast": null
      },
      "comorbidity": [
        {
          "name": "未见合并症记录",
          "since": null,
          "note": "刚确诊，还没排查完",
          "dept": null,
          "visibility": "shared"
        }
      ],
      "meds": [
        {
          "name": "熊去氧胆酸片",
          "doseText": "250 mg × 4 片/日（医生医嘱原文抄录）",
          "freq": "每日 2 次",
          "startDate": "2026-10-21",
          "approval": "unverified",
          "inUse": true
        }
      ],
      "adherence": [
        {
          "month": "2026-10",
          "missed": 0
        },
        {
          "month": "2026-11",
          "missed": 1
        }
      ],
      "episodes": [],
      "symptoms": [
        {
          "date": "2026-11-01",
          "itch": 3,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 2,
          "note": "说不上来，就是没劲",
          "visibility": "shared"
        },
        {
          "date": "2026-10-25",
          "itch": 2,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 1,
          "note": "",
          "visibility": "shared"
        }
      ],
      "screening": [
        {
          "type": "mrcp",
          "date": "2026-10-14",
          "result": "MRCP：肝内外胆管多节段狭窄伴扩张（报告原文抄录）",
          "detail": "确诊依据之一",
          "sectionTitle": "MRCP（胆管成像）"
        },
        {
          "type": "gallbladder",
          "date": "2026-10-14",
          "result": "超声：胆囊壁稍毛糙，未见结石",
          "detail": "",
          "sectionTitle": "胆囊超声"
        },
        {
          "type": "colonoscopy",
          "date": null,
          "result": null,
          "detail": "医生已安排，待做",
          "sectionTitle": "肠镜（IBD 共病监测）"
        }
      ],
      "questions": [
        {
          "id": "q1",
          "text": "ALP 多少算降下来了？我的目标值是什么？",
          "done": false
        },
        {
          "id": "q2",
          "text": "肠镜什么时候做？要提前准备什么？",
          "done": false
        },
        {
          "id": "q3",
          "text": "如果发烧寒战，我应该怎么处理？",
          "done": false
        }
      ],
      "documents": [
        {
          "id": "d1",
          "name": "2026-10 MRCP 报告.pdf",
          "date": "2026-10-14",
          "parsed": false,
          "parseState": "unparsed"
        },
        {
          "id": "d2",
          "name": "2026-11 肝功能.pdf",
          "date": "2026-11-08",
          "parsed": true,
          "parseState": "parsed"
        }
      ],
      "trials": [
        {
          "id": "t1",
          "title": "【虚构示例】PSC 瘙痒症状管理登记研究",
          "source": "ctgov",
          "phase": "登记",
          "status": "登记状态，未核实",
          "area": "上海"
        }
      ],
      "pathway": [
        {
          "d": "2026-10-14",
          "phase": "确诊",
          "text": "体检 ALP 升高，MRCP 见胆管多节段狭窄后确诊",
          "detail": {
            "regimen": {
              "summary": "尚未开始用药",
              "items": [
                [
                  "方案",
                  "无"
                ],
                [
                  "说明",
                  "确诊当次未开药"
                ]
              ]
            },
            "metrics": {
              "summary": "ALP 312 U/L（单据未印上限）",
              "items": [
                [
                  "ALP",
                  "312 U/L"
                ],
                [
                  "GGT",
                  "224 U/L"
                ]
              ]
            },
            "imaging": {
              "summary": "MRCP：肝内外胆管多节段狭窄伴扩张",
              "items": [
                [
                  "报告原文",
                  "肝内外胆管多发节段性狭窄，狭窄上游胆管扩张"
                ]
              ]
            },
            "ae": {
              "summary": "无记录",
              "items": [
                [
                  "说明",
                  "此阶段未开始用药，未记副作用"
                ]
              ]
            },
            "support": {
              "summary": "无记录",
              "items": [
                [
                  "说明",
                  "未记录支持措施"
                ]
              ]
            }
          }
        },
        {
          "d": "2026-10-21",
          "phase": "开始 UDCA",
          "text": "医生开了熊去氧胆酸，医嘱原文如记录",
          "detail": {
            "regimen": {
              "summary": "熊去氧胆酸 250 mg × 4 片/日",
              "items": [
                [
                  "药名",
                  "熊去氧胆酸片"
                ],
                [
                  "剂量原文",
                  "250 mg × 4 片/日"
                ],
                [
                  "频次",
                  "每日 2 次"
                ],
                [
                  "获批状态",
                  "未核实"
                ]
              ]
            },
            "metrics": {
              "summary": "2026-11 复查 ALP 268 U/L",
              "items": [
                [
                  "2026-11 ALP",
                  "268 U/L"
                ],
                [
                  "2026-11 GGT",
                  "196 U/L"
                ]
              ]
            },
            "imaging": {
              "summary": "本阶段未复查影像",
              "items": [
                [
                  "说明",
                  "无记录，不等于没做"
                ]
              ]
            },
            "ae": {
              "summary": "无记录",
              "items": [
                [
                  "说明",
                  "未记录"
                ]
              ]
            },
            "support": {
              "summary": "\"这个病我第一次听说\"",
              "items": [
                [
                  "患者原话",
                  "这个病我第一次听说，医生说的名字我都记不住"
                ]
              ]
            }
          }
        }
      ],
      "labs": [
        {
          "date": "2026-10-08",
          "items": [
            {
              "code": "ALP",
              "value": 318,
              "unit": "U/L",
              "refLow": 35,
              "refHigh": null,
              "lab": "外院报告（未印上限）"
            },
            {
              "code": "GGT",
              "value": 221,
              "unit": "U/L",
              "refLow": 7,
              "refHigh": 45,
              "lab": "市一院检验科"
            },
            {
              "code": "ALT",
              "value": 64,
              "unit": "U/L",
              "refLow": 7,
              "refHigh": 40,
              "lab": "市一院检验科"
            },
            {
              "code": "AST",
              "value": 49,
              "unit": "U/L",
              "refLow": 13,
              "refHigh": 35,
              "lab": "市一院检验科"
            },
            {
              "code": "TBil",
              "value": 16,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 21,
              "lab": "市一院检验科"
            },
            {
              "code": "ALB",
              "value": 45.1,
              "unit": "g/L",
              "refLow": 40,
              "refHigh": 55,
              "lab": "市一院检验科"
            },
            {
              "code": "PLT",
              "value": 209,
              "unit": "10⁹/L",
              "refLow": 125,
              "refHigh": 350,
              "lab": "市一院检验科"
            },
            {
              "code": "Hb",
              "value": 139,
              "unit": "g/L",
              "refLow": 115,
              "refHigh": 150,
              "lab": "市一院检验科"
            },
            {
              "code": "WBC",
              "value": 6,
              "unit": "10⁹/L",
              "refLow": 3.5,
              "refHigh": 9.5,
              "lab": "市一院检验科"
            },
            {
              "code": "ANC",
              "value": 3,
              "unit": "10⁹/L",
              "refLow": 1.8,
              "refHigh": 6.3,
              "lab": "市一院检验科"
            },
            {
              "code": "Cr",
              "value": 68,
              "unit": "µmol/L",
              "refLow": 41,
              "refHigh": 81,
              "lab": "市一院检验科"
            }
          ]
        },
        {
          "date": "2026-11-08",
          "items": [
            {
              "code": "ALP",
              "value": 258,
              "unit": "U/L",
              "refLow": 35,
              "refHigh": 120,
              "lab": "市一院检验科"
            },
            {
              "code": "GGT",
              "value": 197,
              "unit": "U/L",
              "refLow": 7,
              "refHigh": 45,
              "lab": "市一院检验科"
            },
            {
              "code": "ALT",
              "value": 52,
              "unit": "U/L",
              "refLow": 7,
              "refHigh": 40,
              "lab": "市一院检验科"
            },
            {
              "code": "AST",
              "value": 40,
              "unit": "U/L",
              "refLow": 13,
              "refHigh": 35,
              "lab": "市一院检验科"
            },
            {
              "code": "TBil",
              "value": 13,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 21,
              "lab": "市一院检验科"
            },
            {
              "code": "ALB",
              "value": 44.3,
              "unit": "g/L",
              "refLow": 40,
              "refHigh": 55,
              "lab": "市一院检验科"
            },
            {
              "code": "PLT",
              "value": 204,
              "unit": "10⁹/L",
              "refLow": 125,
              "refHigh": 350,
              "lab": "市一院检验科"
            },
            {
              "code": "Hb",
              "value": 142,
              "unit": "g/L",
              "refLow": 115,
              "refHigh": 150,
              "lab": "市一院检验科"
            },
            {
              "code": "WBC",
              "value": 6,
              "unit": "10⁹/L",
              "refLow": 3.5,
              "refHigh": 9.5,
              "lab": "市一院检验科"
            },
            {
              "code": "ANC",
              "value": 3,
              "unit": "10⁹/L",
              "refLow": 1.8,
              "refHigh": 6.3,
              "lab": "市一院检验科"
            },
            {
              "code": "Cr",
              "value": 71,
              "unit": "µmol/L",
              "refLow": 41,
              "refHigh": 81,
              "lab": "市一院检验科"
            }
          ]
        }
      ]
    },
    {
      "key": "B",
      "label": "档案 B · 长期随访",
      "name": "虚构患者乙",
      "age": 55,
      "sex": "女",
      "diagnosedAt": "2018-09-05",
      "startedAt": "2018-09-18",
      "weightKg": 64,
      "antibodies": {
        "panca": "positive",
        "ana": "positive",
        "note": "2018 年报告抄录"
      },
      "fibrosis": {
        "method": "FibroScan（瞬时弹性成像）",
        "value": "12.6 kPa",
        "date": "2026-03-11",
        "note": "报告原文抄录，未判读"
      },
      "ibd": {
        "type": "ulcerative-colitis",
        "note": "溃疡性结肠炎，消化科随访中",
        "colonoscopyLast": "2025-06-18"
      },
      "comorbidity": [
        {
          "name": "溃疡性结肠炎",
          "since": "2019",
          "note": "消化科，美沙拉嗪维持",
          "dept": null,
          "visibility": "shared"
        },
        {
          "name": "甲状腺功能减退",
          "since": "2021",
          "note": "内分泌科，左甲状腺素 50 µg",
          "dept": null,
          "visibility": "shared"
        }
      ],
      "meds": [
        {
          "name": "熊去氧胆酸胶囊",
          "doseText": "250 mg × 6 粒/日",
          "freq": "每日 3 次",
          "startDate": "2018-09-18",
          "approval": "unverified",
          "inUse": true
        },
        {
          "name": "美沙拉嗪缓释片",
          "doseText": "1 g 每日 2 次（消化科医嘱）",
          "freq": "每日 2 次",
          "startDate": "2019-04-02",
          "approval": "unverified",
          "inUse": true
        },
        {
          "name": "左甲状腺素钠片",
          "doseText": "50 µg 每日 1 次",
          "freq": "每日 1 次（另一科开）",
          "startDate": "2021-05-01",
          "approval": "unverified",
          "inUse": true
        }
      ],
      "adherence": [
        {
          "month": "2026-05",
          "missed": 0
        },
        {
          "month": "2026-06",
          "missed": 1
        },
        {
          "month": "2026-07",
          "missed": 0
        },
        {
          "month": "2026-08",
          "missed": 3
        },
        {
          "month": "2026-09",
          "missed": 0
        },
        {
          "month": "2026-10",
          "missed": 1
        }
      ],
      "episodes": [
        {
          "id": "e1",
          "start": "2023-02-10",
          "end": "2023-02-24",
          "hospital": "市一院",
          "signs": "发热 38.6℃、寒战、尿色加深",
          "labsNote": "胆红素升高（当时化验原件未存）",
          "treatment": "住院抗感染治疗 10 天（医生处置原文大意）",
          "actionPlan": null,
          "note": "第一次发作，当时不知道这就是胆管炎",
          "visibility": "shared"
        },
        {
          "id": "e2",
          "start": "2025-01-18",
          "end": "2025-01-27",
          "hospital": "区中心医院",
          "signs": "发热、右上腹痛",
          "labsNote": "白细胞与胆红素升高",
          "treatment": "住院抗感染；出院后医生安排 ERCP 球囊扩张（2025-02-20）",
          "actionPlan": "医生给的计划原文：若再次出现发热寒战或尿色明显加深，当天联系肝胆科值班电话，不要等到复诊",
          "note": "这次记住了先打电话",
          "visibility": "shared"
        },
        {
          "id": "e3",
          "start": "2026-04-30",
          "end": "2026-05-12",
          "hospital": "市一院",
          "signs": "低热、乏力加重",
          "labsNote": "胆红素 38 µmol/L",
          "treatment": "门诊抗感染后好转；医生调了复查节奏",
          "actionPlan": "同上次医生计划（2025-01 记录）",
          "note": "",
          "visibility": "shared"
        }
      ],
      "symptoms": [
        {
          "date": "2026-10-05",
          "itch": 3,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 3,
          "note": "下午就没劲了",
          "visibility": "shared"
        },
        {
          "date": "2026-09-18",
          "itch": 2,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 3,
          "note": "",
          "visibility": "shared"
        },
        {
          "date": "2026-08-22",
          "itch": 4,
          "nightWorse": true,
          "scratch": false,
          "sleepBreaks": 1,
          "fatigue": 2,
          "note": "",
          "visibility": "shared"
        },
        {
          "date": "2026-07-11",
          "itch": 2,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 2,
          "note": "",
          "visibility": "shared"
        },
        {
          "date": "2026-06-09",
          "itch": 5,
          "nightWorse": true,
          "scratch": true,
          "sleepBreaks": 2,
          "fatigue": 3,
          "note": "天热更痒",
          "visibility": "shared"
        },
        {
          "date": "2026-05-16",
          "itch": 3,
          "nightWorse": false,
          "scratch": false,
          "sleepBreaks": 0,
          "fatigue": 2,
          "note": "",
          "visibility": "shared"
        }
      ],
      "screening": [
        {
          "type": "colonoscopy",
          "date": "2025-06-18",
          "result": "肠镜：横结肠可见一段轻度炎性改变（报告原文）",
          "detail": "消化科：病理未见异型，按医嘱 1–2 年复查【待核：具体间隔以医生安排为准】",
          "sectionTitle": "肠镜（IBD 共病监测）"
        },
        {
          "type": "mrcp",
          "date": "2025-02-20",
          "result": "MRCP：肝外胆管狭窄段较前对照，上游扩张（报告原文）",
          "detail": "ERCP 扩张前评估",
          "sectionTitle": "MRCP（胆管成像）"
        },
        {
          "type": "fibroscan",
          "date": "2026-03-11",
          "result": "FibroScan 12.6 kPa（报告原文）",
          "detail": "未判读",
          "sectionTitle": "肝脏弹性（FibroScan）"
        },
        {
          "type": "gallbladder",
          "date": "2025-11-07",
          "result": "超声：胆囊息肉 3 mm，未见结石（报告原文）",
          "detail": "医生说按他的节奏复查",
          "sectionTitle": "胆囊超声"
        },
        {
          "type": "endoscopy",
          "date": "2024-11-20",
          "result": "胃镜：食管下段轻度静脉曲张（报告原文）",
          "detail": "医生建议定期复查",
          "sectionTitle": "胃镜（静脉曲张，医生安排时）"
        }
      ],
      "questions": [
        {
          "id": "q1",
          "text": "下次肠镜该什么时候做？间隔是按年算吗？",
          "done": false
        },
        {
          "id": "q2",
          "text": "胆囊息肉 3 mm 要紧吗？",
          "done": false
        },
        {
          "id": "q3",
          "text": "甲减的药和肝的药一起吃要注意什么？",
          "done": false
        },
        {
          "id": "q4",
          "text": "ERCP 之后这次 MRCP 结果说明什么？",
          "done": true
        }
      ],
      "documents": [
        {
          "id": "d1",
          "name": "2026-03 FibroScan.pdf",
          "date": "2026-03-11",
          "parsed": true,
          "parseState": "parsed"
        },
        {
          "id": "d2",
          "name": "2025-06 肠镜.pdf",
          "date": "2025-06-18",
          "parsed": true,
          "parseState": "parsed"
        },
        {
          "id": "d3",
          "name": "2025-02 MRCP.pdf",
          "date": "2025-02-20",
          "parsed": false,
          "parseState": "unparsed"
        }
      ],
      "trials": [
        {
          "id": "t1",
          "title": "【虚构示例】PSC 长期随访观察研究",
          "source": "ictrp",
          "phase": "观察性",
          "status": "登记状态，未核实",
          "area": "广州"
        },
        {
          "id": "t2",
          "title": "【虚构示例】PSC 胆管炎发作频率研究",
          "source": "ctgov",
          "phase": "登记",
          "status": "登记状态，未核实",
          "area": "北京"
        }
      ],
      "pathway": [
        {
          "d": "2018-09-18",
          "phase": "确诊并开始 UDCA",
          "text": "MRCP 提示胆管多节段狭窄，确诊后开始单药",
          "detail": {
            "regimen": {
              "summary": "熊去氧胆酸 250 mg × 6 粒/日",
              "items": [
                [
                  "药名",
                  "熊去氧胆酸胶囊"
                ],
                [
                  "剂量原文",
                  "250 mg × 6 粒/日"
                ],
                [
                  "获批状态",
                  "未核实"
                ]
              ]
            },
            "metrics": {
              "summary": "确诊时 ALP 310 U/L",
              "items": [
                [
                  "2018-09 ALP",
                  "310 U/L"
                ],
                [
                  "2018-09 TBil",
                  "21 µmol/L"
                ]
              ]
            },
            "imaging": {
              "summary": "MRCP：肝内外胆管多节段狭窄",
              "items": [
                [
                  "报告原文",
                  "肝内外胆管多发节段性狭窄伴上游扩张"
                ]
              ]
            },
            "ae": {
              "summary": "无记录",
              "items": [
                [
                  "说明",
                  "无记录"
                ]
              ]
            },
            "support": {
              "summary": "无记录",
              "items": [
                [
                  "说明",
                  "无记录"
                ]
              ]
            }
          }
        },
        {
          "d": "2023-02-10",
          "phase": "第一次发作",
          "text": "发热寒战住院，才知道这叫胆管炎",
          "detail": {
            "regimen": {
              "summary": "维持原用药",
              "items": [
                [
                  "方案",
                  "未变更"
                ]
              ]
            },
            "metrics": {
              "summary": "胆红素升高（原件未存）",
              "items": [
                [
                  "说明",
                  "当时化验原件未留存，只有口头转述"
                ]
              ]
            },
            "imaging": {
              "summary": "住院期间超声",
              "items": [
                [
                  "说明",
                  "报告未存档"
                ]
              ]
            },
            "ae": {
              "summary": "无新增",
              "items": [
                [
                  "说明",
                  "无记录"
                ]
              ]
            },
            "support": {
              "summary": "\"根本不知道这两个病是一伙的\"",
              "items": [
                [
                  "患者原话",
                  "根本不知道胆管炎和肠子的病是一伙的"
                ]
              ]
            }
          }
        },
        {
          "d": "2025-02-20",
          "phase": "ERCP 球囊扩张",
          "text": "发作后医生安排 ERCP 球囊扩张狭窄段",
          "detail": {
            "regimen": {
              "summary": "维持原用药",
              "items": [
                [
                  "方案",
                  "未变更"
                ]
              ]
            },
            "metrics": {
              "summary": "术前胆红素 42 µmol/L，术后 1 个月 24 µmol/L",
              "items": [
                [
                  "术前 TBil",
                  "42 µmol/L"
                ],
                [
                  "术后 TBil",
                  "24 µmol/L"
                ]
              ]
            },
            "imaging": {
              "summary": "ERCP 术中造影 + 术后 MRCP",
              "items": [
                [
                  "报告原文",
                  "肝外胆管狭窄段扩张后通畅，上游扩张减轻"
                ]
              ]
            },
            "ae": {
              "summary": "术后轻度腹胀",
              "items": [
                [
                  "记录",
                  "术后两天腹胀，自行缓解"
                ]
              ]
            },
            "support": {
              "summary": "\"医生给了发作时的电话\"",
              "items": [
                [
                  "患者原话",
                  "这次医生给了值班电话，心里踏实多了"
                ]
              ]
            }
          }
        },
        {
          "d": "2026-03-11",
          "phase": "弹性成像复查",
          "text": "按医生节奏做 FibroScan 与化验",
          "detail": {
            "regimen": {
              "summary": "维持原用药",
              "items": [
                [
                  "方案",
                  "未变更"
                ]
              ]
            },
            "metrics": {
              "summary": "ALP 179 U/L，胆红素 18 µmol/L",
              "items": [
                [
                  "2026-03 ALP",
                  "179 U/L"
                ],
                [
                  "2026-03 TBil",
                  "18 µmol/L"
                ]
              ]
            },
            "imaging": {
              "summary": "FibroScan 12.6 kPa",
              "items": [
                [
                  "报告原文",
                  "12.6 kPa（未判读）"
                ]
              ]
            },
            "ae": {
              "summary": "无新增",
              "items": [
                [
                  "说明",
                  "无记录"
                ]
              ]
            },
            "support": {
              "summary": "\"记下来就不慌\"",
              "items": [
                [
                  "患者原话",
                  "把每次的数记下来，去医院就不慌了"
                ]
              ]
            }
          }
        }
      ],
      "labs": [
        {
          "date": "2026-05-08",
          "items": [
            {
              "code": "ALP",
              "value": 316,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": null,
              "lab": "外院报告（未印上限）"
            },
            {
              "code": "GGT",
              "value": 219,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 53,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 49,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 22,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 40.2,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 122,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 116,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 72,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        },
        {
          "date": "2026-06-08",
          "items": [
            {
              "code": "ALP",
              "value": 249,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": 135,
              "lab": "区中心医院"
            },
            {
              "code": "GGT",
              "value": 187,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 46,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 43,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 19,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 40.8,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 109,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 121,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 71,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        },
        {
          "date": "2026-07-08",
          "items": [
            {
              "code": "ALP",
              "value": 201,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": 135,
              "lab": "区中心医院"
            },
            {
              "code": "GGT",
              "value": 165,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 40,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 39,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 18,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 39.1,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 99,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 113,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 68,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        },
        {
          "date": "2026-08-08",
          "items": [
            {
              "code": "ALP",
              "value": 193,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": 135,
              "lab": "区中心医院"
            },
            {
              "code": "GGT",
              "value": 148,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 37,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 35,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 17,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 38.8,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 96,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 118,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 73,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        },
        {
          "date": "2026-09-08",
          "items": [
            {
              "code": "ALP",
              "value": 177,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": 135,
              "lab": "区中心医院"
            },
            {
              "code": "GGT",
              "value": 139,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 36,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 35,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 18,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 37.5,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 97,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 110,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 68,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        },
        {
          "date": "2026-10-08",
          "items": [
            {
              "code": "ALP",
              "value": 180,
              "unit": "U/L",
              "refLow": 40,
              "refHigh": 135,
              "lab": "区中心医院"
            },
            {
              "code": "GGT",
              "value": 149,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 50,
              "lab": "区中心医院"
            },
            {
              "code": "ALT",
              "value": 39,
              "unit": "U/L",
              "refLow": 8,
              "refHigh": 45,
              "lab": "区中心医院"
            },
            {
              "code": "AST",
              "value": 37,
              "unit": "U/L",
              "refLow": 14,
              "refHigh": 40,
              "lab": "区中心医院"
            },
            {
              "code": "TBil",
              "value": 18,
              "unit": "µmol/L",
              "refLow": 0,
              "refHigh": 23,
              "lab": "区中心医院"
            },
            {
              "code": "ALB",
              "value": 37.6,
              "unit": "g/L",
              "refLow": 39,
              "refHigh": 54,
              "lab": "区中心医院"
            },
            {
              "code": "PLT",
              "value": 92,
              "unit": "10⁹/L",
              "refLow": 120,
              "refHigh": 340,
              "lab": "区中心医院"
            },
            {
              "code": "Hb",
              "value": 112,
              "unit": "g/L",
              "refLow": 112,
              "refHigh": 148,
              "lab": "区中心医院"
            },
            {
              "code": "WBC",
              "value": 4,
              "unit": "10⁹/L",
              "refLow": 3.4,
              "refHigh": 9.2,
              "lab": "区中心医院"
            },
            {
              "code": "ANC",
              "value": 2,
              "unit": "10⁹/L",
              "refLow": 1.7,
              "refHigh": 6,
              "lab": "区中心医院"
            },
            {
              "code": "Cr",
              "value": 74,
              "unit": "µmol/L",
              "refLow": 40,
              "refHigh": 84,
              "lab": "区中心医院"
            }
          ]
        }
      ]
    }
  ],
  "trialMatch": {
    "A": [
      {
        "pct": 50,
        "band": "needs_info",
        "bandLabel": "需补充信息",
        "hardUnmet": 0,
        "hardUnmetRules": [],
        "recordId": "t1",
        "title": "【虚构示例】PSC 瘙痒症状管理登记研究",
        "sourceId": "ctgov",
        "recruitmentStatus": "登记状态，未核实",
        "statusNote": "登记 ≠ 有效 ≠ 安全 ≠ 可入组",
        "healthyVolunteer": false,
        "counts": {
          "satisfied": 1,
          "conflict": 0,
          "undetermined": 1
        },
        "decidable": 1,
        "total": 2,
        "rows": [
          {
            "tier": "satisfied",
            "rule": "入选：登记病种与本人诊断一致",
            "mine": "原发性硬化性胆管炎（PSC）",
            "hard": true,
            "source": "本工作台只服务 PSC 患者",
            "why": "条目要求\"有这一项\"，本机记录：原发性硬化性胆管炎（PSC）"
          },
          {
            "tier": "undetermined",
            "rule": "纳入 / 排除标准原文",
            "mine": null,
            "source": null,
            "why": "本项目采集只到标题/登记号/状态，未抓纳入排除原文——这一条必须回去看登记页"
          }
        ]
      }
    ],
    "B": [
      {
        "pct": 50,
        "band": "needs_info",
        "bandLabel": "需补充信息",
        "hardUnmet": 0,
        "hardUnmetRules": [],
        "recordId": "t1",
        "title": "【虚构示例】PSC 长期随访观察研究",
        "sourceId": "ictrp",
        "recruitmentStatus": "登记状态，未核实",
        "statusNote": "登记 ≠ 有效 ≠ 安全 ≠ 可入组",
        "healthyVolunteer": false,
        "counts": {
          "satisfied": 1,
          "conflict": 0,
          "undetermined": 1
        },
        "decidable": 1,
        "total": 2,
        "rows": [
          {
            "tier": "satisfied",
            "rule": "入选：登记病种与本人诊断一致",
            "mine": "原发性硬化性胆管炎（PSC）",
            "hard": true,
            "source": "本工作台只服务 PSC 患者",
            "why": "条目要求\"有这一项\"，本机记录：原发性硬化性胆管炎（PSC）"
          },
          {
            "tier": "undetermined",
            "rule": "纳入 / 排除标准原文",
            "mine": null,
            "source": null,
            "why": "本项目采集只到标题/登记号/状态，未抓纳入排除原文——这一条必须回去看登记页"
          }
        ]
      },
      {
        "pct": 50,
        "band": "needs_info",
        "bandLabel": "需补充信息",
        "hardUnmet": 0,
        "hardUnmetRules": [],
        "recordId": "t2",
        "title": "【虚构示例】PSC 胆管炎发作频率研究",
        "sourceId": "ctgov",
        "recruitmentStatus": "登记状态，未核实",
        "statusNote": "登记 ≠ 有效 ≠ 安全 ≠ 可入组",
        "healthyVolunteer": false,
        "counts": {
          "satisfied": 1,
          "conflict": 0,
          "undetermined": 1
        },
        "decidable": 1,
        "total": 2,
        "rows": [
          {
            "tier": "satisfied",
            "rule": "入选：登记病种与本人诊断一致",
            "mine": "原发性硬化性胆管炎（PSC）",
            "hard": true,
            "source": "本工作台只服务 PSC 患者",
            "why": "条目要求\"有这一项\"，本机记录：原发性硬化性胆管炎（PSC）"
          },
          {
            "tier": "undetermined",
            "rule": "纳入 / 排除标准原文",
            "mine": null,
            "source": null,
            "why": "本项目采集只到标题/登记号/状态，未抓纳入排除原文——这一条必须回去看登记页"
          }
        ]
      }
    ]
  },
  "snapshotMeta": {
    "snapshotDate": "2026-11-13",
    "recordCount": 220,
    "relevant": 148,
    "sources": [
      {
        "id": "chictr_online",
        "state": "failed",
        "queried": 0
      },
      {
        "id": "chictr_pancreatic_archive",
        "state": "unconfigured",
        "queried": 0
      },
      {
        "id": "chinadrugtrials",
        "state": "ready",
        "queried": 1
      },
      {
        "id": "ctv",
        "state": "ready",
        "queried": 1
      },
      {
        "id": "ictrp",
        "state": "truncated",
        "queried": 1
      },
      {
        "id": "xyb_chinadrugtrials_archive",
        "state": "ready",
        "queried": 1
      }
    ],
    "honestyNote": "只有 SUCCESS 与 NO_RESULTS 表示该来源真的被查询并给出答案；其余终态一律不代表\"没有试验\""
  }
}
  root.DEMO = DEMO
})(typeof window !== 'undefined' ? window : globalThis)

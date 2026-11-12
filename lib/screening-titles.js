/* 并发症筛查的分节定义 —— 唯一来源（psc-workbench PSC 版）。
 * 播种、读模型、演示数据三处共用；顺序即库里 ord 的顺序。
 * PSC 边界：胆管癌相关条目只以「医生已安排的筛查随访」口径呈现，无风险判读。 */
export const SCREENING_KEYS = Object.freeze(['colonoscopy', 'mrcp', 'fibroscan', 'gallbladder', 'endoscopy'])

export const SCREENING_TITLES = Object.freeze({
  colonoscopy: '肠镜（IBD 共病监测）',
  mrcp: 'MRCP（胆管成像）',
  fibroscan: '肝脏弹性（FibroScan）',
  gallbladder: '胆囊超声',
  endoscopy: '胃镜（静脉曲张，医生安排时）',
})

export function screeningTitle(key) {
  return SCREENING_TITLES[key] ?? key
}

# M7 发布草稿（冻结待发，晨审追认后执行）

状态：**草稿，未执行任何 tag/release**（无人值守边界：M7 冻结备稿）。

## 拟执行步骤（晨审追认后）
1. 确认 VERSION=0.2.0 与 CHANGELOG 0.2.0 段一致（release:check 全绿为前提）
2. git tag v0.2.0 -m "psc-workbench v0.2.0（M0–M5+装机）"
3. git push origin v0.2.0
4. gh release create v0.2.0 --title "v0.2.0 · PSC 工作台社区初期版本" --notes-file docs/release-draft/release-notes-v0.2.0.md
5. 附产物：npm pack 产出 tgz + sha256

## release notes 草稿
见 release-notes-v0.2.0.md（同目录）。

## 未验证项声明（notes 内必须包含）
- 0 患者访谈、0 临床审核；全部医学阈值【待核】
- 装机验证状态以 docs/signoffs/V2-V3 为准（未验证则明示）

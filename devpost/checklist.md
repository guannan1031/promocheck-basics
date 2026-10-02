---
doc: checklist
status: approved
---

# Build Checklist

2026-10-01用户确认技术方案及本构建顺序，进入5-build。
Build mode: fast（已随构建顺序确认；自动验证各片，保留首片反馈和最终试用）

## Slices

- [x] **1. 发现排期冲突并在草案修正**
  Becomes usable: 打开工作台，导入合成配置，看到冲突及双方依据，修改结束时间后复查并看到前后差异。
  Why now: 第一片就证明发现与修正闭环，避免先做装饰性仪表盘。
  PRD ref: `prd.md > Configuration checks`, `prd.md > Draft correction and comparison`
  Spec ref: `spec.md > CSV input`, `spec.md > Rule engine`, `spec.md > Draft state and comparison`, `spec.md > Look and Feel`
  Build: 初始化React/Vite项目及锁定依赖；实现CSV预览、规则、只读原方案/可编辑草案和差异界面。
  Verify (mechanical): CSV/时间/互斥边界自动化测试；构建；浏览器实际修正30分钟重叠为端点相邻，确认原始告警仍在。
  Learner check: 打开样例，改动一个结束时间并重新检查，观察问题位置与修正方式是否易懂。
  Commit: `Build promotion conflict review and draft correction`

- [x] **2. 明确成本假设下的贡献比较**
  Becomes usable: 修改优惠并查看单品贡献前后变化；成本缺失时看到不可计算原因。
  Why now: 配置可靠后再解释方案影响，避免图表掩盖输入错误。
  PRD ref: `prd.md > Unit contribution`
  Spec ref: `spec.md > Money calculation`, `spec.md > Data Model`
  Build: 金额输入与分币计算、计算依据、负贡献提示、缺失成本案例；双语同步。
  Verify (mechanical): 金额/费率边界与舍入测试；合成例-3.50到6.00；浏览器清空成本不显示0或乐观贡献。
  Learner check: 比较优惠30和20两版，点开计算依据，确认看得懂并能手算。
  Commit: `Add explicit unit contribution comparison`

- [ ] **3. 复核记录、报告与可复现交付**
  Becomes usable: 下载包含原始问题和修改依据的HTML/JSON，重新打开报告阅读完整过程。
  Why now: 完成可核查交付和独立复现，供最终验收与后续录屏。
  PRD ref: `prd.md > Review and report`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Review and exports`, `spec.md > Verification`, `spec.md > Where It Runs and How Someone Tries It`
  Build: 复核记录绑定修订、统一报告、启动脚本、安装运行说明与第三方披露。
  Verify (mechanical): 过期结果/确认失效、恶意文本、导出一致性测试；实际浏览器下载并打开HTML；桌面及移动中英文检查；干净副本ci/test/build。
  Learner check: 导出一份有待处理项的报告，核对它没有隐去原始告警；修改后旧确认不再适用。
  Commit: `Add review reports and reproducible local delivery`

## Hands-on Checkpoints
- [x] Early usable behavior explored — 第一片后反馈操作与布局。
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map
- [ ] Learning activity complete — 用一项实际修正说明输入、规则、报告如何对应。
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown

Activity and evidence: 尚未构建。
Route and stops: 完成实现后填写实际文件与函数。
Edit outcome: 尚未进行。
Reflection: 尚未进行。
Activity mode: 待实际试用。

## Revisions

### 2026-10-01 progress
第一片实现及机械验证完成：9项测试、构建、浏览器修正闭环与CSV导入通过，证据见docs/QA-SLICE1.md。当前停在首片用户试用反馈，主复选框暂不勾选；不是等待重复批准技术方案。

2026-10-02：用户首次试用提出模板无法下载，已修复并验证实际落盘；解释产品用途后用户明确要求继续。首片反馈点以该实际反馈结束，不冒称用户已完成全部修正步骤。



2026-10-02第三片机械验证：18项测试、构建、独立目录安装与浏览器导出复核均通过，见docs/QA.md。最终用户试用待进行；第一片实际反馈为下载失败已修复，不冒称用户亲自验证所有路径。

# Official workflow evidence

Date: 2026-09-29. This records actual preparation, not a completed course or submitted entry.

## Source and installation
- Repository: https://github.com/challengepost/learn-ai-basics
- Source commit: `6984209dd33f12ab8781d8caf0c16a5de2343657`.
- Read the official README, `1-start`, `2-scope`, their templates and the `3-prd` routing prerequisite.
- Official suggested installer: `npx skills add challengepost/learn-ai-basics --all -y`.
- Actual installation: exact local copy of the verified official checkout's 14 skill/template/reference files to this project's `.agents/skills`. SHA256 manifest verifies every copied file. No global skill installation and no app source imported.
- A registry metadata probe `npm view skills version repository.url dist.integrity --json` was attempted; its outcome is recorded in command evidence. The npm installer was not run; do not describe it as successful.

## Actual progression
1. Checked the target did not exist, then created an independent empty project directory.
2. Created `.gitignore` before writing learner context; excludes that profile and local credential files.
3. Applied `1-start` using facts from the current user request; coding experience and optional learning interests remain not established. No invented learner interview or answers.
4. Applied `2-scope` and its actual template to produce `devpost/scope.md`, `status: draft`. Input is the attached proposal and the request to prioritize the third event; no assumption that every proposal detail has been approved.
5. `3-prd` explicitly routes an unapproved scope back to `2-scope`. PRD, spec and application implementation remain pending rather than being fabricated as completed steps.

## Review gate
The installed `.agents/skills/2-scope/SKILL.md` says: `Set status: approved when the learner clearly approves the displayed plan` (formatting normalized).
The `.agents/skills/3-prd/SKILL.md` routing rule stops if scope is missing or not approved.
This is a requirement of the official learning workflow, not a claim that the competition's legal rules explicitly require each chat approval. Scope will be marked approved only after an actual learner response.

## Remaining stages
PRD → technical spec → verified build slices and learner review → video/public repository/submission. The pack's `6-ship` also reserves submission prose for the learner; inspect it before preparing those fields. Do not claim a demo script is a finished video.


## 2026-09-30 update (supersedes pending scope above)
The learner explicitly agreed with the competitive direction and asked to continue. Scope marked approved; 3-prd, its guide and template read. Product draft saved as draft. Two questions pending: a first-hand promotion issue and first-screen/visual preferences. Public Shopify rules read as problem background, not customer validation. Example arithmetic checked with Decimal; no application tests or source code yet.

User response: no first-hand case. Problem-source question resolved; use public background and labelled synthetic demonstrations. Visual preferences remain pending.

## 2026-09-30 technical-plan review
User replied 好的继续 to the displayed product draft. Marked core PRD approved; no further visual preferences were supplied. Explicit agent defaults (issue-first light workbench, Chinese/English and session-only data) are documented, not attributed to user speech. Read 4-spec and its reference/template; saved spec as draft. Prepared the three-slice checklist for joint review, also draft. Read 5-build gate; did not implement before technical/build review. This is preparation for 5-build, not a claim it was completed. Heading references and all slice fields verified; no app tests.

## 2026-10-01 slice 1
用户回复可以，spec/checklist标为approved；进入fast模式开发。CSV/规则/草案闭环实现，9项测试及构建通过，浏览器验证见QA-SLICE1.md。第一片用户试用反馈待收集；不进入第二片，也不把官方课程标为完成。

2026-10-02第二片：14项测试与构建通过。实际浏览器优惠30→20显示-3.50→6.00/差额9.50；清空成本显示无法计算且差额为—。开始第三片。首个本地提交作者标识为Codex <codex@localhost>，不使用推测的用户身份，不改全局Git配置。

2026-10-02第三片：复核绑定修订、HTML/JSON同快照与SHA256、恶意文本转义、本地启动脚本完成。18测试/构建与独立目录ci/test/build通过；实际下载并重新打开合成报告通过。用户最终试用、学习回顾与app-map尚未完成，不进入6-ship。

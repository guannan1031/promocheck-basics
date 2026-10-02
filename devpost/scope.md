---
doc: scope
status: approved
---

# PromoCheck

A local promotion preflight workbench: inspect configuration risks, compare unit contribution assumptions, and preserve review evidence.

范围于2026-09-30确认。用户在讨论后明确认同“有依据的问题来源、有价值的修正过程、完整可复现的体验”并要求继续下一步。本轮沿此前展示的促销上线前检查、贡献测算及修正对比推进；批准范围不等于应用已实现或业务效果已验证。依据见 `../docs/COMPETITION_STRATEGY.md`。

## The Unique Kernel
将上线前配置问题、明确成本假设下的单品贡献和方案修改差异放在同一复核闭环。每个问题追溯到原始字段及规则，修改只进入草案；人工确认保留原始告警，不把“已看过”变成“没有问题”。

## Who It's For
在促销上线前检查活动配置表的小型电商运营人员。当前假设是其需要逐条核对日期、必填项与互斥活动；尚无真实用户访谈或提效测量。

## The Core Loop
选择合成样例或载入 CSV → 检查配置与单品贡献 → 查看异常及依据 → 修改草案中的售价或优惠并对比 → 记录人工复核意见 → 导出 HTML / JSON 报告。原输入保留；任何输入变化后旧复核不能沿用。

## Inspiration & Identity
启动包指定浏览器本地单页应用；具体视觉风格尚未确定，留给产品阶段。界面优先让运营人员看清错误、输入证据和下一步；英文材料支持参赛，中文便于本人验收。

## Why This Matters to the Learner
用户要求：“第三个比赛你先制作优先”。更具体的个人学习动机未建立，不代写。

## What "Working" Looks Like
在浏览器打开应用，载入一份包含错误的合成配置；日期反转、缺失商品 ID、明确互斥且重叠的活动均被定位。通过草案修正重新检查，原始告警、修改内容和复查结果均可对比；对成本完整的单品比较方案贡献变化，缺成本则不下结论。换成正确样例不会误报；相邻时间区间不算重叠。记录复核意见后下载可重新打开的报告，原始问题及依据仍在。

这一结果只证明已定义规则得到执行，不证明平台审核通过、活动盈利或商业效果。公开仓库、实际演示视频、报名及提交是后续参赛交付，当前均未完成。

## The POC Boundary
- 日期格式、起止顺序；规则要求的商品/活动 ID 等必填字段；同商品、时间重叠且显式互斥三类检查。
- 同一时区和明确区间边界；不把所有重叠活动都当成冲突。
- 结果分为阻断、待人工确认、未发现已定义的异常；每项有输入值、规则编号、原因。
- CSV 导入、合成样例、只读预览、人工复核记录、HTML / JSON 导出组成一条闭环。
- 本地处理，不需要运行时大模型、数据库或账号。
- 单商品、每单一件、单币种的简化贡献测算；显式成本与费率，缺失则不可计算，不推算净利润。
- 原方案/修改草案对比及差异报告；不预测销量或实际收益。

## Later
在完成并验收上述闭环后再评估真实运营访谈、多平台规则或更多输入格式。当前不作这些能力承诺。

## Explicitly Cut
- 真实店铺连接、写回活动、退款、自动发布：超出只读检查范围。
- 平台合规认证和优惠叠加全覆盖：没有规则来源或授权依据。
- 云服务及运行时 LLM：固定规则检查无需新增调用费用。
- 直接搬用旧作品换名参赛：选择新建独立业务闭环。开源框架、库及依法可复用的历史工作并非一律被官方禁止；实际纳入时记录来源、许可和本轮新增内容。

## Review
2026-09-30用户最后明确表示“这个是我认同的，那我们接着下一步”。据此完成scope批准并进入3-prd，不再重复请求scope确认。产品细节与视觉偏好仍在PRD阶段澄清，不能把本次批准扩写成未展示PRD/spec已批准。

## 2026-10-02 Scope revision: campaign planning slice

用户在阅读国内店铺商业研究和开发方案后要求“那你继续”，授权推进新方向；不是商家验证通过。追加一个合成可操作切片作为模型验证，既有v0.1保留。

Unique kernel now includes comparing event allocations against shared stock, dated confirmed inbound, explicit budget and contribution assumptions. First slice is intentionally one SKU / two events / one stock pool, not the proposed full 50-SKU MVP. No native platform rules, automatic execution, real demand forecast or observed ROI. User can edit assumptions, compare candidate plans and restore an exported scenario. Existing preflight remains available.

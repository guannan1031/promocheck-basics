---
doc: spec
status: approved
---

[English counterpart](spec.en.md)

# PromoCheck — Technical Spec

2026-09-30编写；2026-10-01用户回复“可以”，确认已展示的技术方案及构建顺序，开始实现。

## How This Works, In Plain Language
CSV只在浏览器内读取。原始数据保留一份，修改进入另一份草案；两份数据由同一套检查规则处理，页面对比结果。报告同时保存两份数据、检查依据和人工意见，供之后阅读和复算。

页面关闭或刷新后本轮草案不自动恢复，因此离开前下载报告。这样无需账号、数据库或云服务，也不会把商家输入自动上传出去。报告目前只用于阅读和复核，不承诺重新导入恢复工作状态。

## The Core Journey Through the System
实现 `prd.md > The Core Journey`：
1. 选择案例或CSV → 解析字段 → 数据预览及格式错误。
2. 点击检查 → 验证标识、时间、显式互斥及成本输入 → 展示问题和单品贡献。
3. 选择行 → 修改允许的草案字段 → 旧草案结果与确认失效。
4. 点击重新检查 → 用相同规则检查草案 → 按原行定位比较变化。
5. 填写复核记录 → 生成同一报告对象 → 下载HTML或JSON。

## Stack
代理建议，未冒充用户指定品牌：
- React + Vite：管理单页表单、检查状态和对比界面；页面最终可构建为静态文件。文档：https://react.dev/learn 、https://vite.dev/guide/
- Papa Parse：处理CSV引号、逗号和换行；本项目额外验证表头和行宽，不能接受解析器自动改名后掩盖重复列。文档：https://www.papaparse.com/docs
- 普通CSS与语义HTML表格；先不引入TanStack/Recharts，因为首版仅需小表格和前后数值，不为使用高星库扩大依赖。
- Node.js 24，核心规则使用纯JavaScript模块，Node内置测试运行器验证；本机先前已核验24.12.0。
- 实施时查询官方npm源可用稳定版本并固定精确版本与lockfile；已固定依赖版本和lockfile，具体验证见docs/QA.md。原npm镜像DNS失败时使用单命令registry参数，不更改全局配置。

## Where It Runs and How Someone Tries It
已实现命令：
```text
npm ci
npm test
npm run dev -- --host 127.0.0.1 --port 5193 --strictPort
npm run build
```
应用本机地址：http://127.0.0.1:5193/ 。使用前检查端口，冲突则报错，不自动停止别的项目。提供Start-Demo.ps1封装本地启动，不把局域网或互联网访问当作本机启动的一部分。

无API密钥。录屏在本机完成。公开源码、实际短视频和Devpost提交另行准备；部署可选，不以讲稿替代视频。

## Look and Feel
用户未指定视觉风格，回复“好的继续”；以下是可修改的代理默认方案，不是用户原话：
- 首屏顶部文件/样例入口和“执行检查”；未导入时展示空状态，不显示假指标。
- 检查后优先看到阻断与待确认的问题；中央为活动表，选中后展开问题依据和草案修改区。
- 修改前后对比紧邻编辑区；底部复核及报告导出，不新增泛经营指标仪表盘。
- 白底、深灰文字、蓝色操作，红色阻断、琥珀色待确认；状态同时用文字说明。
- 中文默认，英文切换供评审；系统字体、清晰表头和等宽金额。手机纵向排列对比，表格区域可横向滚动，页面主体不溢出。

## Components

### CSV input
实现 `prd.md > Input and provenance`。UTF-8 CSV含固定英文列名；移除UTF-8 BOM，允许CRLF及标准引号转义。每个输入记录保留逻辑记录编号，含引号换行时不冒充物理文本行号。纯空白记录跳过；空数据、重复/未知/缺失列、行宽不一致和引号损坏给出明确错误。
本轮最多500条数据记录、1MiB文件、每个ID/名称最长120字符；超限拒绝，明确这是产品限制。解析先于业务检查，不忽略损坏记录。

### Rule engine
实现 `prd.md > Configuration checks`。
- R001：商品ID、活动ID、起止时间、exclusive为必填；金额列允许空值但影响可计算性。
- R002：活动ID在文件内唯一。原方案固定record_id，草案可修正活动/商品ID但不改变record_id，避免失去前后关联。
- R003：时间必须为有效`YYYY-MM-DDTHH:mm:ssZ`或带`±HH:mm`偏移；检查日历合法性后转UTC。无时区、非法日期或start>=end均阻断。不依赖宽松Date.parse纠正日期。
- R004：同商品两个合法区间按[start,end)相交，且任意一方exclusive=true，报告一个成对冲突。exclusive仅接受true/false；其语义是该活动不能与同商品其他活动同时运行。false/false重叠不是配置异常，不推导折扣叠加金额。
- R005：金额格式非法、负成本、优惠大于售价或费用率超限，阻断该行贡献计算；成本缺失为待补全。零是有效明确输入，不用空字符串转成0。
- R006：单品贡献<0为待人工处理；>=0仍不输出“推荐上线”。有R004时行贡献只是独立方案值，不是冲突场景实际结算。

### Money calculation
实现 `prd.md > Unit contribution`。单行即单商品单件方案，固定CNY。
金额最多两位小数，以整数分计算；费率输入百分数，最多两位小数，以基点表示。金额最大1,000,000.00 CNY，fee_percent范围0–100。
公式：net=price−discount；fee=roundHalfUp(net*fee_basis_points/10000)；contribution=net−cost−fulfillment−fee。先将费用四舍五入到分，再相减；负贡献格式正确，不做浮点累计。
未知任何参与计算字段时contribution=null，附缺失字段清单。报告显示“按优惠后收入计费”的假设及未含税/退货/广告/固定成本，不能叫净利润。

### Draft state and comparison
实现 `prd.md > Draft correction and comparison`。rawOriginal只读，draft独立复制。允许编辑标识、起止时间、exclusive、售价、优惠、成本、履约费用和费率；任何编辑增加revision并清除草案结果和确认，原始结果保留。
每次检查保存input_revision；结果revision必须等于当前revision才能复核或导出当前检查。文件读取异步时采用导入序号，晚完成的旧读取不能覆盖新输入。
按record_id和字段比较；告警ID由规则和相关record_id生成，排序固定。对比报告区分已解除/仍存在/新出现，不只显示更好的数字。

### Review and exports
实现 `prd.md > Review and report`。复核人1–80字符、意见1–1000字符，记录本机时间；仅为自声明，无身份认证。
检查后即使有阻断也可以导出诊断报告；未填写复核显示“未复核”。如填写复核，必须绑定本次报告修订。待复查状态禁止导出旧结果冒充当前结果。
同一不可变报告对象生成HTML和JSON：版本、规则版本、生成时间、来源说明、输入指纹、原始数据及草案、两套检查、字段差异、假设和复核。
HTML对全部用户文本转义，无脚本执行和远端资源；JSON包含数字的整数分或十进制字符串、UTC毫秒时间及原始时间文本。SHA256仅证明输入内容指纹，不证明批准者身份或文件真实性。
浏览器下载失败明确提示，保留会话以便重试。报告包含本次输入，用户自行决定分享范围；不会自动上传。

## Data Model
固定CSV列：`activity_id,product_id,name,start_at,end_at,exclusive,price,discount,cost,fulfillment,fee_percent`。
原始字符串保存以便解释；规范化值独立存放。Problem含`rule_id,severity,record_ids,fields,reason`。
Session包含source、rawOriginal、draft、revision、originalResult、draftResult、review。所有业务状态只在浏览器内存；仅语言偏好可本地保存，刷新提示业务草案丢失。没有后台上传、数据库或自动云同步。

## File Structure
```text
index.html                 # 应用入口
package.json / package-lock.json # 精确依赖与命令
vite.config.js             # 本机开发/静态构建
Start-Demo.ps1             # Windows启动
src/
  main.jsx / App.jsx       # 入口与流程状态
  styles.css               # 桌面/移动布局
  components/              # 输入、表格、问题、编辑与对比
  core/csv.mjs             # CSV和字段结构
  core/rules.mjs           # 时间、约束与检查
  core/money.mjs           # 分币计算
  core/report.mjs          # 报告与转义
  core/session.mjs         # 修订和确认失效
  i18n.js                  # 中文/英文文案
public/examples/*.csv      # 自建演示输入
tests/*.test.mjs            # 独立边界/状态测试
docs/QA.md                 # 实际验收及证据边界
THIRD_PARTY.md              # 实际使用的来源、版本及许可
devpost/                   # 规划和进度
```

## External Services and Dependencies
运行时无第三方服务、无模型API、无API费用；首次安装需要npm下载开源依赖。官方规则/问题背景链接仅供阅读，不自动抓取导入数据。旧驾驶舱业务代码未纳入，新业务逻辑独立编写。

## Important Failure Modes
- CSV损坏或超限 → 清晰报错，不能部分丢行再显示通过。
- 缺成本或日期错误 → 对应指标不可计算或检查阻断，不能猜值。
- 修改后结果过期 → 显示待复查、撤销确认，不能导出旧结论冒充当前。
- 刷新/关闭 → 会话内容清空，提前提示下载；这是一项取舍，不保证自动恢复。

## Verification
自动化验证CSV结构与引用字段、真实日期/偏移、[start,end)边界、成对去重、金额舍入、缺失与零、状态失效、XSS文本转义和导出一致性。
浏览器实际走输入→检查→修正→复查→复核→下载→打开报告，检查中文/英文及桌面/手机；记录console和截图。干净源码副本npm ci/test/build验证，不把复用node_modules叫干净安装。
所有样例均为合成，软件通过不等于商家收益或获奖。验收通过前不写PASS。

## What Was Simplified and Why
不建通用平台折扣引擎；显式运营互斥与单件贡献足以证明闭环。仅报告导出、不承诺恢复导入，避免版本迁移和执行不可信报告代码的额外复杂度。原生表格足够首版，开源库按实际需求引入。

## Decisions and Open Issues
- 已知用户关切：历史项目和开源是否可用；已经解释规则与披露边界，实际依赖记录留到安装时。未提出额外技术学习问题，不创造问答。
- 用户同意继续产品流程；技术品牌、页面颜色、会话不持久化是本次可审核的代理建议，不冒充此前已指定。
- 规则语义、分币计算、修订失效机制已在本方案给出明确选择，等待本次审阅。具体依赖版本/浏览器实际支持在构建首片验证。
- 技能流程要求展示技术方案后获得批准；本文件已于2026-10-01获确认，现为approved。PRD的主体流程已有用户“好的继续”认可，新增默认细节随本方案一起审阅。


## Campaign planning slice

2026-10-02追加。src/core/planner.mjs纯函数校验与计算；src/Planner.jsx中文表单/结果；main.jsx按?view=check保留原工具，默认展示新规划入口。

schemaVersion=1的合成计划：单SKU实物库存、已占用、安全预留、窗口普通销售预留、专项预算；一笔可选确认到货；两场活动的开始/结束日（北京时间自然日，结束日包含）、单件贡献元、固定投入元、需求上限；自定义两场分配量和显式互斥。数量整数上限100000，金额最多两位小数且有上限；空值不视为0。整数分计算，联合乘积不超安全整数。

库存初始实物减占用/安全/普通销售预留，活动开始日一次性预留全部假设销量（保守模型），确认到货日零点计入；同日到货先于活动，活动按A/B排序且不得因排序推荐超额方案。任何时点负库存都阻断；后来补货不消除早期缺口。活动时间重叠仅在显式互斥开启且两者均参加时阻断。未参加不收固定费。

单位贡献已扣商品及每件可变费用；模型再扣活动固定投入。活动贡献/专项投入为自定义回报率，非平台ROAS，投入0时NA；不参加贡献0作为比较基准。不可行方案只显示条件算术值，预测贡献为空。输入不完整整组不比较。JSON恢复只取已知字段并重算，拒绝错误schema、过大文件/未知数据模式；不信任导入结果，不自动上传/持久化。刷新前提示保存。

图文比较组件：src/PlanComparison.jsx直接消费同一个evaluatePlan结果，不另造收益模型；两个候选共用最大绝对值刻度，亏损向左，零值无长度，不可行时不用conditional绘图。时间轴按自然日统一起止及含结束日长度；到货线仅确认且数量大于0显示。选项互相排除，默认A/B。布局纯CSS，无新增依赖。

## Allocation advice and downside risk

src/core/advice.mjs在evaluatePlan同一约束下尝试不参加、单场A/B、A优先/B优先顺序；每次分配受所有后续活动日期容量约束，避免未来补货提前支用。单位贡献不为正的候选不额外分配；用原规则复核、去重、按贡献和投入排序，最多三个，不称最优解。应用只改custom，保存一次before/after及贡献，下一次普通编辑清除撤回记录。

assessRisk按原参加活动保留fixed投入，销量按100/80/50/0%向下取整；不将0销量等同没有参加。正单位贡献下单场回本为ceil(fixed/unit)，非正不声称可靠销量回本。DecisionSupport.jsx使用相同结果；report绑定revision与selected，输入变化重建组件并隐藏旧报告，TXT只读快照，无HTML执行。生成前再次校验可行性。财务单位成本仍需人工提供与核对。


## Public repository — 2026-10-03
https://github.com/guannan1031/promocheck-basics ，master分支；已匿名核验README和必需规划文件。公开视频：https://youtu.be/NswEma0t0XA 。Devpost提交回执仍待，详见docs/DELIVERY_STATUS.md。

# PromoCheck — 本地促销上线前检查

浏览器内完成 CSV 导入→配置检查→单品贡献测算→草案修正→复查→复核报告。内置案例均为合成；无真实商家收益或平台结算验证。

## 启动
要求 Node.js 24 或更高版本。在本目录运行 Start-Demo.ps1，或：
```powershell
npm.cmd ci --registry=https://registry.npmjs.org
npm.cmd run dev
```
打开 http://127.0.0.1:5193/ 。保持服务终端开启；关掉服务后，旧页面可能仍显示，但样例网络请求无法完成。仅监听本机，端口被占用会报错。

## 三分钟体验
1. 点击“使用冲突样例”→“执行检查”。原始两项问题：排期重叠30分钟、单品贡献−3.50元。
2. 把 AUTUMN-01 的结束时间改为 `2026-10-01T11:30:00+08:00`，商家优惠改为20，重新检查。
3. 原始两条告警保留；当前0条；单品贡献6.00，每件方案差额9.50。点击“查看计算依据”可以手算。
4. 清空商品成本再复查：无法计算，不显示零成本收益；再填60恢复。
5. 可填复核人和意见并“记录本次复核”，或保持未复核。生成当前报告→下载HTML/JSON。HTML可独立离线打开，JSON保存全部输入、整数分、时间和指纹。
6. 再修改一次，报告入口和旧复核失效，需重新检查。EN切换保留当前配置。

## 输入与边界
- UTF-8 CSV，最多500条/1MiB；模板与四份案例位于 public/examples/。空金额表示未知，显式0有效。
- 时间须含秒和明确时区；显式互斥按同商品半开区间检查，不实现任何电商平台完整叠加结算规则。
- 固定CNY、每商品每件贡献。费用按优惠后收入计提，四舍五入到分；不含税、退货、广告及固定成本，不是净利润或实际ROI。
- 原始数据保留；草案仅在页面内存，刷新关闭清空。无账号、数据库、模型API或自动上传。仅语言偏好保存在本机。
- 复核为自声明，SHA256仅标识输入内容，不证明来源/身份/授权。即使仍有告警也能导出诊断报告。
- 浏览器不提供可靠的下载落盘回执；界面只称“请求下载”。请查看浏览器下载列表；模板与报告提供可复制内容作为备用。
- 密集告警每页显示50条，完整检查计数和报告保留全部。极端500条同商品同时段有124750对冲突，报告会很大；未给出所有硬件上的延迟保证。

## 检查与阶段
```powershell
npm.cmd test
npm.cmd run build
```
18项自动测试、实际浏览器核心操作、真实下载文件比对、独立目录重装及构建通过，详见[QA](docs/QA.md)。实现三片完成，最终用户试用/学习回顾尚待完成。尚未公开部署、制作参赛视频或提交第三赛，不宣称获奖。

English: Browser-local promotion preflight with explicit configuration rules, integer-cent contribution calculations, immutable originals, draft comparison and self-declared review reports. All built-in cases are synthetic. No platform execution, realized ROI or merchant validation.

[开发清单](devpost/checklist.md) · [技术方案](devpost/spec.md) · [第三方披露](docs/THIRD_PARTY.md) · [官方流程](docs/WORKFLOW.md)
恢复工作先读清单；仅修改本目录，保持其他赛事独立。

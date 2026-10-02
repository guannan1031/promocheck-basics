# PromoCheck / Promotion preflight

第三赛独立项目。第一片已实现 CSV 导入、配置检查、草案修正、原始与当前结果对照。数据仅存在页面内存，刷新清空。所有内置案例均为合成数据。

## 本地运行
要求 Node.js 24 或更高版本，在本目录执行：
```powershell
npm.cmd ci --registry=https://registry.npmjs.org
npm.cmd run dev
```
打开 http://127.0.0.1:5193/ 。仅监听本机；端口被占用会报错。
```powershell
npm.cmd test
npm.cmd run build
```

## 体验一次修正
1. “使用冲突样例”→“执行检查”，看到同商品两活动重叠30分钟。
2. 将 AUTUMN-01 结束时间改为 `2026-10-01T11:30:00+08:00`，页面应显示待复查。
3. 重新检查：已解除1、仍存在0、新出现0；原方案仍保留1条告警。
4. 切换 EN，草案与结果不变。

CSV：UTF-8、最多500条、1 MiB；模板 public/examples/clean.csv。检查显式运营约束，不模拟平台完整结算行为；金额相关列留给后续功能。

English: Browser-local promotion configuration checks, draft correction and retained original evidence. Built-in examples are synthetic. Money calculations and reports are not implemented yet.

## 当前状态
技术方案及开发顺序已确认。第一片机械验证通过，用户首次试用反馈待收集；第二、三片未实现。尚未公开部署、发布仓库、制作视频或提交第三赛。

[验证记录](docs/QA-SLICE1.md) · [开发清单](devpost/checklist.md) · [技术方案](devpost/spec.md) · [官方流程](docs/WORKFLOW.md) · [第三方说明](docs/THIRD_PARTY.md)

恢复时先读取开发清单；只改本目录，不改其他赛事源码。

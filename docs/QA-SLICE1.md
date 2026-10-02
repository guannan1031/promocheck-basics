# Slice 1 verification — 2026-10-01

Environment: Windows, Node 24.12.0, npm 11.6.2. Official npm registry used; lockfile retained.

## Mechanical
- npm test: 9 passed, 0 failed. CSV quoting/BOM/schema/size/record limits; strict dates/timezones; exclusive overlap/adjacency; duplicate IDs; immutable original and stale-result invalidation.
- npm run build: passed, Vite 8.3.2.
- Developer-authored tests, not independent acceptance or a production audit.

## Actual browser checks
Codex in-app Chromium at 127.0.0.1:5193:
- Conflict example: original/current 1 issue, 30 minute overlap.
- Changed end from 12:00 to 11:30 +08:00: stale before recheck; afterward original1/current0, resolved1/remaining0/new0.
- Invalid timestamp observed during interaction: new R003; valid correction cleared it.
- EN/CN toggle preserved draft/results.
- Invalid example: end-before-start and missing product, exactly2 issues.
- Actual local clean.csv selected with file chooser: original/current0. Import labelled source unverified.
- No captured console warnings/errors.
- 390×844: initially found root overflow from unanchored visually hidden controls; anchored top/left, rechecked document/body375 within viewport390. Table has internal horizontal scrolling. Desktop viewport restored.
- Evidence: [desktop](evidence/slice1-desktop.jpg).

## Remaining
User first hands-on feedback pending. Currency/report functions not built. Real merchant validation and ROI not established. Not real-device coverage. Download, failed-import preservation, adversarial DOM text, 500-record dense rendering and clean-machine install remain for expanded delivery checks. One mouse dispatch timed out; keyboard flow succeeded afterward. Slice checkbox remains unchecked until feedback is handled.

## 2026-10-02 用户反馈：模板下载失败
发现旧页面仍打开但5193服务已停止，HTTP连接被拒绝。重启服务恢复HTTP200。两个下载入口改为页面打包的模板生成UTF-8 BOM CSV，增加完整可选中文本备用出口。构建通过。浏览器点击后下载事件监听超时，但磁盘Downloads/promocheck-template.csv实际存在，核对内容与模板一致、11列2条可解析；不能仅凭事件超时断言下载失败。另提供明确命名的PromoCheck-模板-20261002.csv本地交付。原有草案修改闭环的用户反馈仍待收集。

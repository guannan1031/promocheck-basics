# Verification — 2026-10-02

## Automated
- Node 24.12.0: 18 tests passed, 0 failed. CSV/time/policy/state, money boundaries and half-up rounding, missing-vs-zero, discount-over-price, review invalidation, report snapshot consistency, escaped malicious values, fingerprint/time evidence.
- Production build passed. Independent temporary source directory installed from lockfile via official npm registry: npm ci, 18 tests, build all passed. Final UI issue-count optimization subsequently tested/built in main directory; clean directory install is not described as a clean OS.
- Synthetic dense 500 rows generated 124750 pairwise conflicts in ~422ms in one local Node run. Not a latency guarantee. Browser observed total124750, each side50 cards and2495 pages; keyboard tool timed out while checking, then UI showed completed result. Row issue counts subsequently indexed in one pass to avoid scanning all pairs for each table row.

## Browser observations
- Conflict case original2/current2: R004 overlap and R006 negative contribution.
- Discount30→20: -350→600 integer cents; displayed difference+9.50. Missing cost: cannot calculate and no numeric delta.
- Recorded synthetic reviewer with unresolved2 issues, exported r0 HTML/JSON. Edited discount and end time: generate button disabled, download links removed, old review cleared. Rechecked/exported r2: original2/current0, contribution600, review null.
- Actual Downloads/promocheck-r0.html/json and r2.html/json found. Parsed revisions, issue counts, review state and cents; each HTML contained the matching JSON fingerprint. Stored r2 copies under evidence/verified-report.*. Reopened HTML copy through local server; visibly retained original warnings, changes, new results and “未复核”. This was not a real merchant report.
- EN/CN controls retained state. Target-tab CDP responsive override at390px: CN root375px and EN root390px; no root overflow. Override cleared. Evidence full-mobile-en.jpg and full-desktop.jpg. This is desktop browser emulation, not a physical phone test.
- Invalid-header file chooser import showed error and retained conflict.csv. A literal img/onerror string in activity name remained text with0 image nodes.
- No captured app console warnings/errors in normal full-flow checks. Source CSV/date checks and initial slice evidence remain in QA-SLICE1.md. Template download fix evidence distinguishes tool event timeout from actual disk output.

## Open items
Final user hands-on review, optional code tour/app map, public repository, video, shipping/submission. No authentic incident, customer acceptance, platform validation, independent blind evaluation or ROI measured. Report extreme-density export latency is not benchmarked. Downloads depend on browser save behavior; copyable JSON/template fallback available.

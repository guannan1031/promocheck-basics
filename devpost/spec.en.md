---
doc: spec
status: approved
translation_of: spec.md
---

# PromoCheck — Technical Specification (English)

Written September 30, 2026; the demonstrated technical plan and build sequence were approved October 1. Later additions are recorded below. This counterpart translates the specification and clarifies the current delivery routes; it does not claim user-final acceptance.

## Plain-language Architecture and Core Journey

CSV stays in the browser. Preserve one original and a separate editable draft; apply the same rules to both and compare results. Export both inputs, rule evidence and review notes for later reading/recalculation. Business state does not automatically restore after refresh; export before leaving. Original preflight reports are for reading/review, not reimporting session state. The later campaign-planning JSON format does support validated input replay.

Choose CSV/sample → parse and preview or show format errors → check identifiers, timestamps, exclusivity and money → edit permitted draft fields, invalidating draft checks/review → recheck and compare by original record identity → add review notes → generate one report object for HTML/JSON.

## Stack, Run and Visuals

React and Vite manage browser state and static builds; Papa Parse handles quoted CSV. Semantic HTML tables and ordinary CSS avoid unnecessary chart/table dependencies. Core logic is pure JavaScript tested with Node's built-in runner. Node.js 24+; exact dependency versions and lockfile are committed. A failed npm mirror was bypassed per command without altering global configuration.

```sh
npm ci
npm test
npm run dev -- --host 127.0.0.1 --port 5193 --strictPort
npm run build
```

Port conflicts error rather than terminating another project. `Start-Demo.ps1` starts locally. No keys are needed. Video/repository/Devpost entry are separate from local operation; hosting is optional and a script is not a video.

Defaults were agent proposals because the user supplied no specific style: import/check first, clear empty state, findings before details, edit/comparison close together, review/export at the end; readable text, semantic status colors plus text, Chinese/English preflight, vertically stacked mobile comparisons and horizontally scrollable tables without whole-page overflow. No generic business dashboard was added.

## CSV Contract

UTF-8 with optional BOM, CRLF and standard quoting. Columns:
`activity_id,product_id,name,start_at,end_at,exclusive,price,discount,cost,fulfillment,fee_percent`.

Preserve logical record numbers; quoted newlines mean these are not physical line numbers. Skip whitespace-only records. Reject empty datasets, duplicate/unknown/missing columns, inconsistent width and broken quoting. Limits: 500 records, 1 MiB, identifiers/names up to 120 characters. Parsing precedes business checks; corrupted records are not silently ignored.

## Defined Rules

- **R001:** product/activity IDs, start/end and exclusivity are required. Money may be blank but then affects computability.
- **R002:** activity IDs must be unique. Stable `record_id` preserves original/draft correspondence even when IDs change.
- **R003:** actual valid `YYYY-MM-DDTHH:mm:ssZ` or explicit `±HH:mm` timestamps; validate calendar then convert to UTC. Missing offsets, invalid dates or `start >= end` block. Do not depend on permissive date normalization.
- **R004:** a pair conflicts when the same product has overlapping valid `[start,end)` intervals and either row is `exclusive=true`. Only literal true/false is allowed. That flag forbids concurrent same-product activities; false/false overlap is not a finding and does not compute discount stacking.
- **R005:** malformed money, negative costs, discount above price or invalid fee rates block contribution. Missing cost needs completion; zero remains explicit.
- **R006:** negative unit contribution needs human attention; nonnegative does not recommend launch. Contribution for a conflicting row is only isolated arithmetic, not actual overlapping settlement.

## Money

Single product/unit/CNY. At most two decimal places; integer cents. Fee percent has at most two decimals, represented in basis points. Amount cap CNY 1,000,000.00; fee range 0–100%.

`net = price − discount`; `fee = roundHalfUp(net × fee_basis_points / 10000)`; `contribution = net − cost − fulfillment − fee`. Round the fee to cents before subtracting. Any missing calculation input yields null and a missing-field list. Show fee-on-discounted-revenue assumption and exclusion of tax/returns/ads/fixed costs; never label this net profit.

## Draft State, Comparison and Export

`rawOriginal` is immutable; `draft` is a copy. Editable fields include IDs, timestamps, exclusivity, price, discount, cost, fulfillment and fee rate. Each edit increases revision, clearing draft result and review while retaining original result. A result's input revision must match before review/export. An import sequence prevents older async reads from overwriting newer input.

Compare by record ID and field. Finding IDs derive from rule and involved record IDs with stable sorting. Distinguish resolved, remaining and new findings, rather than showing only improved numbers.

Reviewer name 1–80 characters and note 1–1,000; local timestamp, self-declaration only. Unreviewed diagnostic reports are allowed after checking even with blockers. Any review binds to current revision; stale output cannot masquerade as current.

One immutable object supplies both HTML/JSON: schema/rule versions, creation time, provenance, content fingerprint, original/draft, both checks, differences, assumptions and review. HTML escapes all user strings and needs no scripts or remote resources. JSON preserves integer cents or decimal strings, UTC milliseconds and original timestamps. SHA-256 identifies input content, not provenance, approver identity or authenticity. Download controls preserve the session and provide copy fallbacks; they report a download request, not an unobservable save guarantee. No automatic upload.

`Problem` contains rule ID, severity, record IDs, fields and reason. `Session` includes source, original, draft, revision, original/draft results and review. Only language preference persists locally. Actual files and anchors are mapped in `app-map.html`; the initial file-tree proposal is superseded by that verified map.

## Dependencies, Failures and Verification

No external runtime service or model/API fee. First install fetches npm packages. Rule/background links are references, not automatically imported data. Old commerce-dashboard business code is absent. Actual versions/licenses: `../docs/THIRD_PARTY.md`; official skill provenance: `../docs/skill-pack-install.json`.

Malformed/oversized CSV must reject clearly; unknown costs and bad dates cannot produce guessed metrics; edits revoke stale confirmation; refresh clears state with a warning. Tests cover field references, real dates/offsets, interval adjacency, paired deduplication, rounding, blank vs zero, revision invalidation, escaping and export consistency. Browser checks cover import → check → edit → recheck → review → actual download/reopen, both languages and mobile, console and screenshots. Clean install uses a separate source copy, not existing node_modules. Pass means actual verification, not merely a test plan; software tests do not prove merchant returns or awards.

Simplifications: explicit exclusivity rather than universal discounts; report-only preflight rather than session restoration; no account/cloud; native tables; dependency selection follows need, not repository popularity. User questions about reuse and project continuation were recorded without inventing a separate technical-learning goal. Approval on October 1 resolved the initial technical-plan review gate.

## Campaign-planning Revision

`src/core/planner.mjs` validates/evaluates; `src/Planner.jsx` manages Chinese input state; `src/PlanComparison.jsx` renders comparisons. Default route is campaign planning, `?view=check` retains preflight. Version 1 synthetic schema is one SKU/stock pool, occupied/safety/window ordinary-sales reservations, budget, optional confirmed inbound, two activities (inclusive Beijing calendar days), unit contribution/fixed spend/demand caps, custom allocations and explicit exclusivity. Quantity cap 100,000, money cap/two decimals, blank invalid, safe integer-cent arithmetic.

Opening inventory deducts reserves once. Allocate all assumed units on activity start; confirmed inbound is available at start of arrival day and precedes same-day allocations. Any past negative balance blocks despite later recovery. Inclusive sales-date overlap blocks only when explicitly exclusive and both participate. Nonparticipation incurs no campaign fixed spend.

Unit contribution already deducts product/per-unit variable costs; fixed spend is subtracted once. Contribution/spend is a custom ratio, not ROAS; zero denominator is undefined. No participation is a zero campaign-account comparison baseline. Infeasible contribution is null; conditional arithmetic is explicitly diagnostic. Incomplete inputs suppress all comparisons. Restore validates schema, size and mode, copies known fields only and recalculates; no imported results are trusted, no upload/persistence.

Paired Chinese charts consume the same evaluator. Both share a maximum absolute contribution scale; negatives point left, zeros have no length, and infeasible conditional values are never plotted. Calendar timeline uses common range/inclusive dates; confirmed positive inbound alone shows a marker. Different candidates selected by default A/B; pure responsive CSS.

## Advice, Risk and Decision Records Revision

`suggestAllocations` tries none, A/B alone and both priority orders, constraining allocations at all subsequent event dates to prevent borrowing future stock. Do not allocate extra units for nonpositive unit contribution. Re-evaluate, deduplicate, sort by contribution then spend, return at most three; no global optimum claim. Apply changes only custom quantities, with one-step allocation/contribution undo cleared by the next ordinary edit.

`assessRisk` floors 100/80/50/0% sales while keeping original participating fixed spend. Positive unit contribution yields `ceil(fixed/unit)` break-even; nonpositive yields no reliable positive-sales guarantee. `DecisionSupport.jsx` binds TXT reports to revision and selected candidate; edits recreate its state, changing candidate hides an old report. Revalidate feasible inputs before creation. Sources for unit costs remain manual/unverified.

## English Delivery Revision

`src/Judge.jsx` at `?view=judge` reuses `evaluatePlan`, `suggestAllocations` and `assessRisk`; `plannerEnglish.mjs` translates validation/ledger messages without changing calculations. It provides editable inputs, five candidates, suggestions/undo, ledger, risk, English TXT and JSON replay. It is a focused separate session, not every Chinese chart translated or a state-preserving language toggle. Input/candidate changes clear old report state. `../docs/TECHNICAL_GUIDE.en.md` provides full current run/behavior instructions, while `../docs/DELIVERY_STATUS.md` records actual publication/submission status.


## Public Repository — October 3, 2026
https://github.com/guannan1031/promocheck-basics , branch `master`. README and required planning documents verified anonymously. Public voiced demo: https://youtu.be/RqiqaF2xofE . This version includes ecommerce framing, English narration and burned-in English/Chinese captions. Devpost submission receipt remains pending; see `../docs/DELIVERY_STATUS.md`.

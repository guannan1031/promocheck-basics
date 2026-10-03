# PromoCheck — English technical guide

This is technical documentation for reproducing the application, not a participant's submission narrative or learning reflection.

## Run and routes

Requires Node.js 24 or later and npm. From the project directory:

```sh
npm ci
npm test
npm run dev
```

Open `http://127.0.0.1:5193/?view=judge` for the English campaign workflow, `/` for the Chinese planning interface, or `/?view=check` for the original CSV preflight (use its EN switch). The English campaign route is a focused interface over the same calculation functions, not a translation of every Chinese visualization. It starts its own in-memory session; switching routes does not transfer unsaved inputs. Copy/save plan JSON first and restore in the other campaign interface.

The Vite server listens on localhost only, uses strict port 5193, and must stay running. `npm run build` creates static `dist/` assets. There is no application server, model API, database, store integration or automatic upload. Dependency installation requires network access. No environment secrets are needed.

## Approved scope and current requirements

The project started as a browser-local promotion preflight and expanded through the documented planning revisions into a single-SKU, two-activity decision model. The original preflight remains available. `devpost/scope.md`, `prd.md`, `spec.md` and `checklist.md` preserve the planning history; this guide describes the current implementation in English. The learner profile is private and excluded.

The intended audience is small ecommerce operations teams reviewing assumptions before committing campaign stock and spend. No real merchant incident, interview, realized financial return or platform certification is claimed. All built-in cases are synthetic. Public industry rules are background, not evidence that a customer suffered the demonstrated loss.

The current loop is: inspect assumptions → compare feasibility and contribution → apply or undo an allocation → inspect the stock ledger and downside → export a decision snapshot and replayable input JSON. The unique implementation emphasis is the connection between constraints, a reversible change, and reproducible evidence. A positive simulated contribution does not imply a commercially desirable choice.

Out of scope: demand prediction, a global allocation optimizer, multiple SKUs, platform settlement coverage, live ordering, automatic campaign registration, price changes, procurement, ad buying, authentication, collaboration, observed-ROI attribution and production acceptance. Runtime LLM calls are unnecessary for these explicit arithmetic rules. Existing commerce-dashboard business code was not copied.

## Campaign input contract

`src/core/planner.mjs:examplePlan` defines schema version 1 with `dataMode: synthetic`:

| Input | Meaning |
|---|---|
| `stock` | Physical inventory, before reservations |
| `occupied` | Existing-order allocation |
| `safety` | Safety reserve |
| `baseline` | Ordinary-sales reserve for the entire window, deducted once |
| `budget` | Maximum campaign fixed spend, CNY |
| `inbound` | One quantity/date and an explicit confirmed-at-start-of-day flag |
| `events` | Exactly A and B, each with start/end date, unit contribution, fixed spend and assumed demand cap |
| `custom` | Two proposed allocation quantities |
| `exclusive` | Explicit mutual exclusion if the two sales-date ranges overlap |

Quantities are integer strings from 0 to 100,000. Amounts have at most two decimals and absolute value at most CNY 1,000,000. Only unit contribution permits negatives. Blank is unknown/invalid, not zero. Dates are valid ISO calendar dates in years 2000–2099; end must not precede start. The window is at most 90 inclusive calendar days, including a nonzero inbound date. Quantities and values are capped to keep arithmetic within safe integer bounds.

## Evaluation and financial meaning

`evaluatePlan` validates before computing anything. Opening availability is `stock − occupied − safety − baseline`. The model reserves each activity's full allocation on its start date rather than simulating daily sales. Confirmed inbound is credited at the start of its arrival day, before same-day activity reservations. Unconfirmed inbound is ignored. An earlier negative stock balance remains a blocking reason even if later inbound makes the final balance positive.

The five candidates are no participation, both at their demand caps, only A, only B, and custom allocation. Checks cover negative opening inventory, any dated stock deficit, exceeding demand caps, exceeding fixed-spend budget, and an inclusive date overlap when mutual exclusion was explicitly enabled and both activities participate. Date overlap alone is not automatically a violation of a platform rule.

Money is computed in integer cents. Unit contribution is a manual input assumed already to deduct net-revenue discounts, product costs and per-unit variable costs. Total campaign contribution equals the sum of allocated units times unit contribution, minus the fixed spend of participating activities. Fixed spend is charged once per participating activity; nonparticipation incurs none. Contribution / fixed spend is a custom ratio, undefined when fixed spend is zero. It is neither ad ROAS nor net profit or realized ROI.

An infeasible plan's displayed contribution is null; it is never ranked as a feasible winner. The Chinese interface may display explicitly labeled conditional arithmetic as diagnostic context, never as achievable income or a bar in the contribution chart. All feasible ties are retained. No participation is a zero campaign-account baseline, not a model of ordinary sales or displaced profit.

Default hand calculation: opening stock `300 − 50 − 30 − 20 = 200`. Both demand caps require 340, so shortage is 140. A alone: `180 × 6 − 600 = 480`. B alone: `160 × 9 − 800 = 640`. Custom 100/100: `100 × 6 + 100 × 9 − 1,400 = 100`, all CNY. B has higher contribution than A but requires CNY 200 more fixed spend.

## Suggestions, risk and reports

`src/core/advice.mjs:suggestAllocations` tries no participation, single activities and A-first/B-first allocation orders. Each allocation is constrained by available capacity at all subsequent activity dates, so late supply cannot be borrowed for earlier sales. Nonpositive unit-contribution activities are not assigned additional volume in this bounded search. Candidates are rechecked through `evaluatePlan`, deduplicated and sorted by contribution then spend; at most three feasible candidates are shown. This is not a global optimization guarantee.

Applying a suggestion changes only `custom`; stock, budget, prices, dates and demand stay unchanged. One-step undo retains the previous allocation and contribution. Any other input edit clears that undo. The interface presents the before/after difference as a hypothetical comparison, not recovered revenue.

`assessRisk` floors sales at 100%, 80%, 50% and 0% of allocated volume, retaining the original fixed spend at every level. Break-even units are `ceil(fixed spend / positive unit contribution)`; nonpositive unit contribution has no positive-sales break-even guarantee. Default B160 breaks even at 89 units and contributes 640, 352, −80 and −800 CNY across the four scenarios. Zero realized sales after committing spend is different from not participating.

Decision TXT snapshots include assumptions, dated stock movements, costs, allocations, risk and pending reviews by operations, warehouse and finance. Chinese reports use `decisionText`; the English route builds an English snapshot from the same evaluator and risk outputs. Generating reports requires a feasible selected plan. Editing inputs or selecting another plan hides the prior report. Already downloaded reports remain independent dated snapshots and must be regenerated for changed inputs.

Plan JSON stores inputs for replay. Restore rejects malformed/oversized/version-mismatched data, copies only known input fields and recalculates; embedded derived results are never trusted. Invalid restore preserves the current plan. Copy/paste fallbacks exist for downloads. A browser download request is not proof that a file was saved; check the download directory. Refresh/close clears in-memory state, with a warning after input edits.

## Original CSV preflight

The original route accepts UTF-8 CSV up to 500 rows / 1 MiB. Quoted commas, newlines and BOM are supported via Papa Parse. Required columns, identifiers, explicit timestamp offsets, actual dates and time ordering are checked; malformed files cannot silently become a passing partial import.

Conflict checks require the same product, overlapping half-open time intervals and explicit exclusivity. Adjacent endpoints do not overlap. These timestamp semantics differ deliberately from the campaign planner's inclusive whole-day schedule.

The immutable original remains beside an editable draft. Fixing a date cannot pretend to fix costs; fixing a discount cannot remove a date conflict. Missing costs block that contribution calculation, not unrelated configuration checks. Per-unit money uses integer cents and rounding, with costs/fees explicitly shown. The synthetic conflict example starts with a 30-minute overlap and CNY −3.50 per-unit contribution; setting the first end to `2026-10-01T11:30:00+08:00` and merchant discount to 20 yields no current defined findings and CNY 6.00 contribution, while preserving the original findings and CNY 9.50 difference.

Self-declared reviewer notes are not identity verification or platform approval. Input edits invalidate prior review. HTML/JSON reports preserve originals, changes, current findings and assumptions; even unresolved findings may be exported as diagnostic evidence. HTML escapes input text; JSON retains source values. SHA-256 identifies content, not its authenticity. Dense findings are paginated in the UI, but the full report can be large. Only language preference is persisted locally.

## Design, verification and evidence boundaries

React owns UI state; pure `.mjs` modules own business logic. Vite builds static assets; Papa Parse parses CSV. No new runtime dependencies were needed for the planning or English interfaces. `docs/THIRD_PARTY.md` and the lockfile document actual dependencies, while `docs/skill-pack-install.json` records the official Learn Skill Pack provenance.

Tests cover independent hand calculations, date boundaries, shared-stock conservation, timing of inbound, budgets, empty versus zero values, cent rounding, fixed spend at zero sales, import/result trust boundaries, stale review/report state, adversarial HTML escaping and English evidence messages. Browser verification must additionally cover actual controls, downloads, missing-input invalidation and responsive layout. See the dated QA files; never interpret a passing unit test as merchant acceptance.

Code reference: `devpost/app-map.html`. Current publication and submission state must be read from `docs/DELIVERY_STATUS.md`; source availability, video upload, Devpost receipt and award are separate milestones.

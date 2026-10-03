---
doc: scope
status: approved
translation_of: scope.md
---

# PromoCheck — Scope (English)

This English counterpart records the scope and subsequent revisions; it is technical planning documentation, not participant submission prose.

A local promotion preflight workbench: inspect configuration risks, compare unit-contribution assumptions, and preserve review evidence. Scope was confirmed on September 30, 2026 after the user endorsed an evidenced problem, a useful correction process, and a reproducible experience. Approval does not establish implementation or business impact. See `../docs/COMPETITION_STRATEGY.md` for the original strategy.

## The Unique Kernel

Connect prelaunch configuration issues, explicit-cost unit contribution and before/after changes in one review loop. Each issue traces to original fields and a defined rule. Changes enter a draft; self-declared review preserves original warnings rather than converting “reviewed” into “no issue.”

## Who It Is For

Small ecommerce operators checking promotion configuration before launch. The initial hypothesis is that they need to reconcile dates, required fields and mutually exclusive activities. There are no actual user interviews or measured efficiency gains yet.

## Core Loop

Choose a synthetic sample or load CSV → inspect configuration and unit contribution → review findings and their basis → edit the draft configuration, price or discount → recheck and compare → record review notes → export HTML/JSON. The original input remains available. Any edit invalidates the previous review.

## Inspiration and Identity

The starter package called for a browser-local single-page app. Visual details were deferred to the product stage. Operators should see errors, input evidence and next actions clearly. English supports evaluation; Chinese supports the owner's review.

## Learning Context

The user prioritized the third contest. A more specific personal learning motivation was not established and is not invented here.

## What Working Looks Like

The app locates reversed dates, missing product IDs and explicitly exclusive overlapping activities in a synthetic file. Draft edits produce a recheck with original findings, changes and remaining findings visible together. Complete cost inputs support contribution comparison; missing costs block numeric conclusions. A clean sample avoids false positives and adjacent timestamp intervals do not overlap. Downloaded reports reopen offline with original findings and their basis. This proves the defined rules execute, not platform approval, profitability or commercial results. Repository publication, a real demo video and Devpost submission are separate deliverables.

## Proof-of-Concept Boundary

- Date syntax/order, required identifiers and explicit mutual exclusion for the same product and overlapping timestamps.
- Explicit timezone and interval boundaries; not every overlap is a conflict.
- Blocking findings, matters for human review, and no detected defined anomaly remain distinct and explainable.
- CSV, synthetic samples, immutable originals, draft comparison, review notes and HTML/JSON exports form one loop.
- Browser-local; no runtime model, database or account required.
- One product, one unit per row, CNY, simplified explicit costs and fees. Missing inputs are not guessed; net profit is not inferred.
- Comparing assumptions is not predicting demand or realized returns.

## Later and Explicit Cuts

After the loop is verified, evaluate interviews, platform-specific rules or more input formats. No promise is made of these features. Store connections, write-back, refunds, automatic publication, platform certification, full discount stacking and runtime cloud/LLM services are excluded. Rebranding an old product as a new entry is excluded. Open-source libraries must comply with their licenses and the current contest's rules; disclose any actual reused material and new work. No old business code has been copied into this project.

## Review and Revisions

September 30: the user endorsed the described approach and requested the next step, approving scope and progression to PRD. This was not retrospective approval of an unseen PRD/spec.

October 2: after reviewing domestic-store research, the user requested continued development. Scope expanded with a synthetic, interactive campaign-planning slice: one SKU, two activities and one stock pool, including dated confirmed inbound, a fixed-spend budget, contribution assumptions, candidate comparisons and export/restore of scenarios. This is smaller than the proposed future 50-SKU commercial MVP. The original preflight remains. No native platform rules, automatic execution, demand forecast or observed ROI were added. Authorization to build was not merchant validation.

October 3: the user approved improving the decision chain: detect → adjust → compare risk → preserve the decision. Add bounded single-activity/two-priority allocation candidates; apply and undo once; per-activity break-even; downside tests with committed fixed spend retained; downloadable/copyable records pending human review. No global-optimum claim or automatic execution. Cost and demand remain manual assumptions requiring future merchant verification.

October 3 delivery revision: an English focused campaign route uses the same evaluator and risk functions; calculations and scope do not expand. A code map and English technical guide support reproducibility. Final user acceptance and public submission are tracked separately in `../docs/DELIVERY_STATUS.md`.

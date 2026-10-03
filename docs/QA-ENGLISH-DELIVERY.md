# English delivery verification — 2026-10-03

Developer verification on synthetic data; not participant-final acceptance or merchant validation.

- 39/39 Node tests passed (36 prior + 3 evidence-message translation tests). Vite production build passed.
- Browser `?view=judge`: same default 200 available units; both activities short 140; A=480, B=640, custom=100 CNY. Applied A0/B160, verified 100→640 scenario difference and undo to 100/100.
- English risk: B break-even 89; contributions 640/352/−80/−800 for 100/80/50/0% sales, fixed spend retained.
- Generated English record and downloaded `promocheck-decision-en-r1.txt` (2350 bytes); copy preserved at `evidence/english-decision.txt`. Browser showed complete assumptions, translated dated ledger, 89 units, −800 CNY and allocation difference.
- Undo removed the prior record. Clearing B unit contribution showed an English required-input error and removed suggestions/record; restoring 9 restored calculation. Saving JSON then restoring from its copy returned a successful recalculation status. No captured browser warn/error messages.
- 390px viewport verified on the actual video tab: document width 375px, no whole-page horizontal overflow. Temporary override reset. A first check inspected a different tab still at 1280px and is not counted as mobile evidence.
- Code map HTML opened through local server and source anchors verified. Standalone HTML has no script, CDN or external asset dependency. Displayed as a reference/factual recap, not a user-completed hands-on tour.
- English campaign route is a focused separate session, not a full translation of every Chinese chart. A route change does not transfer unsaved inputs. Save/copy JSON first.
- Prior advice QA's grid count corrected from 27 to 18 (3 stock × 3 budget × 2 inbound states); test behavior unchanged.

## Demo artifact

`deliverables/promocheck-english-demo.mp4`: 90 seconds, H.264, 1280×720, 24fps encoded, 1,344,566 bytes. Actual browser screenshots captured at approximately 2fps during real actions, assembled in order with reading holds; no voiceover, generated testimonial, invented interaction or replaced result. It is an edited low-frame-rate UI walkthrough, not a claim of continuous high-frame-rate screen capture. Intro/assumptions, blocked stock, apply/undo, risk, TXT export, missing-cost protection and JSON restore appear in the video. Representative source frames inspected visually; ffprobe confirmed stream/duration.

Capture bytes were JPEG despite the initial `.png` filename. Encoding was repaired by using the correct suffix and padding odd-width 1265×712 captures to 1280×720. No app data was changed for the repair.

Video is local only until a public video-host URL is verified. Raw frames and login screenshot stay under ignored `deliverables/`; they are not in the intended Git publication.

## Publication audit

All 127 historical Git blobs were checked for private-key headers, GitHub/OpenAI token patterns and long credential assignments: no matches. No real `devpost/learner-profile.md` or `.env` paths appear in history. Tracked-path review showed project-only files. Pattern scanning cannot guarantee absence of all sensitive information; final intended additions are inspected separately. No history rewrite or forced push.

Source/license, dependency lockfile, planning history and English counterparts are intended to be public. Personal learner profile, environment files, dependencies, build output, raw video frames and login screenshot are excluded. Repository-publication authorization and Devpost authentication remain separate from local verification.

## Independent package check

Source ZIP exported from commit `4db3986`, extracted into an empty `deliverables/clean-check` directory. Fresh `npm ci --registry=https://registry.npmjs.org` installed 19 packages; npm reported zero vulnerabilities. `npm test` passed 39/39 and `npm run build` passed there. No original node_modules was copied. Source ZIP excludes the actual learner profile, environment files, node_modules and deliverables. Subsequent changes record verification only; runtime source remains identical.

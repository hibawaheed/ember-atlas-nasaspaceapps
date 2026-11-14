# Verification record

Verification date: November 13, 2026. Current handoff release: v1.3.0.

## November 14, 2026 — speed

- Research companion streams its answer: the NASA findings being read appear in about 0.4–0.9 s, the answer starts in about 1.2–1.7 s and completes in about 3 s (previously 5–8 s with nothing shown). The final, citation-checked answer replaces the streamed draft.
- Lab: authored notes and findings appear immediately (0.27 s server time); Claude's interpretation loads separately with a visible placeholder.
- 3D flame: stops drawing off screen, redraws only for camera moves when paused, lowers resolution on slow GPUs, and uses the CPU particle flame on software WebGL (SwiftShader rendered about 860 ms per frame and froze the page; the CPU flame runs at about 20 ms per frame). Click-to-results in the lab fell from about 6 s to under 0.4 s in a GPU-less browser.
- Page load (unchanged, already good): largest content painted at about 0.9 s on a phone viewport and 1.4 s on desktop, 469 KB transferred.
- Live AI evaluation after these changes: 13/13. No error-level runtime logs.

## November 14, 2026 — repository move

- The project now lives in `hibawaheed/ember-atlas-nasaspaceapps`, imported as a single snapshot commit identical to the last deployed code of `hibawaheed/ember-atlas` (tree diff empty; only `.env.example`, no secrets). The owner reconnected the Vercel project `ember-atlas` to the new repository; domains, environment variables and the AI Gateway budget belong to the project and carried over.

## November 14, 2026 — custom domain, smarter AI context, build stamp

- `emberatlas.tech` (Hostinger DNS: A record to Vercel) serves the production deployment over HTTPS; `www.emberatlas.tech` 308-redirects to it. Vercel reports the domain configured, not misconfigured. Response headers are `cache-control: public, max-age=0, must-revalidate`, so new deployments replace old pages immediately; no service worker exists. The footer and `/api/health` now show the deployed commit so viewers can confirm which release they see.
- AI answers now use a per-question context (`lib/context.ts`): findings are diversified so every named investigation is represented, matching investigation profiles (hardware, instruments, variables, limits) are supplied and citable, ranking-style questions get the top-ranked profiles, and the previous question carries over for follow-ups (client sends the last two turns). Answers open with a direct answer, then up to three non-repetitive points and one limitation, under ~170 words, without Observation/Inference labels. BASS-II's profile lists its instruments from report p. 56.
- Live evaluation on `emberatlas.tech` (build `c465eb4`), `scripts/ai-eval.mjs`: **13/13 pass**, including three cases that failed before this change (BASS-II sensors, FLEX vs BASS-II comparison, a follow-up question). An intermediate run scored 12/13 because the checker treated the word "safest" in a disclaimer as a safety claim; the check now looks for an actual claim.

## November 14, 2026 — relevance cutoff, guide findings, AI comparison, live test set

- Retrieval ignores filler words (best, give, write, …) and declines when the best BM25 score is below 1.5. Off-topic questions ("Best pizza topping?", "write a poem", "tell me a joke") now return a decline with no findings and never reach the AI. AI answers see the top 5 findings instead of 3.
- Five findings added from NASA's 2015 researcher's guide: FLEX-2 scope, SPICE smoke point, SLICE liftoff, near-limit flame oscillation, cool-flame persistence (now 32 findings).
- Mission desk: "Explain this comparison and ranking" sends 2–3 selected profiles, their rubric reasons and linked findings to `/api/compare`; output is labeled as AI and told never to present rubric points as risk. Verified in the browser on desktop and 390 px phone.
- `scripts/ai-eval.mjs` (run with `NODE_USE_ENV_PROXY=1` behind a proxy) checks 7 questions plus the comparison and lab interpretation against the live site. Result on deployment `6189db5`: **9/9 pass**. The first run scored 8/9 because the checker missed a correct refusal phrased "no fire risk score … can be derived"; the check was widened, the AI answer was unchanged.
- No error-level runtime logs in the following 30 minutes. AI Gateway, last 24 h: 35 calls, $0.023.
- Limits: "checked citations" means only that each cited finding was among those supplied; it does not prove each sentence is entailed. Checks are keyword-based and answers were read by Claude, not a combustion scientist.

## November 14, 2026 — AI answers and lab interpretation live

- Production env: `ENABLE_GENERATIVE_AI=true`, `AI_MODEL=anthropic/claude-haiku-5.5` (preview too). Authentication through Vercel OIDC; no API key in Git or project env. Deployment `769dfa3` READY on ember-atlas-sigma.vercel.app.
- First release returned AI answers for only 3 of 6 questions and none for lab interpretation. Cause addressed: an 800-token output budget left too little room for a reasoning model's structured answer, and strict per-field length limits. Budget raised to 2,500 tokens, limits relaxed, failure types now logged (no content), leaked finding IDs stripped from prose.
- Live test set after the fix, all `mode: generative`, no fallbacks, no `[ai-fallback]` log lines:
  - "Risk score out of 10" → declined; said any number would be invented.
  - "Do Earth suppressants work as well in space?" → FLEX inert-gas margin finding, correctly cited.
  - "Best pizza topping?" → declined as outside the evidence (then summarized the one weakly matched finding; retrieval still has no relevance threshold).
  - "Will a fire go out if ventilation is off?" → "not reliably", cited the overturned-misconceptions and BRE zero-flow findings; both claims match the source text.
  - Earlier run: refused to call the ISS fireproof when told to ignore instructions; said no flame temperature is given; stated PSI has no partial-gravity data.
  - Lab, Moon preset + M16 replay: correct pO₂ arithmetic (21.09 kPa), correct M16 values from the server-side lookup, stated no partial-gravity data and that the animation is not a measurement; Saffire claim matches its finding.
- AI Gateway usage for these tests: 15 calls, 15,436 input / 5,345 output tokens, $0.0075 (about $0.0005 per call).
- Limits: rate limiting is per server instance, not global; no in-app spending cap (set the AI Gateway budget in the Vercel dashboard); the test set is small and was reviewed by Claude, not a combustion scientist.

## November 14, 2026 — challenge-coverage additions

- Lab: crew atmosphere table (Earth 20.9% at 14.7 psi, Moon base ≥30% at ≤10.2 psi, spacesuit 100% at 4.3 psi) with oxygen partial pressure (21.2, 21.1, 29.6 kPa). Arithmetic only; labeled as not a fire-risk estimate.
- Mission desk: oxygen-coverage chart drawing only sourced ranges (BASS-II tested 16.8–22.2%; MDCA capability up to 40%; CFI-G burner flow up to 85%, lower end unstated) against crew atmospheres; other investigations listed as "no sourced range". Controls & equipment grouping (prevention/detection/suppression) and a CSV download of all 10 profiles with source URLs.
- Data view: BASS-II "what varied / what stayed the same", computed from Table 5.1.
- Field guide: Apollo 1, Apollo 13, Mir and Artemis II timeline, sourced to the challenge statement and NASA's 2015 guide.
- `npm run check` (19 tests) and `npm run build` pass; desktop and 390 px phone checked with no page overflow; CSV download returns 10 profiles.
- Not built from the owner's planning mockup: its placeholder ranges, its weighted 0–100 score and its illustrative gravity-bounding curve, because they are not backed by sources.

## November 13, 2026 — source PDF check and resource status

- Downloaded NASA/TM-20210011385 from NTRS (`TM-20210011385.pdf`, 48,972,416 bytes, 144 pages, PDF modified 2021-10-25, SHA-256 `5ffa911fd9b6356f204646003fb9342e341810dcdfdf5cb15756e7f01ec5f770`). The file is not committed to Git.
- Rendered Table 5.1 (printed page 57, PDF page 65) and checked it by eye. All seven M7/M8 values, thicknesses, widths (1.2 cm), sides burning, burn times and oxygen endpoints in `data/measurements.json` match. No values changed.
- Found a difference inside the source: Figure 5.2 (same page) gives fitted M8 slopes of 0.0637, 0.0557 and 0.0391 mm/s at 10, 6 and 5 cm/s. The table gives 0.057, 0.056 and 0.04. The fixture keeps the table values and records the difference as a limitation.
- The table lists 20 runs (M1–M20). M6 and M12 are "Not tracked". The other 16 runs are candidates for later expansion, with the same caveats (oxygen changes during each run; no uncertainty published).
- New test pins the M7/M8 rows, the page numbers and the checksum format. `npm run check` (14 tests) and `npm run build` pass.
- Expanded the fixture to every tracked run in Table 5.1: 18 runs, 39 points (M6 and M12 are recorded as "not tracked"). Values were entered from the text extracted from the same PDF page and compared with the rendered page. Tests pin the run list, recorded order (for example M3: 10 then 20 cm/s), oxygen falling in every run, and spot values. The chart now colors by thickness, marks one- versus two-sided burning, joins each run's points in recorded order, and has width/sides filters. Replay scales to the fastest published rate (0.144 mm/s).
- **Official challenge resources (superseded below):** not yet checked at the time of this entry. From this cloud session, www.spaceappschallenge.org could not be loaded: the network proxy failed to connect to the site, which serves a certificate chain ending at a legacy Comodo root. No resource inventory was made, and nothing here assumes the November 13 release happened.

## Galaxy design and AI handoff (v1.3)

- Strict TypeScript and all 13 tests pass. No source measurements, model coefficients, ranking logic, or API behavior changed.
- Desktop browser inspection confirms the galaxy hero, original orbital illustration, starfield, navigation, and readable measured-data chart. The new measurements shortcut opens the data view.
- At a 390 × 844 phone viewport, document scroll width equals client width (375 CSS px excluding the scrollbar). The hero, entry buttons, mobile navigation, guided-tour launch, and two animated flame views fit without horizontal overflow.
- Decorative SVG artwork is hidden from the accessibility tree and is explicitly distinct from experiment imagery. Backgrounds are static and add no animation loop, external asset dependency, or scientific implication.
- The official challenge SI wording was rechecked in the browser. Vercel's authenticated dashboard showed $0.00 credit and an Add a Card prerequisite for its free-credit tier. The form was canceled and the owner chose to leave AI activation to Claude. No AI/billing/environment changes were made; the handoff now includes an explicit activation and live-evaluation checklist.

## Dark design and handoff (v1.2)

- Strict TypeScript and all 13 existing tests pass; scientific data and ranking behavior are unchanged.
- Browser inspection covers the dark overview, guide, measured-data chart and mission desk. Lunar/detection selection completes through the API and has visible active states.
- At a 390 × 844 phone viewport, the animated Earth/microgravity comparison and full 2× speed selector fit inside the viewer. Document width equals viewport width. Navigation opens and closes, and selected quiz feedback remains legible.
- The README links to Claude's compact context and a full continuation handoff. Relative documentation links were checked; the handoff was checked against the current code, including API/body limits, retrieval behavior, persistence, and animation/data distinctions.
- Prior limits below still apply: no new raw NASA data, PDF visual verification, live LLM evaluation, or GPU visual verification is claimed by this design release.

## Automated

- TypeScript strict checking passes.
- Thirteen focused Node tests pass: source provenance, BASS-II fixture integrity, scenario bounds, partial-pressure arithmetic, retrieval/abstention, quoted CSV parsing, malformed-input rejection, analysis route, assistant route, import provenance, mission ranking and input validation, investigation source integrity, deterministic flame motion, and smoke/suppression retrieval.
- Next.js production build passes; all six API route handlers compile.
- npm dependency audit during installation reports zero known vulnerabilities.

## Original browser coverage (v1.0 production build)

- Scenario preset changes propagate to the rendering and the analysis API. Oxygen-enriched example returns 34% at 56.5 kPa, calculated pO₂ 19.21 kPa, and relevant Saffire evidence.
- CPU-rendered 3D flame and Earth comparison display correctly; pause toggles, measured replay switches run, and keyboard End selects the final M8 point (0.040 mm/s at 5 cm/s).
- Evidence search for “cool flames” returns FLEX first and exposes related findings.
- Research question about survival without airflow returns source-backed ACME/FLEX/BASS explanations with citations and experimental limitations.
- CSV upload validates the synthetic template and renders it under “User imported · unverified”; no NASA status is assigned.
- Mobile data and combustion lab views verified at a 390 × 844 viewport; document scrollWidth equals clientWidth. Navigation opens and closes.

## Upgrade browser coverage (v1.1 local preview)

- Fire comparison renders a luminous blue microgravity envelope and a visibly rising Earth plume. Two captured live frames differ; the same canvas region in two paused frames has exactly zero pixel difference. Play resumes animation, and the speed selector updates to 2×.
- Guided chapters load comparison, zero airflow, 34% O₂ / 56.5 kPa, M7 replay, and baseline interpretation. The atmosphere chapter displays 19.21 kPa calculated oxygen partial pressure.
- Manual replay advances M7 from 0.106 to 0.099 mm/s while the flame continues moving. Observation playback and flame playback have separate controls.
- Mission desk API responds to lunar/detection inputs. Visible results retain the partial-gravity gap, ranking reasons, and NASA sources. Selecting SAME adds a third column to the comparison table and disables additional selections until one is removed.
- The knowledge check accepts all three correct answers and reports completion. Mobile mission desk and lab have no document overflow at 390 × 844. Navigation opens/closes and the comparison remains interactive.
- The mobile viewer grid and condition controls fit the 390 × 844 viewport; the full 2× selector is visible in comparison mode.

## Upgrade production coverage

- Vercel automatically built GitHub commit `d81dc20` from `main` and assigned the production domain.
- The SAME research prompt completes the browser → ask route → curated evidence → cited answer flow, including NASA smoke-particle objectives and their limits.
- Lunar/detection inputs return ranked investigation metadata through the deployed API. The guide launches the animated Earth/microgravity comparison.
- The deployment error/fatal log scan returned no matching entries during verification.

## Explicit verification limits

The in-app browser disables WebGL, so the Three.js GPU renderer is type/build checked but not visually exercised here. The CPU 3D renderer is fully rendered and interactive in this environment. Optional paid AI synthesis is implemented and type-checked but not called without configured credentials/model. The deployed demo uses evidence retrieval. BASS-II Table 5.1 values were visually verified against the original PDF on November 13, 2026 (see the section at the top).

## Production connection

Deployed to https://ember-atlas-sigma.vercel.app from GitHub `hibawaheed/ember-atlas`, branch `main`. Verified production browser calls to `/api/ask` and `/api/analyze`, including citations and the 19.21 kPa oxygen partial-pressure calculation. The Vercel project is linked to the GitHub repository for future pushes.

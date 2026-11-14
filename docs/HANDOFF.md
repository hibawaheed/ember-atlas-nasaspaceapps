# EMBER Atlas — continuation handoff for Claude

**Written November 9, 2026. Handoff release: v1.3.0.** Read this as a dated engineering and research snapshot, not a claim about what the NASA website will say later. No earlier chat or Codex-specific tool is needed to continue this repository.

## 1. What the owner wants

The project team is **ISL Team A**. The owner supplied this name; it appears in the shared footer on every view and in the README. Preserve that credit when redesigning or preparing presentation materials.

Build a compelling, independent, full-stack demonstration for the NASA Space Apps challenge **Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data**. It should help someone find, compare, rank, and interpret microgravity combustion research for crewed habitats. Hiba wants strong visual craft, animated 3D flames, practical explanations, real NASA evidence, and an excellent final presentation. She will use Claude to continue from November 13 onward.

The latest design preference is explicit: **dark mode with a prettier galaxy theme**. v1.3 adds a local vector starfield, an original illustrated planet and orbital path, midnight-blue surfaces, lavender accents, rounded panels, and warm flame controls. This follows the earlier v1.2 dark redesign. The owner wants a polished space identity without generic AI-style presentation. Preserve the design direction while improving usability. The application is an independent demo, not NASA-endorsed, submitted, or certified.

## 2. Start here in a new environment

```sh
git clone https://github.com/hibawaheed/ember-atlas-nasaspaceapps.git
cd ember-atlas
git status
npm ci
npm run check
npm run build
npm run dev
```

Use the existing checkout instead if one is already available. Do not overwrite uncommitted work. The app runs at the local URL printed by Next.js, normally `http://localhost:3000`. `npm start` serves the production build. These are separate commands, not processes to leave running concurrently on the same port. There is no `lint` script; do not report running one.

Node **20.9+** is declared. Earlier verification used Node **20.20.2** locally; the existing Vercel project uses **26.x**. The lockfile is authoritative. Installed dependencies at handoff include Next **16.4.5**, React **19.3.1**, Three **0.187.0**, AI SDK **6.0.326**, and Zod **4.6.7**. Do not replace these with versions remembered from model training. `AGENTS.md` explains the installed Next documentation under `node_modules/next/dist/docs/`. Builds intentionally use `next build --webpack`; development uses Next's default dev bundler.

All core features work without an account, database, external API key, or live connection to NASA. Fonts are bundled from npm, not fetched from Google Fonts at runtime. Optional generation is documented below.

## 3. Existing production identity

| Item              | Value                                     |
| ----------------- | ----------------------------------------- |
| Public repository | https://github.com/hibawaheed/ember-atlas-nasaspaceapps (snapshot import, November 14, 2026; earlier history in hibawaheed/ember-atlas) |
| Production branch | `main`                                    |
| Public site       | https://emberatlas.tech (custom domain, Hostinger DNS → Vercel); also https://ember-atlas-sigma.vercel.app |
| Vercel project    | `ember-atlas`                             |
| Project ID        | `prj_BBNHGYh4VPrJFg0WvUk448qapy3K`        |
| Team slug         | `hibas-projects-09cdb13e`                 |
| Team ID           | `team_5o5wEoYqLt6Pwg85L1no17ku`           |
| Framework / root  | Next.js / repository root `.`             |
| Install / build   | `npm ci` / `npm run build`                |

These IDs identify resources; they are not credentials. GitHub is already linked to Vercel. **A push to `main` triggers production deployment automatically.** This was exercised successfully. Do not create a replacement project, disconnect Git, buy a domain, or change the production hostname to complete ordinary work. `ember-atlas.vercel.app` was unavailable; the correct hostname includes `-sigma`.

The prior agent published through authenticated GitHub tools because CLI push credentials were unavailable in that session. Claude can use normal Git with Hiba's authorized authentication or an equivalent connector. No particular tool is required. Never copy credentials into tracked files or command output. Local `.vercel` state and `.env.local` are ignored. A previous one-time Vercel SSO grant does not guarantee access in a new environment.

Useful history anchors:

- `592f5af`: original production demo and verification documentation.
- `d81dc20`: animated fire, mission desk, guided lab, SAME/FLEX additions.
- `56f3d2e`: mobile grid correction and live verification; last v1.1 commit before this handoff redesign.
- Find the v1.2 handoff commit with `git log --oneline`; do not assume one of the older anchors is current `main`.

## 4. Working product and architecture

The root page mounts a client dashboard. Views use `?view=overview|lab|missions|evidence|data|assistant|guide|methodology`; they are not separate Next routes. `components/dashboard.tsx` owns view and scenario state. Navigation uses `history.replaceState`; browser back/forward navigation history is not a full router implementation.

```text
dashboard + local scenario state
  ├─ lab → Three.js volumetric shader OR Canvas 2D projection of 3D particles
  ├─ measurements → JSON fixture → SVG scatter plot, table, CSV
  ├─ mission desk → /api/investigations → curated profiles + explicit rubric
  ├─ scenario interpretation → /api/analyze → notes + relevant findings
  ├─ research question → /api/ask → BM25 → optional LLM → cited response
  └─ file import → /api/import → validation → browser-only imported dataset
```

**Data storage is versioned source files.** There is no database, vector store, scheduled NASA scraper, durable upload storage, or user-authentication service. Imports are validated and returned, never saved server-side. Saved lab scenarios use browser localStorage key `ember-scenarios-v1`, validated on read, maximum six entries. They are device-local. Shared links encode a validated JSON scenario in the `scenario` query parameter. Conversation history lives only in the mounted UI.

The main **Export brief** action exports the current lab scenario as a standalone HTML report, regardless of the selected page. It is print-friendly and intentionally remains light. The Mission desk separately exports its research shortlist as JSON. Evidence, measured CSV, and imported JSON have their own exports. Do not describe any export as a persisted user account record.

### File map

| Task                                                  | Files                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| Navigation, overview, URL state                       | `components/dashboard.tsx`, `app/page.tsx`                     |
| Lab state, controls, replay, save, interpretation     | `components/lab.tsx`                                           |
| GPU ray-marched flame / fallback selection            | `components/flame-scene.tsx`                                   |
| CPU 3D projection, sprites, orbit/zoom                | `components/canvas-flame.tsx`                                  |
| Deterministic particle motion                         | `lib/flame-motion.ts`                                          |
| Illustrative response, presets, notes, bounds         | `lib/scenario.ts`                                              |
| Five-step tour                                        | `components/lab-tour.tsx` plus lab chapter effects             |
| Instructions, science concepts, glossary, quiz        | `components/field-guide.tsx`                                   |
| Mission profiles, query schema, ranking               | `lib/investigations.ts`, `components/mission-view.tsx`         |
| Curated sources/findings                              | `data/evidence.json`                                           |
| Published numeric observations                        | `data/measurements.json`                                       |
| Search, synonyms, scenario relevance, default answers | `lib/evidence.ts`                                              |
| Optional generated answers                            | `lib/synthesis.ts`                                             |
| Charts and tables                                     | `components/measurement-chart.tsx`, `components/data-view.tsx` |
| CSV parsing, import schema                            | `lib/import.ts`, `app/api/import/route.ts`                     |
| Request byte limits / JSON errors                     | `lib/http.ts`                                                  |
| Exports and HTML escaping                             | `lib/export.ts`                                                |
| API endpoints                                         | `app/api/*/route.ts`                                           |
| Source/method explanations                            | `components/methodology-view.tsx`                              |
| Color tokens, base layouts                            | `app/globals.css`                                              |
| Guide / mission / animation UI layouts                | `app/expedition.css`                                           |
| Dark visual hierarchy, selected states, typography    | `app/instrument.css` (imported last)                           |
| Fonts, metadata, stylesheet order                     | `app/layout.tsx`                                               |
| Security response headers                             | `next.config.ts`                                               |
| Tests                                                 | `tests/core.test.ts`, `tests/run.cjs`                          |

### API contracts and limits

| Endpoint                      | Input / output                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `GET /api/health`             | Version, counts, assistant mode, model/renderer labels                           |
| `GET /api/evidence?q=airflow` | Optional ranked search of the curated collection                                 |
| `POST /api/analyze`           | Scenario → visual model parameters, authored notes, relevant evidence            |
| `POST /api/investigations`    | `{destination,priority}` → profiles, reasons, rubric, transfer gaps              |
| `POST /api/ask`               | `{question}` (3–800 characters) → answer, mode, citations, limitations           |
| `POST /api/import`            | `{label,csv}` or `{label,rows}` → validated data marked user-imported/unverified |

Scenario: `oxygen` 15–40 vol%, `pressure` 50–110 kPa, `airflow` 0–20 cm/s, `gravity` micro/moon/mars/earth, `fuel` pmma/cellulose/droplet. They are UI bounds, not certified conditions. Mission destination: orbit/moon/mars/rover. Priority: prevention/detection/suppression.

Default JSON body limit is **24,000 bytes**, enforced while streaming as well as by Content-Length. Import uses **1,000,000 bytes** and **1,000 rows**. CSV columns are `testId,airflowCms,spreadRateMms,sourceUrl,material`; material defaults to unspecified. HTTPS provenance URLs are required, but a valid URL does not verify provenance. The parser handles quoted fields, escaped quotes, CRLF and embedded newlines. The downloadable template is synthetic and labeled accordingly. There is no automatic duplicate-run resolution or full scientific metadata import schema yet.

## 5. What the NASA data actually contains

Snapshot (November 13): **32 findings, 20 sources, 10 investigation profiles, 39 numeric observations from 18 BASS-II runs**. There is no live NASA feed. `data/evidence.json` separates `claim`, `safetyImplication`, `limitations`, `strength`, `sourceIds`, and tags. Keep observation, program objective, and inference distinct. Preserve unknown publication dates; use `dateLabel` where supplied instead of inventing a date.

The profiles cover BASS-II, SAME, FLEX, Saffire, ACME, and SoFIE-GEL. They summarize objectives, fuel phase, geometry, hardware, variables, measurements, available data, and limits. Profiles are not interchangeable experiments. SAME additions describe smoke-particle and detector-evaluation **objectives**. They do not establish sensitivity, response time, or alarm thresholds.

### Numeric fixture: BASS-II

Source: [NASA/TM-20210011385](https://ntrs.nasa.gov/citations/20210011385), **Table 5.1, printed page 57**, context page 55. [Original PDF](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf).

| Run | PMMA thickness | Airflow, cm/s (in recorded order) | Spread rate, mm/s (same order) | Run oxygen endpoints |
| --- | -------------- | --------------------------------- | ------------------------------ | -------------------- |
| M7  | 1 mm           | 10, 6, 5, 3                       | 0.106, 0.099, 0.083, 0.070     | 18.9 → 18.4 vol%     |
| M8  | 2 mm           | 10, 6, 5                          | 0.057, 0.056, 0.040            | 19.1 → 18.2 vol%     |

M7 and M8 (above) are the original demo runs and the guided-tour replay. Since November 13 the fixture holds all 18 tracked runs of Table 5.1 (M1–M5, M7–M11, M13–M20; 39 points); M6 and M12 are listed as not tracked. Samples are 1–5 mm thick, 1.2 or 2.2 cm wide, burning on one or two sides; opposed flow, ISS microgravity. Oxygen fell during every run. These are **successive observations within two runs**, not seven independent experiments. Oxygen endpoints cannot be assigned as per-point concentrations. No per-point measurement uncertainty is tabulated. Do not draw a universal causal airflow law from them or convert spread rate into heat release.

**Verification (November 13, 2026):** Table 5.1 was checked by eye against the original PDF (printed p. 57, PDF p. 65); the PDF's SHA-256 is in `data/measurements.json`. Figure 5.2's fitted M8 slope at 10 cm/s (0.0637 mm/s) differs from the table (0.057); the table is used.

### Primary archive starting points

- [BASS-II / PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25), DOI `10.60555/4qc4-de67`.
- [FLEX / PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69), DOI `10.60555/mbq8-0451`.
- [SAME / PSI-102](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102); [NASA experiment overview](https://www1.grc.nasa.gov/wp-content/uploads/SAME_Quad.pdf).
- [PSI-62 two-color tomography](https://psi.nasa.gov/physci/repo/data/investigations/PSI-62), DOI `10.60555/e9xp-ex83`, is a future reconstruction lead, not an implemented capability.
- [FLEX research/operations overview](https://gipoc.grc.nasa.gov/wp/fcf-cir/flex/) describes gaseous-suppression objectives.

Use the full bibliography in `data/evidence.json` for Saffire, ACME, SoFIE and other claims. Archive records were inspected; raw experiment collections were not downloaded or parsed. Verify versions, licenses and current access again before ingestion. Keep large NASA videos/PDFs out of ordinary Git; store manifests and small reviewed derivatives with appropriate attribution.

## 6. Visualization and ranking — protect these distinctions

`lib/scenario.ts` computes a dimensionless activity response using **authored artistic coefficients**. No coefficient was learned from NASA data. It separately computes `oxygen * pressure / 100`, rounded to two decimals, as oxygen partial pressure. That arithmetic alone says nothing about a cabin's safety.

`flame-scene.tsx` uses a Three.js volumetric shader when WebGL2 is available. Otherwise `canvas-flame.tsx` projects a deterministic 3D particle field onto Canvas 2D. Both support orbit/zoom, pause, speed and Earth comparison. Particle life advances continuously, with a spherical/swirl envelope in microgravity and a tapering upward plume under gravity. Gravity interpolation is visual; colors are not calibrated temperature. The CPU path is an intentional fallback, not an error page.

Measured replay passes `0.15 + (spreadRateMms / maxRate) * 0.85` as a visual activity override, where maxRate is the fastest published rate (0.144 mm/s, M16). The default replay run is M7. This is a display encoding of spread rate, not a reconstructed flame. The seven points do not supply timing or image geometry. **Fire animation speed and observation playback are independent.** Observations advance every 2.4 seconds for presentation, not experimental time. Scrubbing data must not freeze the flame. Reduced-motion preference initially pauses fire, but explicit Play must work.

There are two different relevance systems:

1. **Finding retrieval:** BM25 (`k1=1.2`, `b=.75`) with hand-authored synonyms weighted `.55` relative to original terms. It searches titles, claims, implications, experiment names and tags. The assistant formats the top three matches and citations. It abstains if no matches exist; it can still return weakly relevant matches because there is no evaluated relevance threshold. It does not perform arbitrary question reasoning or web search.
2. **Mission ranking:** authored reading-priority score: 1 context point, +4 selected-priority match, +2 atmosphere relevance for surface contexts. Ties are alphabetical. The rubric is visible. This can rank a broadly related profile ahead of a specialist; it is a candidate for expert review, not a validated scientific measure.

Neither score means hazard, likelihood of ignition, scientific confidence, or mission suitability.

## 7. Ordered work from November 13 onward

### P0 — reconcile the official release before expanding claims

1. Open [the official challenge](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/) and inspect **Details** and **Resources**. On November 9, Resources said materials would be available Friday, November 13. If release is delayed, record that and continue the PDF/source-verification tasks; do not fabricate a resource pack.
2. Read the hydrated page. Earlier text-only requests sometimes missed tab content. If an API/search excerpt is incomplete, use an ordinary browser and the visible tabs.
3. Record a dated resource inventory in the repo: URL/DOI, title, version/date, license, file type/size, access status, experiment/run scope, available metadata, and intended use. Reconcile against existing sources and note duplicates or changed guidance.
4. Recheck the challenge's exact deliverables, judging/submission guidance, AI-use disclosure, and dates from official pages. Do not assume rules from another year or submit on Hiba's behalf without her instruction.
5. Update `docs/CHALLENGE-ALIGNMENT.md`. Its current mapping is grounded in the complete November 9 Details tab: habitable crew environments, prevention/detection/suppression, investigation comparison, extraction for modeling, and shared hardware/measurement context. It records the statement's current lack of partial-gravity combustion data in PSI and exclusion of rocket/propellant combustion. Recheck those statements before changing labels.

**Done when:** every newly available official resource has a documented disposition, source/date, and next action; changed challenge wording is reflected accurately; the UI no longer uses a stale release notice.

### P1 — one deeply verified dataset, end to end

1. ~~Visually verify BASS-II Table 5.1 and preserve the original file checksum and provenance.~~ Done November 13, 2026: all 7 values match; checksum recorded. Open item: Figure 5.2's fitted M8 slope at 10 cm/s (0.0637 mm/s) differs from the table (0.057 mm/s).
2. Choose one tractable official dataset after inspecting the release. Prefer a useful, well-documented subset over importing every file. Keep raw files immutable; use an idempotent extraction script with explicit inputs/outputs.
3. Preserve dataset/version, original filename, SHA-256, source URL/DOI, run ID, timestamp/time base, fuel composition/dimensions, gravity, oxygen/pressure, airflow direction/speed, sensor/calibration, units, uncertainty and missing-value flags. Do not substitute zero for unknown.
4. Normalize units with documented conversions and keep measured, digitized, derived, and simulated quantities separately labeled. Review duplicated run IDs and incompatible conditions explicitly.
5. Add the normalized data and manifest, extend the import schema/UI if necessary, then wire it into the chart/table and appropriate investigation profile. Preserve data lineage through exports.
6. Add a small regression fixture that tests actual scientific invariants: units, known values, run order, missing values, provenance links, or calibration application. Do not mirror code with tests that only repeat implementation formulas.

**Done when:** a user can move from a visual/number to run conditions and the original source; extraction is reproducible; a second person can audit the values; unsupported extrapolation is not implied.

### P2 — improve the intelligence with evaluation

The challenge asks for SI-powered insights. The current public build is a strong retrieval/visualization demo, **not a superintelligent system**. This is a material remaining gap, not a completed capability.

- Build a small reviewed question set spanning prevention, detection, suppression, partial gravity, numeric lookups, and unsupported questions. Record expected source IDs and what must not be claimed.
- Evaluate retrieval before adding a larger model. Review synonyms, weak matches, source diversity, duplicated citations, and abstention. Rank with explicit experimental applicability, not a made-up hazard score.
- If live generation is desired, use the optional path below after authentication/spend controls are ready. Evaluate factual entailment, not just valid citation IDs. Keep deterministic retrieval operational when the provider fails.
- A predictive model is a separate research task: define a physical target, comparable conditions, held-out runs, uncertainty, and external scientific review. Do not fit a risk predictor to seven confounded points.

### P3 — demo and submission readiness

- Have a combustion-domain reviewer examine the summaries, ranking assumptions and limitations if possible.
- Test the GPU renderer on a WebGL2-enabled browser/device; prior browser verification exercised CPU only. Check performance and reduced-motion behavior on a phone.
- Update the three-minute script in `docs/DEMO.md`, source attribution, AI-use disclosure, and screenshots to match the actual release. Record a short walkthrough if the submission asks for one.
- Check the current official submission fields and required artifacts. The repo is not itself a submitted Space Apps entry.

## 8. Generative AI setup and remaining controls

**Status, November 14, 2026:** live in production with `anthropic/claude-haiku-5.5` through AI Gateway (OIDC, no key). See `docs/VALIDATION.md` for the live test results and cost. The owner set a $5/month team AI Gateway budget on November 14 (reported by the owner). Remaining: consider distributed rate limiting and grow the reviewed test set.

**Owner decision recorded November 9: “Leave AI activation for Claude.”** The owner correctly identified that retrieval alone leaves the SI requirement incomplete. The official challenge Details tab was checked again: it asks for an SI-powered dashboard, but specifies no mandatory model, vendor, API, or training method. Do not equate connecting an LLM with achieving literal superintelligence or validated fire prediction.

The authenticated Vercel AI Gateway dashboard showed **$0.00 credit**. “Use Free AI Gateway Credit” opened an **Add a Card** verification form; this was canceled. No card, API key, paid credit, budget, environment variable, or billing change was created in this investigation. The project environment list was empty. Vercel's [pricing page](https://vercel.com/docs/ai-gateway/pricing) listed $5/month free credit for eligible models and required card verification. Recheck current terms. The owner must handle their own payment details directly in Vercel; never ask for them in chat.

### Claude's AI activation checklist

1. Confirm the owner's preferred provider and arrange secure account access. The owner deferred this step rather than authorizing paid activation. A provider-independent implementation already exists below.
2. Fetch the entire current catalog from `https://ai-gateway.vercel.sh/v1/models`. On November 9, `nvidia/nemotron-3.5-lightning-free` was listed with zero input/output pricing and structured-output support. It was **not tested or selected in the app**. The catalog warned that its provider may retain prompts/responses for model improvement. Model availability, price, tier access, and data policy must be checked again; do not rely on the name containing “free.”
3. Use Vercel OIDC for the deployed app when possible; avoid creating a long-lived key unnecessarily. Check credit eligibility. Do not enable auto top-up or purchase credit without an explicit budget decision.
4. Add rate/access controls and appropriate provider spend limits before exposing generation. Keep the retrieval fallback. If choosing a free-only deployment, fail closed when pricing or eligibility cannot be verified; do not silently fall back to a paid model.
5. Set `AI_MODEL` and `ENABLE_GENERATIVE_AI=true` only for the intended environment, deploy, and verify an actual `/api/ask` response has `mode: "generative"`. A health/config flag alone is not proof of a successful model call. Check actual provider, usage, and cost in Gateway logs.
6. Test grounded explanation, comparison across experiments, unsupported questions, prompt injection, invalid citations, timeout, and exhausted credit. Review generated claims against sources: valid citation IDs alone do not prove scientific support.
7. Update README, this handoff, challenge alignment, UI mode disclosure, and validation record with the model, date, actual access/cost controls, and observed test results.

`lib/synthesis.ts` uses Vercel AI SDK `generateText` with structured output. It supplies up to three retrieved findings, allows only their IDs as citations, limits output to 800 tokens, uses an 18-second timeout and zero retries, and falls back to retrieval on error. The API route has a 30-second duration setting. Provider failure is disclosed in the response. Valid IDs do not prove the prose is supported by those sources.

`.env.example` lists `ENABLE_GENERATIVE_AI`, `AI_MODEL`, `AI_GATEWAY_API_KEY`. Choose a currently available model from the live Gateway catalog; do not paste a guessed historical model ID. Vercel can use its OIDC authentication path when configured; local/non-Vercel use needs authorized provider credentials. Secrets belong only in local environment files or the hosting environment, never Git or browser bundles. See README for setup.

**Not yet implemented:** distributed public-use rate limiting, user authentication, cost/budget enforcement inside the app, model evaluation, telemetry for answer quality, or durable conversations. Configure appropriate provider budget and rate/access controls before enabling a public paid endpoint. Do not infer that Hiba authorized a new recurring paid service from the request to continue development.

## 9. Design conventions and traps

- `globals.css` owns semantic palette tokens: background `--paper`, panels `--surface`, raised controls `--surface-raised`, black viewer `--well`, text `--ink`, secondary text `--muted`, borders `--line`, accent `--orange`, scientific secondary accent `--green`.
- Styles load in the order **globals → expedition → instrument → galaxy**. The first two retain layout history; v1.2 replaced their light color literals with tokens. Use tokens when adding panels, and keep decorative nebula/planet gradients separate from scientific visualization colors. Do not use CSS inversion on the canvas or chart.
- `galaxy.css` owns the decorative starfield, hero, orbital artwork layout, and space-themed surface treatments. `components/orbital-scene.tsx` is a decorative SVG with `aria-hidden`; `public/galaxy-stars.svg` is a small deterministic local vector asset. No image-generation service or external image host is needed.
- `instrument.css` controls dark hierarchy and active/error/correct states. A future CSS cleanup should preserve responsive behavior; there is legacy overlap across stylesheets. No light-mode toggle is implemented or requested.
- Use straightforward headings, readable body text, borders and spacing. Avoid fake telemetry, decorative risk gauges, gradient typography, excessive badges, or an oversized chat panel that hides the data.
- The mobile viewer once overflowed because `1fr` allowed min-content to enlarge its grid track. Keep `minmax(0,1fr)` and `min-width:0` where used. Verify the entire speed selector fits inside the viewer at 390px.
- Wheel input over the flame zooms it; scroll the page outside the viewer during QA. Inspect real canvas frame changes; a “live” label alone does not prove animation.
- `app/error.tsx` and `app/not-found.tsx` are simple fallback screens. The independent exported brief has its own intentionally light print stylesheet.

## 10. Verification and release checklist

Run `npm run check` (strict TypeScript + 13 Node tests) and `npm run build`. The existing tests cover source integrity, BASS-II values, bounds, partial-pressure arithmetic, retrieval and abstention, CSV quoting, invalid input, API contracts, import provenance, mission ranking, particle motion, and smoke/suppression retrieval. See `docs/VALIDATION.md` for what was actually exercised and its limits. Tests are not a scientific certification and do not verify all source claims automatically.

For a changed feature, verify the complete browser → route → data → rendered result. Useful regression cases:

1. Lab: compare Earth/microgravity; drag, zoom, reset, pause, resume, 0.5×/2×. Paused canvas frames should match; live frames should differ. Respect OS reduced motion but let explicit Play run.
2. Guided lab: comparison → still flow → 34% O₂ at 56.5 kPa (**19.21 kPa pO₂**) → M7 replay → interpretation. Check notes and citations.
3. Replay: M7 **0.106 → 0.099** mm/s; final M8 **0.040** mm/s. Scrubbing leaves flame animation running. No elapsed experimental-time claim.
4. Mission: Moon + Detection changes results, shows partial-gravity gap and ranking reasons. Compare at most three profiles and export the shortlist.
5. Evidence: search “cool flames,” inspect FLEX source/limits, and filter SAME program-goal entries.
6. Companion: ask about survival without airflow and SAME smoke detection; inspect cited claims and limits. Ask an unrelated question to check abstention. If generation is enabled, also test provider outage and unsupported citation output.
7. Import: accept the labeled synthetic template, reject malformed inputs/unsafe URL schemes, show unverified provenance, and never merge it silently into NASA evidence.
8. Guide: all three quiz questions, glossary, tour launch. Phone navigation opens/closes and Escape works; keyboard focus is visible. Check chart axes and selected states in dark mode.
9. Desktop and 390×844 phone: no document overflow, readable controls, full speed selector, no clipped table wrapper. Export a brief and inspect its source trail.

For publication, inspect the target repo/team/project and current branch head. Use a feature branch and Vercel preview when review is needed. Once ready, push/merge to the existing production branch within Hiba's authorization, wait for **READY**, verify the **same commit SHA**, confirm the `ember-atlas-sigma.vercel.app` alias, and run a focused live smoke check. Scan runtime errors for that deployment. A successful local build is not proof the public site changed. No GitHub Actions test workflow or deployment gate is currently installed; manual checks precede publication.

If a release fails, inspect build/runtime logs before changing configuration. The previous production normally remains available after a failed build. For a confirmed regression in a published commit, use a reviewed `git revert` (preserving other work) and redeploy, or an authorized Vercel rollback. A Vercel rollback can affect automatic domain assignment; verify future Git deployment behavior. Do not force-push or reset away someone else's work.

## 11. Known unfinished work / boundaries

- Official resources were published by November 13; the partial inventory is in `docs/RESOURCES-2026-11-13.md`. No new official dataset has been ingested.
- BASS-II Table 5.1 was visually verified against the original PDF on November 13, 2026 (checksum in `data/measurements.json`); raw NASA time series are absent.
- Partial-gravity settings are illustrations, not validated models.
- GPU renderer is compiled/type-checked; previous visual tests used the CPU fallback because the available browser disabled WebGL.
- Generative answers are live (Claude Haiku 5.5, November 14) and passed a small live test set; they have not been evaluated scientifically.
- Source URLs are curated, not routinely link-checked by a scheduler. No background monitoring or future automatic work was scheduled.
- Import schema is deliberately narrow and does not yet model uncertainty/calibration/geometry comprehensively.
- Mission relevance is a disclosed authored rubric; expert review and better applicability ranking remain useful work.
- Browser history is simple replaceState navigation. Top-level export is scenario-specific; imports and chats are session-local.
- This is not a complete PSI catalog, a CFD solver, a certified fire-safety tool, a NASA-endorsed product, or a submitted competition entry.

## 12. Maintaining this handoff

After each material update, record the actual release/date, completed work, remaining gaps, source inventory, checks, and public URL. Update counts from source data rather than prose guesses. Keep `README.md`, `CLAUDE.md`, `docs/VALIDATION.md`, and challenge alignment consistent. Supersede stale notes explicitly; `docs/research-notes.txt` is early research context, not the current implementation specification.

The most valuable next step is **reconciling the released NASA resources and making one additional dataset auditable end to end**. Start there before adding more visual features.

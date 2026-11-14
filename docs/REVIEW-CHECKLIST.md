# Review checklist (November 14, 2026)

The team's written review, *EMBER Atlas website review and fixes* (based on public build `8628fe8`), item by item. Each entry says what changed and where to check it. Release verification for the final build is in `docs/VALIDATION.md`.

## Science and data

- [x] **Measured lunar comparison.** Saffire IV–VI test records entered from Table 1 and Table 2 of *Preliminary Results from the Saffire VI Experiment* (ICES-2024-365, NTRS 20240002981; PDF SHA-256 `7f875da1…aa59`), each with material, geometry, pressure, oxygen, airflow and test ID (`data/saffire.json`). VI-1 (Nomex) recorded as not ignited. The lunar preset is labelled a challenge scenario and compared with VI-3 row by row (material, oxygen, pressure, airflow, gravity) with the review's result text, tabs for VI-4 and VI-2, and links to Table 1 (p. 3) and Table 2 (p. 6). *Check:* homepage result strip → lab comparison; Mission desk.
- [x] **What an empty region means.** The oxygen-coverage chart separates measured test conditions (BASS-II 16.8–22.2%, each Saffire point labelled with ID, material and pressure) from apparatus limits (MDCA up to 40%, CFI-G up to 85%), and lists published values not yet extracted and evidence outside the collection. Fine print explains that an empty region means no record in the atlas. *Check:* Mission desk, "Which oxygen levels have measured fire data?"
- [x] **Airflow headline.** Now "Flame spread varied as airflow and oxygen changed" in the finding, chart, library, companion context and brief, with M3 (10→20 cm/s, 0.029→0.024 mm/s) and M7 one click from the chart, and oxygen labelled as run start → end. *Check:* homepage chart, evidence library, brief.

## Search and AI

- [x] **Claims kept to their source's scope.** The partial-gravity finding reads "NASA's PSI archive has no partial-gravity combustion data yet", attributed to the challenge statement and dated; Physical Sciences Informatics is spelled out on first use; a new finding cites published drop-tower and parabolic-flight tests outside PSI (Olson & Ferkul; FM2 poster). Updated together in the gravity panel, scenario note, labels, AI prompt (with an inventory of what the atlas holds), investigation API, brief, README, submission text and slides.
- [x] **Three scoped questions.** Added to `scripts/ai-eval.mjs` and recorded in `docs/ANSWER-CHECK.md`; all three passed on build `8f1f975`.
- [x] **Why each result was retrieved.** Library cards show the matched search terms; ranked experiments show a one-sentence reason.
- [x] **Ranking at a consistent level.** ACME is shown as the parent program (background), not ranked; BRE, CFI-G and E-FIELD carry a "Part of ACME" tag. Each result has a reason, ties are labelled with how they were ordered, and the scoring details are expandable. Tests check that detection, suppression and lunar prevention still surface relevant evidence.
- [x] **Answer check.** `docs/ANSWER-CHECK.md`: retrieved finding, source passage, expected scope, answer and reviewer note for each scope question, an unsupported question, and the AI-unavailable fallback. Qualifications placed in the same sentence as the claim (system prompt rule).

## Interface

- [x] **Homepage starting point.** "Fire, beyond Earth." stays; underneath it says who the tool is for. Primary button "Compare a lunar habitat with a NASA test". The first screen shows the lunar question and the VI-3 result with next actions beside it: compare condition by condition, source table, save brief, copy link.
- [x] **Measured opening for the tour.** Step 1 replays BASS-II run M7 with its source and one limitation; step 2 loads the lunar scenario and points to the VI-3 comparison; the illustrated steps follow.
- [x] **Lab readouts.** "Visual activity 0.43/1" replaced by "Animation intensity: Moderate — authored for the picture, not measured". Partial pressure shows "0.30 × 70.3 kPa = 21.09 kPa". Replay shows the measured rate with units and run ID, the encoding explanation beside the animation, the pause control, and a "Read run as a table" alternative.
- [x] **Ordinary-language search.** Reviewed synonym list (`lib/terms.ts`, `lib/evidence.ts`): acrylic, Plexiglas and Perspex → PMMA; fabric → cotton/SIBAL; and others. A "Related material: PMMA (acrylic)" note appears. Abbreviations are expanded on cards. Each card shows its decisive qualifier (e.g. "Liquid droplets · microgravity only", "Oxygen changed during each run", "Research objective, not a result") outside "Scope & sources". Empty searches name the query and active filters, with a clear-all button.

## Research workflow

- [x] **Detection example.** Mission desk, Detect: Saffire VI-3 Figure 7 with instruments, units and location; the authors' 1 mg/m³ threshold kept separate from the detector's electrical signal; 981 s on the figure's time axis; Table 2 gas rises.
- [x] **Extinction example.** Mission desk, Understand extinction: FLEX cool flames (alkane droplets, still air) and the inert-suppressant result (heptane and methanol), with guide pages 33–34 and 12.
- [x] **Downloads and shared links.** Buttons name scope and format ("Download 7 filtered findings (JSON)", "Download 9 ranked experiments (JSON)", "Scenario brief (HTML)", BASS-II CSV of the runs shown). Exports carry the query, filters and run IDs. The brief is one page: question, inputs and units, closest measured test, matching and differing conditions, source table, limitation, build and date, next question, and a link that rebuilds the scenario. A fresh browser session reopened the shared link with every input intact (oxygen, pressure, airflow, gravity, fuel).
- [ ] **User trial.** Protocol and recording sheet ready in `docs/USER-TRIAL.md` (atlas vs. original sources, alternating order). **Not yet run:** needs the team and participants.
- [x] **Demo.** `docs/DEMO.md` starts on the lunar question, opens VI-3, follows the NASA table, shares the brief and ends on the open gravity question, with the BASS-II replay ready for questions. Slides and PDF updated.

## Release verification

- [ ] The review's nine tests on the submitted build, with build ID and evidence: see `docs/VALIDATION.md` (release entry) and `docs/release-evidence/`.

# Challenge review and design benchmarks

Reviewed November 9, 2026; Details and Resources rechecked November 13, 2026; updated after the external website review on November 14, 2026 (see [the resource inventory](RESOURCES-2026-11-13.md)). This is an independent demo, not a submitted or NASA-approved project.

## Official statement

The complete **Details** tab of [Flame in Freefall](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/) was inspected in the official website. On November 13 the **Resources** tab listed an introductory video, a 2015 *Researcher's Guide to ISS Combustion Science*, pages on the Apollo 1, Apollo 13 and Mir fires, and three NASA spinoff pages (air tanks, smoke detector, firefighter clothing). The visible portion contained no dataset. The page says more resources may be added. The Details tab now names additional PSI investigations (SAME-R, FLEX-2, CFI, CFI-G, BRE, E-FIELD Flames, SPICE, SLICE, DAFT), gives Moon base atmosphere figures (≥30% O₂ at ≤10.2 psi), and adds an optional Earth-applications direction. It still says PSI has no partial-gravity combustion data. The site states that claim at its scope (the PSI archive, per the statement) and separately cites published short drop-tower and parabolic-flight studies outside PSI.

The central request is a web dashboard that summarizes, ranks, and interprets combustion investigations for fire safety in habitable crew environments. Optional directions include relevant-investigation discovery, data extraction for modeling, and research on safety equipment. The suggested context includes fuel geometry, test conditions, variables, sensors, differences between investigations, shared hardware, and partial-gravity limitations. Rocket/propellant combustion is outside the stated PSI research scope. These are paraphrases; consult the official statement for exact wording.

## Implemented mapping

| Direction                          | Working demo capability                                                                                | Practical boundary                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Find relevant investigations       | Homepage answers the Moon base question from 2,008 NASA test records; oxygen × pressure map; nearest-test engine in the lab; Mission desk by habitat and safety question | 21 of PSI's 24 combustion investigations have tables; all are imported |
| Summarize and compare              | Objectives, fuel phase, geometry, hardware, variables, measurements, source links; compare up to three | Missing dimensions and missing raw series remain marked                                           |
| Rank                               | Explicit research-priority rubric with a one-sentence reason per experiment, labelled ties, ACME shown as the parent program; separate BM25 finding retrieval | Neither score is a hazard metric or scientific confidence                                         |
| Interpret                          | Scenario notes, source-linked findings, research companion                                             | Editorial inference is labeled; no mission certification                                          |
| Prevention, detection, suppression | Ten investigations; measured lunar-comparison (Saffire VI-3, Table 1), detection example (VI-3 Figure 7, 981 s) and extinction example (FLEX cool flames) | SAME entries describe investigation objectives, not detector performance thresholds; the detection example is one test at one location |
| Extract data for modeling          | 2,008 test records from 21 PSI tables via the PSI API (checksums, unit conversion in code, 28 flagged data problems), filtered CSV API, BASS-II and Saffire values checked against PDFs, one-page brief | Not raw telemetry; no fit or extrapolation from seven confounded observations                     |
| Explain behavior                   | Animated volumetric/particle flames, gravity comparison, guided lab, glossary and quiz                 | Illustration and data encoding are distinguished from reconstruction                              |
| SI-powered capability              | Optional LLM synthesis with validated citation IDs, timeout and retrieval fallback                     | Claude Haiku 5.5 answers from retrieved findings and NASA test rows, citing each; 22 live checks; not scientifically validated |
| Future exploration                 | Eight FLEX tests at the Moon base atmosphere; measured lunar and Martian flammability limits (drop tower, outside PSI) charted against microgravity and Earth | All PSI tests are microgravity; partial-gravity limits are ~5 s tests on three materials |

### Ranking rubric

`POST /api/investigations` accepts destination and priority. Each investigation receives one context point; four when its curated metadata addresses the selected priority; three when the atlas holds its measured data and the experiment addresses the question (one if the data are only background); two for testing near lunar oxygen levels (surface, matching question); two for atmosphere relevance (surface, prevention and suppression); and one for probing gravity dependence (surface). ACME is a program, shown as background rather than ranked. Ties are ordered by primary focus, measured data, number of findings, then name, and labelled on screen. All weights are authored and visible; none is learned from NASA experiments. This is a reading-priority tool.

## Benchmarks reviewed

- [SpaceGenes+ project page](https://www.spaceappschallenge.org/2025/find-a-team/spacegenes/?tab=project): its participant-written presentation connects a particular NASA dataset to comparison across conditions, a specific research audience, and hypothesis generation. Applied lesson: define the user’s question, preserve comparison context, and export the evidence trail. Its scientific calculations were not independently validated in this review.
- [Connected Earth Museum project page](https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/connected-earth-museum/?tab=project): its participant-written presentation describes guided 3D/2D exploration, educational explanations, and a knowledge-check mini-game. Applied lesson: introduce the interaction before expecting the visitor to understand the dashboard.
- NASA’s [2025 winners announcement](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/) identifies SpaceGenes+ as Best Use of Science. NASA’s [2024 announcement](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-international-space-apps-challenge-announces-2024-global-winners/) identifies Connected Earth Museum as Art & Technology and TerraTales as Best Storytelling. TerraTales’ regional narratives informed the decision to organize research around a mission context. No award equivalence or judging outcome is implied.

These are product-design observations, not copied assets, implementation code, or a claim to have audited every Space Apps project.

## Research still needed

1. Finish the November 13 resource inventory (top of list and link targets), use the 2015 Researcher's Guide to check profiles, and add the newly named investigations.
2. ~~Visually verify Table 5.1 against the original BASS-II PDF.~~ Done November 13, 2026 (see `docs/VALIDATION.md`).
3. Ingest raw experiment files with checksums, instrument calibration, timing, uncertainty, flow direction, and fuel geometry.
4. Have a combustion specialist review the summaries and scenario interpretations.
5. Configure a generative provider and public-use budget/rate controls if live LLM synthesis is required. The independent core needs no key.
6. Validate predictive or reconstruction models against held-out experiments before assigning quantitative safety meaning.

## AI-use disclosure

This application was developed with AI assistance for research discovery, code, design, documentation, and tests. NASA sources remain linked. Authored visualization rules and ranking weights are not NASA-derived model coefficients. Since November 14, 2026 the live site uses Claude Haiku 5.5 (Anthropic) through Vercel AI Gateway to write research-companion answers and lab interpretations. These are labeled as AI on screen, may cite only retrieved NASA findings, and fall back to deterministic retrieval when the model is unavailable. AI output was checked against a small test set and is not scientifically validated. Development also used Claude Code (Anthropic) and earlier AI coding assistants.

November 9 follow-up: the SI wording was rechecked against the official Details tab. No specific model/vendor is mandated. The owner has explicitly left AI activation to Claude; the handoff records Vercel’s card-verification prerequisite and an activation/evaluation checklist.

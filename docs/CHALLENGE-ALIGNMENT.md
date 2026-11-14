# Challenge review and design benchmarks

Reviewed November 9, 2026; Details and Resources rechecked November 13, 2026 (see [the resource inventory](RESOURCES-2026-11-13.md)). This is an independent demo, not a submitted or NASA-approved project.

## Official statement

The complete **Details** tab of [Flame in Freefall](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/) was inspected in the official website. On November 13 the **Resources** tab listed an introductory video, a 2015 *Researcher's Guide to ISS Combustion Science*, pages on the Apollo 1, Apollo 13 and Mir fires, and three NASA spinoff pages (air tanks, smoke detector, firefighter clothing). The visible portion contained no dataset. The page says more resources may be added. The Details tab now names additional PSI investigations (SAME-R, FLEX-2, CFI, CFI-G, BRE, E-FIELD Flames, SPICE, SLICE, DAFT), gives Moon base atmosphere figures (≥30% O₂ at ≤10.2 psi), and adds an optional Earth-applications direction. It still says PSI has no partial-gravity combustion data.

The central request is a web dashboard that summarizes, ranks, and interprets combustion investigations for fire safety in habitable crew environments. Optional directions include relevant-investigation discovery, data extraction for modeling, and research on safety equipment. The suggested context includes fuel geometry, test conditions, variables, sensors, differences between investigations, shared hardware, and partial-gravity limitations. Rocket/propellant combustion is outside the stated PSI research scope. These are paraphrases; consult the official statement for exact wording.

## Implemented mapping

| Direction                          | Working demo capability                                                                                | Practical boundary                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Find relevant investigations       | Mission desk with orbit, Moon, Mars, and rover contexts                                                | Six curated profiles, not an exhaustive PSI catalog                                               |
| Summarize and compare              | Objectives, fuel phase, geometry, hardware, variables, measurements, source links; compare up to three | Missing dimensions and missing raw series remain marked                                           |
| Rank                               | Explicit research-priority rubric with visible reasons; separate BM25 finding retrieval                | Neither score is a hazard metric or scientific confidence                                         |
| Interpret                          | Scenario notes, source-linked findings, research companion                                             | Editorial inference is labeled; no mission certification                                          |
| Prevention, detection, suppression | BASS-II, Saffire, SoFIE-GEL, ACME, SAME, FLEX                                                          | SAME entries describe investigation objectives, not detector performance thresholds               |
| Extract data for modeling          | 39 published BASS-II points from 18 runs, run metadata, CSV/JSON exports and validated imports                  | Not raw telemetry; no fit or extrapolation from seven confounded observations                     |
| Explain behavior                   | Animated volumetric/particle flames, gravity comparison, guided lab, glossary and quiz                 | Illustration and data encoding are distinguished from reconstruction                              |
| SI-powered capability              | Optional LLM synthesis with validated citation IDs, timeout and retrieval fallback                     | Live since Nov 14: Claude Haiku 5.5 answers and lab interpretations cite only retrieved findings; small live test set passed; not scientifically validated |
| Future exploration                 | Surface-habitat context and evidence-gap labels                                                        | The statement reports no current partial-gravity combustion dataset in PSI                        |

### Ranking rubric

`POST /api/investigations` accepts destination and priority. Each investigation receives one context point, four points when its curated metadata addresses the selected priority, and two atmosphere points for a surface context when applicable. All weights are authored and visible. No weight is learned from NASA experiments. Equal scores use alphabetical ordering. This is a reading-priority tool.

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

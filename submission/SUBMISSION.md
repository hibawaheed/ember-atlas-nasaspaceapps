# Ember Atlas — NASA Space Apps 2026 submission text

Ready to paste into the Space Apps project page. Check each field's character limit on the submission form before pasting; the official form was not visible from the environment this was written in.

---

## Project name

Ember Atlas

## Challenge

Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data

## Team

ISL Team A: Hiba Waheed Ch, Zaafir Abbas Haidrie, Muhammad Ashar Hassan, Amin Adnan Mahmood

## Links

- **Live project (demo):** https://emberatlas.tech
- **Source code:** https://github.com/hibawaheed/ember-atlas-nasaspaceapps
- **Presentation (7 slides, PDF):** `submission/EMBER-Atlas-Space-Apps-2026.pdf` in the repository. Upload it, or host it at a public link (for example Google Drive), and paste that link into the form.

---

## High-level project summary

Ember Atlas puts every NASA microgravity combustion test we could find into one cited, searchable atlas for crew-habitat fire safety. Using NASA's Physical Sciences Informatics (PSI) API, we imported 2,008 test records from 21 investigations, checksummed each table, converted units in code and flagged 28 data-entry problems openly. The atlas answers the challenge's Moon base question directly: NASA burned fuel droplets at exactly 30% oxygen and 71 kPa (eight FLEX tests); the closest solid-material fire is Saffire VI-3; and drop-tower tests show three materials burning at lower oxygen at lunar gravity than in orbit or on Earth. An oxygen × pressure map, a nearest-test engine, an animated 3D lab and an AI research companion powered by Anthropic's Claude, citing NASA findings and test rows, make that evidence easy to use and check.

*(About 140 words. Shorter version, about 50 words:)* Ember Atlas turns 2,008 NASA combustion test records from 21 PSI investigations into a cited atlas for crew-habitat fire safety. It finds the NASA tests nearest any cabin atmosphere, maps them by oxygen and pressure, charts measured lunar-gravity limits, and uses Anthropic's Claude to answer questions from the tests themselves.

---

## Detailed project description

**The question.** NASA expects Moon bases and rovers to run at 30% oxygen or more and 10.2 psi (70.3 kPa) or less. The challenge says PSI's combustion data is hard to find, compare and interpret. So we asked one concrete question and built the tool that answers it: has NASA burned anything at that atmosphere, and what does the evidence say about lunar gravity?

**What we found.**

- **Liquid droplets: yes.** NASA's Flame Extinguishment Experiment (FLEX, PSI-69) burned methanol and heptane droplets at 30% oxygen and 71.2–72.1 kPa eight times on the ISS in 2009–2010, and nine more at 34% oxygen.
- **Solid materials: close, not exact.** The nearest is Saffire VI-3, acrylic at 30.3% oxygen, but at 54.6 kPa with 20 cm/s forced flow.
- **Lunar gravity: measured, briefly.** In NASA drop-tower tests, Mylar kept burning down to 15.6% oxygen at lunar gravity, against 17.0% in microgravity and 21.2% on Earth, at 10.2 psia. All three materials tested burned at lower oxygen at lunar and Martian gravity than at either end, so microgravity and Earth results did not bracket the middle. These were about 5-second tests published outside PSI.

**What it does.**

- **The atlas map.** 754 tests that record both oxygen and pressure, plotted by fuel type with crew atmospheres marked; click any point for its tests and NASA record.
- **Nearest measured test.** Set any atmosphere, airflow, gravity and fuel in the lab; the site searches all 2,008 records and shows the nearest NASA tests condition by condition, naming every match, difference and missing value, with links to the source table.
- **Data quality, in the open.** 28 problems found in NASA's tables, affecting 122 cells: column subscripts and units lost ("CO" for CO₂, "mm" for mm²/s), spreadsheet autofill that turned "40% CH4" into "CH5 … CH14", percent formatting that wrote 34% as "3400%", unreadable characters and implausible values. Each is listed with our reading, and every record keeps the cell as NASA wrote it.
- **Mission desk.** Choose a habitat and a safety question (prevention, detection, suppression); investigations are ranked with a reason for each, compared side by side and grouped by shared hardware, with measured detection (Saffire VI-3 smoke-alarm timing) and extinction (FLEX cool flames) examples.
- **AI research companion.** Claude answers questions such as "Which BASS-II run had the fastest flame spread?" (run M16, 0.144 mm/s at 5 cm/s) or "Has NASA burned anything at a Moon base atmosphere?" from the matching NASA test rows and curated findings, citing each one.
- **Combustion lab.** An animated 3D flame (Three.js volumetric shader with a CPU fallback) illustrates gravity, oxygen, airflow and pressure, and replays BASS-II measurements; the oxygen partial-pressure arithmetic is shown, and the flame is labelled as an illustration.
- **Downloads.** CSV of any investigation or all 2,008 records with PSI links, a one-page scenario brief, and shareable links that rebuild any scenario.

**How we built it.**

- **Data.** We found PSI's public repository API, downloaded the experimental tables for every combustion investigation that has one (21 of 24), recorded each file's SHA-256 and DOI, and wrote a converter that keeps every raw cell, converts mmHg, atm and bar to kPa and mole fractions to percent, and flags problems instead of fixing them silently. A fetch script re-downloads the tables and confirms they still match. We cross-checked the 18 BASS-II runs we had transcribed from NASA/TM-20210011385 against PSI's table: every run agrees. The partial-gravity limits and Saffire IV–VI values were typed from NASA PDFs and checked against rendered pages.
- **Software.** Next.js 16 and React 19, Three.js, Zod, SVG charts; deployed on Vercel at emberatlas.tech; no database or login. 36 automated tests cover checksums, unit conversions, the Moon-atmosphere tests, the nearest-test engine, the partial-gravity table (it reproduces the paper's own oxygen margins), the API routes, rate limits and AI guardrails.
- **AI pipeline.** The server decides what Claude Haiku 5.5 sees: BM25-retrieved findings, investigation profiles and NASA test rows chosen deterministically from the question (named conditions, whole-table sorts for "fastest" or "highest", condition grids per investigation). The model returns structured output listing the IDs it used; an answer citing anything it was not given is rejected. Repeat questions are cached; calls are limited to 30 per device per 10 minutes, under a $5 monthly budget; any failure falls back to the matching findings.

**Why it matters.** A habitat designer can now find, in one click and with the source table attached, which NASA tests are nearest their cabin and how they differ. The evidence already says three useful things: droplet fires have been run at a Moon base atmosphere; no solid-material fire has; and Earth-gravity flammability screening may not be conservative at lunar gravity.

**Limits.** A research and teaching tool, not a safety certification. Every test in the PSI tables ran in microgravity; the partial-gravity limits come from short drop-tower tests on three materials. The 3D flame is an illustration. AI answers passed a live test set of 22 checks but have not been reviewed by a combustion scientist; checked citations mean each cited item was supplied, not that every sentence is proven.

---

## NASA data and resources used

**Primary data**

- NASA PSI repository, experimental tables for 21 combustion investigations (CC0), retrieved through the PSI API on November 14, 2026; files, DOIs and SHA-256 checksums in `data/psi/manifest.json`. Search: https://psi.nasa.gov/physci/repo/search?q=combustion
  - PSI-69 FLEX, DOI 10.60555/mbq8-0451 (274 tests) · PSI-39 CFI (87) · PSI-68 FLEX-2 (test matrix)
  - PSI-159 ACME CFI-G (333) · PSI-10 ACME Flame Design (327) · PSI-20 ACME BRE · PSI-23 ACME s-Flame · PSI-21 ACME CLD Flame · PSI-22 ACME E-FIELD Flames
  - PSI-25 BASS-II, DOI 10.60555/4qc4-de67 (129) · PSI-26 BASS (122) · PSI-106 SLICE · PSI-107 SPICE (469)
  - PSI-98, PSI-99, PSI-100 Saffire-I to -III · PSI-102 SAME · PSI-101 SAME-R (109) · PSI-47 DAFT
- BASS-II Summary Report, NASA/TM-20210011385 (Table 5.1, 39 flame-spread values): https://ntrs.nasa.gov/citations/20210011385
- Preliminary Results from the Saffire VI Experiment, ICES-2024-365 (Tables 1–2 and Figure 7): https://ntrs.nasa.gov/citations/20240002981
- Olson & Ferkul, Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test (Table I, limiting oxygen at 0g, lunar, Martian and Earth gravity): https://ntrs.nasa.gov/citations/20130010991
- NASA PSI-62, two-color tomography of BASS flames (data reuse example), DOI 10.60555/e9xp-ex83: https://psi.nasa.gov/physci/repo/data/investigations/PSI-62

**Challenge resources**

- Flame in Freefall challenge statement: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- A Researcher’s Guide to: International Space Station Combustion Science (NP-2015-10-034-JSC): https://www.nasa.gov/sites/default/files/atoms/files/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
- NASA ScienceCasts: The Power of Studying Combustion on the ISS: https://www.youtube.com/watch?v=AVuEiKxOpc0
- Combustion Science at NASA Glenn: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/
- PSI combustion investigations (search): https://psi.nasa.gov/physci/repo/search?q=combustion
- Apollo 1 (NASA Safety and Mission Assurance): https://sma.nasa.gov/sma-disciplines/accllp/apollo-1
- Apollo 13 (NASA Safety and Mission Assurance): https://sma.nasa.gov/sma-disciplines/accllp/apollo-13
- 25 Years Ago: Fire Aboard Space Station Mir (NASA History): https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/
- NASA Spinoff, Fireman’s Air Tanks: https://spinoff.nasa.gov/node/9582
- NASA Spinoff, Fire Detector: https://spinoff.nasa.gov/node/9407
- NASA Spinoff, New Technology for the Fire Attire: https://spinoff.nasa.gov/node/9918

**NASA investigation pages and reports**

- Burning Rate Emulator (BRE): https://science.nasa.gov/biological-physical/investigations/bre/
- Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames): https://science.nasa.gov/biological-physical/investigations/e-field-flames/
- Advanced Combustion Microgravity Experiment (ACME) Facility: https://science.nasa.gov/biological-physical/investigations/acme/
- Solid Fuel Ignition and Extinction – Growth and Extinction Limit (SoFIE-GEL): https://science.nasa.gov/biological-physical/investigations/sofie-gel/
- FLEX — Combustion Integrated Rack Operations: https://gipoc.grc.nasa.gov/wp/fcf-cir/flex/
- Smoke Aerosol Measurement Experiment: objectives and diagnostics: https://www1.grc.nasa.gov/wp-content/uploads/SAME_Quad.pdf
- Preliminary Results from the Saffire VI Experiment, ICES 2024 presentation slides: https://ntrs.nasa.gov/citations/20240007488
- Characterizing the Flammability of Nomex Fabric for the Preparation of FM2 (2025 poster): https://ntrs.nasa.gov/citations/20250010975
- Saffire Ignites New Discoveries in Space: https://www.nasa.gov/humans-in-space/saffire-ignites-new-discoveries-in-space/
- Flame Burns Out on NASA’s Long-Running Spacecraft Fire Experiment: https://www.nasa.gov/humans-in-space/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/
- Space Station’s Quest for the Secrets of Fire: https://www.nasa.gov/humans-in-space/space-stations-quest-for-the-secrets-of-fire/
- Cool Flames Created During a First for International Space Station Research: https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research/
- “Cool Flames” in Space, a Hot Prospect on Earth! (V. Nayagam, NASA Glenn, ISS R&D Conference 2013): https://www.nasa.gov/wp-content/uploads/2013/10/issrdc_2013-07-16-0945_nayagam2013.pdf
- NASA Studies Fire in Microgravity (Scientific Visualization Studio): https://svs.gsfc.nasa.gov/31394/

NASA PSI records used here identify CC0 dataset licenses. No NASA insignia is used; Ember Atlas is an independent project with no NASA endorsement.

## Space agency partner and other data

No partner-agency data is used. All data comes from NASA sources listed above and the NASA Space Apps challenge statement.

---

## Use of artificial intelligence

- **In the product:** Ember Atlas uses Anthropic’s Claude Haiku 5.5, through the Vercel AI SDK and Vercel AI Gateway, to write research-companion answers, lab interpretations and Mission-desk comparison explanations. The model sees only NASA findings, investigation profiles and NASA test rows selected by our server, must cite the items it used, and is labeled on screen as AI. Answers fall back to plain search results if the model is unavailable.
- **In development:** the team used Claude Code (Anthropic) and earlier AI coding assistants to help write code, documentation and tests. NASA values were checked by hand against the original sources.
- **Not AI-generated:** the 2,008 test records are NASA's own table values, converted by our script with every original cell kept; the BASS-II, Saffire and partial-gravity values were transcribed from NASA PDFs and visually verified. The 3D flame is an authored illustration, not AI-generated imagery.

---

## Tools and references

Next.js 16, React 19, Three.js, Vercel AI SDK, Vercel AI Gateway, Anthropic Claude Haiku 5.5, Zod, Vercel hosting. Fonts: Inter and Space Grotesk.

## Suggested tags

microgravity, combustion, fire safety, ISS, Moon, Mars, PSI, NASA data, open data, data quality, AI, Claude, data visualization, 3D, spacecraft habitats

# EMBER Atlas — NASA Space Apps 2026 submission text

Ready to paste into the Space Apps project page. Check each field's character limit on the submission form before pasting; the official form was not visible from the environment this was written in.

---

## Project name

EMBER Atlas

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

EMBER Atlas is a web dashboard that helps researchers, engineers and students find, compare and interpret NASA’s microgravity combustion research for fire safety in spacecraft, space stations, Moon and Mars bases, and pressurized rovers. It ranks 10 NASA investigations for each habitat and safety question (prevention, detection, suppression), compares their fuels, conditions, sensors and shared hardware, and charts 39 real BASS-II flame-spread measurements checked against NASA’s original report. An AI research companion powered by Anthropic’s Claude answers questions in plain language from 32 curated NASA findings, citing every source and declining what the evidence cannot support. An animated 3D combustion lab shows how flames change with gravity, oxygen, airflow and pressure, and makes clear what is measured and what is illustrative.

*(About 130 words. Shorter version, about 50 words:)* EMBER Atlas turns NASA’s microgravity combustion research into cited, comparable answers for crew-habitat fire safety. It ranks and compares 10 investigations, charts 39 verified BASS-II measurements, and uses Anthropic’s Claude to answer questions and interpret lab scenarios strictly from 32 curated NASA findings.

---

## Detailed project description

**What it does.** NASA’s Physical Sciences Informatics (PSI) system makes ISS combustion results public, but the challenge statement points out that they are hard to find, harder to compare and harder yet to interpret. EMBER Atlas brings that evidence into one place and keeps every number traceable to its NASA source.

- **Mission desk (find and rank).** Choose a destination (orbital habitat, lunar base, Mars habitat or pressurized rover) and a safety question (prevention, detection or suppression). Ten investigation profiles — BASS-II, SAME/SAME-R, FLEX, Saffire, ACME, SoFIE-GEL, BRE, E-FIELD Flames, CFI-G and SPICE & SLICE — are ranked with a visible, disclosed score, so users can see why each appears where it does. Rankings are reading priorities, never hazard scores.
- **Compare.** Up to three investigations side by side: objectives, fuels and sample sizes, test conditions, variables, sensors and limits, plus a shared-hardware view (ACME experiments in the Combustion Integrated Rack; FLEX, FLEX-2 and CFI in the Multi-user Droplet Combustion Apparatus; BASS, BASS-II, SPICE and SLICE in the Microgravity Science Glovebox flow duct). An oxygen-coverage chart shows the data gap: the solid-material tests in our data ran at 16.8–22.2% oxygen, while a Moon base is expected to run at 30% or more.
- **Interpret with AI.** The research companion answers questions such as “Will a fire go out if ventilation is shut off?” or “Compare FLEX and BASS-II” with short, cited answers and follow-up support. The same model interprets lab setups and explains Mission-desk comparisons.
- **Combustion lab.** An animated 3D flame (Three.js volumetric shader with a CPU fallback) responds to gravity (orbit, Moon, Mars, Earth), oxygen, airflow, cabin pressure and fuel. A measured-replay mode steps through all 18 BASS-II runs. Crew-atmosphere and partial-gravity panels compare Earth air, a Moon base (≥30% O₂, ≤10.2 psi) and a spacesuit (100% O₂, 4.3 psi), and explain that PSI has no partial-gravity combustion data yet (LUCI and FM2 are expected to add it).
- **Measured data.** 39 flame-spread observations from 18 BASS-II runs, with run conditions, a “what varied / what stayed the same” summary and CSV export. All 10 investigation profiles can also be downloaded as CSV for modeling.
- **Earth applications and history.** A “Back on Earth” panel covers water-mist extinguishers, smoke detection and firefighter gear; a field guide covers the Apollo 1, Apollo 13, Mir and Artemis II fire events, key concepts, a glossary and a quiz.

**How we built it.**

- **Data and verification.** We transcribed every tracked run from Table 5.1 of the BASS-II summary report (NASA/TM-20210011385), then rendered the original PDF page and checked each value by eye, recording the file’s SHA-256. In doing so we found that the report’s Figure 5.2 gives a different M8 slope at 10 cm/s than Table 5.1; we kept the table value and documented the difference. Findings come from NTRS reports, PSI records, NASA investigation pages, NASA’s 2015 ISS combustion researcher’s guide and the challenge statement. Each finding stores its source, its meaning and its limitations, and is labeled Observed, Review or Research aim.
- **Software.** Next.js 16 and React 19, Three.js for the flame, and Zod for input validation, deployed on Vercel at emberatlas.tech. Data lives in versioned JSON files; there is no database or login. 23 automated tests cover data integrity, API routes, retrieval, rate limiting and AI guardrails.
- **AI pipeline.** BM25 search over the findings decides what the model may see; off-topic questions fall below a relevance cutoff and are declined without calling the model. A context builder adds the profiles of any investigation the question names, plus the previous question for follow-ups. Anthropic’s Claude Haiku 5.5, called through the Vercel AI SDK and Vercel AI Gateway, returns structured output listing the IDs it relied on, and the server rejects any answer citing an item it was not given. Calls are limited to 10 per visitor per 10 minutes, with a $5 monthly budget cap, and any failure falls back to showing the matching NASA findings directly.

**Why it matters.** The evidence already points to concrete lessons for habitat designers: tested oxygen levels do not yet cover lunar atmospheres; inert-gas suppressants leave less safety margin in reduced gravity than Earth standards assume; shutting off ventilation does not reliably put out a spacecraft fire; and cool flames can keep burning after the visible flame disappears. EMBER Atlas makes these findings, and their limits, easy to reach and check.

**Limits.** EMBER Atlas is a research and teaching tool, not a safety certification. The 3D flame and its Moon and Mars shapes are illustrative, not simulations. AI answers passed a small live test set (13 of 13 checks) but have not been reviewed by a combustion scientist; checked citations mean the cited finding was supplied, not that every sentence is proven.

---

## NASA data and resources used

**Primary data**

- BASS-II Summary Report, NASA/TM-20210011385 (Table 5.1, 39 flame-spread observations): https://ntrs.nasa.gov/citations/20210011385
- NASA PSI-25, Burning and Suppression of Solids II (BASS-II), DOI 10.60555/4qc4-de67: https://psi.nasa.gov/physci/repo/data/investigations/PSI-25
- NASA PSI-69, Flame Extinguishment Experiment (FLEX), DOI 10.60555/mbq8-0451: https://psi.nasa.gov/physci/repo/data/investigations/PSI-69
- NASA PSI-102, Smoke and Aerosol Measurement Experiment (SAME): https://psi.nasa.gov/physci/repo/data/investigations/PSI-102
- NASA PSI-62, Concurrent Flame Spread Modeling with Comparison to BASS Experiments using Two-Color Tomography, DOI 10.60555/e9xp-ex83: https://psi.nasa.gov/physci/repo/data/investigations/PSI-62

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
- Preliminary Results from the Saffire VI Experiment: https://ntrs.nasa.gov/citations/20240007488
- Saffire Ignites New Discoveries in Space: https://www.nasa.gov/humans-in-space/saffire-ignites-new-discoveries-in-space/
- Flame Burns Out on NASA’s Long-Running Spacecraft Fire Experiment: https://www.nasa.gov/humans-in-space/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/
- Space Station’s Quest for the Secrets of Fire: https://www.nasa.gov/humans-in-space/space-stations-quest-for-the-secrets-of-fire/
- Cool Flames Created During a First for International Space Station Research: https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research/
- Cool Flames on the International Space Station — An Anatomy of Discovery: https://blogs.nasa.gov/ISS_Science_Blog/2013/11/25/cool-flames-on-the-international-space-station-an-anatomy-of-discovery/
- NASA Studies Fire in Microgravity (Scientific Visualization Studio): https://svs.gsfc.nasa.gov/31394/

NASA PSI records used here identify CC0 dataset licenses. No NASA insignia is used; EMBER Atlas is an independent project with no NASA endorsement.

## Space agency partner and other data

No partner-agency data is used. All data comes from NASA sources listed above and the NASA Space Apps challenge statement.

---

## Use of artificial intelligence

- **In the product:** EMBER Atlas uses Anthropic’s Claude Haiku 5.5, through the Vercel AI SDK and Vercel AI Gateway, to write research-companion answers, lab interpretations and Mission-desk comparison explanations. The model sees only NASA findings and investigation profiles selected by our search step, must cite the items it used, and is labeled on screen as AI. Answers fall back to plain search results if the model is unavailable.
- **In development:** the team used Claude Code (Anthropic) and earlier AI coding assistants to help write code, documentation and tests. NASA values were checked by hand against the original sources.
- **Not AI-generated:** the BASS-II measurements are NASA published values, transcribed and visually verified. The 3D flame is an authored illustration, not AI-generated imagery.

---

## Tools and references

Next.js 16, React 19, Three.js, Vercel AI SDK, Vercel AI Gateway, Anthropic Claude Haiku 5.5, Zod, Vercel hosting. Fonts: Inter and Space Grotesk.

## Suggested tags

microgravity, combustion, fire safety, ISS, Moon, Mars, PSI, NASA data, AI, Claude, data visualization, 3D, spacecraft habitats
